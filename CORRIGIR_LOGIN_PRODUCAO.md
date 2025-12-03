# 🔧 Corrigir Login em Produção

## Problema

O frontend está tentando conectar em `localhost:8000` mesmo em produção, causando erro de conexão.

## ✅ Solução

### 1. Verificar Variáveis de Ambiente no Railway (Frontend)

**IMPORTANTE:** As variáveis `VITE_*` precisam estar configuradas **ANTES** do build, pois o Vite as injeta durante a compilação.

1. Acesse: https://railway.app
2. Selecione o projeto **ScoreMVP**
3. Selecione o serviço **Frontend**
4. Vá em **Variables**
5. Verifique se existe:
   ```
   VITE_API_URL=https://scoremvpback-production.up.railway.app/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (sua chave pública)
   ```

### 2. Se Não Existir, Adicionar

1. Clique em **+ New Variable**
2. Nome: `VITE_API_URL`
3. Valor: `https://scoremvpback-production.up.railway.app/api`
4. Clique em **Add**
5. Repita para `VITE_STRIPE_PUBLISHABLE_KEY` se necessário

### 3. Rebuild Obrigatório

**CRÍTICO:** Após adicionar/modificar variáveis `VITE_*`, você **DEVE** fazer um novo build:

1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. Ou faça um novo commit para triggerar um novo build

**Por quê?** O Vite injeta as variáveis `VITE_*` durante o build, não em runtime. Se você apenas adicionar a variável sem rebuild, ela não será incluída no bundle.

### 4. Verificar URL do Backend

Se a URL do backend mudou:

1. Vá no serviço **Backend** no Railway
2. Vá em **Settings** → **Networking**
3. Copie a URL pública (ex: `https://scoremvpback-production.up.railway.app`)
4. Use essa URL + `/api` na variável `VITE_API_URL`
5. **Faça rebuild do frontend**

## 🐛 Debug

Após fazer o deploy, abra o console do navegador (F12) e verifique:

- ✅ Deve aparecer: `[API] Base URL configurada: https://scoremvpback-production.up.railway.app/api`
- ❌ Se aparecer `localhost:8000`, a variável não está configurada ou o build não foi refeito

## 📋 Checklist

- [ ] Variável `VITE_API_URL` configurada no Railway (Frontend)
- [ ] Variável `VITE_STRIPE_PUBLISHABLE_KEY` configurada (se usar Stripe)
- [ ] Rebuild do frontend feito após adicionar variáveis
- [ ] Console do navegador mostra URL de produção (não localhost)
- [ ] Login funciona corretamente

## 🔄 Alternativa: Usar Detecção Automática

O código foi atualizado para detectar automaticamente o ambiente baseado no hostname. Se você estiver acessando via `scoremvp.com.br` ou `railway.app`, ele deve usar automaticamente a URL de produção, mesmo sem a variável de ambiente.

Porém, **recomendamos sempre configurar a variável** para garantir comportamento consistente.

