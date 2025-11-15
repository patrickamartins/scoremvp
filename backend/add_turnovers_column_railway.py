#!/usr/bin/env python3
"""
Script para adicionar a coluna turnovers na tabela statistics no Railway
Execute este script localmente com a DATABASE_URL do Railway configurada
"""

import os
import sys
from sqlalchemy import create_engine, text

# Tentar carregar dotenv se disponível
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Se dotenv não estiver instalado, continuar sem ele
    # A variável DATABASE_URL deve estar no ambiente
    pass

def add_turnovers_column():
    """Adiciona a coluna turnovers na tabela statistics"""
    
    # Obter DATABASE_URL do ambiente
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL não encontrada nas variáveis de ambiente")
        print("\n📝 Para usar este script:")
        print("   1. Copie a DATABASE_URL do Railway (Settings > Variables)")
        print("   2. Execute: export DATABASE_URL='sua_url_aqui' (Linux/Mac)")
        print("      ou: set DATABASE_URL=sua_url_aqui (Windows)")
        print("   3. Execute: python add_turnovers_column_railway.py")
        print("\n   Ou crie um arquivo .env na pasta backend com:")
        print("   DATABASE_URL=sua_url_aqui")
        return False
    
    try:
        print(f"🔗 Conectando ao banco de dados...")
        # Remover parâmetros que podem causar problemas
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Verificar se a coluna já existe
            print("🔍 Verificando se a coluna turnovers já existe...")
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'statistics' 
                AND column_name = 'turnovers'
            """))
            
            if result.fetchone():
                print("✅ Coluna turnovers já existe na tabela statistics")
                return True
            
            # Adicionar a coluna
            print("🔧 Adicionando coluna turnovers na tabela statistics...")
            conn.execute(text("""
                ALTER TABLE statistics 
                ADD COLUMN turnovers INTEGER DEFAULT 0
            """))
            conn.commit()
            
            # Verificar se foi criada
            result = conn.execute(text("""
                SELECT column_name, data_type, column_default
                FROM information_schema.columns 
                WHERE table_name = 'statistics' 
                AND column_name = 'turnovers'
            """))
            
            col_info = result.fetchone()
            if col_info:
                print(f"✅ Coluna turnovers adicionada com sucesso!")
                print(f"   Tipo: {col_info[1]}")
                print(f"   Default: {col_info[2]}")
                return True
            else:
                print("❌ Erro: coluna não foi criada")
                return False
                
    except Exception as e:
        print(f"❌ Erro ao adicionar coluna: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Script para adicionar coluna turnovers")
    print("=" * 60)
    print()
    
    success = add_turnovers_column()
    
    print()
    if success:
        print("=" * 60)
        print("✅ Processo concluído com sucesso!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("=" * 60)
        print("❌ Processo falhou. Verifique os erros acima.")
        print("=" * 60)
        sys.exit(1)

