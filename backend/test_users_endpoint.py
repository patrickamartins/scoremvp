#!/usr/bin/env python3
"""
Script para testar o endpoint de usuários
"""
import requests
import json

def test_users_endpoint():
    """Testa o endpoint de usuários"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Testando endpoint de usuários...")
    print("=" * 60)
    
    # 1. Fazer login para obter token
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
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"✅ Login bem-sucedido, token obtido")
        else:
            print(f"❌ Login falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            return
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        return
    
    # 2. Testar GET /users
    print("\n2. Testando GET /users...")
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(
            f"{base_url}/api/users",
            headers=headers,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Usuários encontrados: {len(users)}")
            for user in users:
                print(f"   - {user.get('name', 'N/A')} ({user.get('email', 'N/A')})")
        else:
            print(f"❌ Erro: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao buscar usuários: {e}")
    
    # 3. Testar POST /users (criar usuário)
    print("\n3. Testando POST /users...")
    new_user = {
        "name": "Patrick Martins",
        "email": "patrick.martins@test.com",
        "password": "SenhaForte123!",
        "role": "player",
        "plan": "free",
        "is_active": True,
        "phone": "11999999999",
        "cpf": "12345678901",
        "favorite_team": "São Paulo",
        "playing_team": "Time Teste",
        "number": 10,
        "position": "Atacante"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/users",
            json=new_user,
            headers=headers,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Usuário criado: {user_data.get('name')}")
            print(f"   ID: {user_data.get('id')}")
            print(f"   Email: {user_data.get('email')}")
        else:
            print(f"❌ Erro ao criar usuário: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
    
    # 4. Testar GET /users novamente para verificar se o novo usuário aparece
    print("\n4. Verificando se o novo usuário aparece na lista...")
    try:
        response = requests.get(
            f"{base_url}/api/users",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Total de usuários: {len(users)}")
            patrick_user = next((u for u in users if u.get('email') == 'patrick.martins@test.com'), None)
            if patrick_user:
                print(f"✅ Patrick Martins encontrado na lista!")
            else:
                print(f"❌ Patrick Martins não encontrado na lista")
        else:
            print(f"❌ Erro ao buscar usuários: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao buscar usuários: {e}")

if __name__ == "__main__":
    test_users_endpoint() 