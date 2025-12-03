# 🐛 Debug: Variáveis de Ambiente no Railway

## Problema

O frontend está tentando conectar em `localhost:8000` mesmo com `VITE_API_URL` configurada no Railway.

## Possíveis Causas

### 1. Variável não está sendo injetada durante o build

O Vite substitui `import.meta.env.VITE_API_URL` **durante o build**, não em runtime. Se a variável não estiver disponível durante o build, ela será `undefined`.

**Solução:** Verificar se o Railway está injetando as variáveis durante o build do Docker.

### 2. Build antigo sem as variáveis

Se você adicionou as variáveis **depois** do último build, o código já foi compilado sem elas.

**Solução:** Fazer um **Redeploy** após adicionar as variáveis.

### 3. Dockerfile não está passando as variáveis corretamente

O Dockerfile precisa receber as variáveis como `ARG` e passá-las como `ENV` antes do build.

**Solução:** Verificar se o Dockerfile está configurado corretamente.

## ✅ Verificações

### 1. Verificar Variáveis no Railway

1. Acesse: https://railway.app
2. Selecione o serviço **Frontend**
3. Vá em **Variables**
4. Confirme que `VITE_API_URL` está presente e com o valor correto

### 2. Verificar Logs do Build

1. Vá em **Deployments**
2. Clique no último deployment
3. Verifique os logs do build
4. Procure por mensagens de erro ou avisos sobre variáveis de ambiente

### 3. Verificar Console do Navegador

Após o deploy, abra o console do navegador (F12) e verifique:

- `[API] import.meta.env.VITE_API_URL:` - Deve mostrar a URL de produção
- `[API] Base URL resolvida:` - Deve mostrar a URL de produção
- Se aparecer `localhost:8000`, a variável não foi injetada durante o build

### 4. Forçar Novo Build

1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. Aguarde o build completar
4. Teste novamente

## 🔧 Solução Implementada

O código foi atualizado para:

1. **Resolver a URL dinamicamente** a cada requisição (não no top-level)
2. **Adicionar logs detalhados** para debug
3. **Usar fallback de produção** se a variável não estiver disponível

## 📋 Próximos Passos

1. Fazer commit das alterações
2. Fazer push para o repositório
3. Aguardar o Railway fazer o deploy
4. Verificar os logs do console do navegador
5. Se ainda não funcionar, verificar os logs do build no Railway

