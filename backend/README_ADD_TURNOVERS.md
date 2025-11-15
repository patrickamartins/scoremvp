# Como Adicionar a Coluna `turnovers` no Railway

## Problema
A coluna `turnovers` não existe na tabela `statistics` do banco de dados no Railway, causando erro 500.

## Solução: Script Python Local

### Passo 1: Obter a DATABASE_URL do Railway

1. Acesse o Railway Dashboard: https://railway.app
2. Selecione seu projeto
3. Clique no serviço **Postgres** (banco de dados)
4. Vá em **Variables** (ou **Settings > Variables**)
5. Copie o valor da variável `DATABASE_URL`
   - Formato: `postgresql://user:password@host:port/database`

### Passo 2: Configurar a DATABASE_URL Localmente

**Opção A: Variável de Ambiente (Temporária)**

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://user:password@host:port/database"
```

**Windows (CMD):**
```cmd
set DATABASE_URL=postgresql://user:password@host:port/database
```

**Linux/Mac/WSL:**
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

**Opção B: Arquivo .env (Recomendado)**

1. Na pasta `backend`, crie ou edite o arquivo `.env`
2. Adicione a linha:
```
DATABASE_URL=postgresql://user:password@host:port/database
```
3. Substitua `postgresql://user:password@host:port/database` pela URL real do Railway

### Passo 3: Executar o Script

**No WSL (recomendado):**
```bash
cd /mnt/c/scoremvp/backend
python3 add_turnovers_column_railway.py
```

**No Windows (PowerShell):**
```powershell
cd backend
python add_turnovers_column_railway.py
```

### Passo 4: Verificar o Resultado

O script irá:
- ✅ Conectar ao banco do Railway
- ✅ Verificar se a coluna já existe
- ✅ Adicionar a coluna se não existir
- ✅ Confirmar a criação

## Alternativa: Usando um Cliente PostgreSQL

Se você tiver o `psql` instalado localmente:

1. Instale o PostgreSQL client (se não tiver):
   - Windows: https://www.postgresql.org/download/windows/
   - Linux: `sudo apt-get install postgresql-client`
   - Mac: `brew install postgresql`

2. Execute o SQL diretamente:
```bash
psql "DATABASE_URL_DO_RAILWAY" -f add_turnovers_column.sql
```

Ou conecte interativamente:
```bash
psql "DATABASE_URL_DO_RAILWAY"
```

Depois execute:
```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'statistics' AND column_name = 'turnovers'
    ) THEN
        ALTER TABLE statistics ADD COLUMN turnovers INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna turnovers adicionada';
    ELSE
        RAISE NOTICE 'Coluna turnovers já existe';
    END IF;
END $$;
```

## Verificação

Após executar o script, o erro 500 deve desaparecer e você poderá salvar estatísticas normalmente.

## Troubleshooting

**Erro: "DATABASE_URL não encontrada"**
- Certifique-se de que a variável está configurada (veja Passo 2)

**Erro: "Connection refused" ou "Timeout"**
- Verifique se a URL está correta
- Verifique se o banco do Railway está ativo
- Alguns provedores bloqueiam conexões externas - nesse caso, use a alternativa do cliente PostgreSQL

**Erro: "permission denied"**
- Verifique se o usuário do banco tem permissão para ALTER TABLE

