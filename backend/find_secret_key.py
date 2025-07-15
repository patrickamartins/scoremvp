#!/usr/bin/env python3
"""
Script para descobrir o SECRET_KEY correto do Railway
"""
import requests
import jwt
import itertools
import string

def find_secret_key():
    """Tenta descobrir o SECRET_KEY correto"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Tentando descobrir o SECRET_KEY...")
    print("=" * 60)
    
    # 1. Fazer login para obter token
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
            
            # 2. Decodificar payload sem verificar assinatura
            decoded = jwt.decode(token, options={"verify_signature": False})
            print(f"Payload: {decoded}")
            
            # 3. Tentar SECRET_KEYs comuns
            common_secrets = [
                "scoremvp-secret-2024",
                "railway-secret-key",
                "production-secret",
                "fastapi-secret",
                "jwt-secret-key",
                "auth-secret-key",
                "api-secret-key",
                "backend-secret",
                "token-secret",
                "user-secret-key",
                "admin-secret",
                "secure-key-2024",
                "railway-jwt-secret",
                "production-jwt-key",
                "scoremvp-jwt-secret",
                "fastapi-jwt-secret",
                "auth-jwt-secret",
                "api-jwt-secret",
                "backend-jwt-secret",
                "token-jwt-secret"
            ]
            
            print("\n3. Testando SECRET_KEYs comuns...")
            for secret in common_secrets:
                try:
                    decoded_with_key = jwt.decode(token, secret, algorithms=["HS256"])
                    print(f"✅ SECRET_KEY encontrado: {secret}")
                    return secret
                except jwt.InvalidSignatureError:
                    continue
                except Exception as e:
                    continue
            
            print("❌ SECRET_KEY não encontrado nos padrões comuns")
            
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    find_secret_key() 