#!/usr/bin/env python3
"""
Script para testar diferentes URLs base e descobrir qual está funcionando
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Lista de URLs base para testar
BASE_URLS = [
    "https://scoremvp-production.up.railway.app",
    "https://scoremvpback-production.up.railway.app",
    "https://scoremvp-frontend-production.up.railway.app"
]

def test_urls():
    """Testa diferentes URLs base"""
    
    print("🔍 Testando diferentes URLs base...")
    print("=" * 60)
    
    for base_url in BASE_URLS:
        print(f"\n📡 Testando: {base_url}")
        
        # Teste 1: Health check
        try:
            response = requests.get(f"{base_url}/health", timeout=10)
            print(f"   /health: {response.status_code}")
        except Exception as e:
            print(f"   /health: Erro - {e}")
        
        # Teste 2: Root endpoint
        try:
            response = requests.get(f"{base_url}/", timeout=10)
            print(f"   /: {response.status_code}")
        except Exception as e:
            print(f"   /: Erro - {e}")
        
        # Teste 3: Login endpoint
        login_data = {
            "username": "admin@scoremvp.com",
            "password": "admin123"
        }
        
        try:
            response = requests.post(
                f"{base_url}/api/auth/login",
                data=login_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            print(f"   /api/auth/login: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ Login funcionando!")
                token = response.json().get("access_token")
                if token:
                    print(f"   Token obtido: {token[:50]}...")
                    
                    # Teste 4: Endpoint protegido
                    headers = {"Authorization": f"Bearer {token}"}
                    try:
                        response = requests.get(f"{base_url}/api/users", headers=headers, timeout=10)
                        print(f"   /api/users: {response.status_code}")
                        if response.status_code == 200:
                            data = response.json()
                            print(f"   ✅ Usuários encontrados: {len(data)}")
                        else:
                            print(f"   ❌ Erro: {response.text}")
                    except Exception as e:
                        print(f"   /api/users: Erro - {e}")
            else:
                print(f"   ❌ Erro: {response.text}")
        except Exception as e:
            print(f"   /api/auth/login: Erro - {e}")

def main():
    """Função principal"""
    test_urls()
    print("\n" + "=" * 60)
    print("✅ Teste de URLs concluído!")

if __name__ == "__main__":
    main() 