// src/components/GameBoard.tsx

import React from 'react';

interface GameBoardProps {
  gameState: any;
  playerId: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerId }) => {
  if (!gameState) return null;

  return (
    <div className="game-board">
      <h3>Trump Card: {gameState.trump_card.rank} of {gameState.trump_card.suit}</h3>
      <div className="players">
        {gameState.players.map((player: any) => (
          <div key={player.sid} className={player.sid === playerId ? 'player own-player' : 'player'}>
            <h4>Player {player.sid}</h4>
            <div className="hand">
              {player.hand.map((card: any, index: number) => (
                <div key={index} className="card">
                  {card.rank} of {card.suit}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="active-cards">
        <h4>Active Cards:</h4>
        {gameState.active_cards.map((card: any, index: number) => (
          <div key={index} className="card">
            {card.rank} of {card.suit}
          </div>
        ))}
      </div>
      <div className="beaten-cards">
        <h4>Beaten Cards:</h4>
        {gameState.beaten_cards.map((card: any, index: number) => (
          <div key={index} className="card">
            {card.rank} of {card.suit}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
