#!/usr/bin/env python3
"""
Script para testar se o problema é com o SECRET_KEY
"""
import requests
import jwt
from datetime import datetime

def test_secret_key_issue():
    """Testa se o problema é com o SECRET_KEY"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Testando problema do SECRET_KEY...")
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
            
            # 3. Tentar diferentes SECRET_KEYs baseados em padrões comuns
            print("\n3. Testando SECRET_KEYs...")
            
            # Lista de possíveis SECRET_KEYs
            possible_secrets = [
                "your-secret-key-here-change-in-production",
                "scoremvp-secret-key-2024",
                "railway-secret-key",
                "production-secret-key",
                "fastapi-secret-key",
                "jwt-secret-key",
                "auth-secret-key",
                "api-secret-key",
                "backend-secret-key",
                "token-secret-key",
                "user-secret-key",
                "admin-secret-key",
                "secure-key-2024",
                "railway-jwt-secret",
                "production-jwt-key",
                "scoremvp-jwt-secret",
                "fastapi-jwt-secret",
                "auth-jwt-secret",
                "api-jwt-secret",
                "backend-jwt-secret",
                "token-jwt-secret",
                # Adicionar mais possibilidades baseadas em variáveis de ambiente
                "SECRET_KEY",
                "JWT_SECRET",
                "AUTH_SECRET",
                "API_SECRET",
                "RAILWAY_SECRET",
                "PRODUCTION_SECRET",
                "SCOREMVP_SECRET",
                "FASTAPI_SECRET",
                "BACKEND_SECRET",
                "TOKEN_SECRET"
            ]
            
            for i, secret in enumerate(possible_secrets, 1):
                try:
                    decoded_with_key = jwt.decode(token, secret, algorithms=["HS256"])
                    print(f"✅ SECRET_KEY {i} encontrado: {secret}")
                    print(f"   Payload válido: {decoded_with_key}")
                    
                    # Testar se este SECRET_KEY funciona no endpoint
                    print(f"   Testando endpoint com este SECRET_KEY...")
                    headers = {'Authorization': f'Bearer {token}'}
                    response_test = requests.get(f"{base_url}/api/users", headers=headers, timeout=10)
                    print(f"   Status do endpoint: {response_test.status_code}")
                    
                    return secret
                    
                except jwt.InvalidSignatureError:
                    continue
                except Exception as e:
                    continue
            
            print("❌ Nenhum SECRET_KEY encontrado nos padrões testados")
            print("\n💡 Solução: Verificar variáveis de ambiente no Railway")
            print("   1. Vá para o projeto no Railway")
            print("   2. Na aba 'Variables', adicione:")
            print("      SECRET_KEY = 'um-valor-secreto-muito-seguro-aqui'")
            print("   3. Faça o redeploy do projeto")
            
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_secret_key_issue() 