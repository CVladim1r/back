import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import WebSocketCall from './WebSocketCall';

function App() {
    const [socketInstance, setSocketInstance] = useState(null);

    useEffect(() => {
        const socket = io('http://localhost:5001/');
        setSocketInstance(socket);

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="App">
            {socketInstance && <WebSocketCall socket={socketInstance} />}
        </div>
    );
}

export default App;
