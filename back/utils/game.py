# utils/game.py

import random
from typing import List, Dict, Any

class Card:
    def __init__(self, suit: str, rank: str):
        self.suit = suit
        self.rank = rank

    def dict(self):
        return {"suit": self.suit, "rank": self.rank}

class Player:
    def __init__(self, sid: str, websocket=None):
        self.sid = sid
        self.hand = []
        self.websocket = websocket

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

rooms: Dict[str, Room] = {}

def create_room(room_id: str):
    room = Room(room_id)
    room.init_deck()
    rooms[room_id] = room

def add_player(room_id: str, player_sid: str, websocket) -> Player:
    if room_id not in rooms:
        return None
    room = rooms[room_id]
    player = Player(player_sid, websocket)
    room.players.append(player)
    return player

def start_game(room_id: str):
    room = rooms[room_id]
    if len(room.players) != 2:
        return False
    room.trump_card = room.deck.pop()
    room.deck.insert(0, room.trump_card)
    room.current_turn = room.players[0].sid
    room.attacking_player = room.players[0].sid
    room.defending_player = room.players[1].sid
    deal_cards(room_id)
    return True

def deal_cards(room_id: str):
    room = rooms[room_id]
    for player in room.players:
        while len(player.hand) < 6 and room.deck:
            player.hand.append(room.deck.pop())

def play_card(room_id: str, player_sid: str, card_index: int) -> bool:
    room = rooms[room_id]
    player = next(p for p in room.players if p.sid == player_sid)
    if room.current_turn != player_sid or card_index >= len(player.hand):
        return False
    card = player.hand.pop(card_index)
    room.active_cards.append(card)
    room.current_turn = room.defending_player if room.current_turn == room.attacking_player else room.attacking_player
    return True

def defend_move(room_id: str, player_sid: str, card_index: int) -> bool:
    room = rooms[room_id]
    player = next(p for p in room.players if p.sid == player_sid)
    if room.current_turn != player_sid or card_index >= len(player.hand):
        return False
    card = player.hand.pop(card_index)
    if card.suit != room.active_cards[-1].suit and card.suit != room.trump_card.suit:
        return False
    if card.rank <= room.active_cards[-1].rank:
        return False
    room.active_cards.append(card)
    room.current_turn = room.attacking_player
    return True

def check_win_condition(room_id: str) -> str:
    room = rooms[room_id]
    for player in room.players:
        if len(player.hand) == 0:
            return player.sid
    return ""

async def notify_players(room_id: str):
    if room_id in rooms:
        game_state = {
            'players': [player.dict() for player in rooms[room_id].players],
            'trump_card': rooms[room_id].trump_card.dict() if rooms[room_id].trump_card else None,
            'current_turn': rooms[room_id].current_turn,
            'attacking_player': rooms[room_id].attacking_player,
            'defending_player': rooms[room_id].defending_player,
            'active_cards': [card.dict() for card in rooms[room_id].active_cards]
        }
        for player in rooms[room_id].players:
            await player.websocket.send_json(game_state)
