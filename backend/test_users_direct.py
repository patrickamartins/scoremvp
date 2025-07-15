#!/usr/bin/env python3
"""
Script para testar o endpoint de usuários diretamente
"""
import requests
import json

def test_users_direct():
    """Testa o endpoint de usuários diretamente"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Testando endpoint de usuários diretamente...")
    print("=" * 60)
    
    # 1. Fazer login
    print("1. Fazendo login...")
    login_data = {
        'username': 'admin@scoremvp.com.br',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/login",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        
        print(f"Status do login: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get('access_token')
            print(f"✅ Token obtido")
            
            # 2. Testar GET /users com diferentes headers
            print("\n2. Testando GET /users...")
            
            # Teste 1: Com Authorization header
            headers1 = {'Authorization': f'Bearer {token}'}
            response1 = requests.get(f"{base_url}/api/users", headers=headers1, timeout=10)
            print(f"Teste 1 - Authorization header: {response1.status_code}")
            print(f"Resposta: {response1.text[:200]}...")
            
            # Teste 2: Com Authorization header e Content-Type
            headers2 = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            response2 = requests.get(f"{base_url}/api/users", headers=headers2, timeout=10)
            print(f"Teste 2 - Com Content-Type: {response2.status_code}")
            print(f"Resposta: {response2.text[:200]}...")
            
            # Teste 3: Com Accept header
            headers3 = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
            response3 = requests.get(f"{base_url}/api/users", headers=headers3, timeout=10)
            print(f"Teste 3 - Com Accept: {response3.status_code}")
            print(f"Resposta: {response3.text[:200]}...")
            
            # Teste 4: Com todos os headers
            headers4 = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            response4 = requests.get(f"{base_url}/api/users", headers=headers4, timeout=10)
            print(f"Teste 4 - Todos os headers: {response4.status_code}")
            print(f"Resposta: {response4.text[:200]}...")
            
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_users_direct() 