import psycopg2; print("Testing..."); conn = psycopg2.connect("postgresql://admin:admin123@localhost:5432/scoremvp"); print("OK"); conn.close()
