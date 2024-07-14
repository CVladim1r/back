// src/components/Game.tsx

import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';

interface Card {
    suit: string;
    rank: string;
}

interface Player {
    sid: string;
    hand: Card[];
}

interface GameState {
    players: Player[];
    trump_card: Card;
    current_turn: string;
    attacking_player: string;
    defending_player: string;
    active_cards: Card[];
    winner?: string;
}

const Game: React.FC<{ roomId: string; playerSid: string }> = ({ roomId, playerSid }) => {
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
            if (data.action === 'starting') {
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

        WebSocketService.connect(roomId, playerSid);

        return () => {
            WebSocketService.off('open', handleOpen);
            WebSocketService.off('close', handleClose);
            WebSocketService.off('message', handleMessage);
        };
    }, [roomId, playerSid]);

    const renderCard = (card: Card) => (
        <div className="card">
            <div className="rank">{card.rank}</div>
            <div className="suit">{card.suit}</div>
        </div>
    );

    const getPlayer = () => gameState?.players.find(player => player.sid === playerSid);
    const getOpponent = () => gameState?.players.find(player => player.sid !== playerSid);

    return (
        <div className="game">
            <h1>Durak Online</h1>
            {connected ? (
                <div>
                    <h2>Connected as {playerSid}</h2>
                    {timer !== null ? (
                        <div>
                            <h2>Game starting in {timer} seconds...</h2>
                        </div>
                    ) : gameState && (
                        <div className="game-state">
                            <div className="trump-card">
                                <h3>Trump Card</h3>
                                {renderCard(gameState.trump_card)}
                            </div>
                            <div className="players">
                                <div className="player">
                                    <h3>Your Hand</h3>
                                    <div className="hand">
                                        {getPlayer()?.hand.map(renderCard)}
                                    </div>
                                </div>
                                <div className="opponent">
                                    <h3>Opponent's Hand</h3>
                                    <div className="hand">
                                        {getOpponent() && Array(getOpponent()?.hand.length).fill(<div className="card-back"></div>)}
                                    </div>
                                </div>
                            </div>
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
