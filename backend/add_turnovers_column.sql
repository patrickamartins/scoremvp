-- Script para adicionar a coluna turnovers na tabela statistics
-- Execute este script no banco da Railway se a coluna não existir

-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
    -- Adicionar coluna turnovers se não existir
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

-- Verificar o resultado
SELECT 
    column_name, 
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'statistics' 
AND column_name = 'turnovers';

