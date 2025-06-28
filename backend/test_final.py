import psycopg

try:
    print("Testando conexao com o banco migrado...")
    conn = psycopg.connect(
        host="localhost",
        user="admin",
        password="admin123",
        dbname="scoremvp",
        port="5432"
    )
    print("Conexao OK!")
    
    # Testar uma query simples
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print(f"PostgreSQL version: {version[0]}")
    
    cur.close()
    conn.close()
    print("Teste completo - SUCESSO!")
    
except Exception as e:
    print(f"Erro: {e}")
    print(f"Tipo: {type(e)}") 