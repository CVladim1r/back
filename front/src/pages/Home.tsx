import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSID } from '../utils';
import { createGame } from '../api/api';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStartGame = async () => {
    const sid = generateSID();
    const { roomId } = await createGame(sid);
    navigate(`/game/${roomId}`, { state: { sid } });
  };

  return (
    <div className="home">
      <h1>Durak Online</h1>
      <button onClick={handleStartGame}>Start Game</button>
    </div>
  );
};

export default Home;
