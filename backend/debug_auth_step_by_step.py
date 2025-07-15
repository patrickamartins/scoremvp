#!/usr/bin/env python3
"""
Script para debugar autenticação passo a passo
"""
import requests
import jwt
from datetime import datetime

def debug_auth_step_by_step():
    """Debuga a autenticação passo a passo"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Debugando autenticação passo a passo...")
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
            print(f"✅ Token obtido: {token[:50]}...")
            
            # 2. Decodificar token sem verificar assinatura
            print("\n2. Decodificando token...")
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                print(f"Payload: {decoded}")
                print(f"Sub: {decoded.get('sub')}")
                print(f"Exp: {decoded.get('exp')}")
                print(f"Tipo do sub: {type(decoded.get('sub'))}")
            except Exception as e:
                print(f"❌ Erro ao decodificar: {e}")
            
            # 3. Testar diferentes formatos de Authorization header
            print("\n3. Testando diferentes formatos de Authorization...")
            
            # Teste 1: Bearer token
            headers1 = {'Authorization': f'Bearer {token}'}
            response1 = requests.get(f"{base_url}/api/users", headers=headers1, timeout=10)
            print(f"Teste 1 - Bearer token: {response1.status_code}")
            print(f"Resposta: {response1.text[:100]}...")
            
            # Teste 2: Token sem Bearer
            headers2 = {'Authorization': token}
            response2 = requests.get(f"{base_url}/api/users", headers=headers2, timeout=10)
            print(f"Teste 2 - Token sem Bearer: {response2.status_code}")
            print(f"Resposta: {response2.text[:100]}...")
            
            # Teste 3: Com User-Agent
            headers3 = {
                'Authorization': f'Bearer {token}',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response3 = requests.get(f"{base_url}/api/users", headers=headers3, timeout=10)
            print(f"Teste 3 - Com User-Agent: {response3.status_code}")
            print(f"Resposta: {response3.text[:100]}...")
            
            # Teste 4: Com Origin
            headers4 = {
                'Authorization': f'Bearer {token}',
                'Origin': 'https://scoremvp.com.br'
            }
            response4 = requests.get(f"{base_url}/api/users", headers=headers4, timeout=10)
            print(f"Teste 4 - Com Origin: {response4.status_code}")
            print(f"Resposta: {response4.text[:100]}...")
            
            # 4. Testar endpoint público para verificar se o problema é específico do /users
            print("\n4. Testando endpoint público...")
            try:
                response_public = requests.get(f"{base_url}/health", timeout=10)
                print(f"Health check: {response_public.status_code}")
            except Exception as e:
                print(f"Health check: Erro - {e}")
            
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    debug_auth_step_by_step() 