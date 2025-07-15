#!/usr/bin/env python3
"""
Script para debugar a autenticação do token
"""

import requests
import jwt
from datetime import datetime

# URL correta e credenciais que funcionam
BASE_URL = "https://scoremvpback-production.up.railway.app"
CREDENTIALS = {"username": "admin@scoremvp.com.br", "password": "admin123"}

def debug_token_authentication():
    """Debuga a autenticação do token"""
    
    print("🔍 Debugando autenticação do token...")
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
            print(f"Token: {token[:50]}...")
            print(f"Usuário: {user_data.get('name', 'N/A')}")
            print(f"Email: {user_data.get('email', 'N/A')}")
            print(f"ID: {user_data.get('id', 'N/A')}")
            
            # 2. Decodificar token (sem verificar assinatura)
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                print(f"\n2. Token decodificado:")
                print(f"   Subject (sub): {decoded.get('sub')}")
                print(f"   Expiração: {decoded.get('exp')}")
                print(f"   Tipo de subject: {type(decoded.get('sub'))}")
                
                # Converter para datetime
                exp_timestamp = decoded.get('exp')
                if exp_timestamp:
                    exp_date = datetime.fromtimestamp(exp_timestamp)
                    print(f"   Expira em: {exp_date}")
                    
            except Exception as e:
                print(f"❌ Erro ao decodificar token: {e}")
            
            # 3. Testar diferentes endpoints protegidos
            print(f"\n3. Testando endpoints protegidos...")
            headers = {"Authorization": f"Bearer {token}"}
            
            endpoints = [
                "/api/users",
                "/api/users/players-with-user",
                "/api/users?skip=0&limit=5",
                "/api/me",
                "/api/auth/me"
            ]
            
            for endpoint in endpoints:
                try:
                    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)
                    print(f"   {endpoint}: {response.status_code}")
                    if response.status_code == 200:
                        data = response.json()
                        if isinstance(data, list):
                            print(f"   ✅ {len(data)} itens retornados")
                        else:
                            print(f"   ✅ Dados retornados")
                    else:
                        print(f"   ❌ Erro: {response.text}")
                except Exception as e:
                    print(f"   {endpoint}: Erro - {e}")
            
            # 4. Testar sem token
            print(f"\n4. Testando sem token...")
            try:
                response = requests.get(f"{BASE_URL}/api/users", timeout=10)
                print(f"   /api/users sem token: {response.status_code}")
            except Exception as e:
                print(f"   /api/users sem token: Erro - {e}")
            
            # 5. Testar com token malformado
            print(f"\n5. Testando com token malformado...")
            try:
                headers = {"Authorization": "Bearer invalid_token"}
                response = requests.get(f"{BASE_URL}/api/users", headers=headers, timeout=10)
                print(f"   /api/users com token inválido: {response.status_code}")
            except Exception as e:
                print(f"   /api/users com token inválido: Erro - {e}")
                
        else:
            print(f"❌ Login falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")

def main():
    """Função principal"""
    debug_token_authentication()
    print("\n" + "=" * 60)
    print("✅ Debug de autenticação concluído!")

if __name__ == "__main__":
    main() 