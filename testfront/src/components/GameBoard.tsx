// src/components/GameBoard.tsx
import React from 'react';

interface GameBoardProps {
  gameState: any;
  playerId: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerId }) => {
  if (!gameState) return null;

  const { trump_card, active_cards, beaten_cards, deck_count, current_turn, attacking_player, defending_player } = gameState;

  return (
    <div>
      <h3>Trump Card: {trump_card.rank} of {trump_card.suit}</h3>
      <div>Current Turn: {current_turn === playerId ? 'Your turn' : current_turn}</div>
      <div>Attacking Player: {attacking_player}</div>
      <div>Defending Player: {defending_player}</div>
      <div>
        Active Cards: {active_cards.map((card: any, index: number) => (
          <span key={index}>{card.rank} of {card.suit} </span>
        ))}
      </div>
      <div>
        Beaten Cards: {beaten_cards.map((card: any, index: number) => (
          <span key={index}>{card.rank} of {card.suit} </span>
        ))}
      </div>
      <div>Deck Count: {deck_count}</div>
    </div>
  );
};

export default GameBoard;
