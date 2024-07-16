// src/components/PlayerHand.tsx

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card as CardInterface } from '../types';
import Card from './Card';

interface PlayerHandProps {
  hand: CardInterface[];
  playCard?: (card: CardInterface) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, playCard }) => {
  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item: { card: CardInterface }) => {
      if (playCard) {
        playCard(item.card);
      }
    },
  });

  return (
    <div className="player-hand" ref={drop}>
      {hand.map((card, index) => (
        <DraggableCard key={index} card={card} index={index} playCard={playCard} />
      ))}
    </div>
  );
};

interface DraggableCardProps {
  card: CardInterface;
  index: number;
  playCard?: (card: CardInterface, index: number) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ card, index, playCard }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { card, index },
    end: (item, monitor) => {
      if (monitor.didDrop() && playCard) {
        playCard(item.card, item.index);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Card card={card} />
    </div>
  );
};

export default PlayerHand;
