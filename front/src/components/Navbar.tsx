import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaPlusCircle, FaDoorOpen, FaLock } from 'react-icons/fa';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul>
        <li className={location.pathname === '/profile' ? 'active' : ''}>
          <Link to="/profile"><FaUser /></Link>
        </li>
        <li className={location.pathname === '/create-room' ? 'active' : ''}>
          <Link to="/create-room"><FaPlusCircle /></Link>
        </li>
        <li className={location.pathname === '/open-rooms' ? 'active' : ''}>
          <Link to="/open-rooms"><FaDoorOpen /></Link>
        </li>
        <li className={location.pathname === '/private-rooms' ? 'active' : ''}>
          <Link to="/private-rooms"><FaLock /></Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
