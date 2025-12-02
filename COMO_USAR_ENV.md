# Como Gerenciar Arquivos .env

## Estrutura de Arquivos

Para manter as configurações organizadas e seguras, usamos a seguinte estrutura:

### Frontend
- `.env.example` - Template (pode ser commitado no Git)
- `.env.local` - Configurações para desenvolvimento local (NÃO commitado)
- `.env.production` - Configurações para produção (NÃO commitado)
- `.env` - Arquivo padrão (NÃO commitado, mas pode ser usado)

### Backend
- `.env.example` - Template (pode ser commitado no Git)
- `.env.local` - Configurações para desenvolvimento local (NÃO commitado)
- `.env` - Arquivo padrão (NÃO commitado, mas pode ser usado)

## Como Usar

### Para Desenvolvimento Local

1. **Frontend:**
   ```bash
   cd frontend
   # Copie o .env.local para .env (ou use diretamente o .env.local)
   cp .env.local .env
   ```

2. **Backend:**
   ```bash
   cd backend
   # Copie o .env.local para .env (ou use diretamente o .env.local)
   cp .env.local .env
   ```

### Para Produção (Railway)

**IMPORTANTE:** No Railway, configure as variáveis de ambiente diretamente no painel, não use arquivos `.env`.

1. Acesse o painel do Railway
2. Vá em "Variables"
3. Adicione todas as variáveis necessárias

### Como Editar os Arquivos .env

Os arquivos `.env` estão no `.gitignore` por segurança, mas você pode editá-los normalmente:

1. **No VS Code/Cursor:**
   - Os arquivos aparecem normalmente
   - Você pode editá-los diretamente
   - Eles não serão commitados no Git

2. **Se o arquivo não aparecer:**
   - Verifique se está no `.gitignore`
   - Use `Ctrl+Shift+P` → "File: Reveal in File Explorer"
   - Ou edite diretamente pelo explorador de arquivos

### Solução Rápida

Se você precisa editar o `.env` e ele está bloqueado:

1. **Opção 1: Usar .env.local**
   - Edite `frontend/.env.local` ou `backend/.env.local`
   - Copie para `.env` quando necessário

2. **Opção 2: Remover do .gitignore temporariamente**
   - Edite o `.gitignore` na raiz
   - Comente a linha `.env` (adicione `#` no início)
   - Edite o arquivo
   - Descomente a linha no `.gitignore`
   - **NÃO COMMITE o .env!**

3. **Opção 3: Usar variáveis de ambiente do sistema**
   - Configure as variáveis diretamente no sistema operacional
   - O Vite/Python vai ler automaticamente

## Estrutura Recomendada

### Desenvolvimento Local
```
frontend/.env.local  → Use este arquivo para desenvolvimento
backend/.env.local   → Use este arquivo para desenvolvimento
```

### Produção (Railway)
- Configure as variáveis diretamente no painel do Railway
- Não use arquivos `.env` em produção

## Verificação

Para verificar se as variáveis estão sendo lidas:

**Frontend:**
```bash
cd frontend
npm run dev
# Verifique no console do navegador: console.log(import.meta.env)
```

**Backend:**
```bash
cd backend
python -c "from app.core.config import settings; print(settings.STRIPE_API_KEY)"
```

