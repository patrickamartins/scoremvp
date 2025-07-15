#!/usr/bin/env python3
"""
Script para adicionar a coluna user_id na tabela players
"""

import psycopg2
import os
from dotenv import load_dotenv

def add_user_id_column():
    """Adiciona a coluna user_id na tabela players"""
    
    load_dotenv()
    
    try:
        # Conectar ao banco
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', '5432')
        )
        
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'players' 
            AND column_name = 'user_id'
        """)
        
        if cursor.fetchone():
            print("✅ Coluna user_id já existe na tabela players")
            return
        
        # Adicionar a coluna user_id
        print("🔧 Adicionando coluna user_id na tabela players...")
        cursor.execute("""
            ALTER TABLE players 
            ADD COLUMN user_id INTEGER REFERENCES users(id)
        """)
        
        # Commit das mudanças
        conn.commit()
        print("✅ Coluna user_id adicionada com sucesso!")
        
        # Verificar se foi criada
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'players' 
            AND column_name = 'user_id'
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"✅ Confirmação: coluna {result[0]} ({result[1]}) criada")
        else:
            print("❌ Erro: coluna não foi criada")
            
    except Exception as e:
        print(f"❌ Erro ao adicionar coluna: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    add_user_id_column() 