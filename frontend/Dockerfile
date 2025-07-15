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
RUN npm run build

# Expor porta
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["npm", "run", "preview"] 