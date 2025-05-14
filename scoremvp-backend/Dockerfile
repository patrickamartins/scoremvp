# 1) Imagem base com Python
FROM python:3.11-slim

# 2) Define o diretório de trabalho
WORKDIR /app

# 3) Copia requirements e instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4) Copia todo o resto do código
COPY . .

# 5) Variáveis para o Flask
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=8000

# 6) Exponha a porta
EXPOSE 8000

# 7) Comando ÚNICO para rodar o Flask (sem usar 'source')
CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]
