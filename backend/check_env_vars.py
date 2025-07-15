#!/usr/bin/env python3
"""
Script para verificar variáveis de ambiente do Railway
"""
import requests

def check_env_vars():
    """Verifica as variáveis de ambiente do Railway"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Verificando variáveis de ambiente do Railway...")
    print("=" * 60)
    
    # Endpoints para verificar variáveis de ambiente
    endpoints = [
        "/api/debug-db-url",
        "/health",
        "/",
        "/api/auth/login"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            print(f"{endpoint}: {response.status_code}")
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   Resposta: {data}")
                except:
                    print(f"   Resposta: {response.text[:100]}...")
        except Exception as e:
            print(f"{endpoint}: Erro - {e}")
    
    # Tentar fazer login para ver se há informações sobre SECRET_KEY
    print("\n🔍 Testando login para verificar configurações...")
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
            print("✅ Login bem-sucedido")
            print(f"Token: {token_data.get('access_token', 'N/A')[:50]}...")
            
            # Verificar se há informações sobre o usuário
            user_data = token_data.get('user', {})
            if user_data:
                print(f"Usuário: {user_data.get('name', 'N/A')}")
                print(f"Email: {user_data.get('email', 'N/A')}")
                print(f"Role: {user_data.get('role', 'N/A')}")
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")

if __name__ == "__main__":
    check_env_vars() 