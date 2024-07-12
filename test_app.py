import unittest
from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room
from dev import app, socketio, games, create_game, join_game, start_game, get_hand

class TestDurakGame(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.socketio_test_client = socketio.test_client(app)
        self.socketio_test_client.connect()
        
    def tearDown(self):
        self.socketio_test_client.disconnect()

    def test_create_game(self):
        self.socketio_test_client.emit('message', {'type': 'createGame'})
        received = self.socketio_test_client.get_received()
        self.assertEqual(received[0]['args'][0]['type'], 'gameCreated')
        game_id = received[0]['args'][0]['gameId']
        self.assertIn(game_id, games)
        self.assertEqual(len(games[game_id]['players']), 1)

    def test_join_game(self):
        self.socketio_test_client.emit('message', {'type': 'createGame'})
        received = self.socketio_test_client.get_received()
        game_id = received[0]['args'][0]['gameId']
        
        socketio_test_client2 = socketio.test_client(app)
        socketio_test_client2.connect()
        socketio_test_client2.emit('message', {'type': 'joinGame'})
        
        received2 = socketio_test_client2.get_received()
        self.assertEqual(received2[0]['args'][0]['type'], 'joinedGame')
        self.assertEqual(received2[0]['args'][0]['gameId'], game_id)
        self.assertEqual(len(games[game_id]['players']), 2)

        socketio_test_client2.disconnect()

    def test_get_hand(self):
        self.socketio_test_client.emit('message', {'type': 'createGame'})
        received = self.socketio_test_client.get_received()
        game_id = received[0]['args'][0]['gameId']
        
        socketio_test_client2 = socketio.test_client(app)
        socketio_test_client2.connect()
        socketio_test_client2.emit('message', {'type': 'joinGame'})
        
        self.socketio_test_client.emit('message', {'type': 'startGame'})
        
        self.socketio_test_client.emit('message', {'type': 'getHand'})
        received_hand = self.socketio_test_client.get_received()
        self.assertEqual(received_hand[0]['args'][0]['type'], 'hand')
        self.assertEqual(len(received_hand[0]['args'][0]['hand']), 6)

        socketio_test_client2.disconnect()

if __name__ == '__main__':
    unittest.main()
