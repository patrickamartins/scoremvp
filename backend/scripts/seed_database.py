#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados básicos
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.game import Game
from app.models.player import Player
from app.core.security import get_password_hash
from datetime import datetime

def seed_database():
    """Popula o banco de dados com dados básicos"""
    db = SessionLocal()
    
    try:
        # Verificar se já existe um superadmin
        admin = db.query(User).filter(User.email == "admin@scoremvp.com.br").first()
        if not admin:
            print("Criando superadmin...")
            admin = User(
                name="Administrador",
                email="admin@scoremvp.com.br",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Superadmin criado com sucesso!")
        else:
            print("Superadmin já existe!")
        
        # Criar alguns jogos de exemplo
        games = [
            {
                "opponent": "Time A",
                "date": datetime.now(),
                "location": "Ginásio Municipal",
                "categoria": "Adulto",
                "status": "PENDING"
            },
            {
                "opponent": "Time B", 
                "date": datetime.now(),
                "location": "Arena Esportiva",
                "categoria": "Adulto",
                "status": "PENDING"
            }
        ]
        
        for game_data in games:
            existing_game = db.query(Game).filter(Game.opponent == game_data["opponent"]).first()
            if not existing_game:
                print(f"Criando jogo: {game_data['opponent']}")
                game = Game(**game_data)
                db.add(game)
        
        db.commit()
        print("Jogos criados com sucesso!")
        
        # Criar alguns jogadores de exemplo
        players = [
            {
                "name": "Maria Silva",
                "number": "10",
                "position": "Point Guard",
                "team": "Time A"
            },
            {
                "name": "Ana Santos",
                "number": "15",
                "position": "Shooting Guard",
                "team": "Time A"
            },
            {
                "name": "Joana Costa",
                "number": "8",
                "position": "Center",
                "team": "Time B"
            }
        ]
        
        for player_data in players:
            existing_player = db.query(Player).filter(
                Player.name == player_data["name"],
                Player.number == player_data["number"]
            ).first()
            if not existing_player:
                print(f"Criando jogador: {player_data['name']}")
                player = Player(**player_data)
                db.add(player)
        
        db.commit()
        print("Jogadores criados com sucesso!")
        
        print("Seed do banco de dados concluído!")
        
    except Exception as e:
        print(f"Erro ao popular banco: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 