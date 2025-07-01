-- Script para importar apenas os dados, sem recriar estrutura
-- Limpar dados existentes primeiro
TRUNCATE TABLE user_notifications CASCADE;
TRUNCATE TABLE statistics CASCADE;
TRUNCATE TABLE game_player CASCADE;
TRUNCATE TABLE games CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE users CASCADE;

-- Resetar sequências
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE games_id_seq RESTART WITH 1;
ALTER SEQUENCE players_id_seq RESTART WITH 1;
ALTER SEQUENCE statistics_id_seq RESTART WITH 1;
ALTER SEQUENCE leads_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE user_notifications_id_seq RESTART WITH 1;

-- Inserir usuário admin
INSERT INTO users (id, name, email, hashed_password, role, plan, is_active, created_at) 
VALUES (1, 'Administrador', 'admin@scoremvp.com.br', '$2b$12$SVPxWUiAJQO3GCk8QO3GCk8QO3GCk8QO3GCk8QO3GCk8QO3GCk8QO3GCk', 'admin', 'premium', true, NOW());

-- Inserir jogo de exemplo
INSERT INTO games (id, name, date, owner_id, created_at) 
VALUES (1, 'Vasco da Gama', '2025-06-19 20:30:00', 1, NOW());

-- Inserir jogador de exemplo
INSERT INTO players (id, name, position, created_at) 
VALUES (1, 'Patrick Martins', 'Ala', NOW());

-- Inserir estatística de exemplo
INSERT INTO statistics (id, game_id, player_id, points, rebounds, assists, steals, blocks, fouls, turnovers, field_goals_made, field_goals_attempted, created_at) 
VALUES (1, 1, 1, 5, 0, 2, 2, 0, 0, 0, 1, 1, NOW());

-- Associar jogador ao jogo
INSERT INTO game_player (game_id, player_id) VALUES (1, 1); 