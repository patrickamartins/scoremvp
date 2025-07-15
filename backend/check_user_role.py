#!/usr/bin/env python3
"""
Script para verificar o role do usuário admin
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# URL correta e credenciais que funcionam
BASE_URL = "https://scoremvpback-production.up.railway.app"
CREDENTIALS = {"username": "admin@scoremvp.com.br", "password": "admin123"}

def check_user_role():
    """Verifica o role do usuário admin"""
    
    print("🔍 Verificando role do usuário admin...")
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
            user_data = token_data.get("user", {})
            
            print(f"✅ Login bem-sucedido!")
            print(f"Usuário: {user_data.get('name', 'N/A')}")
            print(f"Email: {user_data.get('email', 'N/A')}")
            print(f"ID: {user_data.get('id', 'N/A')}")
            print(f"Role: {user_data.get('role', 'N/A')}")
            print(f"Is Active: {user_data.get('is_active', 'N/A')}")
            
            # 2. Testar endpoint /me para verificar role
            token = token_data.get("access_token")
            if token:
                headers = {"Authorization": f"Bearer {token}"}
                try:
                    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=10)
                    if response.status_code == 200:
                        me_data = response.json()
                        print(f"\n2. Dados do /me:")
                        print(f"   Role: {me_data.get('role', 'N/A')}")
                        print(f"   Is Active: {me_data.get('is_active', 'N/A')}")
                        print(f"   Plan: {me_data.get('plan', 'N/A')}")
                    else:
                        print(f"   ❌ Erro no /me: {response.text}")
                except Exception as e:
                    print(f"   ❌ Erro no /me: {e}")
            
            # 3. Verificar se o role é superadmin
            role = user_data.get('role', '')
            if role == 'superadmin':
                print(f"\n✅ Usuário é superadmin - deve ter acesso ao /api/users")
            elif role == 'admin':
                print(f"\n⚠️  Usuário é admin - pode não ter acesso ao /api/users")
            else:
                print(f"\n❌ Usuário tem role '{role}' - não tem acesso ao /api/users")
                
        else:
            print(f"❌ Login falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")

def main():
    """Função principal"""
    check_user_role()
    print("\n" + "=" * 60)
    print("✅ Verificação de role concluída!")

if __name__ == "__main__":
    main() 