#!/usr/bin/env python3
"""
Script para deploy na Railway
Roda migrations e verifica o banco
"""
import os
import sys
from sqlalchemy import create_engine, text
from alembic import command
from alembic.config import Config

# Configurar o Alembic
alembic_cfg = Config("alembic.ini")

def check_database():
    """Verifica se o banco está acessível"""
    try:
        # Usar DATABASE_URL do ambiente
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL não encontrada")
            return False
            
        print(f"🔗 Conectando ao banco: {database_url.split('@')[1] if '@' in database_url else 'local'}")
        
        engine = create_engine(database_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            print(f"✅ Banco conectado: {result.fetchone()[0]}")
            
            # Verificar se a tabela users existe
            result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                ORDER BY ordinal_position;
            """))
            
            columns = result.fetchall()
            print(f"📋 Colunas da tabela users:")
            for col in columns:
                print(f"   - {col[0]}: {col[1]}")
                
            # Verificar se number existe
            number_exists = any(col[0] == 'number' for col in columns)
            if not number_exists:
                print("❌ Coluna 'number' não existe - precisa rodar migrations!")
                return False
            else:
                print("✅ Coluna 'number' existe")
                return True
                
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco: {e}")
        return False

def run_migrations():
    """Roda as migrations"""
    try:
        print("🔄 Rodando migrations...")
        command.upgrade(alembic_cfg, "head")
        print("✅ Migrations aplicadas com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao rodar migrations: {e}")
        return False

def main():
    print("🚀 Iniciando deploy na Railway...")
    
    # Verificar banco
    if not check_database():
        print("🔄 Tentando rodar migrations...")
        if run_migrations():
            print("✅ Migrations aplicadas!")
            if check_database():
                print("✅ Banco verificado e pronto!")
            else:
                print("❌ Problema persistente no banco")
                sys.exit(1)
        else:
            print("❌ Falha ao rodar migrations")
            sys.exit(1)
    else:
        print("✅ Banco já está atualizado!")

if __name__ == "__main__":
    main() 