// src/components/Game.tsx
import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';
import PlayerHand from './PlayerHand';
import Table from './Table';
import Card from './Card';
import { Card as CardInterface, Game as GameInterface } from '../types';

const Game: React.FC<{ roomId: string; playerSid: string }> = ({ roomId, playerSid }) => {
  const [connected, setConnected] = useState(false);
  const [game, setGame] = useState<GameInterface | null>(null);
  const [hand, setHand] = useState<CardInterface[]>([]);

  useEffect(() => {
    const ws = WebSocketService;

    ws.connect(roomId, playerSid);

    ws.on('open', () => {
      setConnected(true);
    });

    ws.on('close', () => {
      setConnected(false);
    });

    ws.on('message', (data: any) => {
      if (data.players) {
        const currentPlayer = data.players.find((player: any) => player.sid === playerSid);
        setHand(currentPlayer.hand);
      }
      setGame(data);
    });

    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      ws.off('open', () => setConnected(true));
      ws.off('close', () => setConnected(false));
      ws.off('message', (data: any) => {
        if (data.players) {
          const currentPlayer = data.players.find((player: any) => player.sid === playerSid);
          setHand(currentPlayer.hand);
        }
        setGame(data);
      });
      ws.off('error', (error: any) => console.error('WebSocket error:', error));
    };
  }, [roomId, playerSid]);

  const playCard = (card: CardInterface) => {
    if (game && game.current_turn === playerSid) {
      const message = {
        action: 'playCard',
        cardId: card.id,
      };
      WebSocketService.send(message);
    }
  };

  if (!connected) {
    return <div>Connecting...</div>;
  }

  if (!game) {
    return <div>Loading game data...</div>;
  }

  return (
    <div className="game">
      <h1>Game Room: {roomId}</h1>
      <div className="trump-card">
        <h2>Trump Card</h2>
        {game.trump_card && <Card card={game.trump_card} />}
      </div>
      <div className="deck">
        <h2>Deck</h2>
        {/* Display deck count or deck component */}
      </div>
      <div className="players">
        {game.players.map((player) => (
          <div key={player.sid} className={`player ${player.sid === playerSid ? 'current' : ''}`}>
            <h3>{player.sid === playerSid ? 'You' : `Player ${player.sid}`}</h3>
            <PlayerHand hand={player.hand} playCard={playCard} />
          </div>
        ))}
      </div>
      <div className="active-cards">
        <h2>Active Cards</h2>
        <Table cards={game.active_cards} onCardDrop={(cardId) => playCard({ id: cardId, rank: 0, type: '', img: '' })} />
      </div>
    </div>
  );
};

export default Game;
