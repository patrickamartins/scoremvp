#!/usr/bin/env python3
"""
Teste para verificar quais métodos HTTP o endpoint /api/users aceita
"""

import requests
import json

# Configurações para Railway
BASE_URL = "https://scoremvpback-production.up.railway.app"
ADMIN_EMAIL = "admin@scoremvp.com.br"
ADMIN_PASSWORD = "admin123"

def get_token():
    """Obtém o token de autenticação"""
    print("🔐 Obtendo token...")
    
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
        
        if response.status_code == 200:
            data = response.json()
            return data.get('access_token')
        else:
            print(f"❌ Login falhou: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        return None

def test_method(method, url, token=None):
    """Testa um método HTTP específico"""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json={})
        elif method == "PUT":
            response = requests.put(url, headers=headers, json={})
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        elif method == "PATCH":
            response = requests.patch(url, headers=headers, json={})
        else:
            print(f"❌ Método {method} não suportado")
            return False
        
        print(f"  {method}: {response.status_code}")
        if response.status_code != 200:
            print(f"    Resposta: {response.text[:100]}...")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"  {method}: ❌ Erro - {e}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Testando métodos HTTP para /api/users...")
    print("=" * 60)
    
    # Obter token
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token")
        return
    
    # Testar diferentes métodos
    methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    urls = [
        "/api/users",
        "/api/users/"
    ]
    
    for url in urls:
        print(f"\n📡 Testando {url}:")
        print("-" * 40)
        
        for method in methods:
            test_method(method, f"{BASE_URL}{url}", token)
    
    print("\n" + "=" * 60)
    print("📊 RESUMO:")
    print("✅ = Método aceito (200)")
    print("❌ = Método não aceito ou erro")
    print("\n💡 Se nenhum método GET funcionar, verifique se o endpoint está configurado corretamente.")

if __name__ == "__main__":
    main() 