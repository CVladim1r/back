import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import PlayerHand from '../components/PlayerHand';
import Deck from '../components/Deck';
import Card from '../components/Card';

interface LocationState {
  sid: string;
}

interface AppState {
  data: { value: number, index: number }[];
  count: number;
  ws?: WebSocket;
  interval?: NodeJS.Timeout;
}

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const { sid } = location.state as LocationState;
  const [game, setGame] = useState<any>(null); // Используем any для game, чтобы упростить работу с динамическими данными
  const [ws, setWs] = useState<WebSocket | null>(null); // Состояние WebSocket

  
  useEffect(() => {

    
    const connectWebSocket = () => {
      const newWs = new WebSocket(`ws://localhost:8080/ws?sid=${sid}`);

      newWs.onopen = () => {
        console.log('WebSocket is open now.');
        sendMessage({ type: 'joinGame', gameId, sid });
      };

      newWs.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      newWs.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        setWs(null); // Сброс состояния WebSocket при закрытии
      };

      newWs.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(newWs); // Установка нового экземпляра WebSocket в состояние
    };

    if (!ws) {
      console.log(`Attempting to connect to ws://localhost:8080/ws?sid=${sid}`);
      connectWebSocket();
    }

    return () => {
      if (ws) {
        console.log('Closing WebSocket connection');
        ws.close();
      }
    };
  }, [gameId, sid]); // Зависимости useEffect для переподключения при изменении gameId или sid

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'gameState':
        setGame(data.game);
        break;
      case 'error':
        console.error('Server error:', data.message);
        break;
      default:
        console.warn('Unknown message type:', data);
        break;
    }
  };

  const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Unable to send message:', message);
                setTimeout(() => {
        sendMessage(message);
      }, 1000); 
    }
  };

  if (!game) {
    return <div>Loading...</div>;
  }

  const player = game.players.find((p: any) => p.id === sid);
  const opponent = game.players.find((p: any) => p.id !== sid);

  return (
    <div className="game">
      <h1>Durak Online - Game {gameId}</h1>
      {opponent && <PlayerHand hand={opponent.hand} />}
      <Deck cards={game.deck} trumpCard={game.trumpCard} />
      <div className="table">
        {game.table.map((card: any, index: number) => (
          <Card key={index} card={card} />
        ))}
      </div>
      {player && <PlayerHand hand={player.hand} />}
    </div>
  );
};

export default Game;
