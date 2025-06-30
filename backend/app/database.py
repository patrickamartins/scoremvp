from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Usar a configuração do settings que prioriza DATABASE_URL do ambiente
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI

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
