#!/usr/bin/env python3
"""
Script para testar o endpoint de debug do SECRET_KEY
"""
import requests

def test_debug_secret():
    """Testa o endpoint de debug do SECRET_KEY"""
    
    base_url = "https://scoremvpback-production.up.railway.app"
    
    print("🔍 Testando endpoint de debug do SECRET_KEY...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{base_url}/api/debug-secret", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Configurações do SECRET_KEY:")
            print(f"   Comprimento: {data.get('secret_key_length')}")
            print(f"   Preview: {data.get('secret_key_preview')}")
            print(f"   Algoritmo: {data.get('algorithm')}")
            print(f"   Expiração (minutos): {data.get('access_token_expire_minutes')}")
        else:
            print(f"❌ Erro: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_debug_secret() 