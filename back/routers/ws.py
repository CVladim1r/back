# routers/ws.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from utils.game import rooms, create_room, add_player, start_game, play_card, defend_move, check_win_condition, deal_cards
import json

router = APIRouter()

websockets = {}

@router.websocket("/{room_id}/{player_sid}")

async def websocket_endpoint(websocket: WebSocket, room_id: str, player_sid: str):
    await websocket.accept()
    player = add_player(room_id, player_sid, websocket)
    
    if player and len(player.hand) == 0:
        start_game(room_id)
    
    await notify_players(room_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            action = message.get('action')

            if action == 'playCard':
                card_index = message.get('cardIndex')
                if play_card(room_id, player_sid, card_index):
                    await notify_players(room_id)

            elif action == 'defendMove':
                card_index = message.get('cardIndex')
                if defend_move(room_id, player_sid, card_index):
                    await notify_players(room_id)

            winner_sid = check_win_condition(room_id)
            if winner_sid:
                await websocket.send_json({"winner": winner_sid})
                break

    except WebSocketDisconnect:
        pass

async def handle_connection(room_id: str, player_sid: str, websocket: WebSocket):
    if room_id not in rooms:
        create_room(room_id)

    player = add_player(room_id, player_sid)
    if not player:
        await websocket.close()
        return

    if len(rooms[room_id].players) == 2:
        start_game(room_id)
        deal_cards(room_id)
        await notify_players(room_id)

    await notify_players(room_id)

    while True:
        data = await websocket.receive_text()
        message = json.loads(data)
        action = message.get('action')

        if action == 'play_card':
            card_index = message.get('card_index')
            if play_card(room_id, player_sid, card_index):
                await notify_players(room_id)
        elif action == 'defend_card':
            card_index = message.get('card_index')
            if defend_move(room_id, player_sid, card_index):
                await notify_players(room_id)

        winner_sid = check_win_condition(room_id)
        if winner_sid:
            await notify_players(room_id, winner_sid=winner_sid)
            break

async def handle_disconnect(room_id: str, player_sid: str):
    if room_id in rooms:
        rooms[room_id].players = [player for player in rooms[room_id].players if player.sid != player_sid]
        if player_sid in websockets:
            del websockets[player_sid]
        winner_sid = check_win_condition(room_id)
        if winner_sid:
            await notify_players(room_id, winner_sid=winner_sid)

async def notify_players(room_id: str, winner_sid: str = None):
    if room_id in rooms:
        game_state = {
            'players': [player.dict() for player in rooms[room_id].players],
            'trump_card': rooms[room_id].trump_card.dict() if rooms[room_id].trump_card else None,
            'current_turn': rooms[room_id].current_turn,
            'attacking_player': rooms[room_id].attacking_player,
            'defending_player': rooms[room_id].defending_player,
            'active_cards': [card.dict() for card in rooms[room_id].active_cards]
        }

        if winner_sid:
            game_state['winner'] = winner_sid

        for player in rooms[room_id].players:
            try:
                if player.sid in websockets:
                    await websockets[player.sid].send_json(game_state)
            except Exception as e:
                print(f"Error while sending data to player {player.sid}: {str(e)}")

async def send_game_state(player_sid: str, game_state: dict):
    if player_sid in websockets:
        try:
            await websockets[player_sid].send_json(game_state)
        except Exception as e:
            print(f"Error sending game state to player {player_sid}: {str(e)}")
