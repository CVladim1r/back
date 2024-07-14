import React from 'react';
import { Card as CardInterface } from '../interfaces';

interface CardProps {
  card: CardInterface;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <span>{card.rank} of {card.suit}</span>
    </div>
  );
};

export default Card;
