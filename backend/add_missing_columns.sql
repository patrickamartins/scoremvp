-- Script para adicionar colunas faltantes na tabela users
-- Execute este script no banco da Railway se as migrations não funcionarem

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Adicionar coluna number se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'number'
    ) THEN
        ALTER TABLE users ADD COLUMN number INTEGER;
        RAISE NOTICE 'Coluna number adicionada';
    ELSE
        RAISE NOTICE 'Coluna number já existe';
    END IF;

    -- Adicionar coluna position se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'position'
    ) THEN
        ALTER TABLE users ADD COLUMN position VARCHAR;
        RAISE NOTICE 'Coluna position adicionada';
    ELSE
        RAISE NOTICE 'Coluna position já existe';
    END IF;

    -- Adicionar coluna phone se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR;
        RAISE NOTICE 'Coluna phone adicionada';
    ELSE
        RAISE NOTICE 'Coluna phone já existe';
    END IF;

    -- Adicionar coluna cpf se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'cpf'
    ) THEN
        ALTER TABLE users ADD COLUMN cpf VARCHAR;
        RAISE NOTICE 'Coluna cpf adicionada';
    ELSE
        RAISE NOTICE 'Coluna cpf já existe';
    END IF;

    -- Adicionar coluna favorite_team se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'favorite_team'
    ) THEN
        ALTER TABLE users ADD COLUMN favorite_team VARCHAR;
        RAISE NOTICE 'Coluna favorite_team adicionada';
    ELSE
        RAISE NOTICE 'Coluna favorite_team já existe';
    END IF;

    -- Adicionar coluna playing_team se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'playing_team'
    ) THEN
        ALTER TABLE users ADD COLUMN playing_team VARCHAR;
        RAISE NOTICE 'Coluna playing_team adicionada';
    ELSE
        RAISE NOTICE 'Coluna playing_team já existe';
    END IF;

    -- Adicionar coluna profile_image se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_image'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_image VARCHAR;
        RAISE NOTICE 'Coluna profile_image adicionada';
    ELSE
        RAISE NOTICE 'Coluna profile_image já existe';
    END IF;

END $$;

-- Verificar o resultado
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 