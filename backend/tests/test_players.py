import pytest
from fastapi import status

def test_create_player(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["nome"] == player_data["nome"]
    assert data["numero"] == player_data["numero"]
    assert data["posicao"] == player_data["posicao"]
    assert "id" in data

def test_create_player_duplicate_number(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    # Primeira criação
    client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Tenta criar outra jogadora com o mesmo número
    response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "número já está em uso" in response.json()["detail"].lower()

def test_list_players(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Lista jogadoras
    response = client.get(
        "/api/players",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)

def test_get_player(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    create_response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    player_id = create_response.json()["id"]
    
    # Busca a jogadora
    response = client.get(
        f"/api/players/{player_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["nome"] == player_data["nome"]
    assert data["numero"] == player_data["numero"]
    assert data["posicao"] == player_data["posicao"]

def test_update_player(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    create_response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    player_id = create_response.json()["id"]
    
    # Atualiza a jogadora
    update_data = {
        "nome": "Jogadora Atualizada",
        "numero": 11,
        "posicao": "Pivô"
    }
    
    response = client.put(
        f"/api/players/{player_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["nome"] == update_data["nome"]
    assert data["numero"] == update_data["numero"]
    assert data["posicao"] == update_data["posicao"]

def test_delete_player(client, test_user):
    # Primeiro faz login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Cria uma jogadora
    player_data = {
        "nome": "Jogadora Teste",
        "numero": 10,
        "posicao": "Ala"
    }
    
    create_response = client.post(
        "/api/players",
        json=player_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    player_id = create_response.json()["id"]
    
    # Deleta a jogadora
    response = client.delete(
        f"/api/players/{player_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verifica se a jogadora foi realmente deletada
    get_response = client.get(
        f"/api/players/{player_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert get_response.status_code == status.HTTP_404_NOT_FOUND 