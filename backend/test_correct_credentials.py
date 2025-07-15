#!/usr/bin/env python3
"""
Script para testar com as credenciais corretas
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# URL correta encontrada
BASE_URL = "https://scoremvpback-production.up.railway.app"

def test_credentials():
    """Testa diferentes credenciais"""
    
    print("🔍 Testando credenciais...")
    print("=" * 60)
    
    # Lista de credenciais para testar
    credentials_list = [
        {"username": "admin@scoremvp.com", "password": "admin123"},
        {"username": "admin@scoremvp.com.br", "password": "admin123"},
        {"username": "admin", "password": "admin123"},
        {"username": "admin@scoremvp.com", "password": "admin"},
        {"username": "admin@scoremvp.com.br", "password": "admin"},
    ]
    
    for i, creds in enumerate(credentials_list, 1):
        print(f"\n🔐 Teste {i}: {creds['username']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/auth/login",
                data=creds,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                token = response.json().get("access_token")
                user_data = response.json().get("user", {})
                print(f"   ✅ Login bem-sucedido!")
                print(f"   Token: {token[:50]}..." if token else "   Token: N/A")
                print(f"   Usuário: {user_data.get('name', 'N/A')}")
                print(f"   Email: {user_data.get('email', 'N/A')}")
                
                # Testar endpoint protegido
                if token:
                    headers = {"Authorization": f"Bearer {token}"}
                    try:
                        response = requests.get(f"{BASE_URL}/api/users", headers=headers, timeout=10)
                        print(f"   /api/users: {response.status_code}")
                        if response.status_code == 200:
                            data = response.json()
                            print(f"   ✅ Usuários encontrados: {len(data)}")
                        else:
                            print(f"   ❌ Erro: {response.text}")
                    except Exception as e:
                        print(f"   /api/users: Erro - {e}")
                
                return creds  # Retorna as credenciais que funcionaram
                
            else:
                print(f"   ❌ Erro: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
    
    return None

def main():
    """Função principal"""
    working_creds = test_credentials()
    
    if working_creds:
        print(f"\n✅ Credenciais que funcionaram: {working_creds}")
    else:
        print("\n❌ Nenhuma credencial funcionou")
    
    print("\n" + "=" * 60)
    print("✅ Teste de credenciais concluído!")

if __name__ == "__main__":
    main() 