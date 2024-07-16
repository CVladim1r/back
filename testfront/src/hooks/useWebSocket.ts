import { useEffect, useState } from 'react';

const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    ws.onclose = (event) => {
      if (!event.wasClean) {
        console.error(`WebSocket closed unexpectedly: code=${event.code}, reason=${event.reason}`);
      } else {
        console.log('WebSocket closed:', event);
      }
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = (message: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return { messages, sendMessage };
};

export default useWebSocket;
