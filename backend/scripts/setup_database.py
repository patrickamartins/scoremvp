#!/usr/bin/env python3
"""
Script para configurar o banco de dados no Railway
"""
import os
import subprocess
import sys

def setup_database():
    """Configura o banco de dados executando migrations e seed"""
    
    print("🚀 Configurando banco de dados no Railway...")
    print("=" * 50)
    
    try:
        # Executar migrations
        print("📦 Executando migrations...")
        result = subprocess.run([
            sys.executable, "-m", "alembic", "upgrade", "head"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migrations executadas com sucesso!")
        else:
            print(f"❌ Erro nas migrations: {result.stderr}")
        
        # Executar seed
        print("🌱 Executando seed...")
        result = subprocess.run([
            sys.executable, "scripts/seed_database.py"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Seed executado com sucesso!")
        else:
            print(f"❌ Erro no seed: {result.stderr}")
        
        print("✅ Configuração do banco concluída!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    setup_database() 