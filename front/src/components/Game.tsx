// src/components/Game.tsx
import React from 'react';
import { useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, ActiveCard, Game as GameState } from '../types';
import WebSocketService from '../api/ws';
import CardComponent from './CardComponent';
import './Game.css';

interface GameProps {
    roomId: string;
    playerSid: string;
    playerName: string;
    gameState: GameState;
}

const ItemTypes = {
    CARD: 'card'
};

const Game: React.FC<GameProps> = ({ roomId, playerSid, playerName, gameState }) => {
    const playCard = (cardIndex: number) => {
        if (gameState.current_turn === playerSid && gameState.current_turn === gameState.attacking_player) {
            WebSocketService.send({
                action: 'play_card',
                room_id: roomId,
                card_index: cardIndex
            });
        }
    };

    const defendCard = (cardIndex: number) => {
        if (gameState.current_turn === playerSid && gameState.current_turn === gameState.defending_player) {
            WebSocketService.send({
                action: 'defend_move',
                room_id: roomId,
                card_index: cardIndex
            });
        }
    };

    const renderCard = (card: Card | null, isPlayerCard: boolean = true, index: number) => {
        if (!card) return null;
        return (
            <CardComponent
                key={`${card.suit}-${card.rank}-${index}`} // Ensure a unique key for each card
                card={{ ...card, isPlayerCard, index } as ActiveCard}
                onClick={() => {
                    if (isPlayerCard) {
                        if (gameState.current_turn === gameState.attacking_player) {
                            playCard(index);
                        } else if (gameState.current_turn === gameState.defending_player) {
                            defendCard(index);
                        }
                    }
                }}
            />
        );
    };

    const getPlayer = () => gameState.players.find((player) => player.sid === playerSid);
    const getOpponent = () => gameState.players.find((player) => player.sid !== playerSid);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="game">
                <div className="game-header">
                    <h3>Player: {getPlayer()?.name} ({getPlayer()?.sid})</h3>
                    <h3>Opponent: {getOpponent()?.name} ({getOpponent()?.sid})</h3>
                    <h3>Room: {roomId}</h3>
                    <h3>Current Turn: {gameState.current_turn === playerSid ? 'Your turn' : 'Opponent\'s turn'}</h3>
                    <h3>Cards left in deck: {gameState.deck_count}</h3>
                </div>
                <div className="game-board">
                    <div className="opponent-hand">
                        <h4>Opponent's Hand</h4>
                        <div className="hand">
                            {getOpponent()?.hand.map((_, index) => (
                                <div className="card-back" key={index}></div>
                            ))}
                        </div>
                    </div>
                    <div className="table">
                        <h4>Table</h4>
                        <div className="cards">
                            <DropTargetComponent onDrop={(item) => {
                                if (gameState.current_turn === playerSid) {
                                    if (item.isPlayerCard) {
                                        playCard(item.index);
                                    } else {
                                        defendCard(item.index);
                                    }
                                }
                            }} />
                            {gameState.active_cards?.map((card, index) => renderCard(card, false, index))}
                        </div>
                    </div>
                    <div className="player-hand">
                        <h4>Your Hand</h4>
                        <div className="hand">
                            {getPlayer()?.hand.map((card, index) => renderCard(card, true, index))}
                        </div>
                    </div>
                </div>
                <div className="game-footer">
                    <div className="trump-card">
                        <h4>Trump Card</h4>
                        {renderCard(gameState.trump_card, false, 0)}
                    </div>
                    <div className="deck">
                        <h4>Deck</h4>
                        <div className="cards">
                            {Array(gameState.deck_count).fill(null).map((_, index) => (
                                <div className="card-back" key={index}></div>
                            ))}
                        </div>
                    </div>
                    <div className="beaten-cards">
                        <h4>Beaten Cards</h4>
                        <div className="cards">
                            {gameState.beaten_cards?.map((card, index) => renderCard(card, false, index))}
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

interface DropTargetComponentProps {
    onDrop: (item: any) => void;
}

const DropTargetComponent: React.FC<DropTargetComponentProps> = ({ onDrop }) => {
    const [, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop: (item) => {
            onDrop(item);
        },
    });

    return <div className="drop-target" ref={drop}></div>;
};

export default Game;
