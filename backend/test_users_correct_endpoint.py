#!/usr/bin/env python3
"""
Teste para verificar o endpoint correto /api/users/ (com barra)
"""

import requests
import json

# Configurações para Railway
BASE_URL = "https://scoremvpback-production.up.railway.app"
ADMIN_EMAIL = "admin@scoremvp.com.br"
ADMIN_PASSWORD = "admin123"

def get_token():
    """Obtém o token de autenticação"""
    print("🔐 Obtendo token...")
    
    login_data = {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login bem-sucedido!")
            return data.get('access_token')
        else:
            print(f"❌ Login falhou: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        return None

def test_users_endpoint(token):
    """Testa o endpoint /api/users/ (com barra)"""
    print("\n👥 Testando endpoint /api/users/ (com barra)...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/users/", headers=headers)
        
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint /api/users/ funcionando!")
            print(f"Usuários encontrados: {len(data)}")
            
            if data:
                print("\n📋 Lista de usuários:")
                for i, user in enumerate(data[:5]):  # Mostrar apenas os primeiros 5
                    print(f"  {i+1}. ID: {user.get('id')}, Email: {user.get('email')}, Role: {user.get('role')}")
                if len(data) > 5:
                    print(f"  ... e mais {len(data) - 5} usuários")
            
            return True
        else:
            print(f"❌ Endpoint falhou: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no endpoint: {e}")
        return False

def test_users_endpoint_without_slash(token):
    """Testa o endpoint /api/users (sem barra) para comparação"""
    print("\n👥 Testando endpoint /api/users (sem barra)...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/users", headers=headers)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint /api/users funcionando!")
            print(f"Usuários encontrados: {len(data)}")
            return True
        else:
            print(f"❌ Endpoint falhou: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no endpoint: {e}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Testando endpoints de usuários...")
    print(f"URL Base: {BASE_URL}")
    print(f"Email Admin: {ADMIN_EMAIL}")
    print("=" * 60)
    
    # Obter token
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token")
        return
    
    # Testar endpoint com barra (correto)
    success1 = test_users_endpoint(token)
    
    # Testar endpoint sem barra (para comparação)
    success2 = test_users_endpoint_without_slash(token)
    
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES:")
    print(f"Login: {'✅' if token else '❌'}")
    print(f"/api/users/ (com barra): {'✅' if success1 else '❌'}")
    print(f"/api/users (sem barra): {'✅' if success2 else '❌'}")
    
    if success1:
        print("\n🎉 O endpoint /api/users/ está funcionando!")
        print("💡 O frontend deve usar /api/users/ (com barra) para acessar a lista de usuários.")
    else:
        print("\n⚠️  O endpoint ainda não está funcionando. Verifique a configuração.")

if __name__ == "__main__":
    main() 