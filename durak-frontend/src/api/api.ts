import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:5000';
const socket: Socket = io(URL);

interface Card {
  suit: string;
  rank: string;
}

interface Game {
  players: Player[];
  deck: Card[];
  trumpCard: Card | null;
  table: Card[];
  discardPile: Card[];
  turn: number;
  gameId: string;
}

interface Player {
  sid: string;
  id: string;
  hand: Card[];
  isDefender: boolean;
}

export const findRoom = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${URL}/api/find_room`);
    const data = await response.json();
    return data.roomId || null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const createGame = (callback: (gameId: string) => void): void => {
  socket.emit('message', { type: 'createGame' });
  socket.on('gameCreated', (data) => {
    callback(data.gameId);
  });
};

export const joinGame = (gameId: string, callback: () => void): void => {
  socket.emit('message', { type: 'joinGame', gameId });
  socket.on('joinedGame', () => {
    callback();
  });
};

export const startGame = (callback: (game: Game) => void): void => {
  socket.emit('message', { type: 'startGame' });
  socket.on('gameStarted', (data) => {
    callback(data);
  });
};

export const playCard = (card: Card, callback: (success: boolean) => void): void => {
  socket.emit('message', { type: 'playCard', card });
  socket.on('cardPlayed', (data) => {
    callback(true);
  });
  socket.on('error', () => {
    callback(false);
  });
};

export const takeCards = (callback: () => void): void => {
  socket.emit('message', { type: 'takeCards' });
  socket.on('cardsTaken', () => {
    callback();
  });
};

export const getHand = (callback: (hand: Card[]) => void): void => {
  socket.emit('message', { type: 'getHand' });
  socket.on('hand', (data) => {
    callback(data.hand);
  });
};

export const inviteFriend = (gameId: string, friendSid: string, callback: (success: boolean) => void): void => {
  socket.emit('inviteFriend', { gameId, friendSid });
  socket.on('invited', () => {
    callback(true);
  });
  socket.on('error', () => {
    callback(false);
  });
};

export const onMessage = (handler: (message: any) => void): void => {
  socket.on('message', handler);
};

export const onError = (handler: (error: string) => void): void => {
  socket.on('error', handler);
};
