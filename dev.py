from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
import random
from uuid import uuid4

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

games = {}

@app.route('/')
def index():
    return "Server is running"

@socketio.on('connect')
def handle_connect():
    emit('message', {'type': 'connected', 'message': 'Welcome to Durak Online!'})

@socketio.on('message')
def handle_message(message):
    data = message
    handle_client_message(request.sid, data)

def handle_client_message(sid, data):
    if data['type'] == 'createGame':
        create_game(sid)
    elif data['type'] == 'joinGame':
        join_game(sid)
    elif data['type'] == 'startGame':
        start_game(find_game_by_player(sid))
    elif data['type'] == 'playCard':
        play_card(sid, data)
    elif data['type'] == 'takeCards':
        take_cards(sid)
    elif data['type'] == 'getHand':
        get_hand(sid)
    else:
        emit_error(sid, 'Invalid message type')

def find_game_by_player(sid):
    for game_id, game in games.items():
        for player in game['players']:
            if player['sid'] == sid:
                return game_id
    return None

def emit_error(sid, message):
    emit('message', {'type': 'error', 'message': message}, room=sid)

def create_game(sid):
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
    emit('message', {'type': 'gameCreated', 'gameId': game_id}, room=sid)

def join_game(sid):
    for game in games.values():
        if len(game['players']) < 2:
            game['players'].append({'sid': sid, 'id': str(uuid4()), 'hand': [], 'isDefender': False})
            emit('message', {'type': 'joinedGame', 'gameId': game['gameId']}, room=sid)
            if len(game['players']) == 2:
                start_game(game['gameId'])
            return

    create_game(sid)

def start_game(game_id):
    game = games.get(game_id)
    if not game:
        return

    for player in game['players']:
        player['hand'] = game['deck'][:6]
        game['deck'] = game['deck'][6:]

    game['trumpCard'] = game['deck'].pop()
    game['players'][0]['isDefender'] = True

    emit('message', {
        'type': 'gameStarted',
        'players': [{'id': p['id'], 'hand': p['hand']} for p in game['players']],
        'trumpCard': game['trumpCard']
    }, room=game_id)

    next_turn(game_id)

def play_card(sid, data):
    game_id = find_game_by_player(sid)
    if not game_id:
        emit_error(sid, 'You are not in a game')
        return

    game = games[game_id]
    player = next((p for p in game['players'] if p['sid'] == sid), None)
    if not player:
        emit_error(sid, 'Player not found')
        return

    if game['turn'] != game['players'].index(player):
        emit_error(sid, 'Not your turn')
        return

    card_index = next((i for i, card in enumerate(player['hand']) if card['rank'] == data['card']['rank'] and card['suit'] == data['card']['suit']), None)
    if card_index is not None:
        card = player['hand'].pop(card_index)
        if is_valid_move(game, card):
            game['table'].append(card)
            emit('message', {'type': 'cardPlayed', 'card': card, 'playerId': player['id']}, room=game_id)
            if game['players'][game['turn']]['isDefender']:
                game['turn'] = (game['turn'] + 1) % len(game['players'])
            next_turn(game_id)
        else:
            player['hand'].append(card)
            emit_error(sid, 'Invalid move')

def is_valid_move(game, card):
    if len(game['table']) == 0:
        return True

    last_card = game['table'][-1]
    if last_card['suit'] == card['suit']:
        return get_card_value(card['rank']) > get_card_value(last_card['rank'])
    return card['suit'] == game['trumpCard']['suit'] and last_card['suit'] != game['trumpCard']['suit']

def take_cards(sid):
    game_id = find_game_by_player(sid)
    if not game_id:
        emit_error(sid, 'You are not in a game')
        return

    game = games[game_id]
    player = next((p for p in game['players'] if p['sid'] == sid), None)
    if not player:
        emit_error(sid, 'Player not found')
        return

    if game['turn'] != game['players'].index(player):
        emit_error(sid, 'Not your turn')
        return

    player['hand'].extend(game['table'])
    game['table'] = []
    emit('message', {'type': 'cardsTaken', 'playerId': player['id']}, room=game_id)
    next_turn(game_id)

def next_turn(game_id):
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

    refill_hands(game)
    emit('message', {'type': 'turn', 'playerId': game['players'][game['turn']]['id']}, room=game_id)
    check_game_end(game)

def is_defense_successful(table, trump_card):
    return len(table) % 2 == 0

def refill_hands(game):
    for player in game['players']:
        while len(player['hand']) < 6 and game['deck']:
            player['hand'].append(game['deck'].pop())

def check_game_end(game):
    remaining_players = [player for player in game['players'] if player['hand']]
    if len(remaining_players) <= 1:
        emit('message', {'type': 'gameEnd', 'winner': remaining_players[0]['id'] if remaining_players else None}, room=game['gameId'])

def get_hand(sid):
    game_id = find_game_by_player(sid)
    if not game_id:
        emit_error(sid, 'You are not in a game')
        return

    game = games[game_id]
    player = next((p for p in game['players'] if p['sid'] == sid), None)
    if not player:
        emit_error(sid, 'Player not found')
        return

    emit('message', {'type': 'hand', 'hand': player['hand']}, room=sid)

def create_deck():
    suits = ['hearts', 'diamonds', 'clubs', 'spades']
    ranks = [6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A']
    deck = [{'suit': suit, 'rank': rank} for suit in suits for rank in ranks]
    return deck

def shuffle_deck(deck):
    random.shuffle(deck)
    return deck

def get_card_value(rank):
    if rank == 'J':
        return 11
    elif rank == 'Q':
        return 12
    elif rank == 'K':
        return 13
    elif rank == 'A':
        return 14
    else:
        return rank

if __name__ == '__main__':
    socketio.run(app, port=8080, debug=True)
