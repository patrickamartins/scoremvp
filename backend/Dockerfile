FROM python:3.10-slim

WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primeiro para aproveitar cache do Docker
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar apenas a pasta app do backend
COPY app ./app

# Garantir que o PYTHONPATH inclui o diretório atual
ENV PYTHONPATH=/app

ENV PORT=8000
EXPOSE ${PORT}

# Criar diretório de mídia
RUN mkdir -p /app/app/media/avatars

# Criar script de entrada simples
RUN echo '#!/bin/sh\nPORT=${PORT:-8000}\nexec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --log-level info' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]

