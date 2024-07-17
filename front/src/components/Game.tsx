import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';
import { Card, Player, Game as GameState } from '../types';
import PlayerHand from './PlayerHand';
import { cards } from '../cards'
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

    const playCard = (card: Card) => {
        if (gameState?.current_turn === playerSid) {
            WebSocketService.send({
                action: 'play_card',
                room_id: roomId,
                card
            });
        }
    };

    const defendCard = (card: Card) => {
        if (gameState?.current_turn === playerSid) {
            WebSocketService.send({
                action: 'defend_card',
                room_id: roomId,
                card
            });
        }
    };


    const renderCard = (card: { suit: string; rank: string }, isPlayerCard: boolean = true) => (
        <div className="card" onClick={() => isPlayerCard ? playCard(card) : defendCard(card)}>
            <img src={getCardImage(card.rank, card.suit)} alt={`${card.rank} of ${card.suit}`} />
        </div>
    );

    const getCardImage = (rank: string, suit: string) => {
        const card = cards.find(c => c.rank === rank && c.suit === suit);
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
                                        {getPlayer()?.hand.map(card => renderCard(card))}
                                    </div>
                                </div>
                            </div>
                            <div className="table">
                                <h3>Table</h3>
                                <div className="cards">
                                    {gameState.active_cards.map(card => renderCard(card, false))}
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
