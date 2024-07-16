// src/App.tsx

import React, { useState } from 'react';
import Connection from './components/Connection';
import Game from './components/Game';
import './App.css';

const App: React.FC = () => {
    const [connected, setConnected] = useState<boolean>(false);
    const [roomId, setRoomId] = useState<string>('room1');
    const [playerSid, setPlayerSid] = useState<string>('');
    const handleConnect = (roomId: string, playerSid: string) => {
        setRoomId(roomId);
        setPlayerSid(playerSid);
        setConnected(true);
    };

    return (
        <div>
            {connected ? (
                <Game roomId={roomId} playerSid={playerSid}/>
            ) : (
                <Connection onConnect={handleConnect} />
            )}
        </div>
    );
};

export default App;
