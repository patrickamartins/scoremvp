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

# Copiar start.sh
COPY start.sh .
RUN chmod +x start.sh

# Copiar apenas a pasta app do backend
COPY app ./app

# Garantir que o PYTHONPATH inclui o diretório atual
ENV PYTHONPATH=/app

ENV PORT=8000
EXPOSE ${PORT}

CMD ["./start.sh"] 