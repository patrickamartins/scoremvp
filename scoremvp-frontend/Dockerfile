# -------- STAGE 1: build --------
FROM node:20-alpine AS builder
WORKDIR /app

# 1.1) Copia manifestos e configs de PostCSS/Tailwind
COPY package.json package-lock.json tailwind.config.js postcss.config.js ./

# 1.2) Garante instalação de devDependencies
ENV NODE_ENV=development
RUN npm install

# 1.3) Copia todo o resto do código
COPY . .

# 1.4) Gera o build de produção
RUN npm run build

# -------- STAGE 2: ship --------
FROM nginx:alpine
# Limpa o site default do nginx
RUN rm -rf /usr/share/nginx/html/*

# 2.1) Copia o build final
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
