from database import SessionLocal
from models import Jogadora

def populate_jogadoras():
    jogadoras = [
        "Manu", "Belinha", "Sofia Alves", "Letícia Laura", "Laura Xavier",
        "Noemi", "Maria Luiza", "Valentina Altfuldisk", "Aysha", "Duda",
        "Helô", "Aline Gomes", "Mari Garcia", "Valentina Soares"
    ]
    
    db = SessionLocal()
    try:
        for nome in jogadoras:
            jogadora = Jogadora(nome=nome)
            db.add(jogadora)
        db.commit()
        print("Jogadoras cadastradas com sucesso!")
    except Exception as e:
        print(f"Erro ao cadastrar jogadoras: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_jogadoras() 