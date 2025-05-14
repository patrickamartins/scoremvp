FROM python:3.11-slim

WORKDIR /app

# 1) Copia requirements e instala no ambiente global
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Copia o resto do código
COPY . .

# 3) Define variáveis para o Flask
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=8000

EXPOSE 8000

# 4) Comando default que o Railway agora vai usar
CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]
