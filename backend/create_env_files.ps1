# Script PowerShell para criar arquivos .env

# Backend .env
$backendEnv = @"
# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=scoremvp

# API Configuration
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here-change-in-production-use-a-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# CORS Configuration
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:3003", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3003", "http://127.0.0.1:5173"]

# Frontend URL
FRONTEND_URL=http://localhost:3003

# Environment
ENVIRONMENT=development

# Stripe Configuration (Test Mode)
# IMPORTANTE: Substitua pelas suas chaves reais do Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID_PRO=price_your_pro_price_id_here
STRIPE_PRICE_ID_TEAM=price_your_team_price_id_here

# Email Configuration (MailerSend)
# IMPORTANTE: Substitua pelas suas credenciais reais do MailerSend
MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_SMTP_USERNAME=your_mailersend_smtp_username_here
MAILERSEND_SMTP_PASSWORD=your_mailersend_smtp_password_here
MAILERSEND_SENDER_EMAIL=no-reply@scoremvp.com
MAILERSEND_SENDER_NAME=ScoreMVP

# Security
SECURITY_PASSWORD_SALT=scoremvp-salt-2024
"@

# Frontend .env
$frontendEnv = @"
# API URL
VITE_API_URL=http://localhost:8000/api

# Stripe Public Key (Test Mode)
# IMPORTANTE: Substitua pela sua chave pública do Stripe Dashboard
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
"@

# Criar arquivos
$backendEnv | Out-File -FilePath "backend\.env" -Encoding utf8
$frontendEnv | Out-File -FilePath "frontend\.env" -Encoding utf8

Write-Host "Arquivos .env criados com sucesso!"
Write-Host "- backend\.env"
Write-Host "- frontend\.env"

