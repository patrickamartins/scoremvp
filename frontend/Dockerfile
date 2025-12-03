# Dockerfile para o frontend
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para o build)
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
# As variáveis de ambiente VITE_* devem estar disponíveis durante o build
# Railway injeta essas variáveis automaticamente
ARG VITE_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
RUN npm run build

# Expor porta
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["npm", "run", "preview"] 