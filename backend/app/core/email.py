from jinja2 import Environment, FileSystemLoader
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.template_dir = Path(__file__).parent.parent / "templates"
        self.env = Environment(loader=FileSystemLoader(str(self.template_dir)))
        self.sender_email = settings.MAILERSEND_SENDER_EMAIL
        self.sender_name = settings.MAILERSEND_SENDER_NAME
        self.smtp_username = settings.MAILERSEND_SMTP_USERNAME
        self.smtp_password = settings.MAILERSEND_SMTP_PASSWORD
        self.smtp_server = settings.MAILERSEND_SMTP_HOST
        self.smtp_port = settings.MAILERSEND_SMTP_PORT
        self.api_key = settings.MAILERSEND_API_KEY
        self.use_api = bool(self.api_key)

    def _render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """Renderiza um template HTML com o contexto fornecido"""
        try:
            template = self.env.get_template(f"{template_name}.html")
            return template.render(**context)
        except Exception as e:
            logger.error(f"Erro ao renderizar template {template_name}: {e}")
            # Retorna um template básico em caso de erro
            return f"""
            <html>
                <body>
                    <h2>{context.get('subject', 'ScoreMVP')}</h2>
                    <p>{context.get('message', '')}</p>
                </body>
            </html>
            """

    def _send_via_api(self, to_email: str, subject: str, html_body: str, to_name: Optional[str] = None) -> bool:
        """Envia email usando MailerSend API"""
        if not self.api_key:
            logger.warning("MAILERSEND_API_KEY não configurada, usando SMTP")
            return False
        
        try:
            url = "https://api.mailersend.com/v1/email"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            }
            
            payload = {
                "from": {
                    "email": self.sender_email,
                    "name": self.sender_name
                },
                "to": [
                    {
                        "email": to_email,
                        "name": to_name or to_email.split("@")[0]
                    }
                ],
                "subject": subject,
                "html": html_body
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            logger.info(f"Email enviado via API para {to_email}")
            return True
        except requests.exceptions.HTTPError as e:
            error_detail = ""
            try:
                error_detail = response.json() if hasattr(e, 'response') and e.response else ""
            except:
                pass
            
            # Verificar se é erro de domínio não verificado
            if hasattr(e, 'response') and e.response:
                if e.response.status_code == 422:
                    error_text = str(e.response.text).lower()
                    if "domain must be verified" in error_text or "ms42207" in error_text:
                        logger.error(f"Erro ao enviar email via API: Domínio '{self.sender_email.split('@')[1]}' não está verificado no MailerSend. Por favor, verifique o domínio na sua conta MailerSend.")
                    else:
                        logger.error(f"Erro ao enviar email via API: {e.response.status_code} - {e.response.text}")
                else:
                    logger.error(f"Erro ao enviar email via API: {e.response.status_code} - {e.response.text}")
            else:
                logger.error(f"Erro ao enviar email via API: {e}")
            return False
        except Exception as e:
            logger.error(f"Erro ao enviar email via API: {e}")
            return False

    def _send_via_smtp(self, to_email: str, subject: str, html_body: str) -> bool:
        """Envia email usando SMTP"""
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{self.sender_name} <{self.sender_email}>"
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.sender_email, to_email, msg.as_string())
            
            logger.info(f"Email enviado via SMTP para {to_email}")
            return True
        except smtplib.SMTPDataError as e:
            error_msg = str(e).lower()
            if "domain must be verified" in error_msg or "ms42207" in error_msg:
                logger.error(f"Erro ao enviar email via SMTP: Domínio '{self.sender_email.split('@')[1]}' não está verificado no MailerSend. Por favor, verifique o domínio na sua conta MailerSend.")
            else:
                logger.error(f"Erro ao enviar email via SMTP: {e}")
            return False
        except Exception as e:
            logger.error(f"Erro ao enviar email via SMTP: {e}")
            return False

    def send_email(self, to_email: str, subject: str, html_body: str, to_name: Optional[str] = None) -> bool:
        """Envia email usando API ou SMTP como fallback"""
        if self.use_api:
            if self._send_via_api(to_email, subject, html_body, to_name):
                return True
            # Fallback para SMTP se API falhar
            logger.warning("Falha ao enviar via API, tentando SMTP...")
        
        return self._send_via_smtp(to_email, subject, html_body)

    def send_activation_email(self, email: str, name: str, activation_token: str) -> bool:
        """Envia email de ativação de conta"""
        activation_url = f"{settings.FRONTEND_URL}/activate?token={activation_token}"
        context = {
            "user_name": name,
            "activation_url": activation_url,
            "frontend_url": settings.FRONTEND_URL
        }
        html_content = self._render_template("account_activation", context)
        subject = "Ative sua conta - ScoreMVP"
        return self.send_email(email, subject, html_content, name)

    def send_welcome_email(self, email: str, name: str) -> bool:
        """Envia email de boas-vindas após ativação"""
        context = {
            "user_name": name,
            "frontend_url": settings.FRONTEND_URL
        }
        html_content = self._render_template("welcome", context)
        subject = "Bem-vindo ao ScoreMVP!"
        return self.send_email(email, subject, html_content, name)

    def send_password_reset_email(self, email: str, reset_token: str) -> bool:
        """Envia email de recuperação de senha"""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        context = {
            "reset_url": reset_url,
            "user_email": email,
            "frontend_url": settings.FRONTEND_URL
        }
        html_content = self._render_template("password_reset", context)
        subject = "Recuperação de Senha - ScoreMVP"
        return self.send_email(email, subject, html_content)

    def send_agenda_event_email(self, email: str, name: str, event_title: str, event_date: str, event_type: str = "criado") -> bool:
        """Envia email sobre evento da agenda (criado ou removido)"""
        context = {
            "user_name": name,
            "event_title": event_title,
            "event_date": event_date,
            "event_type": event_type,
            "frontend_url": settings.FRONTEND_URL
        }
        html_content = self._render_template("agenda_event", context)
        subject = f"Evento {event_type} na Agenda - ScoreMVP"
        return self.send_email(email, subject, html_content, name)

    def send_game_finished_email(self, email: str, name: str, game_opponent: str, game_date: str, game_id: int) -> bool:
        """Envia email quando partida é finalizada"""
        game_url = f"{settings.FRONTEND_URL}/dashboard?game={game_id}"
        context = {
            "user_name": name,
            "game_opponent": game_opponent,
            "game_date": game_date,
            "game_url": game_url,
            "frontend_url": settings.FRONTEND_URL
        }
        html_content = self._render_template("game_finished", context)
        subject = f"Estatísticas disponíveis - {game_opponent} - ScoreMVP"
        return self.send_email(email, subject, html_content, name)

    def send_subscription_email(self, email: str, name: str, subscription_type: str, plan_name: str) -> bool:
        """Envia email transacional sobre assinatura"""
        context = {
            "user_name": name,
            "subscription_type": subscription_type,  # confirmed, upgraded, charged, cancelled
            "plan_name": plan_name,
            "frontend_url": settings.FRONTEND_URL
        }
        html_content = self._render_template("subscription", context)
        subject_map = {
            "confirmed": "Confirmação de Assinatura - ScoreMVP",
            "upgraded": "Upgrade de Plano - ScoreMVP",
            "charged": "Cobrança Realizada - ScoreMVP",
            "cancelled": "Assinatura Cancelada - ScoreMVP"
        }
        subject = subject_map.get(subscription_type, "Atualização de Assinatura - ScoreMVP")
        return self.send_email(email, subject, html_content, name)

    def send_custom_email(self, to_email: str, subject: str, html_body: str, to_name: Optional[str] = None) -> bool:
        """Envia email customizado"""
        return self.send_email(to_email, subject, html_body, to_name)

email_service = EmailService()
