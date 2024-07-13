import React, { useEffect, useState } from 'react';

function WebSocketCall({ socket }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (socket) {
            socket.on('message', (msg) => {
                setMessages(prevMessages => [...prevMessages, msg]);
            });
        }

        return () => {
            if (socket) {
                socket.off('message'); // Clean up event listener
            }
        };
    }, [socket]);

    const handleText = (event) => {
        setMessage(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (socket && message.trim() !== '') {
            socket.emit('data', message);
            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={message} onChange={handleText} />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default WebSocketCall;
