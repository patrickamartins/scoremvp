import psycopg

try:
    print("Testing psycopg3 connection...")
    conn = psycopg.connect(
        host="localhost",
        user="admin",
        password="admin123",
        database="scoremvp",
        port="5432"
    )
    print("Connection successful with psycopg3!")
    conn.close()
except Exception as e:
    print(f"Error with psycopg3: {e}")
    print(f"Type: {type(e)}") 