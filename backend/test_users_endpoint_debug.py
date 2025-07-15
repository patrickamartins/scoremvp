#!/usr/bin/env python3
"""
Script para debugar especificamente o endpoint /api/users
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# URL correta e credenciais que funcionam
BASE_URL = "https://scoremvpback-production.up.railway.app"
CREDENTIALS = {"username": "admin@scoremvp.com.br", "password": "admin123"}

def test_users_endpoint_debug():
    """Debuga especificamente o endpoint /api/users"""
    
    print("🔍 Debugando endpoint /api/users...")
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
            print(f"Token: {token[:50]}...")
            
            # 2. Testar diferentes variações do endpoint /api/users
            headers = {"Authorization": f"Bearer {token}"}
            
            endpoints_to_test = [
                "/api/users",
                "/api/users/",
                "/api/users?skip=0&limit=10",
                "/api/users?skip=0&limit=5",
                "/api/users?limit=1",
                "/api/users?skip=0"
            ]
            
            print(f"\n2. Testando diferentes variações do endpoint /api/users...")
            
            for endpoint in endpoints_to_test:
                try:
                    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)
                    print(f"   {endpoint}: {response.status_code}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        if isinstance(data, list):
                            print(f"   ✅ {len(data)} usuários retornados")
                            if data:
                                first_user = data[0]
                                print(f"   📋 Primeiro usuário: {first_user.get('name', 'N/A')} ({first_user.get('email', 'N/A')})")
                        else:
                            print(f"   ✅ Dados retornados: {type(data)}")
                    elif response.status_code == 401:
                        print(f"   ❌ Não autenticado: {response.text}")
                    elif response.status_code == 403:
                        print(f"   ❌ Sem permissão: {response.text}")
                    elif response.status_code == 404:
                        print(f"   ❌ Não encontrado: {response.text}")
                    else:
                        print(f"   ❌ Erro {response.status_code}: {response.text}")
                        
                except Exception as e:
                    print(f"   {endpoint}: Erro - {e}")
            
            # 3. Testar com diferentes headers
            print(f"\n3. Testando com diferentes headers...")
            
            header_variations = [
                {"Authorization": f"Bearer {token}"},
                {"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                {"Authorization": f"Bearer {token}", "Accept": "application/json"},
                {"Authorization": f"Bearer {token}", "Content-Type": "application/json", "Accept": "application/json"}
            ]
            
            for i, headers in enumerate(header_variations, 1):
                try:
                    response = requests.get(f"{BASE_URL}/api/users", headers=headers, timeout=10)
                    print(f"   Headers {i}: {response.status_code}")
                    if response.status_code == 200:
                        data = response.json()
                        print(f"   ✅ {len(data)} usuários retornados")
                    else:
                        print(f"   ❌ Erro: {response.text}")
                except Exception as e:
                    print(f"   Headers {i}: Erro - {e}")
            
            # 4. Testar sem parâmetros de query
            print(f"\n4. Testando endpoint básico...")
            try:
                response = requests.get(f"{BASE_URL}/api/users", headers={"Authorization": f"Bearer {token}"}, timeout=10)
                print(f"   GET /api/users: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ {len(data)} usuários retornados")
                else:
                    print(f"   ❌ Erro: {response.text}")
            except Exception as e:
                print(f"   ❌ Erro: {e}")
                
        else:
            print(f"❌ Login falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")

def main():
    """Função principal"""
    test_users_endpoint_debug()
    print("\n" + "=" * 60)
    print("✅ Debug do endpoint /api/users concluído!")

if __name__ == "__main__":
    main() 