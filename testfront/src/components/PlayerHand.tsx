// src/components/PlayerHand.tsx
import React from 'react';

interface PlayerHandProps {
  gameState: any;
  playerId: string;
  sendMessage: (message: any) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ gameState, playerId, sendMessage }) => {
  if (!gameState) return null;

  const player = gameState.players.find((p: any) => p.sid === playerId);
  if (!player) return null;

  const handlePlayCard = (index: number) => {
    sendMessage({ action: 'play_card', room_id: gameState.room_id, player_sid: playerId, card_index: index });
  };

  const handleDefendMove = (index: number) => {
    sendMessage({ action: 'defend_move', room_id: gameState.room_id, player_sid: playerId, card_index: index });
  };

  return (
    <div>
      <h3>Your Hand</h3>
      <div>
        {player.hand.map((card: any, index: number) => (
          <button key={index} onClick={() => handlePlayCard(index)}>
            {card.rank} of {card.suit}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
