from app.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

def create_test_user():
    db = SessionLocal()
    username = "ek9bsb"
    password = "ek9bsb"

    # Verifica se já existe
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        print("Usuário já existe.")
        return

    user = User(
        username=username,
        hashed_password=get_password_hash(password)
    )
    db.add(user)
    db.commit()
    db.close()
    print("Usuário criado com sucesso.")

if __name__ == "__main__":
    create_test_user()
