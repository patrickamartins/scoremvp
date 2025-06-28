import psycopg2

conn = psycopg2.connect("postgresql://postgres:postgres@localhost:5432/scoremvp")
cur = conn.cursor()
cur.execute("SET client_encoding TO 'UTF8';")
print("Conexao OK!")
conn.close()