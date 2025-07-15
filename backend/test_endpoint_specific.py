#!/usr/bin/env python3
"""
Script para testar se o problema é específico do endpoint /users
"""
import requests
import jwt
from datetime import datetime

def test_endpoint_specific():
    """Testa se o problema é específico do endpoint /users"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Testando se o problema é específico do endpoint /users...")
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
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get('access_token')
            print(f"✅ Token obtido")
            
            # 2. Testar diferentes endpoints protegidos
            print("\n2. Testando diferentes endpoints protegidos...")
            
            headers = {'Authorization': f'Bearer {token}'}
            
            # Teste 1: Endpoint /users
            try:
                response1 = requests.get(f"{base_url}/api/users", headers=headers, timeout=10)
                print(f"Teste 1 - /api/users: {response1.status_code}")
                print(f"   Resposta: {response1.text[:100]}...")
            except Exception as e:
                print(f"Teste 1 - /api/users: Erro - {e}")
            
            # Teste 2: Endpoint /users/ (com barra)
            try:
                response2 = requests.get(f"{base_url}/api/users/", headers=headers, timeout=10)
                print(f"Teste 2 - /api/users/: {response2.status_code}")
                print(f"   Resposta: {response2.text[:100]}...")
            except Exception as e:
                print(f"Teste 2 - /api/users/: Erro - {e}")
            
            # Teste 3: Endpoint /users com parâmetros
            try:
                response3 = requests.get(f"{base_url}/api/users?skip=0&limit=10", headers=headers, timeout=10)
                print(f"Teste 3 - /api/users?skip=0&limit=10: {response3.status_code}")
                print(f"   Resposta: {response3.text[:100]}...")
            except Exception as e:
                print(f"Teste 3 - /api/users?skip=0&limit=10: Erro - {e}")
            
            # Teste 4: Endpoint /users/players-with-user
            try:
                response4 = requests.get(f"{base_url}/api/users/players-with-user", headers=headers, timeout=10)
                print(f"Teste 4 - /api/users/players-with-user: {response4.status_code}")
                print(f"   Resposta: {response4.text[:100]}...")
            except Exception as e:
                print(f"Teste 4 - /api/users/players-with-user: Erro - {e}")
            
            # Teste 5: Endpoint público para comparação
            try:
                response5 = requests.get(f"{base_url}/health", timeout=10)
                print(f"Teste 5 - /health (público): {response5.status_code}")
            except Exception as e:
                print(f"Teste 5 - /health: Erro - {e}")
            
            # Teste 6: Verificar se há logs de debug
            print("\n3. Verificando logs de debug...")
            railway_secret = "sua-chave-secreta-aqui-muito-segura"
            try:
                decoded = jwt.decode(token, railway_secret, algorithms=["HS256"])
                print(f"Token decodificado com sucesso: {decoded}")
                print(f"User ID: {decoded.get('sub')}")
                print(f"Expiração: {decoded.get('exp')}")
            except Exception as e:
                print(f"Erro ao decodificar token: {e}")
            
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_endpoint_specific() 