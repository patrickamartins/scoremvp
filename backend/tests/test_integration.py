#!/usr/bin/env python3
"""
Teste de integração para verificar se o frontend consegue acessar o endpoint de usuários
após as correções feitas
"""

import requests
import json
import pytest

# Configurações para Railway
BASE_URL = "https://scoremvpback-production.up.railway.app"
ADMIN_EMAIL = "admin@scoremvp.com.br"
ADMIN_PASSWORD = "admin123"

def test_frontend_integration():
    """Testa se o frontend consegue acessar o endpoint de usuários"""
    print("🚀 Testando integração frontend-backend...")
    print(f"URL Base: {BASE_URL}")
    print("=" * 60)
    
    # Simular login do frontend
    print("🔐 Simulando login do frontend...")
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
        
        if response.status_code != 200:
            print(f"❌ Login falhou: {response.text}")
            return False
        
        data = response.json()
        token = data.get('access_token')
        print("✅ Login bem-sucedido!")
        
        # Testar endpoint que o frontend usa
        print("\n👥 Testando endpoint /api/users/ (usado pelo frontend)...")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{BASE_URL}/api/users/", headers=headers)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            users = response.json()
            print("✅ Endpoint /api/users/ funcionando para o frontend!")
            print(f"📊 Usuários encontrados: {len(users)}")
            
            if users:
                print("\n📋 Lista de usuários (primeiros 3):")
                for i, user in enumerate(users[:3]):
                    print(f"  {i+1}. ID: {user.get('id')}, Email: {user.get('email')}, Role: {user.get('role')}")
            
            return True
        else:
            print(f"❌ Endpoint falhou: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na integração: {e}")
        return False

def test_frontend_urls():
    """Testa URLs que o frontend pode usar"""
    print("\n🌐 Testando URLs do frontend...")
    
    urls_to_test = [
        "/api/users/",
        "/api/users",
        "/api/users?search=admin",
        "/api/users/?search=admin"
    ]
    
    # Obter token primeiro
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
        
        if response.status_code != 200:
            print("❌ Não foi possível obter token")
            return
        
        data = response.json()
        token = data.get('access_token')
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        for url in urls_to_test:
            try:
                response = requests.get(f"{BASE_URL}{url}", headers=headers)
                status = "✅" if response.status_code == 200 else "❌"
                print(f"  {status} {url}: {response.status_code}")
            except Exception as e:
                print(f"  ❌ {url}: Erro - {e}")
                
    except Exception as e:
        print(f"❌ Erro ao testar URLs: {e}")

def main():
    """Executa todos os testes"""
    print("🔧 TESTE DE INTEGRAÇÃO FRONTEND-BACKEND")
    print("=" * 60)
    
    # Teste principal
    success = test_frontend_integration()
    
    # Teste de URLs
    test_frontend_urls()
    
    print("\n" + "=" * 60)
    print("📊 RESUMO DA INTEGRAÇÃO:")
    print(f"Integração frontend-backend: {'✅' if success else '❌'}")
    
    if success:
        print("\n🎉 SUCESSO! O frontend está integrado corretamente!")
        print("✅ O endpoint /api/users/ está funcionando")
        print("✅ O frontend pode acessar a lista de usuários")
        print("✅ As correções foram aplicadas com sucesso")
    else:
        print("\n⚠️  Ainda há problemas na integração")
        print("💡 Verifique se o deploy foi concluído")

if __name__ == "__main__":
    main() 