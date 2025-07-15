#!/usr/bin/env python3
"""
Script para testar o endpoint /api/users após a correção
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# URL correta e credenciais que funcionam
BASE_URL = "https://scoremvpback-production.up.railway.app"
CREDENTIALS = {"username": "admin@scoremvp.com.br", "password": "admin123"}

def test_fixed_users_endpoint():
    """Testa o endpoint /api/users após a correção"""
    
    print("🔍 Testando endpoint /api/users após correção...")
    print("=" * 60)
    
    # 1. Fazer login
    print("1. Fazendo login...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=CREDENTIALS,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            user_data = token_data.get("user", {})
            
            print(f"✅ Login bem-sucedido!")
            print(f"Usuário: {user_data.get('name', 'N/A')}")
            print(f"Role: {user_data.get('role', 'N/A')}")
            
            # 2. Testar endpoint /api/users
            headers = {"Authorization": f"Bearer {token}"}
            
            print(f"\n2. Testando endpoint /api/users...")
            try:
                response = requests.get(f"{BASE_URL}/api/users", headers=headers, timeout=10)
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   ✅ {len(data)} usuários retornados")
                        for user in data:
                            print(f"   📋 - {user.get('name', 'N/A')} ({user.get('email', 'N/A')}) - {user.get('role', 'N/A')}")
                    else:
                        print(f"   ✅ Dados retornados: {type(data)}")
                else:
                    print(f"   ❌ Erro: {response.text}")
            except Exception as e:
                print(f"   ❌ Erro na requisição: {e}")
            
            # 3. Testar endpoint /api/users com parâmetros
            print(f"\n3. Testando endpoint /api/users com parâmetros...")
            try:
                response = requests.get(f"{BASE_URL}/api/users?skip=0&limit=5", headers=headers, timeout=10)
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   ✅ {len(data)} usuários retornados (limit=5)")
                    else:
                        print(f"   ✅ Dados retornados: {type(data)}")
                else:
                    print(f"   ❌ Erro: {response.text}")
            except Exception as e:
                print(f"   ❌ Erro na requisição: {e}")
            
            # 4. Testar endpoint /api/users/players-with-user
            print(f"\n4. Testando endpoint /api/users/players-with-user...")
            try:
                response = requests.get(f"{BASE_URL}/api/users/players-with-user", headers=headers, timeout=10)
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   ✅ {len(data)} players retornados")
                    else:
                        print(f"   ✅ Dados retornados: {type(data)}")
                else:
                    print(f"   ❌ Erro: {response.text}")
            except Exception as e:
                print(f"   ❌ Erro na requisição: {e}")
                
        else:
            print(f"❌ Login falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")

def main():
    """Função principal"""
    test_fixed_users_endpoint()
    print("\n" + "=" * 60)
    print("✅ Teste do endpoint /api/users concluído!")

if __name__ == "__main__":
    main() 