#!/usr/bin/env python3
"""
Teste para verificar se o endpoint /api/users está funcionando no Railway
após a correção do prefixo do router
"""

import requests
import json
import os

# Configurações para Railway
BASE_URL = "https://scoremvpback-production.up.railway.app"
ADMIN_EMAIL = "admin@scoremvp.com.br"
ADMIN_PASSWORD = "admin123"

def test_login():
    """Testa o login do admin"""
    print("🔐 Testando login no Railway...")
    
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
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login bem-sucedido!")
            print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
            return data.get('access_token')
        else:
            print(f"❌ Login falhou: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        return None

def test_users_endpoint(token):
    """Testa o endpoint /api/users"""
    print("\n👥 Testando endpoint /api/users...")
    
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

def test_users_endpoint_with_slash(token):
    """Testa o endpoint /api/users/ (com barra)"""
    print("\n👥 Testando endpoint /api/users/ (com barra)...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/users/", headers=headers)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint /api/users/ funcionando!")
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
    print("🚀 Iniciando testes no Railway...")
    print(f"URL Base: {BASE_URL}")
    print(f"Email Admin: {ADMIN_EMAIL}")
    print("=" * 50)
    
    # Teste de login
    token = test_login()
    
    if not token:
        print("❌ Não foi possível obter token. Testes abortados.")
        return
    
    # Teste do endpoint sem barra
    success1 = test_users_endpoint(token)
    
    # Teste do endpoint com barra
    success2 = test_users_endpoint_with_slash(token)
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES:")
    print(f"Login: {'✅' if token else '❌'}")
    print(f"/api/users: {'✅' if success1 else '❌'}")
    print(f"/api/users/: {'✅' if success2 else '❌'}")
    
    if success1 and success2:
        print("\n🎉 TODOS OS TESTES PASSARAM! O problema foi resolvido!")
    else:
        print("\n⚠️  Alguns testes falharam. Verifique a configuração.")

if __name__ == "__main__":
    main() 