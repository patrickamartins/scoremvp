FROM python:3.10-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primeiro para aproveitar o cache do Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o resto do código
COPY . .

# Tornar o script executável
RUN chmod +x start.sh

# Expor a porta dinâmica
ENV PORT=8000
EXPOSE ${PORT}

# Comando para iniciar a aplicação
CMD ./start.sh 