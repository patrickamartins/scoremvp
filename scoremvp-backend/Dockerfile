FROM python:3.11-slim

WORKDIR /app

# Instala dependências
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código (incluindo frontend/build se estiver aqui)
COPY . .

# Define a porta padrão (Railway usa 8080 para HTTP)
ENV PORT 8080

EXPOSE 8080

# Use sh -c com expansão e valor default se PORT não estiver definido
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT:-3306} app:app"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD sh -c "curl -f http://localhost:${PORT:-3306}/health || exit 1"
