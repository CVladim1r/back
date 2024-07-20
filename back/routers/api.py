from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, HTTPException
from fastapi.responses import JSONResponse
from utils.gamelogic import rooms, create_room, add_player, start_game, notify_players, get_rooms_status

router = APIRouter()

@router.get("/rooms", response_model=List[Dict[str, Any]])
async def list_rooms():
    """
    Возвращает список всех комнат с количеством игроков в каждой.
    """
    return JSONResponse(content=get_rooms_status())

@router.post("/create_room/{room_id}", status_code=201)
async def create_new_room(room_id: str):
    if room_id in rooms:
        raise HTTPException(status_code=400, detail="Room already exists")
    create_room(room_id)
    return {"message": f"Room {room_id} created successfully"}

@router.post("/room/{room_id}/add_player", status_code=201)
async def add_new_player(room_id: str, player_sid: str, player_name: str, websocket: WebSocket):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    player = add_player(room_id, player_sid, player_name, websocket)
    if not player:
        raise HTTPException(status_code=400, detail="Player could not be added")
    await notify_players(room_id)
    return {"message": f"Player {player_name} added to room {room_id}"}

@router.post("/room/{room_id}/start_game", status_code=200)
async def start_game_manually(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    room = rooms[room_id]
    if len(room.players) < 2:
        raise HTTPException(status_code=400, detail="Not enough players to start the game")
    await start_game(room_id)
    return {"message": "Game started"}

@router.get("/room/{room_id}/game_state", response_model=Dict[str, Any])
async def get_game_state(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    room = rooms[room_id]
    return JSONResponse(content=room.get_game_state())

@router.post("/room/{room_id}/end_game", status_code=200)
async def end_game_manually(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    room = rooms[room_id]
    room.winner = room.current_turn
    await room.notify_players({"message": "Game ended", "winner": room.winner})
    return {"message": "Game ended"}

@router.get("/room/{room_id}/players", response_model=List[Dict[str, Any]])
async def list_players(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    room = rooms[room_id]
    return JSONResponse(content=[player.dict() for player in room.players])

@router.delete("/room/{room_id}", status_code=200)
async def delete_room(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    del rooms[room_id]
    return {"message": f"Room {room_id} deleted"}