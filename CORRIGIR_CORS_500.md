# 🔧 Corrigir CORS e Erro 500

## Problemas Identificados

1. **CORS**: `https://scoremvp.com.br` não está sendo permitido
2. **500 Internal Server Error**: Erro no backend

## ✅ Soluções Aplicadas

### 1. CORS

- ✅ `https://scoremvp.com.br` já está na lista de origens permitidas
- ✅ Adicionado tratamento para garantir que CORS funcione mesmo se vier como string do ambiente
- ✅ Adicionado log para debug de CORS

### 2. Verificar Variáveis de Ambiente no Railway (Backend)

O problema pode ser que `BACKEND_CORS_ORIGINS` está sendo sobrescrito por uma variável de ambiente no Railway.

**Verificar no Railway:**
1. Acesse: https://railway.app
2. Selecione o serviço **Backend**
3. Vá em **Variables**
4. Verifique se existe `BACKEND_CORS_ORIGINS`
5. Se existir, verifique se contém `https://scoremvp.com.br`

**Se não contiver, adicione:**
```
BACKEND_CORS_ORIGINS=["https://scoremvp-frontend-production.up.railway.app","https://scoremvp.com.br","https://www.scoremvp.com.br"]
```

**Ou remova a variável** para usar os valores padrão do código.

### 3. Erro 500

O erro 500 pode ser causado por:
- Problema de conexão com o banco de dados
- Erro na autenticação
- Erro no código do endpoint `/auth/login`

**Verificar logs do backend no Railway:**
1. Acesse: https://railway.app
2. Selecione o serviço **Backend**
3. Vá em **Deployments**
4. Clique no último deployment
5. Veja os logs para identificar o erro 500

## 🔄 Após Fazer as Alterações

1. **Fazer commit das alterações:**
   ```bash
   git add backend/app/core/config.py backend/app/main.py
   git commit -m "fix: corrige CORS para scoremvp.com.br e adiciona logs de debug"
   git push origin railway-deploy
   ```

2. **Aguardar deploy no Railway**

3. **Testar novamente o login**

4. **Verificar logs do backend** se ainda houver erro

## 🐛 Debug

Para verificar se o CORS está funcionando:

1. Acesse: `https://scoremvpback-production.up.railway.app/api/debug-cors`
2. Deve retornar a lista de origens permitidas
3. Verifique se `https://scoremvp.com.br` está na lista

