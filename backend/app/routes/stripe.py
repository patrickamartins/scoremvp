from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import stripe
import logging
import os
import time
from datetime import datetime

from app.database import get_db
from app import models
from app.core.security import get_current_user, get_current_user_optional
from app.core.config import settings
from app.core.email import email_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/stripe",
    tags=["stripe"],
)

# Configurar Stripe
stripe.api_key = settings.STRIPE_API_KEY or os.getenv("STRIPE_SECRET_KEY", "")

# Mapeamento de planos para product IDs do Stripe
PLAN_PRODUCT_IDS = {
    "free": os.getenv("STRIPE_PRODUCT_ID_FREE", "prod_TTl5NDezoVwBAq"),  # Player
    "pro": os.getenv("STRIPE_PRODUCT_ID_PRO", "prod_TTl5HSgywoCp3v"),  # MVP
    "team": os.getenv("STRIPE_PRODUCT_ID_TEAM", "prod_TTl4dZ3GtEK0EE"),  # Team
}

def get_price_id_for_product(product_id: str, max_retries: int = 3) -> str:
    """Busca o primeiro price (recurring) de um produto com retry para erros de conexão"""
    last_error = None
    for attempt in range(max_retries):
        try:
            prices = stripe.Price.list(product=product_id, active=True, limit=1)
            if prices.data:
                return prices.data[0].id
            raise ValueError(f"Nenhum price encontrado para o produto {product_id}")
        except (stripe.error.APIConnectionError, ConnectionError, OSError) as e:
            last_error = e
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2  # Backoff exponencial: 2s, 4s, 6s
                logger.warning(f"Erro de conexão ao buscar price (tentativa {attempt + 1}/{max_retries}). Tentando novamente em {wait_time}s...")
                time.sleep(wait_time)
            else:
                logger.error(f"Erro de conexão ao buscar price para produto {product_id} após {max_retries} tentativas: {e}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Erro de conexão com o Stripe. Por favor, tente novamente em alguns instantes."
                )
        except stripe.error.StripeError as e:
            logger.error(f"Erro do Stripe ao buscar price para produto {product_id}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao buscar preço do produto: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Erro inesperado ao buscar price para produto {product_id}: {e}")
            raise
    
    # Se chegou aqui, todas as tentativas falharam
    raise HTTPException(
        status_code=503,
        detail=f"Erro de conexão com o Stripe após {max_retries} tentativas. Por favor, tente novamente."
    )

class CheckoutSessionRequest(BaseModel):
    plan_id: str
    user_id: Optional[int] = None

class PaymentIntentRequest(BaseModel):
    plan_id: str
    user_id: Optional[int] = None

class CreateSubscriptionRequest(BaseModel):
    plan_id: str
    user_id: Optional[int] = None
    payment_intent_id: str

class AttachPaymentMethodRequest(BaseModel):
    payment_method_id: str
    customer_id: str

@router.post("/create-checkout-session")
def create_checkout_session(
    request_data: CheckoutSessionRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """Cria uma sessão de checkout do Stripe"""
    plan_id = request_data.plan_id
    
    # Se não houver usuário autenticado, tentar usar userId do request
    user = current_user
    if not user and request_data.user_id:
        user = db.query(models.User).filter(models.User.id == request_data.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado ou não encontrado"
        )
    if not stripe.api_key:
        raise HTTPException(
            status_code=500,
            detail="Stripe não configurado. Configure STRIPE_SECRET_KEY."
        )
    
    if plan_id not in PLAN_PRODUCT_IDS:
        raise HTTPException(
            status_code=400,
            detail=f"Plano inválido. Planos disponíveis: {list(PLAN_PRODUCT_IDS.keys())}"
        )
    
    product_id = PLAN_PRODUCT_IDS[plan_id]
    if not product_id:
        raise HTTPException(
            status_code=500,
            detail=f"Product ID não configurado para o plano {plan_id}"
        )
    
    try:
        # Buscar o price ID do produto
        price_id = get_price_id_for_product(product_id)
        
        # Criar ou buscar customer no Stripe
        customer_id = user.stripe_customer_id
        if not customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={"user_id": str(user.id)}
            )
            customer_id = customer.id
            user.stripe_customer_id = customer_id
            db.commit()
        
        # Criar sessão de checkout
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/register/plan?canceled=true",
            metadata={
                "user_id": str(user.id),
                "plan_id": plan_id,
            },
        )
        
        return {
            "sessionId": checkout_session.id,
            "url": checkout_session.url,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Erro do Stripe: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar sessão de checkout: {str(e)}"
        )

