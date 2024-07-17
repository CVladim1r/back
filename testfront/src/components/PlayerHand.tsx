// src/components/PlayerHand.tsx
import React from 'react';

interface PlayerHandProps {
  gameState: any;
  playerId: string;
  sendMessage: (message: any) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ gameState, playerId, sendMessage }) => {
  const player = gameState.players.find((p: any) => p.sid === playerId);
  if (!player || !player.hand || player.hand.length === 0) return null;

  const playCard = (index: number) => {
    sendMessage({ action: 'play_card', room_id: gameState.room_id, player_sid: playerId, card_index: index });
  };

  return (
    <div className="player-hand">
      <h4>Your Hand:</h4>
      {player.hand.map((card: any, index: number) => (
        <div key={`${card.rank}-${card.suit}`} className="card" onClick={() => playCard(index)}>
          {card.rank} of {card.suit}
        </div>
      ))}
    </div>
  );
};

export default PlayerHand;
