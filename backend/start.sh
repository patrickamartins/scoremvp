#!/bin/bash

# Garantir que PORT seja um número
if [ -z "$PORT" ]; then
    PORT=8000
fi

# Remover qualquer caractere não numérico
PORT=$(echo $PORT | tr -cd '0-9')

echo "Starting server on port $PORT"
echo "Current directory: $(pwd)"
echo "Files in directory: $(ls -la)"
echo "PYTHONPATH: $PYTHONPATH"

# Garante que a pasta de uploads existe antes de iniciar o servidor
mkdir -p app/media/avatars

# Verifica se o uvicorn está instalado
python -c "import uvicorn" || { echo "uvicorn não está instalado!"; exit 1; }

# Inicia o FastAPI/Uvicorn com mais logs
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level debug 