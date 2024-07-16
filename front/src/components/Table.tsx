// src/components/Table.tsx

import React from 'react';
import { useDrop } from 'react-dnd';
import { Card as CardInterface } from '../types';
import Card from './Card';

interface TableProps {
  cards: CardInterface[];
  onCardDrop: (cardId: number) => void;
}

const Table: React.FC<TableProps> = ({ cards, onCardDrop }) => {
  const [, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { id: number }) => onCardDrop(item.id),
  }));

  return (
    <div ref={drop} className="table">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
};

export default Table;
