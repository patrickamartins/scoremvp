# backend/create_tables.py

from app.database import Base, engine
import app.models  # importe todos os modules que contêm Base subclasses

def main():
    Base.metadata.create_all(bind=engine)
    print("🗄️ Tabelas criadas com sucesso!")

if __name__ == "__main__":
    main()
