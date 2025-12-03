# Instruções para Adicionar Colunas Faltantes na Tabela Players

## Problema
Os endpoints `/api/players` e `/api/dashboard/public/jogadoras` estão retornando erro 500 porque as colunas `user_id`, `team_id`, `categoria` e `active` não existem na tabela `players` do banco de dados do Railway.

## Solução
Execute o script `backend/adicionar_colunas_players_railway.py` localmente, conectando ao banco de dados do Railway.

## Passos

### 1. Obter a DATABASE_URL do Railway
1. Acesse o painel do Railway: https://railway.app
2. Selecione o projeto `scoremvp`
3. Selecione o serviço do banco de dados (PostgreSQL)
4. Vá na aba "Variables"
5. Copie o valor da variável `DATABASE_URL`

### 2. Executar o Script no WSL

```bash
# Navegar para o diretório do projeto
cd /mnt/c/scoremvp

# Ativar o ambiente virtual (se necessário)
source venv/bin/activate  # ou o caminho do seu venv

# Definir a variável de ambiente DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/database"
# Substitua pelos valores reais da sua DATABASE_URL do Railway

# Executar o script
python backend/adicionar_colunas_players_railway.py
```

### 3. Verificar o Resultado
O script irá:
- Conectar ao banco de dados do Railway
- Verificar quais colunas já existem
- Adicionar apenas as colunas faltantes
- Criar índices necessários
- Exibir um resumo das colunas da tabela `players`

### 4. Testar
Após executar o script, teste novamente:
- Login no sistema
- Acessar o Dashboard
- Verificar se os endpoints `/api/players` e `/api/dashboard/public/jogadoras` funcionam

## Nota Importante
O script é seguro e não remove dados existentes. Ele apenas adiciona colunas que não existem, usando valores padrão quando necessário:
- `user_id`: NULL (pode ser preenchido depois)
- `team_id`: NULL (pode ser preenchido depois)
- `categoria`: NULL (pode ser preenchido depois)
- `active`: TRUE (padrão)
