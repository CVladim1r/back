// src/components/Game.tsx

import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';
import Card from '../components/Card';
import Table from '../components/Table';
import PlayerHand from '../components/PlayerHand';
import Deck from '../components/Deck';
import { Game as GameInterface, Card as CardInterface } from '../types';

const Game: React.FC<{ roomId: string; playerSid: string }> = ({ roomId, playerSid }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameInterface | null>(null);

  useEffect(() => {
    const handleOpen = () => {
      setConnected(true);
    };

    const handleClose = () => {
      setConnected(false);
    };

    const handleMessage = (data: GameInterface) => {
      setGameState(data);
    };

    WebSocketService.on('open', handleOpen);
    WebSocketService.on('close', handleClose);
    WebSocketService.on('message', handleMessage);

    WebSocketService.connect(roomId, playerSid);

    return () => {
      WebSocketService.off('open', handleOpen);
      WebSocketService.off('close', handleClose);
      WebSocketService.off('message', handleMessage);
    };
  }, [roomId, playerSid]);

  const handleCardDrop = (cardId: number) => {
    console.log(`Card with id ${cardId} dropped on table`);
    // Implement game logic to handle card drop
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const player = gameState.players.find((p) => p.id === playerSid);
  const opponent = gameState.players.find((p) => p.id !== playerSid);

  return (
    <div className="game">
      <h1>Durak Online</h1>
      {connected ? (
        <div>
          <h2>Connected as {playerSid}</h2>
          <div className="game-state">
            <Deck cards={gameState.deck} trumpCard={gameState.trumpCard} />
            <Table cards={gameState.table} onCardDrop={handleCardDrop} />
            <PlayerHand hand={player ? player.hand : []} />
            {opponent && <PlayerHand hand={opponent.hand} />}
          </div>
        </div>
      ) : (
        <div>Connecting...</div>
      )}
    </div>
  );
};

export default Game;
