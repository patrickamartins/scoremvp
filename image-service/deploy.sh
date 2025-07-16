#!/bin/bash

echo "🚀 Deployando Score MVP Image Service..."

# Verificar se o Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado. Instale com: npm install -g @railway/cli"
    exit 1
fi

# Fazer login no Railway (se necessário)
echo "📝 Verificando login no Railway..."
railway login

# Criar novo projeto (se necessário)
echo "🏗️  Criando projeto no Railway..."
railway init --name "scoremvp-images"

# Deploy
echo "📦 Fazendo deploy..."
railway up

echo "✅ Deploy concluído!"
echo "🌐 URL do serviço: https://scoremvp-images-production.up.railway.app"
echo "📋 Configure a variável IMAGE_SERVICE_URL no serviço principal com a URL acima" 