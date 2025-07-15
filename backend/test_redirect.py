#!/usr/bin/env python3
"""
Script para diagnosticar o problema de redirect 307
"""
import requests
import json

def test_redirect_problem():
    """Testa especificamente o problema de redirect 307"""
    
    # URLs de teste
    urls_to_test = [
        "https://scoremvpback-production.up.railway.app",
        "http://scoremvpback-production.up.railway.app",
        "https://scoremvpback-production.up.railway.app/api/users",
        "http://scoremvpback-production.up.railway.app/api/users"
    ]
    
    print("🔍 Diagnosticando problema de redirect 307...")
    print("=" * 60)
    
    for url in urls_to_test:
        print(f"\n📡 Testando: {url}")
        
        try:
            # Teste 1: GET simples
            response = requests.get(url, timeout=10, allow_redirects=False)
            print(f"   GET: {response.status_code}")
            if response.status_code == 307:
                print(f"   ⚠️  Redirect para: {response.headers.get('Location', 'N/A')}")
            
            # Teste 2: OPTIONS (CORS preflight)
            headers = {
                'Origin': 'https://scoremvp-frontend-production.up.railway.app',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Authorization'
            }
            response = requests.options(url, headers=headers, timeout=10, allow_redirects=False)
            print(f"   OPTIONS: {response.status_code}")
            if response.status_code == 307:
                print(f"   ⚠️  Redirect para: {response.headers.get('Location', 'N/A')}")
            
            # Teste 3: Com Authorization header
            headers = {'Authorization': 'Bearer test-token'}
            response = requests.get(url, headers=headers, timeout=10, allow_redirects=False)
            print(f"   GET com Auth: {response.status_code}")
            if response.status_code == 307:
                print(f"   ⚠️  Redirect para: {response.headers.get('Location', 'N/A')}")
                
        except Exception as e:
            print(f"   ❌ Erro: {e}")
    
    print("\n" + "=" * 60)
    print("📋 Análise:")
    print("- Se todos os testes retornam 307, o Railway está forçando HTTPS")
    print("- Se apenas alguns retornam 307, pode ser configuração específica")
    print("- Se nenhum retorna 307, o problema pode estar no frontend")

def test_local_vs_production():
    """Compara comportamento local vs produção"""
    
    print("\n🔍 Comparando local vs produção...")
    print("=" * 60)
    
    # Teste local
    try:
        response = requests.get("http://localhost:8000/api/users", timeout=5)
        print(f"✅ Local: {response.status_code}")
    except:
        print("❌ Local: não disponível")
    
    # Teste produção
    try:
        response = requests.get("https://scoremvpback-production.up.railway.app/api/users", timeout=10)
        print(f"✅ Produção: {response.status_code}")
        if response.status_code == 307:
            print(f"   ⚠️  Redirect para: {response.headers.get('Location', 'N/A')}")
    except Exception as e:
        print(f"❌ Produção: {e}")

if __name__ == "__main__":
    test_redirect_problem()
    test_local_vs_production() 