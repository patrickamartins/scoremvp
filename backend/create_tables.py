#!/usr/bin/env python3
import os
import sys
from sqlalchemy import create_engine, text

# Adiciona o diretório raiz ao PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.database import Base, engine
from app.models import (
    User, UserRole, UserPlan,
    Game, Player, Statistic, Lead,
    Notification, UserNotification, NotificationTarget
)

def create_tables():
    """Cria todas as tabelas manualmente"""
    try:
        print("Criando tabelas...")
        
        # Cria todas as tabelas
        Base.metadata.create_all(bind=engine)
        
        print("Tabelas criadas com sucesso!")
        
        # Verifica se as tabelas foram criadas
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            
            tables = [row[0] for row in result]
            print(f"Tabelas criadas: {', '.join(tables)}")
        
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")
        sys.exit(1)

def create_admin_user():
    """Cria um usuário administrador inicial"""
    try:
        from app.core.security import get_password_hash
        from sqlalchemy.orm import sessionmaker
        
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
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
        
        db.close()
        
    except Exception as e:
        print(f"Erro ao criar usuário admin: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("=== CRIANDO TABELAS E USUÁRIO ADMIN ===")
    create_tables()
    create_admin_user()
    print("=== CONCLUÍDO ===")
