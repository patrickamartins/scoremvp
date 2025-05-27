# Score MVP Backend

Este é o backend do projeto Score MVP, desenvolvido com FastAPI, SQLAlchemy e MySQL.

## Requisitos

- Python 3.8+
- MySQL 8.0+
- pip (gerenciador de pacotes Python)
- Docker e Docker Compose (opcional)

## Instalação

### Usando Docker (Recomendado)

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/score-mvp-backend.git
cd score-mvp-backend
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

3. Inicie os containers:
```bash
docker-compose up -d
```

O servidor estará disponível em `http://localhost:8000`.

### Instalação Manual

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/score-mvp-backend.git
cd score-mvp-backend
```

2. Crie e ative um ambiente virtual:
```bash
# Linux/Mac
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

3. Instale as dependências:
```bash
# Para produção
pip install -r requirements.txt

# Para desenvolvimento
pip install -r requirements-dev.txt
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

5. Execute as migrações do banco de dados:
```bash
alembic upgrade head
```

6. Configure o pre-commit (opcional, mas recomendado):
```bash
pre-commit install
```

## Executando o Servidor

### Com Docker
```bash
docker-compose up -d
```

### Sem Docker
```bash
uvicorn app.main:app --reload
```

O servidor estará disponível em `http://localhost:8000`.

## Documentação da API

A documentação interativa da API estará disponível em:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testes

### Com Docker
```bash
docker-compose run api pytest --cov=app --cov-report=term-missing
```

### Sem Docker
Para executar os testes, você pode usar um dos seguintes comandos:

#### Linux/Mac
```bash
./run_tests.sh
```

#### Windows
```bash
run_tests.bat
```

Ou executar diretamente com pytest:
```bash
pytest --cov=app --cov-report=term-missing
```

## Desenvolvimento

### Formatação de Código

O projeto usa várias ferramentas para garantir a qualidade do código:

- **Black**: Formatador de código Python
- **isort**: Organizador de imports
- **Flake8**: Linter
- **MyPy**: Verificador de tipos

Para formatar o código:
```bash
# Formatação automática
black .
isort .

# Verificação de tipos
mypy .

# Linting
flake8
```

### Pre-commit Hooks

O projeto usa pre-commit hooks para garantir a qualidade do código antes de cada commit. Os hooks incluem:

- Verificação de formatação (Black)
- Organização de imports (isort)
- Linting (Flake8)
- Verificação de tipos (MyPy)
- Verificações gerais (pre-commit-hooks)

Para instalar os hooks:
```bash
pre-commit install
```

Para executar os hooks manualmente:
```bash
pre-commit run --all-files
```

## Estrutura do Projeto

```
score-mvp-backend/
├── alembic/              # Migrações do banco de dados
├── app/
│   ├── core/            # Configurações e utilitários
│   ├── models/          # Modelos SQLAlchemy
│   ├── routes/          # Rotas da API
│   ├── schemas/         # Schemas Pydantic
│   └── main.py          # Aplicação FastAPI
├── tests/               # Testes
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de variáveis de ambiente
├── .pre-commit-config.yaml # Configuração do pre-commit
├── alembic.ini          # Configuração do Alembic
├── docker-compose.yml   # Configuração do Docker Compose
├── Dockerfile          # Configuração do Docker
├── requirements.txt     # Dependências de produção
├── requirements-dev.txt # Dependências de desenvolvimento
└── README.md           # Este arquivo
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