@router.post("/create-payment-intent")
def create_payment_intent(
    request_data: PaymentIntentRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """Cria um Payment Intent para processar pagamento com cartão"""
    try:
        logger.info(f"[PAYMENT_INTENT] Iniciando criação. Plan: {request_data.plan_id}, User ID: {request_data.user_id}")
        
        plan_id = request_data.plan_id
        
        # Se não houver usuário autenticado, tentar usar userId do request
        user = current_user
        if not user and request_data.user_id:
            logger.info(f"[PAYMENT_INTENT] Buscando usuário por ID: {request_data.user_id}")
            user = db.query(models.User).filter(models.User.id == request_data.user_id).first()
        
        if not user:
            logger.error(f"[PAYMENT_INTENT] Usuário não encontrado")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não autenticado ou não encontrado"
            )
        
        logger.info(f"[PAYMENT_INTENT] Usuário encontrado: {user.email}")
        
        if plan_id not in PLAN_PRODUCT_IDS:
            logger.error(f"[PAYMENT_INTENT] Plano inválido: {plan_id}. Disponíveis: {list(PLAN_PRODUCT_IDS.keys())}")
            raise HTTPException(
                status_code=400,
                detail=f"Plano inválido. Planos disponíveis: {list(PLAN_PRODUCT_IDS.keys())}"
            )
        
        product_id = PLAN_PRODUCT_IDS[plan_id]
        logger.info(f"[PAYMENT_INTENT] Product ID para {plan_id}: {product_id}")
        
        if not product_id:
            logger.error(f"[PAYMENT_INTENT] Product ID não configurado para {plan_id}")
            raise HTTPException(
                status_code=500,
                detail=f"Product ID não configurado para o plano {plan_id}"
            )
        
        # Buscar o price ID do produto
        try:
            price_id = get_price_id_for_product(product_id)
            logger.info(f"[PAYMENT_INTENT] Price ID encontrado: {price_id}")
        except Exception as e:
            logger.error(f"[PAYMENT_INTENT] Erro ao buscar price ID: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao buscar price do produto: {str(e)}"
            )
        
        # Verificar se Stripe está configurado
        if not stripe.api_key:
            logger.error("[PAYMENT_INTENT] Stripe API key não configurada")
            raise HTTPException(
                status_code=500,
                detail="Stripe não configurado. Configure STRIPE_SECRET_KEY."
            )
        
        logger.info("[PAYMENT_INTENT] Stripe API key configurada")
        
        # Buscar o preço para obter o valor
        try:
            logger.info(f"[PAYMENT_INTENT] Buscando preço no Stripe: {price_id}")
            max_retries = 3
            price = None
            last_error = None
            
            for attempt in range(max_retries):
                try:
                    price = stripe.Price.retrieve(price_id)
                    break
                except (stripe.error.APIConnectionError, ConnectionError, OSError) as e:
                    last_error = e
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 2
                        logger.warning(f"[PAYMENT_INTENT] Erro de conexão ao buscar preço (tentativa {attempt + 1}/{max_retries}). Tentando novamente em {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        logger.error(f"[PAYMENT_INTENT] Erro de conexão ao buscar preço após {max_retries} tentativas: {e}")
                        raise HTTPException(
                            status_code=503,
                            detail=f"Erro de conexão com o Stripe. Por favor, tente novamente em alguns instantes."
                        )
            
            if not price:
                raise HTTPException(
                    status_code=500,
                    detail=f"Erro ao buscar preço do Stripe após {max_retries} tentativas."
                )
            
            amount = price.unit_amount  # Valor em centavos
            
            logger.info(f"[PAYMENT_INTENT] Preço encontrado. Amount: {amount}")
            
            if not amount:
                logger.error(f"[PAYMENT_INTENT] Preço sem valor (amount)")
                raise HTTPException(
                    status_code=500,
                    detail=f"Preço não encontrado ou inválido para o plano {plan_id}"
                )
        except HTTPException:
            raise
        except stripe.error.InvalidRequestError as e:
            logger.error(f"[PAYMENT_INTENT] Erro ao buscar preço: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao buscar preço do Stripe: {str(e)}. Verifique se o Price ID está correto."
            )
        except (stripe.error.APIConnectionError, ConnectionError, OSError) as e:
            logger.error(f"[PAYMENT_INTENT] Erro de conexão ao buscar preço: {e}")
            raise HTTPException(
                status_code=503,
                detail=f"Erro de conexão com o Stripe. Por favor, tente novamente em alguns instantes."
            )
        
        # Criar ou buscar customer no Stripe
        customer_id = user.stripe_customer_id
        if not customer_id:
            logger.info(f"[PAYMENT_INTENT] Criando novo customer no Stripe para {user.email}")
            max_retries = 3
            customer = None
            
            for attempt in range(max_retries):
                try:
                    customer = stripe.Customer.create(
                        email=user.email,
                        name=user.name,
                        metadata={"user_id": str(user.id)}
                    )
                    break
                except (stripe.error.APIConnectionError, ConnectionError, OSError) as e:
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 2
                        logger.warning(f"[PAYMENT_INTENT] Erro de conexão ao criar customer (tentativa {attempt + 1}/{max_retries}). Tentando novamente em {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        logger.error(f"[PAYMENT_INTENT] Erro de conexão ao criar customer após {max_retries} tentativas: {e}")
                        raise HTTPException(
                            status_code=503,
                            detail=f"Erro de conexão com o Stripe. Por favor, tente novamente em alguns instantes."
                        )
            
            if not customer:
                raise HTTPException(
                    status_code=500,
                    detail=f"Erro ao criar customer no Stripe após {max_retries} tentativas."
                )
            
            customer_id = customer.id
            user.stripe_customer_id = customer_id
            db.commit()
            logger.info(f"[PAYMENT_INTENT] Customer criado: {customer_id}")
        else:
            logger.info(f"[PAYMENT_INTENT] Usando customer existente: {customer_id}")
        
        # Criar Payment Intent
        logger.info(f"[PAYMENT_INTENT] Criando Payment Intent. Amount: {amount}, Currency: brl")
        max_retries = 3
        payment_intent = None
        
        for attempt in range(max_retries):
            try:
                payment_intent = stripe.PaymentIntent.create(
                    amount=amount,
                    currency="brl",
                    customer=customer_id,
                    payment_method_types=["card"],
                    metadata={
                        "user_id": str(user.id),
                        "plan_id": plan_id,
                    },
                )
                break
            except (stripe.error.APIConnectionError, ConnectionError, OSError) as e:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    logger.warning(f"[PAYMENT_INTENT] Erro de conexão ao criar payment intent (tentativa {attempt + 1}/{max_retries}). Tentando novamente em {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"[PAYMENT_INTENT] Erro de conexão ao criar payment intent após {max_retries} tentativas: {e}")
                    raise HTTPException(
                        status_code=503,
                        detail=f"Erro de conexão com o Stripe. Por favor, tente novamente em alguns instantes."
                    )
        
        if not payment_intent:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar payment intent no Stripe após {max_retries} tentativas."
            )
        
        logger.info(f"[PAYMENT_INTENT] Payment Intent criado com sucesso: {payment_intent.id}")
        
        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id,
            "customer_id": customer_id,
        }
    except HTTPException:
        raise
    except (stripe.error.APIConnectionError, ConnectionError, OSError) as e:
        logger.error(f"[PAYMENT_INTENT] Erro de conexão com o Stripe: {e}", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=f"Erro de conexão com o Stripe. Por favor, tente novamente em alguns instantes."
        )
    except stripe.error.StripeError as e:
        logger.error(f"[PAYMENT_INTENT] Erro do Stripe: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar payment intent: {str(e)}"
        )
    except Exception as e:
        logger.error(f"[PAYMENT_INTENT] Erro inesperado: {e}", exc_info=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao criar payment intent: {str(e)}"
        )

@router.post("/attach-payment-method")
def attach_payment_method(
    request_data: AttachPaymentMethodRequest = Body(...),
    db: Session = Depends(get_db),
):
    """Anexa um payment method a um customer"""
    try:
        logger.info(f"[ATTACH_PM] Anexando payment method {request_data.payment_method_id} ao customer {request_data.customer_id}")
        
        stripe.PaymentMethod.attach(
            request_data.payment_method_id,
            customer=request_data.customer_id,
        )
        
        logger.info(f"[ATTACH_PM] Payment method anexado com sucesso")
        
        return {
            "status": "success",
            "message": "Payment method anexado com sucesso"
        }
    except stripe.error.StripeError as e:
        error_msg = str(e).lower()
        # Se já estiver anexado, não é erro
        if "already been attached" in error_msg or "already attached" in error_msg:
            logger.info(f"[ATTACH_PM] Payment method já estava anexado")
            return {
                "status": "success",
                "message": "Payment method já estava anexado"
            }
        logger.error(f"[ATTACH_PM] Erro ao anexar payment method: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao anexar payment method: {str(e)}"
        )

@router.post("/create-subscription")
def create_subscription(
    request_data: CreateSubscriptionRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """Cria uma subscription após o pagamento ser confirmado"""
    plan_id = request_data.plan_id
    payment_intent_id = request_data.payment_intent_id
    
    # Se não houver usuário autenticado, tentar usar userId do request
    user = current_user
    if not user and request_data.user_id:
        user = db.query(models.User).filter(models.User.id == request_data.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado ou não encontrado"
        )
    
    if plan_id not in PLAN_PRODUCT_IDS:
        raise HTTPException(
            status_code=400,
            detail=f"Plano inválido. Planos disponíveis: {list(PLAN_PRODUCT_IDS.keys())}"
        )
    
    product_id = PLAN_PRODUCT_IDS[plan_id]
    if not product_id:
        raise HTTPException(
            status_code=500,
            detail=f"Product ID não configurado para o plano {plan_id}"
        )
    
    try:
        # Verificar se o usuário já tem uma subscription ativa
        if user.stripe_customer_id:
            existing_subscriptions = stripe.Subscription.list(
                customer=user.stripe_customer_id,
                status="active",
                limit=10
            )
            
            if existing_subscriptions.data:
                # Se já existe uma subscription ativa, não permitir criar nova
                active_sub = existing_subscriptions.data[0]
                
                # Buscar o price ID do novo plano
                new_price_id = get_price_id_for_product(product_id)
                
                # Acessar items corretamente - items é um objeto com data
                try:
                    # No Stripe Python SDK, items é um objeto que tem um atributo data
                    # Vamos usar o acesso direto ao dict para garantir compatibilidade
                    sub_dict = active_sub.to_dict() if hasattr(active_sub, 'to_dict') else dict(active_sub)
                    current_price_id = sub_dict['items']['data'][0]['price']['id']
                except (AttributeError, KeyError, TypeError, IndexError) as e:
                    logger.warning(f"[SUBSCRIPTION] Erro ao acessar price_id da subscription existente: {e}")
                    # Se não conseguir acessar, apenas bloquear criação de nova subscription
                    raise HTTPException(
                        status_code=400,
                        detail=f"Você já possui uma assinatura ativa. Para alterar seu plano, cancele a assinatura atual primeiro ou faça upgrade/downgrade através do painel de assinaturas."
                    )
                
                # Se for o mesmo plano, retornar erro
                if current_price_id == new_price_id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Você já possui uma assinatura ativa para este plano. Para alterar seu plano, cancele a assinatura atual primeiro."
                    )
                
                # Se for um plano diferente, também não permitir criar nova
                # O usuário deve cancelar a atual primeiro ou fazer upgrade/downgrade
                raise HTTPException(
                    status_code=400,
                    detail=f"Você já possui uma assinatura ativa. Para alterar seu plano, cancele a assinatura atual primeiro ou faça upgrade/downgrade através do painel de assinaturas."
                )
        
        # Buscar o price ID do produto
        price_id = get_price_id_for_product(product_id)
        
        # Recuperar Payment Intent para obter payment method
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if payment_intent.status != "succeeded":
            raise HTTPException(
                status_code=400,
                detail="Payment Intent não foi processado com sucesso"
            )
        
        payment_method_id = payment_intent.payment_method
        
        if not payment_method_id:
            raise HTTPException(
                status_code=400,
                detail="Payment method não encontrado no Payment Intent"
            )
        
        # Verificar se o payment method já está anexado ao customer
        # Se não estiver, tentar anexar (mas não falhar se já estiver)
        try:
            payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
            if payment_method.customer != user.stripe_customer_id:
                # Tentar anexar
                stripe.PaymentMethod.attach(
                    payment_method_id,
                    customer=user.stripe_customer_id,
                )
                logger.info(f"[SUBSCRIPTION] Payment method {payment_method_id} anexado ao customer {user.stripe_customer_id}")
            else:
                logger.info(f"[SUBSCRIPTION] Payment method já estava anexado ao customer")
        except stripe.error.StripeError as e:
            error_msg = str(e).lower()
            # Se já estiver anexado, ignorar o erro
            if "already been attached" in error_msg or "already attached" in error_msg:
                logger.info(f"[SUBSCRIPTION] Payment method já estava anexado")
            else:
                logger.warning(f"[SUBSCRIPTION] Erro ao verificar/anexar payment method: {e}")
                # Não falhar aqui, tentar criar subscription mesmo assim
        
        # Criar subscription com payment method já anexado
        subscription = stripe.Subscription.create(
            customer=user.stripe_customer_id,
            items=[{
                "price": price_id,
            }],
            default_payment_method=payment_method_id,
            expand=["latest_invoice.payment_intent"],
        )
        
        # Atualizar usuário no banco
        user.plan = models.UserPlan[plan_id.upper()]
        user.stripe_subscription_id = subscription.id
        user.last_payment_date = datetime.utcnow()
        # Ativar conta automaticamente após pagamento bem-sucedido
        user.is_active = True
        user.email_verified = True
        logger.info(f"[SUBSCRIPTION] Conta do usuário {user.id} ativada automaticamente após pagamento. is_active={user.is_active}, email_verified={user.email_verified}")
        db.commit()
        db.refresh(user)  # Garantir que os dados estão atualizados
        
        # Enviar email de confirmação
        try:
            email_service.send_subscription_email(
                email=user.email,
                name=user.name,
                subscription_type="confirmed",
                plan_name=plan_id
            )
        except Exception as e:
            logger.error(f"Erro ao enviar email: {e}")
        
        return {
            "subscription_id": subscription.id,
            "status": "success",
        }
    except stripe.error.StripeError as e:
        logger.error(f"Erro do Stripe: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar subscription: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """Webhook do Stripe para processar eventos"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET or os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    if not webhook_secret:
        logger.warning("STRIPE_WEBHOOK_SECRET não configurado")
        return {"status": "webhook_secret_not_configured"}
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        logger.error("Payload inválido")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        logger.error("Assinatura inválida")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Processar eventos
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = int(session["metadata"]["user_id"])
        plan_id = session["metadata"]["plan_id"]
        
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.plan = models.UserPlan[plan_id.upper()]
            user.stripe_subscription_id = session.get("subscription")
            user.last_payment_date = datetime.utcnow()
            db.commit()
            
            # Enviar email de confirmação
            try:
                email_service.send_subscription_email(
                    email=user.email,
                    name=user.name,
                    subscription_type="confirmed",
                    plan_name=plan_id
                )
            except Exception as e:
                logger.error(f"Erro ao enviar email: {e}")
    
    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        subscription_id = invoice.get("subscription")
        
        if subscription_id:
            subscription = stripe.Subscription.retrieve(subscription_id)
            customer_id = subscription.customer
            
            user = db.query(models.User).filter(
                models.User.stripe_customer_id == customer_id
            ).first()
            
            if user:
                user.last_payment_date = datetime.utcnow()
                # Calcular próxima data de pagamento
                if subscription.current_period_end:
                    user.next_payment_date = datetime.fromtimestamp(
                        subscription.current_period_end
                    )
                db.commit()
                
                # Enviar email de cobrança
                try:
                    email_service.send_subscription_email(
                        email=user.email,
                        name=user.name,
                        subscription_type="charged",
                        plan_name=user.plan.value
                    )
                except Exception as e:
                    logger.error(f"Erro ao enviar email: {e}")
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription.customer
        
        user = db.query(models.User).filter(
            models.User.stripe_customer_id == customer_id
        ).first()
        
        if user:
            user.plan = models.UserPlan.FREE
            user.stripe_subscription_id = None
            db.commit()
            
            # Enviar email de cancelamento
            try:
                email_service.send_subscription_email(
                    email=user.email,
                    name=user.name,
                    subscription_type="cancelled",
                    plan_name=user.plan.value
                )
            except Exception as e:
                logger.error(f"Erro ao enviar email: {e}")
    
    return {"status": "success"}

@router.get("/check-session/{session_id}")
def check_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Verifica o status de uma sessão de checkout"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == "paid":
            # Atualizar usuário
            plan_id = session.metadata.get("plan_id")
            if plan_id:
                current_user.plan = models.UserPlan[plan_id.upper()]
                current_user.stripe_subscription_id = session.get("subscription")
                current_user.last_payment_date = datetime.utcnow()
                db.commit()
            
            return {
                "status": "success",
                "paid": True,
                "plan": plan_id,
            }
        else:
            return {
                "status": "pending",
                "paid": False,
            }
    except stripe.error.StripeError as e:
        logger.error(f"Erro ao verificar sessão: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao verificar sessão: {str(e)}"
        )

@router.get("/my-subscription")
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Obtém informações da assinatura do usuário"""
    if not current_user.stripe_customer_id:
        return {
            "has_subscription": False,
            "plan": current_user.plan.value if current_user.plan else "free",
        }
    
    try:
        # Buscar subscriptions ativas
        subscriptions = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            status="active",
            limit=1
        )
        
        if not subscriptions.data:
            return {
                "has_subscription": False,
                "plan": current_user.plan.value if current_user.plan else "free",
            }
        
        subscription = subscriptions.data[0]
        
        # Buscar payment methods do customer
        payment_methods = stripe.PaymentMethod.list(
            customer=current_user.stripe_customer_id,
            type="card"
        )
        
        card_info = None
        if payment_methods.data:
            pm = payment_methods.data[0]
            if hasattr(pm, 'card') and pm.card:
                card_info = {
                    "last4": pm.card.last4,
                    "brand": pm.card.brand,
                    "exp_month": pm.card.exp_month,
                    "exp_year": pm.card.exp_year,
                }
        
        # Calcular data de início (created)
        subscribed_since = None
        if subscription.created:
            subscribed_since = datetime.fromtimestamp(subscription.created)
        
        # Próxima cobrança
        next_billing = None
        if subscription.current_period_end:
            next_billing = datetime.fromtimestamp(subscription.current_period_end)
        
        # Última cobrança
        last_payment = None
        amount = None
        if subscription.current_period_start:
            last_payment = datetime.fromtimestamp(subscription.current_period_start)
            # Buscar o valor do plano
            if subscription.items.data:
                price = subscription.items.data[0].price
                amount = price.unit_amount / 100 if price.unit_amount else None  # Converter de centavos para reais
        
        # Identificar o plano
        plan_name = "free"
        if subscription.items.data:
            price_id = subscription.items.data[0].price.id
            # Verificar qual produto corresponde ao price
            for plan_id, product_id in PLAN_PRODUCT_IDS.items():
                try:
                    product_prices = stripe.Price.list(product=product_id, active=True)
                    if any(p.id == price_id for p in product_prices.data):
                        plan_name = plan_id
                        break
                except:
                    continue
        
        return {
            "has_subscription": True,
            "subscription_id": subscription.id,
            "plan": plan_name,
            "status": subscription.status,
            "subscribed_since": subscribed_since.isoformat() if subscribed_since else None,
            "next_billing": next_billing.isoformat() if next_billing else None,
            "last_payment": last_payment.isoformat() if last_payment else None,
            "amount": amount,
            "card_last4": card_info["last4"] if card_info else None,
            "card_brand": card_info["brand"] if card_info else None,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Erro ao buscar subscription: {e}")
        return {
            "has_subscription": False,
            "plan": current_user.plan.value if current_user.plan else "free",
            "error": str(e),
        }

@router.post("/cancel-subscription")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Cancela a assinatura do usuário"""
    if not current_user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="Usuário não possui assinatura ativa")
    
    try:
        subscription = stripe.Subscription.retrieve(current_user.stripe_subscription_id)
        stripe.Subscription.delete(subscription.id)
        
        # Atualizar usuário
        current_user.plan = models.UserPlan.FREE
        current_user.stripe_subscription_id = None
        current_user.next_payment_date = None
        db.commit()
        
        return {"message": "Assinatura cancelada com sucesso"}
    except stripe.error.StripeError as e:
        logger.error(f"Erro ao cancelar subscription: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao cancelar assinatura: {str(e)}"
        )

@router.post("/upgrade-downgrade")
def upgrade_downgrade(
    new_plan_id: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Faz upgrade ou downgrade da assinatura (apenas player <-> MVP)"""
    if new_plan_id not in ["free", "pro"]:
        raise HTTPException(status_code=400, detail="Apenas upgrade/downgrade entre Player e MVP é permitido")
    
    if current_user.plan.value not in ["free", "pro"]:
        raise HTTPException(status_code=400, detail="Apenas usuários Player ou MVP podem fazer upgrade/downgrade")
    
    if not current_user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="Usuário não possui assinatura ativa")
    
    try:
        subscription = stripe.Subscription.retrieve(current_user.stripe_subscription_id)
        
        # Buscar novo price ID
        product_id = PLAN_PRODUCT_IDS[new_plan_id]
        new_price_id = get_price_id_for_product(product_id)
        
        # Atualizar subscription
        stripe.Subscription.modify(
            subscription.id,
            items=[{
                "id": subscription.items.data[0].id,
                "price": new_price_id,
            }],
            proration_behavior="always_invoice",
        )
        
        # Atualizar usuário
        current_user.plan = models.UserPlan[new_plan_id.upper()]
        db.commit()
        
        return {"message": f"Plano alterado para {new_plan_id} com sucesso"}
    except stripe.error.StripeError as e:
        logger.error(f"Erro ao fazer upgrade/downgrade: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao alterar plano: {str(e)}"
        )

