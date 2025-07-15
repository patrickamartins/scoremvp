#!/usr/bin/env python3
"""
Script para testar autenticação simulando o ambiente do Railway
"""
import requests
import jwt
from datetime import datetime

def test_railway_auth():
    """Testa autenticação simulando o ambiente do Railway"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Testando autenticação do Railway...")
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
            
            # 2. Decodificar o token para verificar o SECRET_KEY
            print("\n2. Decodificando token...")
            try:
                # Tentar decodificar sem verificar assinatura para ver o payload
                decoded = jwt.decode(token, options={"verify_signature": False})
                print(f"Payload: {decoded}")
                
                # Tentar decodificar com diferentes SECRET_KEYs
                secret_keys = [
                    "your-secret-key-here-change-in-production",
                    "scoremvp-secret-key-2024",
                    "railway-secret-key",
                    "production-secret-key"
                ]
                
                print("\n3. Testando diferentes SECRET_KEYs...")
                for i, secret_key in enumerate(secret_keys, 1):
                    try:
                        decoded_with_key = jwt.decode(token, secret_key, algorithms=["HS256"])
                        print(f"   SECRET_KEY {i} ({secret_key[:20]}...): ✅ Válido")
                        print(f"   Payload: {decoded_with_key}")
                    except jwt.InvalidSignatureError:
                        print(f"   SECRET_KEY {i} ({secret_key[:20]}...): ❌ Assinatura inválida")
                    except Exception as e:
                        print(f"   SECRET_KEY {i} ({secret_key[:20]}...): ❌ Erro - {e}")
                
            except Exception as e:
                print(f"❌ Erro ao decodificar token: {e}")
            
            # 3. Testar endpoint protegido
            print("\n4. Testando endpoint protegido...")
            headers = {'Authorization': f'Bearer {token}'}
            
            response = requests.get(
                f"{base_url}/api/users",
                headers=headers,
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Resposta: {response.text[:200]}...")
            
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_railway_auth() 