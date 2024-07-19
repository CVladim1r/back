// src/components/RoomList.tsx
import React, { useEffect, useState } from 'react';
import { getRooms } from '../api/api';
import WebSocketService from '../api/ws';

interface Room {
  room_id: string;
  player_count: number;
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerSid, setPlayerSid] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsList = await getRooms();
        setRooms(roomsList);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleConnect = () => {
    if (selectedRoom && playerName && playerSid) {
      WebSocketService.connect(selectedRoom, playerSid, playerName);
    }
  };

  return (
    <div>
      <h1>Available Rooms</h1>
      <ul>
        {rooms.map(room => (
          <li key={room.room_id}>
            <span>Room ID: {room.room_id} - Players: {room.player_count}</span>
            <button onClick={() => setSelectedRoom(room.room_id)}>Select</button>
          </li>
        ))}
      </ul>

      <div>
        <input
          type="text"
          placeholder="Player Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Player ID"
          value={playerSid}
          onChange={(e) => setPlayerSid(e.target.value)}
        />
        <button onClick={handleConnect}>Connect</button>
      </div>
    </div>
  );
};

export default RoomList;
