# utils/game.py

import random
from typing import List, Dict, Any
from fastapi import WebSocket

class Card:
    def __init__(self, suit: str, rank: str):
        self.suit = suit
        self.rank = rank

    def dict(self):
        return {"suit": self.suit, "rank": self.rank}

    def __str__(self):
        return f"{self.rank} of {self.suit}"

    def __repr__(self):
        return self.__str__()

class Player:
    def __init__(self, sid: str):
        self.sid = sid
        self.hand: List[Card] = []
        self.websocket: WebSocket = None

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
        self.game_state = None 

    def init_deck(self):
        suits = ["hearts", "diamonds", "clubs", "spades"]
        ranks = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        self.deck = [Card(suit, rank) for suit in suits for rank in ranks]
        random.shuffle(self.deck)
        
    def add_player(self, player_sid: str, player_name: str):
        if any(player.sid == player_sid for player in self.players):
            return None
        player = Player(player_sid, player_name)
        self.players.append(player)
        return player

    def draw_card(self):
        return self.deck.pop() if self.deck else None

    def is_defended(self):
        return len(self.active_cards) % 2 == 0
    
    def get_game_state(self):
        return self.game_state
    
    def update_game_state(self, new_state):
        self.game_state = new_state

    def deal_cards(self):
        for player in self.players:
            while len(player.hand) < 6 and self.deck:
                player.hand.append(self.draw_card())

class Game:
    def __init__(self):
        self.players: List[Player] = []
        self.deck: List[Card] = []
        self.trump_card: Card = None
        self.current_turn: str = None
        self.attacking_player: str = None
        self.defending_player: str = None
        self.active_cards: List[Card] = []
        self.winner: str = None
        self.game_state = None 

    async def notify_players(room_id: str, winner_sid: str = None):
        room = rooms.get(room_id)
        if room:
            game_state = room.get_game_state()
            if winner_sid:
                game_state['winner'] = winner_sid
            action = 'update' if winner_sid else 'notify'
            game_state['action'] = action
            
            for player in room.players:
                if player.websocket:
                    await player.websocket.send_json(game_state)


    async def start_game(self, room_id: str):
        room = rooms.get(room_id)
        if room and len(room.players) == 2:
            # Your game initialization logic here
            room.trump_card = room.deck.pop()
            room.current_turn = room.players[0].sid
            room.attacking_player = room.players[0].sid
            room.defending_player = room.players[1].sid
            # Assuming notify_players is a method of Game class
            await self.notify_players(room_id, {"action": "starting", "timer": 3})
            # Other game start logic
        else:
            raise ValueError("Room not found or insufficient players")
        
    def get_game_state(self, room_id: str):
        room = rooms.get(room_id)
        if not room:
            return {}

        return {
            "players": [{"sid": player.sid, "hand": [card.dict() for card in player.hand]} for player in room.players],
            "trump_card": self.trump_card.dict() if self.trump_card else None,
            "current_turn": self.current_turn,
            "attacking_player": self.attacking_player,
            "defending_player": self.defending_player,
            "active_cards": [card.dict() for card in self.active_cards],
            "winner": self.winner
        }
    async def notify_players(self, room_id: str, message: dict):
        # Implement your notification logic here
        # Example implementation:
        room = rooms.get(room_id)
        if room:
            for player in room.players:
                if player.websocket:
                    await player.websocket.send_json(message)
        else:
            raise ValueError(f"Room {room_id} not found")

# Assuming `rooms` is defined outside this module
rooms = {}

async def emit_error(websocket: WebSocket, sid: str, message: str):
    await websocket.send_json({'type': 'error', 'message': message})

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

def deal_cards(room_id: str):
    room = rooms.get(room_id)
    if room:
        room.deal_cards()

async def play_card(websocket: WebSocket, room_id: str, player_sid: str, card_index: int) -> bool:
    room = rooms.get(room_id)
    if not room:
        await emit_error(websocket, player_sid, 'You are not in a game')
        return False

    player = next((p for p in room.players if p.sid == player_sid), None)
    if not player:
        await emit_error(websocket, player_sid, 'Player not found')
        return False

    if room.current_turn != player_sid or card_index >= len(player.hand):
        await emit_error(websocket, player_sid, 'Invalid move')
        return False

    card = player.hand.pop(card_index)
    room.active_cards.append(card)
    room.current_turn = room.defending_player if room.current_turn == room.attacking_player else room.attacking_player
    return True

async def defend_move(room_id: str, player_sid: str, card_index: int) -> bool:
    room = rooms.get(room_id)
    if not room:
        return False

    if room.current_turn != player_sid:
        return False

    player = next((p for p in room.players if p.sid == player_sid), None)
    if not player or card_index >= len(player.hand):
        return False

    attack_card = room.active_cards[-1]
    defend_card = player.hand.pop(card_index)

    if (defend_card.suit == attack_card.suit and defend_card.rank > attack_card.rank) or \
       (defend_card.suit == room.trump_card.suit and attack_card.suit != room.trump_card.suit):
        room.active_cards.append(defend_card)
        room.current_turn = room.attacking_player
        return True
    else:
        player.hand.append(defend_card)
        return False

async def check_win_condition(room_id: str) -> str:
    room = rooms.get(room_id)
    if not room:
        return ""

    for player in room.players:
        if not player.hand and not room.deck:
            room.winner = player.sid
            return player.sid
    return ""

async def handle_client_message(websocket: WebSocket, player_sid: str, data: Dict[str, Any]):
    action = data.get('action')
    room_id = data.get('room_id')
    card_index = data.get('card_index')

    if action == 'play_card':
        await play_card(websocket, room_id, player_sid, card_index)
    elif action == 'defend_card':
        await defend_move(room_id, player_sid, card_index)
    
    winner_sid = await check_win_condition(room_id)
    if winner_sid:
        await notify_players(room_id, winner_sid=winner_sid)
    else:
        await notify_players(room_id)

async def notify_players(room_id: str, winner_sid: str = None):
    room = rooms.get(room_id)
    if room:
        game_state = room.get_game_state()
        if winner_sid:
            game_state['winner'] = winner_sid
        
        for player in room.players:
            if player.websocket:
                await player.websocket.send_json(game_state)
