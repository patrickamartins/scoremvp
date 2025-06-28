import psycopg2
import sys

print("=== SIMPLE CONNECTION TEST ===")
print(f"Python: {sys.version}")
print(f"psycopg2: {psycopg2.__version__}")

try:
    print("\n1. Testing connection string...")
    conn1 = psycopg2.connect("postgresql://admin:admin123@localhost:5432/scoremvp")
    print("OK - Connection string works")
    conn1.close()
    
except Exception as e:
    print(f"ERROR - Connection string: {e}")
    print(f"Type: {type(e)}")

try:
    print("\n2. Testing separate parameters...")
    conn2 = psycopg2.connect(
        host="localhost",
        user="admin", 
        password="admin123",
        database="scoremvp",
        port="5432"
    )
    print("OK - Separate parameters work")
    conn2.close()
    
except Exception as e:
    print(f"ERROR - Separate parameters: {e}")
    print(f"Type: {type(e)}")

print("\n=== END OF TEST ===") 