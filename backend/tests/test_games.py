import pytest
from fastapi import status
from datetime import datetime, timedelta

def test_create_game(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria um novo jogo
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal",
        "status": "pendente"
    }
    
    response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["opponent"] == game_data["opponent"]
    assert data["location"] == game_data["location"]
    assert data["status"] == game_data["status"]
    assert "id" in data

def test_create_game_past_date(client, test_user):
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() - timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_list_games(client, test_user):
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/api/games",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)

def test_get_game(client, test_user):
    # Primeiro cria um jogo
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    create_response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    game_id = create_response.json()["id"]
    
    # Agora busca o jogo
    response = client.get(
        f"/api/games/{game_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == game_id
    assert data["opponent"] == game_data["opponent"]

def test_update_game(client, test_user):
    # Primeiro cria um jogo
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    create_response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    game_id = create_response.json()["id"]
    
    # Atualiza o jogo
    update_data = {
        "opponent": "Novo Adversário",
        "status": "em_andamento"
    }
    
    response = client.put(
        f"/api/games/{game_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["opponent"] == update_data["opponent"]
    assert data["status"] == update_data["status"]

def test_delete_game(client, test_user):
    # Primeiro cria um jogo
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    game_data = {
        "opponent": "Time Adversário",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "location": "Ginásio Principal"
    }
    
    create_response = client.post(
        "/api/games",
        json=game_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    game_id = create_response.json()["id"]
    
    # Deleta o jogo
    response = client.delete(
        f"/api/games/{game_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verifica se o jogo foi realmente deletado
    get_response = client.get(
        f"/api/games/{game_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert get_response.status_code == status.HTTP_404_NOT_FOUND 