#!/usr/bin/env python3
"""
Script para adicionar coluna public_link na tabela games
Execute: python3 add_public_link_column.py
"""
import os
import sys
from sqlalchemy import create_engine, text

def add_public_link_column():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL não encontrada nas variáveis de ambiente")
        print("\n📝 Execute: export DATABASE_URL='sua_url_aqui'")
        return False

    try:
        print(f"🔗 Conectando ao banco de dados...")
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)

        engine = create_engine(database_url)

        with engine.connect() as conn:
            print(f"🔍 Verificando se a coluna public_link já existe...")
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'games'
                AND column_name = 'public_link'
            """))

            if result.fetchone():
                print(f"✅ Coluna public_link já existe na tabela games")
            else:
                print(f"🔧 Adicionando coluna public_link na tabela games...")
                conn.execute(text("""
                    ALTER TABLE games
                    ADD COLUMN public_link VARCHAR(255) UNIQUE
                """))
                conn.execute(text("""
                    CREATE INDEX idx_games_public_link ON games(public_link)
                """))
                conn.commit()
                print(f"✅ Coluna public_link adicionada com sucesso!")

            print("\n✨ Estrutura final da tabela games:")
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'games'
                ORDER BY ordinal_position
            """))
            for row in result:
                print(f"   - {row[0]} ({row[1]}, nullable: {row[2]})")

        return True

    except Exception as e:
        print(f"❌ Erro ao adicionar coluna: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Script para adicionar coluna public_link na tabela games")
    print("=" * 60)
    print()

    success = add_public_link_column()

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

