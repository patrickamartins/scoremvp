# ScoreMVP

Sistema de registro e acompanhamento de estatísticas de jogos de basquete.

Este projeto é um **monorepo** contendo:

- `scoremvp-backend/`: Backend em Flask
- `scoremvp-frontend/`: Frontend em React

Hospedado na plataforma [Railway](https://railway.app/).

---

## Requisitos Locais (opcional para desenvolvimento)

- Python 3.8+
- Node.js 14+
- MySQL 5.7+

---

## Backend (Python/Flask)

### Desenvolvimento local

```bash
cd scoremvp-backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

---

## Deploy (Railway)

### Configuração

1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente:
   - `MYSQL_URL`: URL de conexão do MySQL
   - `SECRET_KEY`: Chave secreta para JWT
   - `PORT`: Porta para o servidor (opcional)

### Deploy Manual

```bash
railway up
```

---
