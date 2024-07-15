import React from 'react';
import { Card as CardInterface } from '../interfaces';
import Card from './CardComponent';

interface PlayerHandProps {
  hand: CardInterface[];
  playCard?: (card: CardInterface) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, playCard }) => {
  return (
    <div className="player-hand">
      {hand.map((card, index) => (
        <Card key={index} card={card} onClick={playCard ? () => playCard(card) : undefined} />
      ))}
    </div>
  );
};

export default PlayerHand;
