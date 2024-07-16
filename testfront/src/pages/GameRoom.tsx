import { useParams } from 'react-router-dom';
import WebSocketService from '../hooks/useWebSocket';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import { useState, useEffect } from 'react';

const GameRoom = () => {
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    WebSocketService.connect(roomId!, playerId!);

    const handleOpen = () => {
      console.log('WebSocket connection opened');
    };

    const handleMessage = (data: any) => {
      if (data.action === 'game_state') {
        setGameState(data);
      }
    };

    const handleClose = () => {
      console.log('WebSocket connection closed');
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
    };

    WebSocketService.on('open', handleOpen);
    WebSocketService.on('message', handleMessage);
    WebSocketService.on('close', handleClose);
    WebSocketService.on('error', handleError);

    return () => {
      WebSocketService.off('open', handleOpen);
      WebSocketService.off('message', handleMessage);
      WebSocketService.off('close', handleClose);
      WebSocketService.off('error', handleError);
    };
  }, [roomId, playerId]);

  const handleStartGame = () => {
    WebSocketService.send({ action: 'confirm_start', room_id: roomId, player_sid: playerId });
  };

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <button onClick={handleStartGame}>Confirm Start</button>
      <GameBoard gameState={gameState} playerId={playerId!} />
      <PlayerHand gameState={gameState} playerId={playerId!} sendMessage={WebSocketService.send.bind(WebSocketService)} />
    </div>
  );
};


export default GameRoom;