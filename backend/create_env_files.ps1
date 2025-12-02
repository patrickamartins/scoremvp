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
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_TEAM=

# Email Configuration
MAILERSEND_API_KEY=mlsn.633a7b62f3a7bbea05355a9fbd6828756c31b6a07effb34d03d3addbd71b4e1b
MAILERSEND_SMTP_USERNAME=MS_xqZKL5@scoremvp.com
MAILERSEND_SMTP_PASSWORD=mssp.yAA7z00.yzkq3403xv04d796.WgibWXG
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
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RN6g1C4MzjUUyB7VX01q3f4OiOu8izn5BKLNnUmKkfICrvjIX5S2MFvmmF7zokjrYszc1EsJXnh2rpcxZ3c2yH50016TzlQQK
"@

# Criar arquivos
$backendEnv | Out-File -FilePath "backend\.env" -Encoding utf8
$frontendEnv | Out-File -FilePath "frontend\.env" -Encoding utf8

Write-Host "Arquivos .env criados com sucesso!"
Write-Host "- backend\.env"
Write-Host "- frontend\.env"

