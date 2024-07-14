import React, { useState, useEffect } from 'react';
import { findRoom, createGame, joinGame, startGame } from '../api/api';

const RoomPage: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      const room = await findRoom();
      setRoomId(room);
    };

    fetchRoom();
  }, []);

  const handleCreateGame = () => {
    createGame((gameId) => {
      setGameId(gameId);
    });
  };

  const handleJoinGame = () => {
    if (roomId) {
      joinGame(roomId, () => {
        console.log('Joined game successfully!');
      });
    }
  };

  const handleStartGame = () => {
    startGame((game) => {
      console.log('Game started:', game);
      // Additional logic to handle game state
    });
  };

  return (
    <div className="room-page">
      <h1>Room Page</h1>
      <p>Room ID: {roomId}</p>
      <button onClick={handleCreateGame}>Create Game</button>
      <button onClick={handleJoinGame}>Join Game</button>
      <button onClick={handleStartGame}>Start Game</button>
      {/* Additional UI elements and logic can be added */}
    </div>
  );
};

export default RoomPage;
