#!/usr/bin/env python3
"""
Script para adicionar colunas faltantes na tabela players do banco de dados do Railway.
Execute este script localmente conectando ao banco de dados do Railway.

Uso:
    export DATABASE_URL="postgresql://user:password@host:port/database"
    python adicionar_colunas_players_railway.py
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import ProgrammingError

def get_database_url():
    """Obtém a URL do banco de dados do ambiente ou do Railway."""
    # Prioridade 1: DATABASE_URL do ambiente (Railway)
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Converter postgres:// para postgresql:// se necessário
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return database_url
    
    # Prioridade 2: Construir a partir de variáveis de ambiente
    postgres_user = os.getenv("POSTGRES_USER", "admin")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "admin123")
    postgres_server = os.getenv("POSTGRES_SERVER", "localhost")
    postgres_db = os.getenv("POSTGRES_DB", "scoremvp")
    
    return f"postgresql://{postgres_user}:{postgres_password}@{postgres_server}:5432/{postgres_db}"

def column_exists(conn, table_name, column_name):
    """Verifica se uma coluna existe na tabela."""
    query = text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = :table_name AND column_name = :column_name
    """)
    result = conn.execute(query, {"table_name": table_name, "column_name": column_name})
    return result.fetchone() is not None

def add_columns():
    """Adiciona as colunas faltantes na tabela players."""
    database_url = get_database_url()
    
    print("=" * 60)
    print("Script para adicionar colunas na tabela players")
    print("=" * 60)
    print()
    print(f"Conectando ao banco de dados...")
    print(f"URL: {database_url.split('@')[0] if '@' in database_url else database_url[:50]}@...")
    print()
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Verificar se a tabela players existe
            inspector = inspect(engine)
            if 'players' not in inspector.get_table_names():
                print("❌ Erro: Tabela 'players' não existe no banco de dados!")
                return False
            
            print("✅ Tabela 'players' encontrada.")
            print()
            
            # Lista de colunas para adicionar
            columns_to_add = [
                {
                    "name": "user_id",
                    "sql": "ALTER TABLE players ADD COLUMN user_id INTEGER REFERENCES users(id)",
                    "index": "CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id)"
                },
                {
                    "name": "team_id",
                    "sql": "ALTER TABLE players ADD COLUMN team_id INTEGER REFERENCES users(id)",
                    "index": "CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id)"
                },
                {
                    "name": "categoria",
                    "sql": "ALTER TABLE players ADD COLUMN categoria VARCHAR(255)"
                },
                {
                    "name": "active",
                    "sql": "ALTER TABLE players ADD COLUMN active BOOLEAN DEFAULT TRUE"
                }
            ]
            
            # Adicionar cada coluna se não existir
            for col in columns_to_add:
                col_name = col["name"]
                if column_exists(conn, "players", col_name):
                    print(f"ℹ️  Coluna '{col_name}' já existe. Pulando...")
                else:
                    print(f"➕ Adicionando coluna '{col_name}'...")
                    try:
                        # Usar transação explícita
                        trans = conn.begin()
                        conn.execute(text(col["sql"]))
                        trans.commit()
                        print(f"✅ Coluna '{col_name}' adicionada com sucesso!")
                        
                        # Adicionar índice se especificado
                        if "index" in col:
                            try:
                                trans = conn.begin()
                                conn.execute(text(col["index"]))
                                trans.commit()
                                print(f"✅ Índice para '{col_name}' criado com sucesso!")
                            except Exception as e:
                                print(f"⚠️  Aviso: Não foi possível criar índice para '{col_name}': {e}")
                                trans.rollback()
                    except ProgrammingError as e:
                        print(f"❌ Erro ao adicionar coluna '{col_name}': {e}")
                        if 'trans' in locals():
                            trans.rollback()
                        # Continuar com outras colunas mesmo se uma falhar
                        continue
                    except Exception as e:
                        print(f"❌ Erro inesperado ao adicionar coluna '{col_name}': {e}")
                        if 'trans' in locals():
                            trans.rollback()
                        # Continuar com outras colunas mesmo se uma falhar
                        continue
                    print()
            
            # Verificar colunas finais
            print("=" * 60)
            print("Verificando colunas da tabela players:")
            print("=" * 60)
            query = text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'players'
                ORDER BY ordinal_position
            """)
            result = conn.execute(query)
            columns = result.fetchall()
            
            for col in columns:
                print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'YES' else 'NOT NULL'}")
            
            print()
            print("✅ Processo concluído com sucesso!")
            return True
            
    except ProgrammingError as e:
        print(f"❌ Erro ao executar SQL: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = add_columns()
    
    print()
    if success:
        print("=" * 60)
        print("✅ Todas as colunas foram adicionadas com sucesso!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("=" * 60)
        print("❌ Processo falhou. Verifique os erros acima.")
        print("=" * 60)
        sys.exit(1)

