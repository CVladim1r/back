import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import CreateRoom from './pages/CreateRoom';
import OpenRooms from './pages/OpenRooms';
import PrivateRooms from './pages/PrivateRooms';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/open-rooms" element={<OpenRooms />} />
          <Route path="/private-rooms" element={<PrivateRooms />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
};

export default App;
