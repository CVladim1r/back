# ws.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from utils.game import rooms, Game, create_room, add_player, play_card, defend_move, check_win_condition, deal_cards, handle_client_message, notify_players
import json

router = APIRouter()

websockets = {}

@router.websocket("/{room_id}/{player_sid}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_sid: str):
    await websocket.accept()
    websockets[player_sid] = websocket
    try:
        await handle_connection(room_id, player_sid, websocket)
    except WebSocketDisconnect:
        await handle_disconnect(room_id, player_sid)

async def handle_connection(room_id: str, player_sid: str, websocket: WebSocket):
    if room_id not in rooms:
        create_room(room_id)

    player = add_player(room_id, player_sid)
    if not player:
        await websocket.close()
        return

    player.websocket = websocket

    if len(rooms[room_id].players) == 2:
        game_instance = Game()  # Create an instance of the Game class
        await game_instance.start_game(room_id)  # Call start_game() from the instance
        deal_cards(room_id)
        await notify_players(room_id)

    await notify_players(room_id)

    while True:
        data = await websocket.receive_text()
        message = json.loads(data)
        await handle_client_message(websocket, player_sid, message)

async def handle_disconnect(room_id: str, player_sid: str):
    if room_id in rooms:
        rooms[room_id].players = [player for player in rooms[room_id].players if player.sid != player_sid]
        if player_sid in websockets:
            del websockets[player_sid]
        winner_sid = await check_win_condition(room_id)
        if winner_sid:
            await notify_players(room_id, winner_sid=winner_sid)
