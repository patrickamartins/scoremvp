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

exec uvicorn app.main:app --host 0.0.0.0 --port $PORT 