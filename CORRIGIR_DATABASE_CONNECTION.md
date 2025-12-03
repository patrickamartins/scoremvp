# 🔧 Corrigir Conexão com Banco de Dados

## Problema Identificado

O backend está tentando conectar em `localhost:5432` em vez de usar a `DATABASE_URL` do Railway, causando:

```
psycopg2.OperationalError: connection to server at "localhost" (::1), port 5432 failed: Connection refused
```

## ✅ Solução Aplicada

A lógica de conexão foi simplificada para:

1. **Prioridade 1**: Usar `DATABASE_URL` do ambiente (Railway) se existir
2. **Prioridade 2**: Usar configurações do `.env` (desenvolvimento local) se `DATABASE_URL` não existir

A lógica anterior tinha uma verificação que ignorava `DATABASE_URL` em certas condições, causando o problema em produção.

## 🔄 Próximos Passos

1. **Fazer commit e push:**
   ```bash
   git add backend/app/core/config.py
   git commit -m "fix: corrige conexão com banco de dados para priorizar DATABASE_URL do Railway"
   git push origin railway-deploy
   ```

2. **Aguardar deploy no Railway**

3. **Testar login novamente**

## 📋 Verificações

Após o deploy, verifique se o backend está usando a `DATABASE_URL` correta:

1. Acesse os logs do backend no Railway
2. Procure por: `[DB] Usando DATABASE_URL do ambiente:`
3. Deve mostrar a URL do Railway, não `localhost`

## ⚠️ Importante

A `DATABASE_URL` é fornecida automaticamente pelo Railway quando você conecta um banco de dados PostgreSQL ao serviço. Não é necessário configurá-la manualmente.

