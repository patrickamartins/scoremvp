#!/usr/bin/env python3
"""
Script para adicionar todas as colunas faltantes na tabela statistics no Railway
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
    pass

def add_missing_columns():
    """Adiciona todas as colunas faltantes na tabela statistics"""
    
    # Obter DATABASE_URL do ambiente
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL não encontrada nas variáveis de ambiente")
        print("\n📝 Execute: export DATABASE_URL='sua_url_aqui'")
        return False
    
    # Colunas que devem existir na tabela statistics (apenas as que estão faltando)
    # Baseado no modelo: rebo_ofensivo, rebo_defensivo, fr, fp
    columns_to_add = [
        ("rebo_ofensivo", "INTEGER DEFAULT 0"),
        ("rebo_defensivo", "INTEGER DEFAULT 0"),
        ("fr", "INTEGER DEFAULT 0"),
        ("fp", "INTEGER DEFAULT 0"),
    ]
    
    try:
        print(f"🔗 Conectando ao banco de dados...")
        # Remover parâmetros que podem causar problemas
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("🔍 Verificando colunas existentes...")
            
            # Verificar quais colunas já existem
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'statistics'
            """))
            
            existing_columns = {row[0] for row in result.fetchall()}
            print(f"✅ Colunas existentes: {len(existing_columns)}")
            
            # Adicionar colunas faltantes
            added_count = 0
            for col_name, col_type in columns_to_add:
                if col_name in existing_columns:
                    print(f"⏭️  Coluna {col_name} já existe, pulando...")
                    continue
                
                print(f"🔧 Adicionando coluna {col_name}...")
                try:
                    conn.execute(text(f"""
                        ALTER TABLE statistics 
                        ADD COLUMN {col_name} {col_type}
                    """))
                    conn.commit()
                    print(f"✅ Coluna {col_name} adicionada com sucesso!")
                    added_count += 1
                except Exception as e:
                    print(f"❌ Erro ao adicionar {col_name}: {e}")
                    conn.rollback()
            
            if added_count > 0:
                print(f"\n✅ Total de {added_count} coluna(s) adicionada(s)!")
            else:
                print("\n✅ Todas as colunas já existem!")
            
            # Verificar resultado final
            print("\n📋 Verificando estrutura final da tabela...")
            result = conn.execute(text("""
                SELECT column_name, data_type, column_default
                FROM information_schema.columns 
                WHERE table_name = 'statistics'
                ORDER BY ordinal_position
            """))
            
            print("\nColunas da tabela statistics:")
            for row in result.fetchall():
                print(f"  - {row[0]}: {row[1]} (default: {row[2]})")
            
            return True
                
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Script para adicionar colunas faltantes em statistics")
    print("=" * 60)
    print()
    
    success = add_missing_columns()
    
    print()
    if success:
        print("=" * 60)
        print("✅ Processo concluído!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("=" * 60)
        print("❌ Processo falhou. Verifique os erros acima.")
        print("=" * 60)
        sys.exit(1)

