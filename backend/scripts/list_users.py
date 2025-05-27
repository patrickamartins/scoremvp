from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.core.settings import settings

# Criar conexão com o banco de dados
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def list_users():
    try:
        # Buscar todos os usuários
        users = db.query(User).all()
        
        if not users:
            print("Nenhum usuário encontrado no banco de dados.")
            return
        
        print("\nLista de Usuários:")
        print("-" * 80)
        print(f"{'ID':<5} {'Username':<20} {'Email':<30} {'Nível':<10} {'Ativo':<8}")
        print("-" * 80)
        
        for user in users:
            print(f"{user.id:<5} {user.username:<20} {user.email:<30} {user.nivel:<10} {user.is_active}")
        
        print("-" * 80)
        print(f"Total de usuários: {len(users)}")
    
    except Exception as e:
        print(f"Erro ao listar usuários: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users() 