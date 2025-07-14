#!/usr/bin/env python3
"""
Script para verificar configurações de deploy e testar endpoints
"""
import requests
import os
import sys

def check_backend_health():
    """Verifica se o backend está funcionando"""
    try:
        # URL do backend em produção
        backend_url = "https://scoremvpback-production.up.railway.app"
        
        print("🔍 Verificando backend...")
        
        # Teste 1: Health check
        response = requests.get(f"{backend_url}/health", timeout=10)
        print(f"✅ Health check: {response.status_code}")
        
        # Teste 2: Root endpoint
        response = requests.get(f"{backend_url}/", timeout=10)
        print(f"✅ Root endpoint: {response.status_code}")
        
        # Teste 3: CORS preflight
        headers = {
            'Origin': 'https://scoremvp-frontend-production.up.railway.app',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization'
        }
        response = requests.options(f"{backend_url}/api/users", headers=headers, timeout=10)
        print(f"✅ CORS preflight: {response.status_code}")
        
        # Teste 4: Login endpoint
        login_data = {
            'username': 'admin@scoremvp.com.br',
            'password': 'admin123'
        }
        response = requests.post(
            f"{backend_url}/api/auth/login",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        print(f"✅ Login endpoint: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            if token:
                # Teste 5: Endpoint protegido
                headers = {'Authorization': f'Bearer {token}'}
                response = requests.get(f"{backend_url}/api/users", headers=headers, timeout=10)
                print(f"✅ Users endpoint: {response.status_code}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar com backend: {e}")
        return False

def check_frontend_health():
    """Verifica se o frontend está funcionando"""
    try:
        frontend_url = "https://scoremvp-frontend-production.up.railway.app"
        
        print("🔍 Verificando frontend...")
        
        response = requests.get(frontend_url, timeout=10)
        print(f"✅ Frontend: {response.status_code}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar com frontend: {e}")
        return False

def check_database():
    """Verifica se o banco de dados está acessível"""
    try:
        import psycopg2
        from app.core.config import settings
        
        print("🔍 Verificando banco de dados...")
        
        # Testar conexão
        conn = psycopg2.connect(settings.SQLALCHEMY_DATABASE_URI)
        cursor = conn.cursor()
        
        # Verificar tabelas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        print(f"✅ Tabelas encontradas: {len(tables)}")
        
        # Verificar dados
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"✅ Usuários: {user_count}")
        
        cursor.execute("SELECT COUNT(*) FROM games")
        game_count = cursor.fetchone()[0]
        print(f"✅ Jogos: {game_count}")
        
        cursor.execute("SELECT COUNT(*) FROM players")
        player_count = cursor.fetchone()[0]
        print(f"✅ Jogadores: {player_count}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao conectar com banco: {e}")
        return False

def main():
    """Executa todas as verificações"""
    print("🚀 Verificando deploy do Score MVP...")
    print("=" * 50)
    
    backend_ok = check_backend_health()
    print()
    
    frontend_ok = check_frontend_health()
    print()
    
    database_ok = check_database()
    print()
    
    print("=" * 50)
    if backend_ok and frontend_ok and database_ok:
        print("✅ Todos os serviços estão funcionando!")
    else:
        print("❌ Alguns serviços apresentam problemas.")
        print("\n📋 Próximos passos:")
        if not backend_ok:
            print("- Verificar logs do backend no Railway")
            print("- Confirmar que o Procfile está correto")
        if not frontend_ok:
            print("- Verificar logs do frontend no Railway")
            print("- Confirmar que o build foi executado")
        if not database_ok:
            print("- Executar migrations: python -m alembic upgrade head")
            print("- Executar seed: python scripts/seed_database.py")

if __name__ == "__main__":
    main() 