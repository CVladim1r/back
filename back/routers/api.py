from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import json
import logging
from utils.gamelogic import rooms, create_room, add_player, start_game, handle_client_message, notify_players, get_rooms_status

router = APIRouter()

@router.get("/rooms", response_model=List[Dict[str, Any]])
async def list_rooms():
    """
    Возвращает список всех комнат с количеством игроков в каждой.
    """
    return get_rooms_status()