import React, { useEffect } from 'react';
import io from 'socket.io-client';

const RoomPage: React.FC = () => {

  useEffect(() => {
    const socket = io('http://localhost:8080');
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
    </div>
  );
};

export default RoomPage;
