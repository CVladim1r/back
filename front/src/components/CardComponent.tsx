// src/components/CardComponent.tsx

import * as React from 'react';
import { Card } from '../types';

interface ICardComponentProps {
  card: Card
  onClick?: () => void
}

const CardComponent: React.FunctionComponent<ICardComponentProps> = ({ card, onClick }) => {
  return (
    <div onClick={onClick} className='card'>
      <img src={card.img} alt={`${card.rank} of ${card.suit}`} width='80' />
    </div>
  );
};

export default CardComponent;
