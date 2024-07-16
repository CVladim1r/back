import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId/:playerId" element={<GameRoom />} />
      </Routes>
    </Router>
  );
};

export default App;
