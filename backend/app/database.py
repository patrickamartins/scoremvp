from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# URL de conexao com usuario admin
DATABASE_URL = "postgresql://admin:admin123@localhost:5432/scoremvp"

# Configuracao do engine
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True,
    echo=False  # Set to True for SQL debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
