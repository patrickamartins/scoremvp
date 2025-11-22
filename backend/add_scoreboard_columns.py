#!/usr/bin/env python3
"""
Script para adicionar colunas do placar na tabela games
Execute: python3 add_scoreboard_columns.py
"""
import os
import sys
from sqlalchemy import create_engine, text

def add_scoreboard_columns():
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

        with engine.begin() as conn:  # Usar begin() para transação automática
            columns_to_add = [
                ("away_score", "INTEGER DEFAULT 0"),
                ("timer_time", "INTEGER DEFAULT 720"),
                ("timer_running", "BOOLEAN DEFAULT FALSE"),
                ("current_quarter", "INTEGER DEFAULT 1"),
            ]

            for col_name, col_type in columns_to_add:
                print(f"🔍 Verificando se a coluna {col_name} já existe...")
                result = conn.execute(text(f"""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'games'
                    AND column_name = '{col_name}'
                """))

                if result.fetchone():
                    print(f"✅ Coluna {col_name} já existe na tabela games")
                else:
                    print(f"🔧 Adicionando coluna {col_name} na tabela games...")
                    conn.execute(text(f"""
                        ALTER TABLE games
                        ADD COLUMN {col_name} {col_type}
                    """))
                    print(f"✅ Coluna {col_name} adicionada com sucesso!")

            print("\n✨ Estrutura final da tabela games:")
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'games'
                ORDER BY ordinal_position
            """))
            for row in result:
                print(f"   - {row[0]} ({row[1]}, nullable: {row[2]}, default: {row[3]})")

        return True

    except Exception as e:
        print(f"❌ Erro ao adicionar colunas: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Script para adicionar colunas do placar na tabela games")
    print("=" * 60)
    print()

    success = add_scoreboard_columns()

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

