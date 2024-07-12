// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new Server(server);

const games = {}; // Хранение игровых сессий

app.use(cors());

wss.on('connection', function connection(ws) {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    handleClientMessage(ws, data);
  });

  ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to Durak Online!' }));
});

function handleClientMessage(ws, data) {
  switch (data.type) {
    case 'createGame':
      createGame(ws);
      break;
    case 'joinGame':
      joinGame(ws, data.gameId);
      break;
    case 'startGame':
      startGame(data.gameId);
      break;
    case 'playCard':
      playCard(ws, data);
      break;
    case 'takeCards':
      takeCards(ws, data.gameId);
      break;
    default:
      break;
  }
}

function createGame(ws) {
  const gameId = uuidv4();
  games[gameId] = {
    players: [{ ws, id: uuidv4(), hand: [], isDefender: false }],
    deck: shuffleDeck(createDeck()),
    trumpCard: null,
    table: [],
    discardPile: [],
    turn: 0,
    gameId
  };
  ws.send(JSON.stringify({ type: 'gameCreated', gameId }));
}

function joinGame(ws, gameId) {
  const game = games[gameId];
  if (!game || game.players.length >= 6) {
    return ws.send(JSON.stringify({ type: 'error', message: 'Game not found or full' }));
  }
  const player = { ws, id: uuidv4(), hand: [], isDefender: false };
  game.players.push(player);
  ws.send(JSON.stringify({ type: 'joinedGame', gameId }));
  if (game.players.length === 2) {
    startGame(gameId);
  }
}

function startGame(gameId) {
  const game = games[gameId];
  if (!game) return;

  game.players.forEach((player) => {
    player.hand = game.deck.splice(0, 6);
  });
  game.trumpCard = game.deck.pop();
  game.players[0].isDefender = true;
  broadcast(gameId, { type: 'gameStarted', players: game.players.map(p => ({ id: p.id, hand: p.hand })), trumpCard: game.trumpCard });
  nextTurn(gameId);
}

function playCard(ws, data) {
  const game = games[data.gameId];
  if (!game) {
    return ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
  }

  const player = game.players.find(p => p.ws === ws);
  if (!player) {
    return ws.send(JSON.stringify({ type: 'error', message: 'Player not found' }));
  }

  if (game.turn !== game.players.indexOf(player)) {
    return ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
  }

  const cardIndex = player.hand.findIndex(card => card.rank === data.card.rank && card.suit === data.card.suit);
  if (cardIndex !== -1) {
    const card = player.hand.splice(cardIndex, 1)[0];
    if (isValidMove(game, card)) {
      game.table.push(card);
      broadcast(data.gameId, { type: 'cardPlayed', card, playerId: player.id });
      if (game.players[game.turn].isDefender) {
        game.turn = (game.turn + 1) % game.players.length;
      }
      nextTurn(data.gameId);
    } else {
      player.hand.push(card);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
    }
  }
}

function isValidMove(game, card) {
  if (game.table.length === 0) {
    return true;
  }
  const lastCard = game.table[game.table.length - 1];
  if (lastCard.suit === card.suit) {
    return getCardValue(card.rank) > getCardValue(lastCard.rank);
  }
  return card.suit === game.trumpCard.suit && lastCard.suit !== game.trumpCard.suit;
}

function takeCards(ws, gameId) {
  const game = games[gameId];
  if (!game) {
    return ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
  }

  const player = game.players.find(p => p.ws === ws);
  if (!player) {
    return ws.send(JSON.stringify({ type: 'error', message: 'Player not found' }));
  }

  player.hand = player.hand.concat(game.table);
  game.table = [];
  broadcast(gameId, { type: 'cardsTaken', playerId: player.id });
  nextTurn(gameId);
}

function nextTurn(gameId) {
  const game = games[gameId];
  if (!game) return;

  if (game.table.length === 0) {
    game.turn = (game.turn + 1) % game.players.length;
  } else {
    const defender = game.players[game.turn];
    if (defender.isDefender) {
      if (isDefenseSuccessful(game.table, game.trumpCard)) {
        game.discardPile.push(...game.table);
        game.table = [];
        defender.isDefender = false;
        game.players[(game.turn + 1) % game.players.length].isDefender = true;
      } else {
        defender.hand.push(...game.table);
        game.table = [];
      }
    } else {
      game.turn = (game.turn + 1) % game.players.length;
    }
  }
  refillHands(game);
  broadcast(gameId, { type: 'turn', playerId: game.players[game.turn].id });
  checkGameEnd(game);
}

function isDefenseSuccessful(table, trumpCard) {
  return table.length % 2 === 0;
}

function refillHands(game) {
  game.players.forEach(player => {
    while (player.hand.length < 6 && game.deck.length > 0) {
      player.hand.push(game.deck.pop());
    }
  });
}

function checkGameEnd(game) {
  const remainingPlayers = game.players.filter(player => player.hand.length > 0);
  if (remainingPlayers.length <= 1) {
    broadcast(game.gameId, { type: 'gameEnd', winner: remainingPlayers[0]?.id || null });
  }
}

function broadcast(gameId, data) {
  const game = games[gameId];
  if (!game) return;

  game.players.forEach(player => {
    player.ws.send(JSON.stringify(data));
  });
}

function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = [6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
  const deck = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ suit, rank });
    });
  });
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
