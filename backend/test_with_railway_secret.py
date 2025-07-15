#!/usr/bin/env python3
"""
Script para testar com o SECRET_KEY específico do Railway
"""
import requests
import jwt
from datetime import datetime

def test_with_railway_secret():
    """Testa com o SECRET_KEY específico do Railway"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Testando com SECRET_KEY do Railway...")
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
            
            # 2. Decodificar payload
            decoded = jwt.decode(token, options={"verify_signature": False})
            print(f"Payload: {decoded}")
            
            # 3. Testar com o SECRET_KEY específico do Railway
            railway_secret = "sua-chave-secreta-aqui-muito-segura"
            print(f"\n3. Testando com SECRET_KEY do Railway: {railway_secret}")
            
            try:
                decoded_with_key = jwt.decode(token, railway_secret, algorithms=["HS256"])
                print(f"✅ SECRET_KEY do Railway é válido!")
                print(f"   Payload válido: {decoded_with_key}")
                
                # Testar endpoint com este SECRET_KEY
                print(f"\n4. Testando endpoint...")
                headers = {'Authorization': f'Bearer {token}'}
                response_test = requests.get(f"{base_url}/api/users", headers=headers, timeout=10)
                print(f"Status do endpoint: {response_test.status_code}")
                
                if response_test.status_code == 200:
                    print("✅ Endpoint funcionando!")
                    users = response_test.json()
                    print(f"Usuários encontrados: {len(users)}")
                    for user in users:
                        print(f"   - {user.get('name', 'N/A')} ({user.get('email', 'N/A')})")
                else:
                    print(f"❌ Endpoint ainda falhando: {response_test.text}")
                
            except jwt.InvalidSignatureError:
                print("❌ SECRET_KEY do Railway não é válido")
                print("💡 O problema pode ser que o SECRET_KEY no Railway não está sendo usado corretamente")
                
            except Exception as e:
                print(f"❌ Erro ao testar SECRET_KEY: {e}")
            
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_with_railway_secret() 