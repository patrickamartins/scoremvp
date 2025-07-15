#!/usr/bin/env python3
"""
Script para verificar a configuração do backend
"""
import sys
import os
sys.path.append('.')

from app.core.config import settings
import requests

def check_config():
    """Verifica a configuração do backend"""
    
    print("🔍 Verificando configuração do backend...")
    print("=" * 60)
    
    # 1. Verificar configurações locais
    print("1. Configurações locais:")
    print(f"   SECRET_KEY: {settings.SECRET_KEY[:20]}..." if settings.SECRET_KEY else "   SECRET_KEY: None")
    print(f"   ALGORITHM: {settings.ALGORITHM}")
    print(f"   ACCESS_TOKEN_EXPIRE_MINUTES: {settings.ACCESS_TOKEN_EXPIRE_MINUTES}")
    print(f"   DATABASE_URL: {settings.SQLALCHEMY_DATABASE_URI[:50]}..." if settings.SQLALCHEMY_DATABASE_URI else "   DATABASE_URL: None")
    
    # 2. Verificar endpoints do Railway
    print("\n2. Testando endpoints do Railway:")
    base_url = "https://scoremvpback-production.up.railway.app"
    
    # Teste 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"   Health check: {response.status_code}")
    except Exception as e:
        print(f"   Health check: Erro - {e}")
    
    # Teste 2: Root endpoint
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        print(f"   Root endpoint: {response.status_code}")
    except Exception as e:
        print(f"   Root endpoint: Erro - {e}")
    
    # Teste 3: Debug DB URL
    try:
        response = requests.get(f"{base_url}/api/debug-db-url", timeout=10)
        print(f"   Debug DB URL: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   DB URL: {data.get('database_url', 'N/A')[:50]}...")
    except Exception as e:
        print(f"   Debug DB URL: Erro - {e}")
    
    # Teste 4: Login endpoint
    try:
        login_data = {
            'username': 'admin@scoremvp.com.br',
            'password': 'admin123'
        }
        response = requests.post(
            f"{base_url}/api/auth/login",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        print(f"   Login endpoint: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            print(f"   Token obtido: {'Sim' if token_data.get('access_token') else 'Não'}")
        else:
            print(f"   Erro: {response.text}")
    except Exception as e:
        print(f"   Login endpoint: Erro - {e}")

if __name__ == "__main__":
    check_config() 