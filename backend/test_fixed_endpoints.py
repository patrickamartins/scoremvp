#!/usr/bin/env python3
"""
Script para testar endpoints após correção da coluna user_id
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configurações
BASE_URL = os.getenv('API_BASE_URL', 'https://scoremvp-production.up.railway.app')
LOGIN_URL = f"{BASE_URL}/api/auth/login"
USERS_URL = f"{BASE_URL}/api/users"
PLAYERS_URL = f"{BASE_URL}/api/users/players-with-user"

def test_login():
    """Testa o login e retorna o token"""
    print("🔐 Testando login...")
    
    login_data = {
        "username": "admin@scoremvp.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(LOGIN_URL, data=login_data, headers={'Content-Type': 'application/x-www-form-urlencoded'})
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print("✅ Login bem-sucedido")
            return token
        else:
            print(f"❌ Erro no login: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return None

def test_protected_endpoints(token):
    """Testa endpoints protegidos"""
    if not token:
        print("❌ Token não disponível")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔍 Testando endpoints protegidos...")
    
    # Teste 1: /api/users
    print("\n1. Testando /api/users...")
    try:
        response = requests.get(USERS_URL, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! {len(data)} usuários encontrados")
        else:
            print(f"   ❌ Erro: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro na requisição: {e}")
    
    # Teste 2: /api/users/players-with-user
    print("\n2. Testando /api/users/players-with-user...")
    try:
        response = requests.get(PLAYERS_URL, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! {len(data)} players encontrados")
            if data:
                print(f"   📋 Primeiro player: {data[0]}")
        else:
            print(f"   ❌ Erro: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro na requisição: {e}")
    
    # Teste 3: /api/users com parâmetros
    print("\n3. Testando /api/users?skip=0&limit=5...")
    try:
        response = requests.get(f"{USERS_URL}?skip=0&limit=5", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! {len(data)} usuários retornados")
        else:
            print(f"   ❌ Erro: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro na requisição: {e}")

def test_public_endpoints():
    """Testa endpoints públicos"""
    print("\n🌐 Testando endpoints públicos...")
    
    # Teste: /health
    health_url = f"{BASE_URL}/health"
    try:
        response = requests.get(health_url)
        print(f"   /health - Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Endpoint público funcionando")
        else:
            print(f"   ❌ Erro: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro na requisição: {e}")

def main():
    """Função principal"""
    print("🚀 Testando endpoints após correção da coluna user_id")
    print("=" * 60)
    
    # Testar endpoints públicos
    test_public_endpoints()
    
    # Testar login
    token = test_login()
    
    if token:
        # Testar endpoints protegidos
        test_protected_endpoints(token)
    
    print("\n" + "=" * 60)
    print("✅ Teste concluído!")

if __name__ == "__main__":
    main() 