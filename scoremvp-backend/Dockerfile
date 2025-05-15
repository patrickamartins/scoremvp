FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia código Flask + build do React
COPY . .

# NÃO sobrescreva PORT
# EXPOSE 8080    # opcional, a plataforma já faz isso por você

# Inicia com Gunicorn na porta que a plataforma passar (via env PORT)
CMD ["gunicorn", "--bind", "0.0.0.0:0.0.0.0:$PORT", "app:app"]
# ou, se a sintaxe acima não funcionar, deixe:
# CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
