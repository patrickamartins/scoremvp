#!/usr/bin/env python3
import os
import sys
from sqlalchemy.orm import Session

# Adiciona o diretório raiz ao PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.models import User, UserRole, UserPlan
from app.core.security import get_password_hash

def create_admin_user():
    """Cria um usuário administrador inicial"""
    try:
        db = next(get_db())
        
        # Verifica se já existe um usuário admin
        existing_admin = db.query(User).filter(User.email == "admin@scoremvp.com.br").first()
        if existing_admin:
            print("Usuário admin já existe!")
            return
        
        # Cria o usuário admin
        admin_user = User(
            name="Administrador",
            email="admin@scoremvp.com.br",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.SUPERADMIN,
            plan=UserPlan.TEAM,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("Usuário admin criado com sucesso!")
        print(f"Email: admin@scoremvp.com.br")
        print(f"Senha: admin123")
        
    except Exception as e:
        print(f"Erro ao criar usuário admin: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_admin_user() 