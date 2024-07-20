import os
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(autouse=True)
def setup_testing_environment():
    os.environ['TESTING'] = 'true'

client = TestClient(app)

def test_create_room():
    response = client.post("/rooms", json={"room_id": "test_room"})
    assert response.status_code == 200
    assert response.json() == {"message": "Room created", "room_id": "test_room"}

def test_add_player():
    response = client.post(
        "/rooms/test_room/players",
        json={"player_sid": "player1", "player_name": "Alice"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Player added", "player_sid": "player1"}

def test_get_players():
    response = client.get("/rooms/test_room/players")
    assert response.status_code == 200
    assert response.json() == {"players": [{"sid": "player1", "name": "Alice"}]}

def test_start_game():
    client.post("/rooms/test_room/players", json={"player_sid": "player1", "player_name": "Alice"})
    client.post("/rooms/test_room/players", json={"player_sid": "player2", "player_name": "Bob"})
    response = client.post("/rooms/test_room/start")
    assert response.status_code == 200
    assert response.json() == {"message": "Game started"}

def test_get_game_state():
    response = client.get("/rooms/test_room/state")
    assert response.status_code == 200
    assert "game_state" in response.json()

def test_delete_room():
    response = client.delete("/rooms/test_room")
    assert response.status_code == 200
    assert response.json() == {"message": "Room deleted"}
