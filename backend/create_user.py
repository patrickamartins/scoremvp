from app.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin_user():
    db = SessionLocal()
    email = "admin@scoremvp.com"
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"User with email {email} already exists")
        return

    user = User(
        name="Admin",
        email=email,
        hashed_password=get_password_hash("admin123"),
        role="superadmin"
    )
    
    db.add(user)
    db.commit()
    print(f"Admin user created successfully with email {email}")

if __name__ == "__main__":
    create_admin_user()
