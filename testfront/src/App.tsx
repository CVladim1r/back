import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import JoinRoomForm from './components/JoinRoomForm';
import GameRoom from './pages/GameRoom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/room/:roomId/player/:playerId/username/:username" element={<GameRoom />} />
        <Route path="/" element={<JoinRoomForm />} />
      </Routes>
    </Router>
  );
};

export default App;
