# ✅ Solução para Arquivos .env

## Problema Resolvido

Os arquivos `.env` estão no `.gitignore` por segurança (para não commitar senhas e chaves), mas isso não impede você de editá-los.

## Estrutura Criada

### Frontend
- ✅ `.env` - Configurações ativas para desenvolvimento local
- ✅ `.env.local` - Template para desenvolvimento local
- ✅ `.env.production` - Template para produção (Railway)
- ✅ `.env.example` - Template genérico (pode ser commitado)

### Backend
- ✅ `.env` - Configurações ativas para desenvolvimento local
- ✅ `.env.local` - Template para desenvolvimento local
- ✅ `.env.example` - Template genérico (pode ser commitado)

## Como Editar os Arquivos .env

### Opção 1: Editar Diretamente (Recomendado)

Os arquivos `.env` podem ser editados normalmente no VS Code/Cursor:

1. Abra o arquivo `frontend/.env` ou `backend/.env`
2. Edite normalmente
3. Salve o arquivo

**Nota:** Se o arquivo não aparecer no explorador:
- Use `Ctrl+P` e digite `.env` para abrir
- Ou use o explorador de arquivos do Windows

### Opção 2: Usar os Templates

Se precisar trocar entre local e produção:

**Para desenvolvimento local:**
```powershell
cd frontend
Copy-Item .env.local .env -Force
```

**Para produção:**
```powershell
cd frontend
Copy-Item .env.production .env -Force
```

### Opção 3: Editar pelo Terminal

```powershell
# Frontend
notepad frontend\.env

# Backend
notepad backend\.env
```

## Configurações Atuais

### Frontend (.env)
- `VITE_API_URL=http://localhost:8000/api` (local)
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` (chave de teste)

### Backend (.env)
- `POSTGRES_SERVER=localhost`
- `STRIPE_SECRET_KEY=sk_test_...` (chave de teste)
- Configurações do MailerSend

## Para Produção (Railway)

**IMPORTANTE:** No Railway, NÃO use arquivos `.env`. Configure as variáveis diretamente no painel:

1. Acesse https://railway.app
2. Selecione seu projeto
3. Vá em "Variables"
4. Adicione todas as variáveis necessárias

### Variáveis Necessárias no Railway

**Backend:**
- `DATABASE_URL` (gerado automaticamente)
- `STRIPE_SECRET_KEY`
- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ID_TEAM`
- `MAILERSEND_API_KEY`
- `MAILERSEND_SMTP_USERNAME`
- `MAILERSEND_SMTP_PASSWORD`
- `FRONTEND_URL`
- `SECRET_KEY`
- `BACKEND_CORS_ORIGINS`

**Frontend (Railway):**
- `VITE_API_URL=https://scoremvpback-production.up.railway.app/api`
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

## Verificação

Para verificar se as variáveis estão sendo lidas:

**Frontend:**
```bash
cd frontend
npm run dev
# No console do navegador: console.log(import.meta.env)
```

**Backend:**
```bash
cd backend
python -c "from app.core.config import settings; print('Stripe Key:', settings.STRIPE_API_KEY[:20] + '...')"
```

## Backup

Backups dos arquivos originais foram criados:
- `frontend/.env.backup`
- `backend/.env.backup`

Se precisar restaurar:
```powershell
Copy-Item frontend\.env.backup frontend\.env -Force
Copy-Item backend\.env.backup backend\.env -Force
```

