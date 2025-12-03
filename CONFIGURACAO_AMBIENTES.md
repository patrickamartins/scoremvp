# 🔧 Configuração de Ambientes - ScoreMVP

## 📁 Arquivo `.env` do Frontend

O arquivo `frontend/.env` é **APENAS para desenvolvimento local** e **NÃO é commitado** no Git.

### ✅ Configuração Atual (Correta para Local)

```env
# Configurações para desenvolvimento LOCAL
# Este arquivo não é commitado no Git

# API Configuration
VITE_API_URL=http://localhost:8000/api

# Stripe Configuration (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Isso está correto!** Este arquivo é usado quando você roda `npm run dev` localmente.

## 🚀 Produção no Railway

Para produção, as variáveis de ambiente **NÃO vêm do arquivo `.env`**, mas sim do painel do Railway.

### Como Configurar no Railway

1. Acesse: https://railway.app
2. Selecione o projeto **ScoreMVP**
3. Selecione o serviço **Frontend**
4. Vá em **Variables**
5. Adicione as variáveis:

```
VITE_API_URL=https://scoremvpback-production.up.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (sua chave pública)
```

### ⚠️ Importante

- O arquivo `.env` **NÃO vai para produção** (está no `.gitignore`)
- As variáveis no Railway são injetadas **durante o build** do Docker/Nixpacks
- Após adicionar variáveis no Railway, **sempre faça rebuild** do frontend

## 🔄 Fluxo de Trabalho

### Desenvolvimento Local
```bash
# Usa o arquivo frontend/.env
npm run dev
# Conecta em: http://localhost:8000/api
```

### Produção (Railway)
```bash
# Railway usa variáveis do painel
# Build automático ao fazer push
# Conecta em: https://scoremvpback-production.up.railway.app/api
```

## 📋 Resumo

| Ambiente | Fonte das Variáveis | URL da API |
|----------|---------------------|------------|
| **Local** | `frontend/.env` | `http://localhost:8000/api` |
| **Produção** | Painel Railway (Variables) | `https://scoremvpback-production.up.railway.app/api` |

## ✅ Conclusão

O arquivo `.env` está **correto** para desenvolvimento local. Para produção, configure as variáveis no painel do Railway.

