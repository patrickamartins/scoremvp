# Verificar Variáveis de Ambiente no Railway

## 🔍 Problema

O frontend está tentando conectar em `localhost:8000` mesmo em produção, indicando que a variável `VITE_API_URL` não está configurada no Railway.

## ✅ Solução

### 1. Verificar Variáveis de Ambiente no Railway (Frontend)

1. Acesse: https://railway.app
2. Selecione o projeto **ScoreMVP**
3. Selecione o serviço **Frontend**
4. Vá em **Variables**
5. Verifique se existe a variável:
   ```
   VITE_API_URL=https://scoremvpback-production.up.railway.app/api
   ```

### 2. Se Não Existir, Adicionar

1. Clique em **+ New Variable**
2. Nome: `VITE_API_URL`
3. Valor: `https://scoremvpback-production.up.railway.app/api`
4. Clique em **Add**

### 3. Rebuild do Frontend

Após adicionar a variável:
1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. Ou faça um novo commit para triggerar um novo build

## 🔧 Alternativa: Verificar URL do Backend

Se a URL do backend mudou, atualize:

1. Vá no serviço **Backend** no Railway
2. Vá em **Settings** → **Networking**
3. Copie a URL pública (ex: `https://scoremvpback-production.up.railway.app`)
4. Use essa URL + `/api` na variável `VITE_API_URL`

## 📋 Variáveis Necessárias no Railway

### Frontend
```
VITE_API_URL=https://scoremvpback-production.up.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (sua chave pública)
```

### Backend
```
DATABASE_URL=<fornecido automaticamente>
FRONTEND_URL=https://scoremvp-frontend-production.up.railway.app
BACKEND_CORS_ORIGINS=["https://scoremvp-frontend-production.up.railway.app","https://scoremvp.com.br","https://www.scoremvp.com.br"]
STRIPE_SECRET_KEY=sk_test_... (sua chave secreta)
# ... outras variáveis
```

## 🐛 Debug

Após fazer o deploy, abra o console do navegador (F12) e verifique:
- Deve aparecer: `[API] Base URL configurada: https://scoremvpback-production.up.railway.app/api`
- Se aparecer `localhost:8000`, a variável não está configurada corretamente

