# Stage 1: Build do frontend React + Tailwind
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copia as definições de deps e instala incluindo devDeps
COPY scoremvp-frontend/package.json scoremvp-frontend/package-lock.json ./
RUN npm ci

# Copia todo o código do frontend e gera o build
COPY scoremvp-frontend/ .
# Gera o CSS minificado via Tailwind CLI e cria o tailwind.css
RUN npx tailwindcss -i ./src/index.css -o ./src/tailwind.css --minify
# Ajusta o import em index.js para usar o CSS gerado
RUN sed -i 's@import "./index.css";@import "./tailwind.css";@' src/index.js
RUN npm run build

# Stage 2: Build do backend Flask + cópia do build do frontend
FROM python:3.11-slim
WORKDIR /app

# Instala só as dependências Python
COPY scoremvp-backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código do back-end
COPY scoremvp-backend/ .

# Copia o build estático do front para onde o Flask vai servir
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Rota de healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Expõe a porta que o Railway passa em $PORT
EXPOSE 8080

# Executa o Gunicorn escutando em $PORT
CMD gunicorn --bind 0.0.0.0:$PORT app:app
