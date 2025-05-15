FROM python:3.11-slim

WORKDIR /app

# Instala dependências
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código (incluindo frontend/build se estiver aqui)
COPY . .

# Garanta que o PORT padrão é 8080 (Railway usa 8080 para HTTP)
ENV PORT 8080

# Expõe a porta (opcional, o Railway já faz isso)
EXPOSE 8080

# Usa shell form para que $PORT seja expandido
CMD gunicorn --bind 0.0.0.0:$PORT app:app

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1
