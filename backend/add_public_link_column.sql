-- Script para adicionar coluna public_link na tabela games
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'public_link'
    ) THEN
        ALTER TABLE games ADD COLUMN public_link VARCHAR(255) UNIQUE;
        CREATE INDEX idx_games_public_link ON games(public_link);
        RAISE NOTICE 'Coluna public_link adicionada';
    ELSE
        RAISE NOTICE 'Coluna public_link já existe';
    END IF;
END $$;

