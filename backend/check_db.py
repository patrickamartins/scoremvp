import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

# Configurar encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'

def check_and_create_db():
    try:
        # Conectar ao PostgreSQL sem especificar banco
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="postgres",
            port="5432",
            client_encoding='utf8'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Verificar se o banco existe
        cur.execute("SELECT 1 FROM pg_database WHERE datname='scoremvp'")
        exists = cur.fetchone()
        
        if not exists:
            print("Criando banco de dados 'scoremvp'...")
            cur.execute("CREATE DATABASE scoremvp")
            print("Banco de dados criado com sucesso!")
        else:
            print("Banco de dados 'scoremvp' ja existe!")
        
        cur.close()
        conn.close()
        
        # Testar conexão com o banco criado
        print("Testando conexao com o banco 'scoremvp'...")
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="postgres",
            database="scoremvp",
            port="5432",
            client_encoding='utf8'
        )
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"Conexao OK! PostgreSQL version: {version[0]}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    check_and_create_db() 