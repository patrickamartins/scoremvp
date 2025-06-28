#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
import sys

print("=== TESTE DE CONEXAO SIMPLES ===")
print(f"Python: {sys.version}")
print(f"psycopg2: {psycopg2.__version__}")

try:
    # Teste 1: String de conexão simples
    print("\n1. Testando string de conexao...")
    conn1 = psycopg2.connect("postgresql://admin:admin123@localhost:5432/scoremvp")
    print("✓ String de conexao OK")
    conn1.close()
    
except Exception as e:
    print(f"✗ Erro na string de conexao: {e}")
    print(f"Tipo: {type(e)}")

try:
    # Teste 2: Parâmetros separados
    print("\n2. Testando parametros separados...")
    conn2 = psycopg2.connect(
        host="localhost",
        user="admin", 
        password="admin123",
        database="scoremvp",
        port="5432"
    )
    print("✓ Parametros separados OK")
    conn2.close()
    
except Exception as e:
    print(f"✗ Erro nos parametros separados: {e}")
    print(f"Tipo: {type(e)}")

try:
    # Teste 3: Conexão com encoding explícito
    print("\n3. Testando com encoding explicito...")
    conn3 = psycopg2.connect(
        host="localhost",
        user="admin",
        password="admin123", 
        database="scoremvp",
        port="5432",
        options="-c client_encoding=utf8"
    )
    print("✓ Encoding explicito OK")
    conn3.close()
    
except Exception as e:
    print(f"✗ Erro com encoding explicito: {e}")
    print(f"Tipo: {type(e)}")

print("\n=== FIM DO TESTE ===") 