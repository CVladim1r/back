import React, { useState, useEffect } from 'react';
import WebSocketService from '../api/ws';
import Game from './Game';
import { Game as GameState } from '../types';

interface ConnectionProps {
  onConnect: (roomId: string, playerSid: string, playerName: string) => void;
}

const tele = window.Telegram.WebApp;

const Connection: React.FC<ConnectionProps> = ({ onConnect }) => {
  const [roomId, setRoomId] = useState<string>('room1');
  const [playerSid, setPlayerSid] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const handleOpen = () => {
      setConnected(true);
      onConnect(roomId, playerSid, playerName);
    };

    const handleClose = () => {
      setConnected(false);
    };

    const handleMessage = (message: any) => {
      const data = JSON.parse(message.data);
      console.log("Received game state:", data);
      setGameState(data);
    };

    WebSocketService.onOpen(handleOpen);
    WebSocketService.onClose(handleClose);
    WebSocketService.onMessage(handleMessage);

    return () => {
      WebSocketService.offOpen(handleOpen);
      WebSocketService.offClose(handleClose);
      WebSocketService.offMessage(handleMessage);
    };
  }, [onConnect, roomId, playerSid, playerName]);

  const connect = () => {
    if (WebSocketService.isConnected()) return;

    const user = tele.initDataUnsafe.user;
    const sid = `player${user.id}`;
    setPlayerSid(sid);
    setPlayerName(user.username || `${user.first_name} ${user.last_name}`);
    WebSocketService.connect(roomId, sid, user.username || `${user.first_name} ${user.last_name}`);
  };

  return (
    <div>
      <h1>Connect to Room</h1>
      {connected ? (
        <div>
          <h2>Connected as {playerName} ({playerSid})</h2>
          {gameState ? (
            <Game
              roomId={roomId}
              playerSid={playerSid}
              playerName={playerName}
              gameState={gameState}
            />
          ) : (
            <h2>Waiting for game state...</h2>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
          />
          <button onClick={connect}>Connect to Room</button>
        </div>
      )}
    </div>
  );
};

export default Connection;
