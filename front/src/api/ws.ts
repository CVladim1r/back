// src/ws.ts

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: { [key: string]: Function[] } = {};

    connect(roomId: string, playerSid: string): void {
        this.socket = new WebSocket(`ws://localhost:8000/ws/${roomId}/${playerSid}`);

        this.socket.onopen = () => {
            this.emit('open');
        };

        this.socket.onclose = () => {
            this.emit('close');
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            this.emit('message', data);
        };

        this.socket.onerror = (error: Event) => {
            this.emit('error', error);
        };
    }

    send(data: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not open to send data.');
        }
    }

    on(event: string, callback: Function): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: Function): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    private emit(event: string, data?: any): void {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}

export default new WebSocketService();
