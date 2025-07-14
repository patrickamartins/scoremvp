#!/bin/bash

# Script para executar migrations na Railway
# Execute este script no console da Railway ou via SSH

echo "🚀 Iniciando migrations na Railway..."

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não está definida"
    exit 1
fi

echo "🔗 DATABASE_URL encontrada"

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    echo "🐍 Ativando ambiente virtual..."
    source venv/bin/activate
fi

# Instalar dependências se necessário
echo "📦 Verificando dependências..."
pip install -r requirements.txt

# Rodar migrations
echo "🔄 Executando migrations..."
alembic upgrade head

# Verificar se as migrations foram aplicadas
echo "✅ Migrations concluídas!"

# Verificar estrutura da tabela users
echo "📋 Verificando estrutura da tabela users..."
python -c "
import os
from sqlalchemy import create_engine, text

engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    result = conn.execute(text('SELECT column_name FROM information_schema.columns WHERE table_name = \\'users\\' ORDER BY ordinal_position'))
    columns = [row[0] for row in result.fetchall()]
    print('Colunas da tabela users:')
    for col in columns:
        print(f'  - {col}')
    
    if 'number' in columns:
        print('✅ Coluna number existe')
    else:
        print('❌ Coluna number não existe')
"

echo "✅ Verificação concluída!" 