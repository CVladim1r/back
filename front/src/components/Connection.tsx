import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';

interface Player {
    sid: string;
    name: string;
    hand: any[];
}

interface GameState {
    players: Player[];
    trump_card: any;
    current_turn: string;
    attacking_player: string;
    defending_player: string;
    active_cards: any[];
    winner?: string;
}

interface ConnectionProps {
    onConnect: (roomId: string, playerSid: string, playerName: string) => void;
}

const Connection: React.FC<ConnectionProps> = ({ onConnect }) => {
    const [roomId, setRoomId] = useState<string>('room1');
    const [playerSid, setPlayerSid] = useState<string>('');
    const [playerName, setPlayerName] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        const handleOpen = () => {
            setConnected(true);
            onConnect(roomId, playerSid, playerName);
        };

        const handleClose = () => {
            setConnected(false);
        };

        const handleMessage = (data: GameState) => {
            setGameState(data);
        };

        WebSocketService.on('open', handleOpen);
        WebSocketService.on('close', handleClose);
        WebSocketService.on('message', handleMessage);

        return () => {
            WebSocketService.off('open', handleOpen);
            WebSocketService.off('close', handleClose);
            WebSocketService.off('message', handleMessage);
        };
    }, [onConnect, roomId, playerSid, playerName]);

    const connect = () => {
        const sid = `player${Math.floor(Math.random() * 10000)}`;
        setPlayerSid(sid);
        WebSocketService.connect(roomId, sid, playerName);
    };

    return (
        <div>
            <h1>Connect to Room</h1>
            {connected ? (
                <div>
                    <h2>Connected as {playerName} ({playerSid})</h2>
                    {gameState && (
                        <div>
                            <h3>Players in room:</h3>
                            <ul>
                                {gameState.players.map(player => (
                                    <li key={player.sid}>{player.name} ({player.sid})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                    />
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                    />
                    <button onClick={connect}>Connect to Room</button>
                </div>
            )}
        </div>
    );
};

export default Connection;
