#!/bin/bash
set -e  # Exit on error

# Garantir que PORT seja um número
if [ -z "$PORT" ]; then
    PORT=8000
fi

# Remover qualquer caractere não numérico
PORT=$(echo $PORT | tr -cd '0-9')

echo "=========================================="
echo "Starting ScoreMVP Backend Server"
echo "=========================================="
echo "Port: $PORT"
echo "Current directory: $(pwd)"
echo "PYTHONPATH: $PYTHONPATH"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..." # Mostrar apenas primeiros 50 caracteres por segurança

# Garante que a pasta de uploads existe antes de iniciar o servidor
mkdir -p app/media/avatars
echo "✓ Media directory created"

# Verifica se o uvicorn está instalado
echo "Checking uvicorn installation..."
python -c "import uvicorn; print(f'✓ uvicorn version: {uvicorn.__version__}')" || { 
    echo "❌ uvicorn não está instalado!"; 
    exit 1; 
}

# Verifica se o app.main pode ser importado
echo "Checking app.main import..."
python -c "from app.main import app; print('✓ app.main imported successfully')" || { 
    echo "❌ Erro ao importar app.main!"; 
    echo "Tentando importar módulos individuais para diagnóstico..."
    python -c "import app.core.config" || echo "Erro ao importar config"
    python -c "import app.database" || echo "Erro ao importar database"
    exit 1; 
}

echo "=========================================="
echo "Starting Uvicorn server..."
echo "=========================================="

# Inicia o FastAPI/Uvicorn
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port $PORT \
    --log-level info \
    --timeout-keep-alive 30 \
    --access-log 