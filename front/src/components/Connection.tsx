import React, { useState } from 'react';
import RoomList from './RoomList';

interface ConnectionProps {
    onConnect: (roomId: string, playerSid: string, playerName: string) => void;
}

const Connection: React.FC<ConnectionProps> = ({ onConnect }) => {
    const [roomId, setRoomId] = useState<string>('room1');
    const [playerName, setPlayerName] = useState<string>('');

    const connect = () => {
        const sid = `player${Math.floor(Math.random() * 10000)}`;
        onConnect(roomId, sid, playerName);
    };

    return (
        <div>
            <RoomList></RoomList>

            <h1>Connect to Room</h1>
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
        </div>
    );
};

export default Connection;
