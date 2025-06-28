import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.core.config import settings

# Criar conexão com o banco de dados
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def update_user_level(email: str):
    try:
        # Buscar o usuário pelo email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Usuário com email {email} não encontrado.")
            return
        
        # Atualizar o nível para ADMIN
        user.nivel = "ADMIN"
        db.commit()
        print(f"Usuário {user.username} atualizado para ADMIN com sucesso!")
    
    except Exception as e:
        print(f"Erro ao atualizar usuário: {str(e)}")
        db.rollback()
    finally:
        db.close()

def update_user_role():
    db = SessionLocal()
    email = input("Enter user email: ")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User with email {email} not found")
        return
    
    user.role = "superadmin"
    db.commit()
    print(f"User {user.name} updated to SUPERADMIN successfully!")

if __name__ == "__main__":
    # Substitua pelo email do usuário que você quer atualizar
    email = input("Digite o email do usuário que você quer atualizar para ADMIN: ")
    update_user_level(email)
    update_user_role() 