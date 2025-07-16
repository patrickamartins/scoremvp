# 🖼️ Configuração do Serviço de Imagens

## Passo a Passo

### 1. Deploy do Serviço de Imagens

```bash
# Navegar para a pasta do serviço de imagens
cd image-service

# Dar permissão de execução ao script
chmod +x deploy.sh

# Executar o deploy
./deploy.sh
```

### 2. Configurar Variável de Ambiente

No serviço principal (backend), adicione a variável de ambiente:

```bash
IMAGE_SERVICE_URL=https://scoremvp-images-production.up.railway.app
```

### 3. Testar o Serviço

```bash
# Health check
curl https://scoremvp-images-production.up.railway.app/health

# Listar imagens
curl https://scoremvp-images-production.up.railway.app/list
```

## Estrutura Final

```
scoremvp/
├── backend/                    # Serviço principal
│   └── app/
│       └── api/endpoints/
│           └── users.py        # Upload para serviço de imagens
└── image-service/              # Serviço de imagens
    ├── main.py
    ├── requirements.txt
    ├── railway.toml
    └── images/                 # Pasta persistente
```

## Vantagens

✅ **Imagens persistem** entre deploys do serviço principal  
✅ **Serviço dedicado** só para imagens  
✅ **Fallback automático** se o serviço de imagens estiver indisponível  
✅ **Mais simples** que migrar para storage externo  
✅ **Sem custos adicionais** (Railway gratuito)  

## URLs

- **Serviço Principal**: `https://scoremvpback-production.up.railway.app`
- **Serviço de Imagens**: `https://scoremvp-images-production.up.railway.app`
- **Frontend**: `https://scoremvp-frontend-production.up.railway.app`

## Fluxo de Upload

1. Frontend faz upload para `/api/users/{user_id}/photo`
2. Backend salva temporariamente e envia para serviço de imagens
3. Backend retorna URL do serviço de imagens
4. Frontend exibe imagem do serviço de imagens
5. Se serviço de imagens falhar, usa fallback local 