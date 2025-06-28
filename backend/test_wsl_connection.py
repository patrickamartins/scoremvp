#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
import os
from urllib.parse import quote_plus

def test_connection():
    try:
        # Configurações básicas
        host = "localhost"
        port = "5432"
        database = "scoremvp"
        user = "admin"
        password = "admin123"  # Ajuste para sua senha real
        
        print(f"Tentando conectar com:")
        print(f"Host: {host}")
        print(f"Port: {port}")
        print(f"Database: {database}")
        print(f"User: {user}")
        print(f"Password: {password}")
        
        # Conexão direta
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
        
        print("✅ Conexão bem-sucedida!")
        
        # Testar query simples
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"PostgreSQL version: {version[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        print(f"Tipo do erro: {type(e)}")
        return False

if __name__ == "__main__":
    test_connection() 