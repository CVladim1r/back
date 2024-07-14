import React from 'react';
import { Card as CardInterface } from '../interfaces';
import Card from './Card';

interface DeckProps {
  cards: CardInterface[];
  trumpCard: CardInterface;
}

const Deck: React.FC<DeckProps> = ({ cards, trumpCard }) => {
  return (
    <div className="deck">
      <Card card={trumpCard} />
      <div>{cards.length} cards in deck</div>
    </div>
  );
};

export default Deck;
