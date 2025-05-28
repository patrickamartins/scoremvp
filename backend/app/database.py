from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Configuração do banco de dados para SQLite
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'scoremvp.db')}"

# Configuração do engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # echo=True para debug de SQL
    connect_args={"check_same_thread": False}  # Necessário para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    # Importar todos os modelos aqui para garantir que eles sejam registrados no Base.metadata
    from app.models import User, Jogadora, Jogo, Estatistica
    
    # Criar todas as tabelas
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
