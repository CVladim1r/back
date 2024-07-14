import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>(null); // Здесь может быть интерфейс для состояния игры

  const wsUrl = 'ws://127.0.0.1:8000/ws'; // URL вашего WebSocket сервера

  useEffect(() => {
    const newSocket = new WebSocket(wsUrl);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'gameState') {
        setGameState(message.game);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

  }, [socket]);

  const createRoom = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'createGame' }));
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'joinGame', gameId: roomId }));
    }
  };

  const startGame = () => {
    if (socket && roomId) {
      socket.send(JSON.stringify({ type: 'startGame', gameId: roomId }));
    }
  };

  const renderGameState = () => {
    if (!gameState) return null;

    // Здесь можно отобразить состояние игры, например, текущих игроков, карты на столе и т.д.
    return (
      <div>
        <h2>Game State</h2>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div>
      <h1>Online Durak Game</h1>
      <button onClick={createRoom}>Create Room</button>
      <button onClick={() => joinRoom('example_room_id')}>Join Room</button> {/* Замените на реальный ID */}
      <button onClick={startGame}>Start Game</button>
      {renderGameState()}
    </div>
  );
};

export default App;
