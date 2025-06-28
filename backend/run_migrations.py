#!/usr/bin/env python3
import os
import sys
from alembic.config import Config
from alembic import command

# Adiciona o diretório raiz ao PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def run_migrations():
    """Executa as migrações do Alembic"""
    try:
        # Configura o Alembic
        alembic_cfg = Config("alembic.ini")
        
        print("Executando migrações do Alembic...")
        
        # Executa as migrações
        command.upgrade(alembic_cfg, "head")
        
        print("Migrações executadas com sucesso!")
        
    except Exception as e:
        print(f"Erro ao executar migrações: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migrations() 