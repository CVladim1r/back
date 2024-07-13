import React from 'react';
import { CardProps } from './types';

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div className="card" onClick={() => onClick(card)}>
      {card.rank} {card.suit}
    </div>
  );
};

export default Card;
