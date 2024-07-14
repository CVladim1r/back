from fastapi import WebSocket
from uuid import uuid4
import random

games = {}

def find_or_create_room(sid, games):
    for game_id, game in games.items():
        if len(game['players']) < 2:
            join_game_with_id(sid, game_id, games)
            return game_id
    return create_room(sid, games)

def join_game_with_id(sid, game_id, games):
    game = games.get(game_id)
    if game and len(game['players']) < 2:
        game['players'].append({'sid': sid, 'id': str(uuid4()), 'hand': [], 'isDefender': False})
        if len(game['players']) == 2:
            start_game(game_id, games)

def start_game(game_id, games):
    if game_id in games:
        game = games[game_id]
        game['status'] = 'started'
        game['trumpCard'] = game['deck'].pop()
        for player in game['players']:
            player['hand'].extend([game['deck'].pop() for _ in range(6)])

def create_room(sid, games):
    game_id = str(uuid4())
    games[game_id] = {
        'players': [{'sid': sid, 'id': str(uuid4()), 'hand': [], 'isDefender': False}],
        'deck': shuffle_deck(create_deck()),
        'trumpCard': None,
        'table': [],
        'discardPile': [],
        'turn': 0,
        'gameId': game_id
    }
    return game_id

def shuffle_deck(deck):
    random.shuffle(deck)
    return deck

def create_deck():
    suits = ['hearts', 'diamonds', 'clubs', 'spades']
    ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    return [{'suit': suit, 'rank': rank} for suit in suits for rank in ranks]

async def send_game_state(websocket: WebSocket, game_id):
    game = games.get(game_id)
    if game:
        await websocket.send_json({'type': 'gameState', 'game': game})

async def handle_client_message(websocket: WebSocket, sid, data):
    if data['type'] == 'joinGame':
        game_id = data.get('gameId')
        if not game_id:
            game_id = find_or_create_room(sid, games)
        else:
            join_game_with_id(sid, game_id, games)
        await send_game_state(websocket, game_id)
    elif data['type'] == 'playCard':
        await play_card(websocket, sid, data)
    elif data['type'] == 'takeCards':
        await take_cards(websocket, sid)
    elif data['type'] == 'getHand':
        await get_hand(websocket, sid)
    else:
        await emit_error(websocket, sid, 'Invalid message type')

async def emit_error(websocket: WebSocket, sid, message):
    await websocket.send_json({'type': 'error', 'message': message})

async def play_card(websocket: WebSocket, sid: str, data: dict):
    game_id = find_game_by_player(sid, games)
    if not game_id:
        await emit_error(websocket, sid, 'You are not in a game')
        return

    game = games[game_id]
    player = next((p for p in game['players'] if p['sid'] == sid), None)
    if not player:
        await emit_error(websocket, sid, 'Player not found')
        return

    if game['turn'] != game['players'].index(player):
        await emit_error(websocket, sid, 'Not your turn')
        return

    card_index = next((i for i, card in enumerate(player['hand']) if card['rank'] == data['card']['rank'] and card['suit'] == data['card']['suit']), None)
    if card_index is not None:
        card = player['hand'].pop(card_index)
        if is_valid_move(game, card):
            game['table'].append(card)
            if game['players'][game['turn']]['isDefender']:
                game['turn'] = (game['turn'] + 1) % len(game['players'])
            await next_turn(websocket, game_id)
        else:
            player['hand'].append(card)
            await emit_error(websocket, sid, 'Invalid move')

    await send_game_state(websocket, game_id)

def is_valid_move(game, card):
    if len(game['table']) == 0:
        return True

    last_card = game['table'][-1]
    if last_card['suit'] == card['suit']:
        return get_card_value(card['rank']) > get_card_value(last_card['rank'])
    return card['suit'] == game['trumpCard']['suit'] and last_card['suit'] != game['trumpCard']['suit']

async def take_cards(websocket: WebSocket, sid):
    game_id = find_game_by_player(sid, games)
    if not game_id:
        await emit_error(websocket, sid, 'You are not in a game')
        return

    game = games[game_id]
    player = next((p for p in game['players'] if p['sid'] == sid), None)
    if not player:
        await emit_error(websocket, sid, 'Player not found')
        return

    if game['turn'] != game['players'].index(player):
        await emit_error(websocket, sid, 'Not your turn')
        return

    player['hand'].extend(game['table'])
    game['table'] = []
    await next_turn(websocket, game_id)

async def next_turn(websocket: WebSocket, game_id):
    game = games.get(game_id)
    if not game:
        return

    if len(game['table']) == 0:
        game['turn'] = (game['turn'] + 1) % len(game['players'])
    else:
        defender = game['players'][game['turn']]
        if defender['isDefender']:
            if is_defense_successful(game['table'], game['trumpCard']):
                game['discardPile'].extend(game['table'])
                game['table'] = []
                defender['isDefender'] = False
                game['players'][(game['turn'] + 1) % len(game['players'])]['isDefender'] = True
            else:
                defender['hand'].extend(game['table'])
                game['table'] = []
        else:
            game['turn'] = (game['turn'] + 1) % len(game['players'])
            game['players'][game['turn']]['isDefender'] = True

    await websocket.send_json({
        'type': 'nextTurn',
        'turn': game['turn'],
        'playerId': game['players'][game['turn']]['id']
    })

def is_defense_successful(table, trump_card):
    defending_cards = [card for card in table if card['suit'] == trump_card['suit']]
    attacking_cards = [card for card in table if card['suit'] != trump_card['suit']]
    return len(defending_cards) >= len(attacking_cards)

async def get_hand(websocket: WebSocket, sid):
    game_id = find_game_by_player(sid, games)
    if not game_id:
        await emit_error(websocket, sid, 'You are not in a game')
        return

    game = games[game_id]
    player = next((p for p in game['players'] if p['sid'] == sid), None)
    if not player:
        await emit_error(websocket, sid, 'Player not found')
        return

    await websocket.send_json({'type': 'hand', 'hand': player['hand']})

def find_game_by_player(sid, games):
    for game_id, game in games.items():
        for player in game['players']:
            if player['sid'] == sid:
                return game_id
    return None

def get_card_value(rank):
    values = {'6': 1, '7': 2, '8': 3, '9': 4, '10': 5, 'J': 6, 'Q': 7, 'K': 8, 'A': 9}
    return values[rank]