import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoomForm = () => {
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/room=${roomId}/player=/${playerId}/username=${username}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Room ID:</label>
        <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
      </div>
      <div>
        <label>Player ID:</label>
        <input type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)} required />
      </div>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <button type="submit">Join Room</button>
    </form>
  );
};

export default JoinRoomForm;
