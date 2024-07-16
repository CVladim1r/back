import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';
import { Card, Player, Game as GameState, TypeCard } from '../types';
import PlayerHand from './PlayerHand';

const Game: React.FC<{ roomId: string; playerSid: string }> = ({ roomId, playerSid }) => {
    const [connected, setConnected] = useState<boolean>(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [timer, setTimer] = useState<number | null>(null);

    useEffect(() => {
        const handleOpen = () => {
            setConnected(true);
            WebSocketService.connect(roomId, playerSid);
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

        return () => {
            WebSocketService.off('open', handleOpen);
            WebSocketService.off('close', handleClose);
            WebSocketService.off('message', handleMessage);
        };
    }, [roomId, playerSid]);

    const playCard = (card: Card) => {
        if (gameState?.current_turn === playerSid) { // Обновлено: проверка на текущий ход игрока
            WebSocketService.send({
                action: 'play_card',
                room_id: roomId,
                card
            });
        }
    };

    const defendCard = (card: Card) => {
        if (gameState?.current_turn === playerSid) { // Обновлено: проверка на текущий ход игрока
            WebSocketService.send({
                action: 'defend_card',
                room_id: roomId,
                card
            });
        }
    };

    const renderCard = (card: Card, isPlayerCard: boolean = true) => (
        <div className="card" onClick={() => isPlayerCard ? playCard(card) : defendCard(card)}>
            <img src={card.img} alt={`${card.rank} of ${card.type}`} />
        </div>
    );

    const getPlayer = () => gameState?.players.find(player => player.sid === playerSid); // Обновлено: исправлено сравнение
    const getOpponent = () => gameState?.players.find(player => player.sid !== playerSid); // Обновлено: исправлено сравнение

    return (
        <div className="game">
            <h1>Durak Online</h1>
            {connected ? (
                <div>
                    <h3>Player: {getPlayer()?.sid}, Opponent: {getOpponent()?.sid}</h3> {/* Обновлено: выводим id игрока и оппонента */}
                    <h3>Room: {roomId}</h3>

                    {timer !== null ? (
                        <div>
                            <h2>Game starting in {timer} seconds...</h2>
                        </div>
                    ) : gameState ? (
                        <div className="game-state">
                            <div className="trump-card">
                                <h3>Trump Card</h3>
                                {renderCard(gameState.trumpCard, false)} {/* Обновлено: исправлено имя свойства */}
                            </div>
                            <div className="players">
                                <div className="player">
                                    <h3>Your Hand</h3>
                                    <div className="hand">
                                        {getPlayer()?.hand.map(card => renderCard(card))}
                                    </div>
                                </div>
                                <div className="opponent">
                                    <h3>Opponent's Hand</h3>
                                    <div className="hand">
                                        {getOpponent()?.hand.map(() => (
                                            <div className="card-back"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="table">
                                <h3>Table</h3>
                                <div className="cards">
                                    {gameState.deck.map(card => renderCard(card, false))} {/* Обновлено: исправлено имя свойства */}
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
