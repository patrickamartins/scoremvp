#!/usr/bin/env python3
"""
Script para debugar o token de autenticação
"""
import requests
import jwt
from datetime import datetime

def debug_token():
    """Debuga o token de autenticação"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Debugando token de autenticação...")
    print("=" * 60)
    
    # 1. Fazer login para obter token
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
        print(f"Resposta do login: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get('access_token')
            print(f"✅ Token obtido: {token[:50]}...")
            
            # Decodificar o token (sem verificar assinatura para debug)
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                print(f"✅ Token decodificado:")
                print(f"   Subject (sub): {decoded.get('sub')}")
                print(f"   Exp: {decoded.get('exp')}")
                print(f"   Tipo do sub: {type(decoded.get('sub'))}")
                
                # Verificar se o sub é um número
                sub = decoded.get('sub')
                if sub is not None:
                    try:
                        sub_int = int(sub)
                        print(f"   Sub convertido para int: {sub_int}")
                    except (ValueError, TypeError) as e:
                        print(f"   ❌ Erro ao converter sub para int: {e}")
                
            except Exception as e:
                print(f"❌ Erro ao decodificar token: {e}")
            
            # 2. Testar o token
            print("\n2. Testando token...")
            headers = {'Authorization': f'Bearer {token}'}
            
            response = requests.get(
                f"{base_url}/api/users",
                headers=headers,
                timeout=10
            )
            
            print(f"Status da requisição: {response.status_code}")
            print(f"Resposta: {response.text}")
            
        else:
            print(f"❌ Login falhou")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    debug_token() 