import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';
import { Card, Player, Game as GameState } from '../types';
import { cards } from '../cards';
import './Game.css'; // импортируем стили

interface GameProps {
    roomId: string;
    playerSid: string;
    playerName: string;
}

const Game: React.FC<GameProps> = ({ roomId, playerSid, playerName }) => {
    const [connected, setConnected] = useState<boolean>(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [timer, setTimer] = useState<number | null>(null);

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
        if (gameState?.current_turn === playerSid) {
            WebSocketService.send({
                action: 'play_card',
                room_id: roomId,
                card_index: cardIndex
            });
        }
    };

    const defendCard = (cardIndex: number) => {
        if (gameState?.current_turn === playerSid) {
            WebSocketService.send({
                action: 'defend_move',
                room_id: roomId,
                card_index: cardIndex
            });
        }
    };

    const renderCard = (card: { suit: string; rank: string } | null, isPlayerCard: boolean = true, key?: number) => {
        if (!card) return null;
        return (
            <div className="card" onClick={() => key !== undefined && (isPlayerCard ? playCard(key) : defendCard(key))} key={key}>
                <img src={getCardImage(card.rank, card.suit)} alt={`${card.rank} of ${card.suit}`} />
            </div>
        );
    };

    const getCardImage = (rank: string, suit: string) => {
        const card = cards.find(c => c.rank === rank && c.type === suit);
        return card ? card.img : 'path/to/default/image.png'; 
    };

    const getPlayer = () => gameState?.players.find(player => player.sid === playerSid);
    const getOpponent = () => gameState?.players.find(player => player.sid !== playerSid);

    return (
        <div className="game">
            <h1>Durak Online</h1>
            {connected ? (
                <div>
                    <h3>Player: {getPlayer()?.name} ({getPlayer()?.sid}), Opponent: {getOpponent()?.name} ({getOpponent()?.sid})</h3>
                    <h3>Room: {roomId}</h3>
                    <h3>Current Turn: {gameState?.current_turn === playerSid ? 'Your turn' : 'Opponent\'s turn'}</h3>
                    <h3>Cards left in deck: {gameState?.deck_count}</h3>

                    {timer !== null ? (
                        <div>
                            <h2>Game starting in {timer} seconds...</h2>
                        </div>
                    ) : gameState ? (
                        <div className="game-state">
                            <div className="trump-card">
                                <h3>Trump Card</h3>
                                {renderCard(gameState.trump_card, false)}
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
                                    {gameState.active_cards.map((card, index) => renderCard(card, false, index))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2>Waiting for game state...</h2>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h2>Connecting...</h2>
                </div>
            )}
        </div>
    );
};

export default Game;
