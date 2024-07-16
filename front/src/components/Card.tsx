// src/components/Card.tsx

import React from 'react';
import { useDrag } from 'react-dnd';
import { Card as CardInterface } from '../types';

interface CardProps {
  card: CardInterface;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  const [, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id: card.id },
  }));

  return (
    <div ref={drag} onClick={onClick} className="card">
      <img src={card.img} alt={`${card.rank} of ${card.type}`} width="80" />
    </div>
  );
};

export default Card;
