FROM python:3.10-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e start.sh primeiro
COPY requirements.txt .
COPY start.sh .

# Copiar apenas a pasta app do backend
COPY app ./app

RUN chmod +x start.sh

ENV PORT=8000
EXPOSE ${PORT}

CMD ./start.sh 