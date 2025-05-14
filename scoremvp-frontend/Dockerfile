# stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app

# 1.1) Copia só manifestos e o postcss.config.js
COPY package.json package-lock.json postcss.config.js tailwind.config.js ./

# 1.2) Instala dependências (tanto dependencies quanto devDependencies)
RUN npm install

# 1.3) Copia o resto do código
COPY . .

# 1.4) Gera o build de produção
RUN npm run build

# stage 2: ship
FROM nginx:alpine
# remove site default do nginx
RUN rm -rf /usr/share/nginx/html/*

# 2.1) Copia o build estático
COPY --from=builder /app/build /usr/share/nginx/html

# expõe a porta 80
EXPOSE 80

# 2.2) Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
