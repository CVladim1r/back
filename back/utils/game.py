# utils/game.py

import random
from typing import List, Dict, Any
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

class Card:
    def __init__(self, suit: str, rank: str):
        self.suit = suit
        self.rank = rank

    def dict(self):
        return {"suit": self.suit, "rank": self.rank}

class Player:
    def __init__(self, sid: str):
        self.sid = sid
        self.hand = []
        self.websocket = None


    def dict(self):
        return {"sid": self.sid, "hand": [card.dict() for card in self.hand]}

class Room:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.players: List[Player] = []
        self.deck: List[Card] = []
        self.trump_card: Card = None
        self.current_turn: str = None
        self.attacking_player: str = None
        self.defending_player: str = None
        self.active_cards: List[Card] = []

    def init_deck(self):
        suits = ["hearts", "diamonds", "clubs", "spades"]
        ranks = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        self.deck = [Card(suit, rank) for suit in suits for rank in ranks]
        random.shuffle(self.deck)

class Game:
    def __init__(self):
        self.players: List[Player] = []
        self.deck = []
        self.trump_card = None
        self.current_turn = None
        self.attacking_player = None
        self.defending_player = None
        self.active_cards = []
        self.winner = None

    async def notify_players(self, message: Dict[str, Any]):
        for player in self.players:
            if player.websocket:
                await player.websocket.send_json(message)

    async def start_game(self):
        await self.notify_players({"action": "starting", "timer": 3})
        
        self.deck = self.create_deck()
        random.shuffle(self.deck)
        self.trump_card = self.deck.pop()
        for player in self.players:
            player.hand = [self.deck.pop() for _ in range(6)]
        
        self.attacking_player = random.choice(self.players).sid
        self.defending_player = [p for p in self.players if p.sid != self.attacking_player][0].sid
        self.current_turn = self.attacking_player

        await self.notify_players(self.get_game_state())

    def create_deck(self):
        suits = ["hearts", "diamonds", "clubs", "spades"]
        ranks = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        return [{"suit": suit, "rank": rank} for suit in suits for rank in ranks]

    def get_game_state(self):
        return {
            "players": [{"sid": player.sid, "hand": player.hand} for player in self.players],
            "trump_card": self.trump_card,
            "current_turn": self.current_turn,
            "attacking_player": self.attacking_player,
            "defending_player": self.defending_player,
            "active_cards": self.active_cards,
            "winner": self.winner
        }


rooms: Dict[str, Room] = {}

def create_room(room_id: str):
    room = Room(room_id)
    room.init_deck()
    rooms[room_id] = room

def add_player(room_id: str, player_sid: str) -> Player:
    if room_id not in rooms:
        return None
    room = rooms[room_id]
    player = Player(player_sid)
    room.players.append(player)
    return player

def start_game(room_id: str):
    room = rooms[room_id]
    room.trump_card = room.deck.pop()
    room.deck.insert(0, room.trump_card)  # Ensure the trump card is the last in the deck

def deal_cards(room_id: str):
    room = rooms[room_id]
    for player in room.players:
        while len(player.hand) < 6 and room.deck:
            player.hand.append(room.deck.pop())

def play_card(room_id: str, player_sid: str, card_index: int) -> bool:
    # Implement play card logic
    return True

def defend_move(room_id: str, player_sid: str, card_index: int) -> bool:
    # Implement defend move logic
    return True

def check_win_condition(room_id: str) -> str:
    # Implement win condition check logic
    return ""

# Functions to handle client messages and notify players
async def handle_client_message(websocket: WebSocket, player_sid: str, data: Dict[str, Any]):
    pass

async def notify_players(room_id: str):
    game = rooms[room_id]
    await game.notify_players(game.get_game_state())