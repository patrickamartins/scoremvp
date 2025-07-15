#!/usr/bin/env python3
"""
Script para verificar as credenciais do admin no banco de dados
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Adicionar o diretório do projeto ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Carregar variáveis de ambiente
load_dotenv("env_railway.txt")

def check_admin_credentials():
    """Verifica as credenciais do admin no banco de dados"""
    print("🔍 Verificando credenciais do admin...")
    
    # Obter variáveis de ambiente
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL não encontrada nas variáveis de ambiente")
        return
    
    try:
        # Criar conexão com o banco
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Verificar se a tabela users existe
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            """))
            
            if not result.fetchone():
                print("❌ Tabela 'users' não encontrada")
                return
            
            # Buscar usuários admin
            result = conn.execute(text("""
                SELECT id, email, role, is_active, created_at
                FROM users 
                WHERE role = 'superadmin' OR role = 'admin'
                ORDER BY created_at DESC
            """))
            
            admins = result.fetchall()
            
            if not admins:
                print("❌ Nenhum usuário admin encontrado")
                return
            
            print(f"✅ Encontrados {len(admins)} usuários admin:")
            print("=" * 80)
            
            for admin in admins:
                print(f"ID: {admin[0]}")
                print(f"Email: {admin[1]}")
                print(f"Role: {admin[2]}")
                print(f"Ativo: {admin[3]}")
                print(f"Criado em: {admin[4]}")
                print("-" * 40)
            
            # Verificar se há algum usuário com email admin@scoremvp.com
            result = conn.execute(text("""
                SELECT id, email, role, is_active
                FROM users 
                WHERE email = 'admin@scoremvp.com'
            """))
            
            specific_admin = result.fetchone()
            
            if specific_admin:
                print(f"✅ Usuário admin@scoremvp.com encontrado:")
                print(f"   ID: {specific_admin[0]}")
                print(f"   Role: {specific_admin[2]}")
                print(f"   Ativo: {specific_admin[3]}")
            else:
                print("❌ Usuário admin@scoremvp.com não encontrado")
                
    except Exception as e:
        print(f"❌ Erro ao conectar com o banco: {e}")

if __name__ == "__main__":
    check_admin_credentials() 