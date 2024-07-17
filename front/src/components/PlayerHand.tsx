import React from 'react';
import { Card } from '../types';
import { getCardImage } from '../cards'; // Update this import if necessary

interface PlayerHandProps {
    hand: Card[];
    playCard: (card: Card) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, playCard }) => (
    <div className="hand">
        {hand.map(card => (
            <div className="card" onClick={() => playCard(card)} key={`${card.rank}-${card.suit}`}>
                <img src={getCardImage(card.rank, card.suit)} alt={`${card.rank} of ${card.suit}`} />
            </div>
        ))}
    </div>
);

export default PlayerHand;
