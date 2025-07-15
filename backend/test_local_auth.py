#!/usr/bin/env python3
"""
Script para testar autenticação localmente
"""
import sys
import os
sys.path.append('.')

from app.core.security import create_access_token, get_current_user
from app.database import SessionLocal
from app.models import User
from jose import jwt
from app.core.config import settings

def test_local_auth():
    """Testa autenticação localmente"""
    
    print("🔍 Testando autenticação localmente...")
    print("=" * 60)
    
    # 1. Criar token
    print("1. Criando token...")
    user_id = 1
    token = create_access_token(user_id)
    print(f"Token criado: {token}")
    
    # 2. Decodificar token
    print("\n2. Decodificando token...")
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    print(f"Payload: {decoded}")
    print(f"Sub: {decoded.get('sub')}")
    print(f"Tipo do sub: {type(decoded.get('sub'))}")
    
    # 3. Testar get_current_user
    print("\n3. Testando get_current_user...")
    db = SessionLocal()
    try:
        user = get_current_user(token, db)
        print(f"✅ Usuário encontrado: {user.name} ({user.email})")
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_local_auth() 