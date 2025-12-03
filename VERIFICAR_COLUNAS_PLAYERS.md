# 🔍 Verificar Colunas Faltando no Banco de Dados

## Problema

Erros 500 em `/api/players` e `/api/dashboard/public/jogadoras` podem ser causados por colunas faltando na tabela `players`.

## Colunas Necessárias na Tabela `players`

Baseado no modelo `Player`, as seguintes colunas devem existir:

- `id` (Integer, Primary Key)
- `name` (String, NOT NULL)
- `number` (Integer, nullable)
- `position` (String, nullable)
- `categoria` (String, nullable)
- `active` (Boolean, default=True)
- `created_at` (DateTime)
- `user_id` (Integer, Foreign Key para users.id, nullable)
- `team_id` (Integer, Foreign Key para users.id, nullable)

## ✅ Verificar no Railway

Execute este SQL no Railway (Data → Query):

```sql
-- Verificar colunas da tabela players
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'players'
ORDER BY ordinal_position;
```

## 🔧 Adicionar Colunas Faltando

Se alguma coluna estiver faltando, execute:

```sql
-- Adicionar user_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='players' AND column_name='user_id'
    ) THEN
        ALTER TABLE players ADD COLUMN user_id INTEGER REFERENCES users(id);
    END IF;
END $$;

-- Adicionar team_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='players' AND column_name='team_id'
    ) THEN
        ALTER TABLE players ADD COLUMN team_id INTEGER REFERENCES users(id);
    END IF;
END $$;

-- Adicionar categoria se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='players' AND column_name='categoria'
    ) THEN
        ALTER TABLE players ADD COLUMN categoria VARCHAR(255);
    END IF;
END $$;

-- Adicionar active se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='players' AND column_name='active'
    ) THEN
        ALTER TABLE players ADD COLUMN active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
```

## 📋 Verificar Logs do Backend

Após verificar/adicionar as colunas, verifique os logs do backend no Railway para ver o erro exato:

1. Acesse: https://railway.app
2. Selecione o serviço **Backend**
3. Vá em **Deployments**
4. Veja os logs do último deployment
5. Procure por erros relacionados a `players` ou colunas faltando

