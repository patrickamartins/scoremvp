#!/usr/bin/env python3
"""
Script para verificar o schema do banco de dados
"""
import sys
import os
sys.path.append('.')

from app.database import SessionLocal
from sqlalchemy import text

def check_database_schema():
    """Verifica o schema do banco de dados"""
    
    print("🔍 Verificando schema do banco de dados...")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # 1. Verificar se a tabela users existe
        print("1. Verificando tabela users...")
        result = db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"))
        users_columns = result.fetchall()
        print(f"Colunas da tabela users: {len(users_columns)}")
        for col in users_columns:
            print(f"   - {col[0]}: {col[1]}")
        
        # 2. Verificar se a tabela players existe
        print("\n2. Verificando tabela players...")
        result = db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'players'"))
        players_columns = result.fetchall()
        print(f"Colunas da tabela players: {len(players_columns)}")
        for col in players_columns:
            print(f"   - {col[0]}: {col[1]}")
        
        # 3. Verificar se a coluna user_id existe na tabela players
        print("\n3. Verificando coluna user_id na tabela players...")
        user_id_exists = any(col[0] == 'user_id' for col in players_columns)
        print(f"Coluna user_id existe: {user_id_exists}")
        
        if not user_id_exists:
            print("❌ Coluna user_id não existe na tabela players!")
            print("💡 Solução: Executar migração para adicionar a coluna")
            
            # 4. Tentar adicionar a coluna user_id
            print("\n4. Tentando adicionar coluna user_id...")
            try:
                db.execute(text("ALTER TABLE players ADD COLUMN user_id INTEGER REFERENCES users(id)"))
                db.commit()
                print("✅ Coluna user_id adicionada com sucesso!")
            except Exception as e:
                print(f"❌ Erro ao adicionar coluna: {e}")
                db.rollback()
        
        # 5. Verificar dados nas tabelas
        print("\n5. Verificando dados nas tabelas...")
        
        # Contar usuários
        result = db.execute(text("SELECT COUNT(*) FROM users"))
        users_count = result.fetchone()[0]
        print(f"Usuários na tabela: {users_count}")
        
        # Contar players
        result = db.execute(text("SELECT COUNT(*) FROM players"))
        players_count = result.fetchone()[0]
        print(f"Players na tabela: {players_count}")
        
        # Verificar players com user_id
        if user_id_exists:
            result = db.execute(text("SELECT COUNT(*) FROM players WHERE user_id IS NOT NULL"))
            players_with_user = result.fetchone()[0]
            print(f"Players com user_id: {players_with_user}")
        
    except Exception as e:
        print(f"❌ Erro ao verificar schema: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_database_schema() 