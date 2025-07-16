# Score MVP Image Service

Serviço separado para armazenar e servir imagens do Score MVP.

## Estrutura

```
image-service/
├── main.py              # Servidor FastAPI
├── requirements.txt      # Dependências Python
├── railway.toml         # Configuração Railway
├── README.md           # Este arquivo
└── images/             # Pasta onde as imagens são salvas
```

## Endpoints

- `GET /` - Status do serviço
- `GET /health` - Health check
- `GET /images/{filename}` - Buscar imagem específica
- `GET /list` - Listar todas as imagens

## Como usar

1. Deploy no Railway como um novo serviço
2. O serviço principal fará upload das imagens para este serviço
3. As URLs das imagens apontarão para este serviço

## Vantagens

- Imagens persistem entre deploys do serviço principal
- Serviço dedicado só para imagens
- Mais simples que migrar para storage externo 