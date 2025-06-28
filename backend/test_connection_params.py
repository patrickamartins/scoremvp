import psycopg2
from sqlalchemy import create_engine
from app.database import Base
import app.models

def test_connection():
    try:
        # Teste com psycopg2 usando parâmetros separados
        print("Testando conexao com psycopg2...")
        conn = psycopg2.connect(
            host="localhost",
            user="admin",
            password="admin123",
            database="scoremvp",
            port="5432"
        )
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"psycopg2 OK! PostgreSQL version: {version[0]}")
        cur.close()
        conn.close()
        
        # Teste com SQLAlchemy usando parâmetros separados
        print("Testando conexao com SQLAlchemy...")
        engine = create_engine(
            "postgresql://admin:admin123@localhost:5432/scoremvp",
            echo=False
        )
        
        # Teste simples de conexão
        with engine.connect() as connection:
            result = connection.execute("SELECT version();")
            version = result.fetchone()
            print(f"SQLAlchemy OK! PostgreSQL version: {version[0]}")
        
        # Teste de criação de tabelas
        print("Testando criacao de tabelas...")
        Base.metadata.create_all(bind=engine)
        print("Tabelas criadas com sucesso!")
        
        return True
        
    except Exception as e:
        print(f"Erro: {e}")
        return False

if __name__ == "__main__":
    test_connection() 