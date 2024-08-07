import React, { useState, useEffect } from 'react';
import Connection from '../components/Connection';
import Game from '../components/Game';
import WebSocketService from '../api/ws';
import { Game as GameState } from '../types';

const tele = window.Telegram.WebApp;

const CreateRoom: React.FC = () => {
    const [connected, setConnected] = useState<boolean>(false);
    const [roomId, setRoomId] = useState<string>('room1');
    const [playerSid, setPlayerSid] = useState<string>('');
    const [playerName, setPlayerName] = useState<string>('');
    const [gameState, setGameState] = useState<GameState | null>(null);

    const handleConnect = (roomId: string, playerSid: string, playerName: string) => {
        setRoomId(roomId);
        setPlayerSid(playerSid);
        setPlayerName(playerName);
        setConnected(true);
    };

    useEffect(() => {
        const user = tele.initDataUnsafe.user;
        if (user) {
            setPlayerSid(`player${user.id}`);
            setPlayerName(user.username || `${user.first_name} ${user.last_name}`);
        }
    }, []);

    useEffect(() => {
        if (connected) {
            WebSocketService.connect(roomId, playerSid, playerName);
            WebSocketService.onMessage((message: any) => {
                const data = JSON.parse(message.data);
                setGameState(data);
            });
        }
    }, [connected, roomId, playerSid, playerName]);

    return (
        <div>
            {connected ? (
                gameState ? (
                    <Game
                        roomId={roomId}
                        playerSid={playerSid}
                        playerName={playerName}
                        gameState={gameState}
                    />
                ) : (
                    <h2>Waiting for game state...</h2>
                )
            ) : (
                <Connection onConnect={handleConnect} />
            )}
        </div>
    );
};

export default CreateRoom;
