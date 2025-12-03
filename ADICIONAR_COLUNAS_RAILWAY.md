# 🔧 Adicionar Colunas ao Banco de Dados do Railway

## Problema

O banco de dados do Railway não tem as colunas `email_verified` e `activation_token` na tabela `users`, causando o erro:

```
psycopg2.errors.UndefinedColumn: column users.email_verified does not exist
```

## ✅ Solução

Execute o script `add_email_verified_railway.py` para adicionar as colunas necessárias.

### Opção 1: Executar Localmente (Recomendado)

1. **Obter a DATABASE_URL do Railway:**
   - Acesse: https://railway.app
   - Selecione o serviço **PostgreSQL**
   - Vá em **Variables**
   - Copie o valor de `DATABASE_URL`

2. **Configurar variável de ambiente:**
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```

3. **Executar o script:**
   ```bash
   cd backend
   python add_email_verified_railway.py
   ```

### Opção 2: Executar via Railway CLI

1. **Instalar Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Executar o script no contexto do Railway:**
   ```bash
   cd backend
   railway run python add_email_verified_railway.py
   ```

### Opção 3: Executar via SQL Direto no Railway

1. **Acessar o banco de dados:**
   - Acesse: https://railway.app
   - Selecione o serviço **PostgreSQL**
   - Vá em **Data** → **Query**
   - Execute os seguintes comandos SQL:

```sql
-- Adicionar coluna email_verified se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
END $$;

-- Adicionar coluna activation_token se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='activation_token'
    ) THEN
        ALTER TABLE users ADD COLUMN activation_token VARCHAR(255);
    END IF;
END $$;
```

## 📋 Verificação

Após executar o script, verifique se as colunas foram adicionadas:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('email_verified', 'activation_token');
```

## ⚠️ Importante

- O script verifica se as colunas já existem antes de adicioná-las
- É seguro executar o script múltiplas vezes
- As colunas serão adicionadas apenas se não existirem

