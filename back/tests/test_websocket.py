import pytest
import websockets
import asyncio
import json

async def websocket_test_client(uri: str, data: dict):
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps(data))
        response = await websocket.recv()
        return json.loads(response)

@pytest.mark.asyncio
async def test_websocket_connection():
    uri = "ws://localhost:8000/ws/room/test_room?player_id=player1"
    data = {"action": "play_card", "card_index": 0}

    response = await websocket_test_client(uri, data)
    assert response["action"] == "game_state"
    assert "players" in response

@pytest.mark.asyncio
async def test_websocket_message_handling():
    uri = "ws://localhost:8000/ws/room/test_room?player_id=player1"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({"action": "play_card", "card_index": 0}))
        response = await websocket.recv()
        message = json.loads(response)
        assert message["action"] == "game_state"
