#!/usr/bin/env python3
"""
Script para testar endpoints localmente
"""
import requests
import json

def test_local_endpoints():
    """Testa endpoints localmente"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testando endpoints localmente...")
    print("=" * 50)
    
    # Teste 1: Health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check: {e}")
    
    # Teste 2: Root endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Root endpoint: {e}")
    
    # Teste 3: Login
    try:
        login_data = {
            'username': 'admin@scoremvp.com.br',
            'password': 'admin123'
        }
        response = requests.post(
            f"{base_url}/api/auth/login",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        print(f"✅ Login: {response.status_code}")
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"   Token obtido: {'Sim' if token else 'Não'}")
            
            # Teste 4: Users endpoint (protegido)
            if token:
                headers = {'Authorization': f'Bearer {token}'}
                response = requests.get(f"{base_url}/api/users", headers=headers)
                print(f"✅ Users endpoint: {response.status_code}")
                if response.status_code == 200:
                    users = response.json()
                    print(f"   Usuários encontrados: {len(users)}")
                elif response.status_code == 307:
                    print("   ⚠️  Redirect 307 detectado!")
                    print(f"   Location: {response.headers.get('Location', 'N/A')}")
        else:
            print(f"   Erro: {response.text}")
    except Exception as e:
        print(f"❌ Login: {e}")
    
    # Teste 5: CORS preflight
    try:
        headers = {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization'
        }
        response = requests.options(f"{base_url}/api/users", headers=headers)
        print(f"✅ CORS preflight: {response.status_code}")
    except Exception as e:
        print(f"❌ CORS preflight: {e}")
    
    print("=" * 50)

if __name__ == "__main__":
    test_local_endpoints() 