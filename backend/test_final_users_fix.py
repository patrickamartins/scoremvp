#!/usr/bin/env python3
"""
Teste final para verificar se a correção do prefixo do router funcionou
"""

import requests
import json
import time

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
            print("✅ Login bem-sucedido!")
            return data.get('access_token')
        else:
            print(f"❌ Login falhou: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        return None

def test_users_endpoint(token):
    """Testa o endpoint /api/users/ (com barra)"""
    print("\n👥 Testando endpoint /api/users/ (com barra)...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/users/", headers=headers)
        
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint /api/users/ funcionando!")
            print(f"Usuários encontrados: {len(data)}")
            
            if data:
                print("\n📋 Lista de usuários:")
                for i, user in enumerate(data[:5]):  # Mostrar apenas os primeiros 5
                    print(f"  {i+1}. ID: {user.get('id')}, Email: {user.get('email')}, Role: {user.get('role')}")
                if len(data) > 5:
                    print(f"  ... e mais {len(data) - 5} usuários")
            
            return True
        else:
            print(f"❌ Endpoint falhou: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no endpoint: {e}")
        return False

def test_health_endpoint():
    """Testa o endpoint de health para verificar se o servidor está funcionando"""
    print("\n🏥 Testando endpoint de health...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Servidor está funcionando")
            return True
        else:
            print(f"⚠️  Servidor respondeu com status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao conectar com servidor: {e}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Teste final após correção do router...")
    print(f"URL Base: {BASE_URL}")
    print(f"Email Admin: {ADMIN_EMAIL}")
    print("=" * 60)
    
    # Aguardar um pouco para o deploy
    print("⏳ Aguardando deploy...")
    time.sleep(10)
    
    # Testar health primeiro
    if not test_health_endpoint():
        print("❌ Servidor não está respondendo. Aguarde mais tempo para o deploy.")
        return
    
    # Obter token
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token")
        return
    
    # Testar endpoint de usuários
    success = test_users_endpoint(token)
    
    print("\n" + "=" * 60)
    print("📊 RESUMO FINAL:")
    print(f"Health: {'✅' if test_health_endpoint() else '❌'}")
    print(f"Login: {'✅' if token else '❌'}")
    print(f"/api/users/: {'✅' if success else '❌'}")
    
    if success:
        print("\n🎉 SUCESSO! O endpoint /api/users/ está funcionando!")
        print("✅ O problema foi resolvido com a correção do prefixo do router.")
        print("💡 O frontend agora pode acessar a lista de usuários em /api/users/")
    else:
        print("\n⚠️  O endpoint ainda não está funcionando.")
        print("💡 Verifique se o deploy foi concluído e tente novamente em alguns minutos.")

if __name__ == "__main__":
    main() 