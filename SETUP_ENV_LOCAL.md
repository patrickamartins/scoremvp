# Configuração de Ambiente Local

## Backend (.env)

Crie o arquivo `backend/.env` com o seguinte conteúdo:

```env
# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=scoremvp

# API Configuration
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here-change-in-production-use-strong-random-key
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# CORS Configuration
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:3003", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3003", "http://127.0.0.1:5173"]

# Frontend URL
FRONTEND_URL=http://localhost:3003

# Environment
ENVIRONMENT=development

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_API_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
# Nota: Você precisará criar os produtos no Stripe Dashboard e obter os Price IDs
# Depois substitua os valores abaixo pelos IDs reais dos produtos
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_TEAM=price_xxxxx

# Email Configuration (MailerSend)
MAILERSEND_API_KEY=mlsn.633a7b62f3a7bbea05355a9fbd6828756c31b6a07effb34d03d3addbd71b4e1b
MAILERSEND_SMTP_HOST=smtp.mailersend.net
MAILERSEND_SMTP_PORT=587
MAILERSEND_SMTP_USERNAME=MS_xqZKL5@scoremvp.com
MAILERSEND_SMTP_PASSWORD=mssp.yAA7z00.yzkq3403xv04d796.WgibWXG
MAILERSEND_SENDER_EMAIL=no-reply@scoremvp.com.br
MAILERSEND_SENDER_NAME=ScoreMVP
```

## Frontend (.env)

Crie o arquivo `frontend/.env` com o seguinte conteúdo:

```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RN6g1C4MzjUUyB7VX01q3f4OiOu8izn5BKLNnUmKkfICrvjIX5S2MFvmmF7zokjrYszc1EsJXnh2rpcxZ3c2yH50016TzlQQK
```

## Próximos Passos

1. **Criar produtos no Stripe Dashboard:**
   - Acesse https://dashboard.stripe.com/test/products
   - Crie dois produtos:
     - **MVP (Pro)**: R$ 19,90/mês
     - **Team**: R$ 199/mês
   - Copie os **Price IDs** (começam com `price_`) e substitua no `backend/.env`:
     - `STRIPE_PRICE_ID_PRO=price_xxxxx`
     - `STRIPE_PRICE_ID_TEAM=price_xxxxx`

2. **Configurar Webhook do Stripe:**
   - Acesse https://dashboard.stripe.com/test/webhooks
   - Clique em "Add endpoint"
   - URL: `http://localhost:8000/api/stripe/webhook` (para desenvolvimento local, use ngrok ou similar)
   - Eventos a escutar:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
   - Copie o **Signing secret** (começa com `whsec_`) e substitua no `backend/.env`:
     - `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

3. **Iniciar o banco de dados PostgreSQL:**
   ```bash
   # Certifique-se de que o PostgreSQL está rodando
   # E que o banco 'scoremvp' existe
   ```

4. **Iniciar o backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Iniciar o frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Testando o Fluxo Completo

1. Acesse http://localhost:3003
2. Clique em "Criar conta"
3. Preencha o formulário de registro
4. Escolha um plano (Free, MVP ou Team)
5. Se escolher MVP ou Team, será redirecionado para o Stripe Checkout
6. Use um cartão de teste do Stripe: `4242 4242 4242 4242`
7. Após o pagamento, você será redirecionado para o dashboard

## Cartões de Teste do Stripe

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **Data de expiração**: Qualquer data futura (ex: 12/25)
- **CVC**: Qualquer 3 dígitos (ex: 123)

