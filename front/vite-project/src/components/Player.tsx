import React from 'react';
import { PlayerType, CardType } from './types';

interface PlayerProps {
  player: PlayerType;
  onCardClick: (card: CardType) => void;
}

const Player: React.FC<PlayerProps> = ({ player, onCardClick }) => {
  return (
    <div className="player">
      <h3>Player: {player.id}</h3>
      <div className="hand">
        {player.hand.map((card, index) => (
          <div key={index} className="card" onClick={() => onCardClick(card)}>
            {card.rank} - {card.suit}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Player;
