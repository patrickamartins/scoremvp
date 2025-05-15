# ScoreMVP

Sistema de registro e acompanhamento de estatísticas de jogos de basquete.

## Requisitos

- Python 3.8+
- Node.js 14+
- MySQL 5.7+

## Backend (Python/Flask)

1. Crie um ambiente virtual:
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

2. Instale as dependências:
```bash
pip install flask flask-cors pyjwt sqlalchemy mysql-connector-python
```

3. Configure o banco de dados:
- Crie um banco de dados MySQL chamado `scoremvp`
- Atualize as credenciais no arquivo `database.py`

4. Execute o script para criar as tabelas e popular dados iniciais:
```bash
python create_tables.py
python populate_initial_data.py
```

5. Inicie o servidor:
```bash
python app.py
```

O backend estará rodando em `http://localhost:5000`

## Frontend (React)

1. Entre no diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

O frontend estará rodando em `http://localhost:3000`

## Acesso ao Sistema

- Usuário: `admin`
- Senha: `admin`

## Funcionalidades

1. **Login**
   - Autenticação com usuário e senha
   - Geração de token JWT

2. **Registro de Estatísticas**
   - Criação de novos jogos
   - Registro de estatísticas por jogadora
   - Botões para cada tipo de estatística
   - Funcionalidade de desfazer última ação

3. **Dashboard**
   - Visualização de estatísticas em tempo real
   - Filtro por jogo
   - Destaques individuais
   - Totais por tipo de estatística

## Estrutura do Banco de Dados

- `jogadoras`: Cadastro de jogadoras
- `jogos`: Informações dos jogos
- `estatisticas`: Registro de estatísticas
- `acoes`: Histórico de ações para desfazer 