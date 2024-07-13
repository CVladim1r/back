from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import random
from uuid import uuid4
import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

games = {}

@app.route('/')
def index():
    return "Server is running"

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "Hello from backend"}
    return jsonify(data)

@app.route('/api/data', methods=['POST'])
def post_data():
    received_data = request.json
    response = {"received": received_data}
    return jsonify(response), 201

@app.route('/api/find_room', methods=['GET'])
def find_room():
    sid = request.args.get('sid')
    room_id = find_or_create_room(sid)
    if room_id:
        socketio.emit('message', {'type': 'gameCreated', 'gameId': room_id}, room=sid)
        return jsonify({"roomId": room_id})
    return jsonify({"error": "Could not find or create a room"}), 500

@socketio.on('connect')
def handle_connect():
    emit('message', {'type': 'connected', 'message': 'Welcome to Durak Online!'})

@socketio.on('message')
def handle_message(message):
    data = message
    handle_client_message(request.sid, data)

@socketio.on('inviteFriend')
def on_invite_friend(data):
    game_id = data.get('gameId')
    friend_sid = data.get('friendSid')
    invite_friend(game_id, friend_sid)

def handle_client_message(sid, data):
    message_handlers = {
        'createGame': create_room,
        'joinGame': join_game,
        'startGame': lambda sid: start_game(find_game_by_player(sid)),
        'playCard': play_card,
        'takeCards': take_cards,
        'getHand': get_hand
    }
    
    handler = message_handlers.get(data['type'])
    if handler:
        if data['type'] == 'playCard':
            handler(sid, data)
        else:
            handler(sid)
    else:
        emit_error(sid, 'Invalid message type')


def find_or_create_room(sid):
    for game_id, game in games.items():
        if len(game['players']) < 2:
            join_game_with_id(sid, game_id)
            return game_id
    return create_room(sid)

def find_game_by_player(sid):
    for game_id, game in games.items():
        for player in game['players']:
            if player['sid'] == sid:
                return game_id
    return None

def emit_error(sid, message):
    emit('message', {'type': 'error', 'message': message}, room=sid)

def create_room(sid):
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
    return game_id


def invite_friend(game_id, friend_sid):
    game = games.get(game_id)
    if not game:
        emit_error(friend_sid, 'Game not found')
        return
    if len(game['players']) >= 2:
        emit_error(friend_sid, 'Game is full')
        return

    game['players'].append({'sid': friend_sid, 'id': str(uuid4()), 'hand': [], 'isDefender': False})
    emit('message', {'type': 'invited', 'gameId': game_id}, room=friend_sid)
    if len(game['players']) == 2:
        start_game_with_delay(game_id)

def start_game_with_delay(game_id):
    game = games.get(game_id)
    if not game:
        return

    emit('message', {'type': 'gameStarting', 'delay': 5}, room=game_id)
    threading.Timer(5.0, start_game, args=[game_id]).start()

def start_game(game_id):
    game = games.get(game_id)
    if not game:
        return

    for player in game['players']:
        player['hand'] = game['deck'][:6]
        game['deck'] = game['deck'][6:]

    game['trumpCard'] = game['deck'].pop()
    game['deck'].append(game['trumpCard'])  # Trump card goes to the bottom of the deck
    game['players'][0]['isDefender'] = True

    emit('message', {
        'type': 'gameStarted',
        'players': [{'id': p['id'], 'hand': p['hand']} for p in game['players']],
        'trumpCard': game['trumpCard']
    }, room=game_id)

    next_turn(game_id)

def join_game(sid):
    for game in games.values():
        if len(game['players']) < 2:
            game['players'].append({'sid': sid, 'id': str(uuid4()), 'hand': [], 'isDefender': False})
            emit('message', {'type': 'joinedGame', 'gameId': game['gameId']}, room=sid)
            if len(game['players']) == 2:
                start_game_with_delay(game['gameId'])
            return
    create_room(sid)

def join_game_with_id(sid, game_id):
    game = games.get(game_id)
    if game and len(game['players']) < 2:
        game['players'].append({'sid': sid, 'id': str(uuid4()), 'hand': [], 'isDefender': False})
        socketio.emit('message', {'type': 'joinedGame', 'gameId': game['gameId']}, room=sid)
        if len(game['players']) == 2:
            start_game_with_delay(game_id)

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
            game['players'][game['turn']]['isDefender'] = True

    emit('message', {'type': 'nextTurn', 'turn': game['turn'], 'playerId': game['players'][game['turn']]['id']}, room=game_id)

def is_defense_successful(table, trump_card):
    defending_cards = [card for card in table if card['suit'] == trump_card['suit']]
    attacking_cards = [card for card in table if card['suit'] != trump_card['suit']]
    return len(defending_cards) >= len(attacking_cards)

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
    ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    return [{'suit': suit, 'rank': rank} for suit in suits for rank in ranks]

def shuffle_deck(deck):
    random.shuffle(deck)
    return deck

def get_card_value(rank):
    values = {'6': 1, '7': 2, '8': 3, '9': 4, '10': 5, 'J': 6, 'Q': 7, 'K': 8, 'A': 9}
    return values[rank]

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
