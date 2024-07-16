import { useParams } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import { useState, useEffect } from 'react';

const GameRoom = () => {
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();
  const { messages, sendMessage } = useWebSocket(`ws://localhost:8000/ws/${roomId}/${playerId}`);
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    const gameStateMessage = messages.find((msg) => msg.action === 'game_state');
    if (gameStateMessage) {
      setGameState(gameStateMessage);
    }
  }, [messages]);

  const handleStartGame = () => {
    sendMessage({ action: 'confirm_start', room_id: roomId, player_sid: playerId });
  };

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <button onClick={handleStartGame}>Confirm Start</button>
      <GameBoard gameState={gameState} playerId={playerId!} />
      <PlayerHand gameState={gameState} playerId={playerId!} sendMessage={sendMessage} />
    </div>
  );
};

export default GameRoom;
