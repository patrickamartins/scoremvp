import pytest
from fastapi import status
from datetime import datetime, timedelta

def test_create_estatistica(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria um jogo
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    game_response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    game_id = game_response.json()["id"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    player_response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    player_id = player_response.json()["id"]
    
    # Cria uma estatística
    estatistica_data = {
        "jogadora_id": player_id,
        "jogo_id": game_id,
        "pontos": 10,
        "assistencias": 5,
        "rebotes": 3,
        "roubos": 2,
        "faltas": 1,
        "quarto": 1
    }
    
    response = client.post(
        "/api/estatisticas",
        json=estatistica_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["pontos"] == estatistica_data["pontos"]
    assert data["assistencias"] == estatistica_data["assistencias"]
    assert data["quarto"] == estatistica_data["quarto"]
    assert "id" in data

def test_list_estatisticas_jogo(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria um jogo
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    game_response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    game_id = game_response.json()["id"]
    
    # Lista estatísticas do jogo
    response = client.get(
        f"/api/estatisticas/jogo/{game_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)

def test_update_estatistica(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria um jogo
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    game_response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    game_id = game_response.json()["id"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    player_response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    player_id = player_response.json()["id"]
    
    # Cria uma estatística
    estatistica_data = {
        "jogadora_id": player_id,
        "jogo_id": game_id,
        "pontos": 10,
        "assistencias": 5,
        "rebotes": 3,
        "roubos": 2,
        "faltas": 1,
        "quarto": 1
    }
    
    create_response = client.post(
        "/api/estatisticas",
        json=estatistica_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    estatistica_id = create_response.json()["id"]
    
    # Atualiza a estatística
    update_data = {
        "pontos": 15,
        "assistencias": 7
    }
    
    response = client.put(
        f"/api/estatisticas/{estatistica_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["pontos"] == update_data["pontos"]
    assert data["assistencias"] == update_data["assistencias"]

def test_delete_estatistica(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria um jogo
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    game_response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    game_id = game_response.json()["id"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    player_response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    player_id = player_response.json()["id"]
    
    # Cria uma estatística
    estatistica_data = {
        "jogadora_id": player_id,
        "jogo_id": game_id,
        "pontos": 10,
        "assistencias": 5,
        "rebotes": 3,
        "roubos": 2,
        "faltas": 1,
        "quarto": 1
    }
    
    create_response = client.post(
        "/api/estatisticas",
        json=estatistica_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    estatistica_id = create_response.json()["id"]
    
    # Deleta a estatística
    response = client.delete(
        f"/api/estatisticas/{estatistica_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verifica se a estatística foi realmente deletada
    get_response = client.get(
        f"/api/estatisticas/jogo/{game_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    data = get_response.json()
    assert len(data) == 0 