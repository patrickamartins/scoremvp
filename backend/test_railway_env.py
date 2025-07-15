#!/usr/bin/env python3
"""
Script para testar as variáveis de ambiente do Railway
"""

import os
import requests

def test_railway_environment():
    """Testa as variáveis de ambiente do Railway"""
    print("🔍 Verificando variáveis de ambiente...")
    
    # Listar todas as variáveis de ambiente
    env_vars = [
        "DATABASE_URL",
        "SECRET_KEY", 
        "POSTGRES_SERVER",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB",
        "RAILWAY_ENVIRONMENT",
        "RAILWAY_PROJECT_ID",
        "RAILWAY_SERVICE_ID"
    ]
    
    print("Variáveis de ambiente encontradas:")
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Mascarar senhas
            if "PASSWORD" in var or "SECRET" in var:
                masked_value = value[:10] + "..." if len(value) > 10 else "***"
                print(f"  {var}: {masked_value}")
            else:
                print(f"  {var}: {value}")
        else:
            print(f"  {var}: ❌ Não encontrada")
    
    # Testar conexão com o Railway
    print("\n🌐 Testando conexão com Railway...")
    
    try:
        response = requests.get("https://scoremvpback-production.up.railway.app/health", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Servidor Railway acessível")
        else:
            print(f"⚠️  Servidor respondeu com status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro ao conectar com Railway: {e}")

if __name__ == "__main__":
    test_railway_environment() 