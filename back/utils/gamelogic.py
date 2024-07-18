import random
from typing import List, Dict, Any
import asyncio
from fastapi import WebSocket

class Card:
    def __init__(self, suit: str, rank: str):
        self.suit = suit
        self.rank = rank

    def dict(self):
        return {"suit": self.suit, "rank": self.rank}

    def __repr__(self):
        return f"{self.rank} of {self.suit}"

    def can_beat(self, other_card, trump_suit):
        if self.suit == other_card.suit and self.rank > other_card.rank:
            return True
        if self.suit == trump_suit and other_card.suit != trump_suit:
            return True
        return False

class Player:
    def __init__(self, sid: str, name: str, websocket: WebSocket):
        self.sid = sid
        self.name = name
        self.hand: List[Card] = []
        self.websocket: WebSocket = websocket
        self.ready: bool = False

    def dict(self):
        return {
            "sid": self.sid,
            "name": self.name,
            "hand": [card.dict() for card in self.hand],
            "ready": self.ready
        }
        
    def __repr__(self):
        return f"Player {self.name} ({self.sid}) with hand {self.hand}"

class Room:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.players: List[Player] = []
        self.deck: List[Card] = []
        self.trump_card: Card = None
        self.current_turn: str = None
        self.attacking_player: str = None
        self.defending_player: str = None
        self.active_cards: List[Dict[str, Any]] = []
        self.deck_cards: List[Card] = []
        self.beaten_cards: List[Card] = []
        self.winner: str = None
        self.defense_successful: bool = True

    def initialize_deck(self, shuffle: bool = True):
        suits = ["hearts", "diamonds", "clubs", "spades"]
        ranks = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        self.deck = [Card(suit, rank) for suit in suits for rank in ranks]
        if shuffle:
            random.shuffle(self.deck)
        self.deck_cards = list(self.deck)

    def get_game_state(self):
        return {
            "players": [player.dict() for player in self.players],
            "trump_card": self.trump_card.dict() if self.trump_card else None,
            "current_turn": self.current_turn,
            "attacking_player": self.attacking_player,
            "defending_player": self.defending_player,
            "active_cards": [{"card": card["card"].dict(), "player_sid": card["player_sid"]} for card in self.active_cards],
            "deck_cards": [card.dict() for card in self.deck_cards],
            "beaten_cards": [card.dict() for card in self.beaten_cards],
            "winner": self.winner
        }

    async def notify_players(self, message: Dict[str, Any]):
        for player in self.players:
            await player.websocket.send_json(message)

    async def start_game(self):
        self.initialize_deck()
        self.trump_card = self.deck.pop()
        for player in self.players:
            player.hand = [self.deck.pop() for _ in range(6)]

        if len(self.players) < 2:
            raise ValueError("Not enough players to start the game.")

        self.attacking_player = random.choice(self.players).sid
        defending_players = [p.sid for p in self.players if p.sid != self.attacking_player]
        if not defending_players:
            raise ValueError(f"Cannot find defending player for {self.attacking_player}")

        self.defending_player = defending_players[0]
        self.current_turn = self.attacking_player

        await self.notify_players(self.get_game_state())

    def deal_cards(self):
        for player in self.players:
            while len(player.hand) < 6 and self.deck:
                player.hand.append(self.deck.pop())

    def play_card(self, player_sid: str, card_index: int) -> bool:
        player = next((p for p in self.players if p.sid == player_sid), None)
        if player and 0 <= card_index < len(player.hand):
            card = player.hand.pop(card_index)
            if self.current_turn == self.attacking_player:
                self.active_cards.append({"card": card, "player_sid": player_sid})
                self.current_turn = self.defending_player
            elif self.current_turn == self.defending_player:
                attack_card = self.active_cards[-1]["card"]
                if card.can_beat(attack_card, self.trump_card.suit):
                    self.active_cards.append({"card": card, "player_sid": player_sid})
                    self.current_turn = self.attacking_player
                    self.defense_successful = True
                else:
                    player.hand.append(card)
                    return False
            asyncio.create_task(self.notify_players(self.get_game_state()))
            return True
        return False

    def defend_move(self, player_sid: str, card_index: int) -> bool:
        return self.play_card(player_sid, card_index)

    def check_win_condition(self) -> str:
        if all(len(p.hand) == 0 for p in self.players) and not self.deck:
            self.winner = self.current_turn
            asyncio.create_task(self.notify_players(self.get_game_state()))
            return self.winner
        return ""

    def end_turn(self):
        if self.defense_successful:
            self.beaten_cards.extend([card["card"] for card in self.active_cards])
        else:
            defending_player = next(p for p in self.players if p.sid == self.defending_player)
            defending_player.hand.extend([card["card"] for card in self.active_cards])

        self.active_cards = []
        self.deal_cards()

        if self.check_win_condition():
            return

        if self.defense_successful:
            self.current_turn = self.attacking_player
            self.attacking_player, self.defending_player = self.defending_player, self.attacking_player
        else:
            self.current_turn = self.attacking_player
            self.defending_player = self.attacking_player
        self.defense_successful = True

        asyncio.create_task(self.notify_players(self.get_game_state()))



rooms: Dict[str, Room] = {}

def create_room(room_id: str):
    if room_id not in rooms:
        room = Room(room_id)
        room.initialize_deck()
        rooms[room_id] = room

def add_player(room_id: str, player_sid: str, player_name: str, websocket: WebSocket) -> Player:
    if room_id not in rooms:
        return None
    room = rooms[room_id]
    player = Player(player_sid, player_name, websocket)
    room.players.append(player)
    return player

async def confirm_start_game(room_id: str):
    room = rooms[room_id]
    for player in room.players:
        player.ready = False
    await room.notify_players({"action": "confirm_start"})

async def start_game(room_id: str):
    room = rooms[room_id]
    if len(room.players) != 2:
        raise ValueError("Cannot start game: Not enough players")
    room.trump_card = room.deck.pop()
    room.deck.insert(0, room.trump_card)
    room.attacking_player = random.choice(room.players).sid
    defending_players = [p.sid for p in room.players if p.sid != room.attacking_player]
    if defending_players:
        room.defending_player = defending_players[0]
    else:
        raise ValueError("Cannot find defending player")
    asyncio.create_task(room.start_game())

async def handle_client_message(websocket: WebSocket, player_sid: str, data: Dict[str, Any]):
    room_id = data.get("room_id")
    action = data.get("action")
    if room_id not in rooms:
        return

    room = rooms[room_id]
    if action == "play_card":
        card_index = data.get("card_index")
        if room.play_card(player_sid, card_index):
            room.end_turn()
    elif action == "defend_move":
        card_index = data.get("card_index")
        if room.defend_move(player_sid, card_index):
            room.end_turn()
    elif action == "deal_cards":
        room.deal_cards()
    elif action == "check_win_condition":
        room.check_win_condition()
    elif action == "confirm_start":
        player = next(p for p in room.players if p.sid == player_sid)
        if player:
            player.ready = True
            if all(p.ready for p in room.players):
                await start_game(room_id)
    await room.notify_players(room.get_game_state())



async def notify_players(room_id: str):
    if room_id in rooms:
        room = rooms[room_id]
        await room.notify_players(room.get_game_state())
