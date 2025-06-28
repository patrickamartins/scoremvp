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

def list_users():
    try:
        # Buscar todos os usuários
        users = db.query(User).all()
        
        if not users:
            print("Nenhum usuário encontrado no banco de dados.")
            return
        
        print("\nLista de Usuários:")
        print("-" * 75)
        print(f"{'ID':<5} {'Name':<20} {'Email':<30} {'Role':<10} {'Active':<8}")
        print("-" * 75)
        
        for user in users:
            print(f"{user.id:<5} {user.name:<20} {user.email:<30} {user.role:<10} {user.is_active}")
        
        print("-" * 75)
        print(f"Total de usuários: {len(users)}")
    
    except Exception as e:
        print(f"Erro ao listar usuários: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users() 