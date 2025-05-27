import psycopg2

conn = psycopg2.connect("postgresql://postgres:postgres@localhost:5432/scoremvp?client_encoding=utf8")
cur = conn.cursor()
cur.execute("SET client_encoding TO 'UTF8';")
print("Conexão OK!")
conn.close()