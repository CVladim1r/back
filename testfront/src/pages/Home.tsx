import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    const playerId = Date.now().toString();
    navigate(`/room/${roomId}/${playerId}`);
  };

  return (
    <div>
      <h1>Welcome to Durak Game</h1>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
      />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
};

export default Home;
