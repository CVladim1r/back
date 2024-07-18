// src/components/Game.tsx

import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, Game as GameState, ActiveCard } from '../types';
import { cards } from '../cards';
import './Game.css';

interface GameProps {
    roomId: string;
    playerSid: string;
    playerName: string;
}

const ItemTypes = {
    CARD: 'card'
};

const Game: React.FC<GameProps> = ({ roomId, playerSid, playerName }) => {
    const [connected, setConnected] = useState<boolean>(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [timer, setTimer] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [winner, setWinner] = useState<string | null>(null);

    useEffect(() => {
        const handleOpen = () => {
            setConnected(true);
        };

        const handleClose = () => {
            setConnected(false);
        };

        const handleMessage = (data: any) => {
            console.log('Received data from WebSocket:', data);

            if (!data) {
                console.error('Received null or undefined data from WebSocket');
                return;
            }

            if (data.action === 'starting' && typeof data.timer === 'number') {
                setTimer(data.timer);
                const countdown = setInterval(() => {
                    setTimer(prevTimer => {
                        if (prevTimer === 1) {
                            clearInterval(countdown);
                            setTimer(null);
                        }
                        return prevTimer ? prevTimer - 1 : null;
                    });
                }, 1000);
            } else {
                setGameState(data);

                // Check if the game is over
                if (data.winner) {
                    setGameOver(true);
                    setWinner(data.winner);
                }
            }
        };

        WebSocketService.on('open', handleOpen);
        WebSocketService.on('close', handleClose);
        WebSocketService.on('message', handleMessage);

        WebSocketService.connect(roomId, playerSid, playerName);

        return () => {
            WebSocketService.off('open', handleOpen);
            WebSocketService.off('close', handleClose);
            WebSocketService.off('message', handleMessage);
        };
    }, [roomId, playerSid, playerName]);

    const playCard = (cardIndex: number) => {
        if (gameState?.current_turn === playerSid && gameState.current_turn === gameState.attacking_player) {
            WebSocketService.send({
                action: 'play_card',
                room_id: roomId,
                card_index: cardIndex
            });
        }
    };

    const defendCard = (cardIndex: number) => {
        if (gameState?.current_turn === playerSid && gameState.current_turn === gameState.defending_player) {
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
                card={{ ...card, isPlayerCard, index } as ActiveCard}
                index={index}
                isPlayerCard={isPlayerCard}
                playCard={playCard}
                defendCard={defendCard}
            />
        );
    };

    const getCardImage = (rank: string, suit: string) => {
        const card = cards.find(c => c.rank === rank && c.type === suit);
        return card ? card.img : 'path/to/default/image.png';
    };

    const getPlayer = () => gameState?.players.find(player => player.sid === playerSid);
    const getOpponent = () => gameState?.players.find(player => player.sid !== playerSid);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="game">
                <h1>Durak Online</h1>
                {connected ? (
                    <div>
                        {gameOver ? (
                            <div>
                                <h2>Game Over!</h2>
                                <h3>Winner: {winner}</h3>
                            </div>
                        ) : (
                            <>
                                <h3>Player: {getPlayer()?.name} ({getPlayer()?.sid}), Opponent: {getOpponent()?.name} ({getOpponent()?.sid})</h3>
                                <h3>Room: {roomId}</h3>
                                <h3>Current Turn: {gameState?.current_turn === playerSid ? 'Your turn' : 'Opponent\'s turn'}</h3>
                                <h3>Cards left in deck: {gameState?.deck ? gameState.deck.length : 0}</h3>

                                {timer !== null ? (
                                    <div>
                                        <h2>Game starting in {timer} seconds...</h2>
                                    </div>
                                ) : gameState ? (
                                    <div className="game-state">
                                        <div className="trump-card">
                                            <h3>Trump Card</h3>
                                            {renderCard(gameState.trump_card, false, 0)}
                                        </div>
                                        <div className="players">
                                            <div className="player">
                                                <h3>Your Hand</h3>
                                                <div className="hand">
                                                    {getPlayer()?.hand.map((card, index) => renderCard(card, true, index))}
                                                </div>
                                            </div>
                                            <div className="opponent">
                                                <h3>Opponent's Hand</h3>
                                                <div className="hand">
                                                    {getOpponent()?.hand.map((_, index) => (
                                                        <div className="card-back" key={index}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table">
                                            <h3>Table</h3>
                                            <div className="cards">
                                                <DropTargetComponent onDrop={(item: any) => {
                                                    if (gameState?.current_turn === playerSid) {
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
                                        <div className="deck">
                                            <h3>Deck</h3>
                                            <div className="cards">
                                                {gameState.deck?.map((card, index) => (
                                                    <div className="card-back" key={index}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="beaten-cards">
                                            <h3>Beaten Cards</h3>
                                            <div className="cards">
                                                {gameState.beaten_cards?.map((card, index) => renderCard(card, false, index))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2>Waiting for game state...</h2>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2>Connecting...</h2>
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

interface CardComponentProps {
    card: ActiveCard;
    index: number;
    isPlayerCard: boolean;
    playCard: (cardIndex: number) => void;
    defendCard: (cardIndex: number) => void;
}

const CardComponent: React.FC<CardComponentProps> = ({ card, index, isPlayerCard, playCard, defendCard }) => {
    const [, drag] = useDrag({
        type: ItemTypes.CARD,
        item: { card, index, isPlayerCard },
    });

    return (
        <div
            className="card"
            ref={drag}
            style={{ backgroundImage: `url(${getCardImage(card.rank, card.suit)})` }}
        >
        </div>
    );
};

const DropTargetComponent: React.FC<{ onDrop: (item: any) => void }> = ({ onDrop }) => {
    const [, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop: (item) => {
            onDrop(item);
        },
    });

    return <div className="drop-target" ref={drop}></div>;
};

const getCardImage = (rank: string, suit: string) => {
    const card = cards.find(c => c.rank === rank && c.type === suit);
    return card ? card.img : 'path/to/default/image.png';
};

export default Game;
