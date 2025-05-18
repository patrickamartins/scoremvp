from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.settings import settings

# Configuração do banco de dados para PostgreSQL
DATABASE_URL = settings.database_url

engine = create_engine(DATABASE_URL, echo=True)  # echo=True para debug de SQL
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
