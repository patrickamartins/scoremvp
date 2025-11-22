# ✅ Checklist de Deploy - ScoreMVP

## 📋 Configurações Verificadas

### Frontend
- ✅ `.env` configurado com `VITE_API_URL=https://scoremvpback-production.up.railway.app/api`
- ✅ `resolve-api-base-url.ts` usa variável de ambiente corretamente
- ✅ Fallback para produção quando não há variável de ambiente
- ✅ `railway.toml` configurado

### Backend
- ✅ `config.py` com `FRONTEND_URL` padrão para produção
- ✅ `BACKEND_CORS_ORIGINS` inclui URLs de produção
- ✅ `DATABASE_URL` prioriza variável de ambiente (Railway)
- ✅ `railway.toml` configurado

## 🚀 Variáveis de Ambiente no Railway

### Frontend (Railway)
```
VITE_API_URL=https://scoremvpback-production.up.railway.app/api
```

### Backend (Railway)
```
DATABASE_URL=<fornecido automaticamente pelo Railway>
FRONTEND_URL=https://scoremvp-frontend-production.up.railway.app
BACKEND_CORS_ORIGINS=["https://scoremvp-frontend-production.up.railway.app","https://scoremvp.com.br"]
```

## 📝 Arquivos Modificados para Deploy

1. `frontend/.env` - Configurado para produção
2. `backend/app/core/config.py` - FRONTEND_URL padrão atualizado
3. Todos os componentes novos (GameScoreboard, SubstitutionModal)
4. BoxScoreTable atualizado com coluna MIN
5. Painel.tsx com sistema de substituições e tempo

## ⚠️ Importante

- O arquivo `.env` está no `.gitignore` (não será commitado)
- As variáveis de ambiente devem ser configuradas diretamente no Railway
- O backend usa `DATABASE_URL` do Railway automaticamente
- CORS já está configurado para as URLs de produção

## 🔄 Próximos Passos

1. Fazer commit das alterações
2. Push para o repositório
3. Railway fará deploy automaticamente
4. Verificar se as variáveis de ambiente estão configuradas no Railway

