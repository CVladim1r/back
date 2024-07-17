from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status
from utils.gamelogic import rooms, confirm_start_game, create_room, add_player, start_game, handle_client_message, notify_players
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/{room_id}/{player_sid}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_sid: str):
    await websocket.accept()
    try:
        if room_id not in rooms:
            create_room(room_id)
            logger.info(f"Room {room_id} created")

        player = add_player(room_id, player_sid)
        if not player:
            existing_player = next((p for p in rooms[room_id].players if p.sid == player_sid), None)
            if existing_player:
                logger.info(f"Player {player_sid} reconnected to room {room_id}")
                existing_player.websocket = websocket
            else:
                logger.warning(f"Failed to add player {player_sid} to room {room_id}")
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        else:
            player.websocket = websocket
            logger.info(f"Player {player_sid} added to room {room_id}")

        if len(rooms[room_id].players) == 2:
            await confirm_start_game(room_id)
            logger.info(f"Game started in room {room_id}")

        await notify_players(room_id)
        logger.info(f"Players notified in room {room_id}")

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_client_message(websocket, player_sid, message)

    except WebSocketDisconnect:
        logger.info(f"Player {player_sid} disconnected from room {room_id}")
        await handle_disconnect(room_id, player_sid)
    except HTTPException as http_exc:
        logger.error(f"HTTP Exception in WebSocket handling for player {player_sid} in room {room_id}: {http_exc.detail}")
        await handle_disconnect(room_id, player_sid)
    except Exception as e:
        logger.error(f"Error in WebSocket handling for player {player_sid} in room {room_id}: {str(e)}")
        await handle_disconnect(room_id, player_sid)
        raise

async def handle_disconnect(room_id: str, player_sid: str):
    if room_id in rooms:
        room = rooms[room_id]
        player = next((p for p in room.players if p.sid == player_sid), None)
        if player:
            player.websocket = None
            logger.info(f"Player {player_sid} disconnected from room {room_id} but will remain in the room for reconnection")
        
        if not any(p.websocket for p in room.players):
            del rooms[room_id]
            logger.info(f"Room {room_id} deleted because it is empty")
        else:
            await notify_players(room_id)
            logger.info(f"Players notified in room {room_id} after disconnection of player {player_sid}")
