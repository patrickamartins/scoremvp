import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        user="admin",
        password="admin123",
        database="scoremvp",
        port="5432"
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    print(f"Type: {type(e)}") 