import psycopg2
import os
import sys

# Configurar encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'

def test_minimal():
    try:
        print("Teste minimo de conexao...")
        print(f"Python version: {sys.version}")
        print(f"psycopg2 version: {psycopg2.__version__}")
        print(f"Current directory: {os.getcwd()}")
        
        # Teste com parâmetros separados
        conn = psycopg2.connect(
            host="localhost",
            user="admin",
            password="admin123",
            database="scoremvp",
            port="5432"
        )
        
        print("Conexao OK!")
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro: {e}")
        print(f"Tipo do erro: {type(e)}")
        return False

if __name__ == "__main__":
    test_minimal() 