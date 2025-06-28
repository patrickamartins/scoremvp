import sys
import os
from pathlib import Path
from datetime import datetime

# Adiciona o diretório raiz ao PYTHONPATH
sys.path.append(str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

# Dados do admin
ADMIN_NAME = "Admin"
ADMIN_EMAIL = "admin@scoremvp.com.br"
ADMIN_PASSWORD = "admin123"

# Criptografa a senha
hashed_password = get_password_hash(ADMIN_PASSWORD)

def create_admin():
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == ADMIN_EMAIL).first():
            print("Usuário admin já existe.")
            return
        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            hashed_password=hashed_password,
            role="superadmin",
            is_active=True,
            created_at=datetime.utcnow(),
            plan="free"
        )
        db.add(admin)
        db.commit()
        print("Usuário superadmin criado com sucesso!")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin() 