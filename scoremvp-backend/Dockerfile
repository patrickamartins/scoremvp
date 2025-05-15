FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT 8080
EXPOSE 8080

 # (não precisamos mais forçar ENV PORT 8080 — o Railway injeta o $PORT)
 EXPOSE 8080

 # usa shell form para expandir $PORT no runtime
 CMD gunicorn --bind 0.0.0.0:$PORT app:app

 # healthcheck interno (opcional, pois o Railway já faz /health)
 HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
   CMD curl -f http://localhost:$PORT/health || exit 1
