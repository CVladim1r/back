// src/api/ws.ts

type EventCallback = (data?: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: { [key: string]: EventCallback[] } = {};

    connect(roomId: string, playerSid: string, playerName: string): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return; // Prevent multiple connections
        this.socket = new WebSocket(`ws://localhost:8000/ws/room=${roomId}&playerid=${playerSid}&playername=${playerName}`);

        this.socket.onopen = () => {
            console.log("WebSocket connection opened.");
            this.emit('open');
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed.");
            this.emit('close');
        };

        this.socket.onmessage = (event: MessageEvent) => {
            console.log("WebSocket message received:", event.data);
            const data = JSON.parse(event.data);
            this.emit('message', data);
        };

        this.socket.onerror = (error: Event) => {
            console.error("WebSocket error:", error);
            this.emit('error', error);
        };
    }

    isConnected(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }

    send(data: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not open to send data.');
        }
    }

    on(event: string, callback: EventCallback): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: EventCallback): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    private emit(event: string, data?: any): void {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}

export default new WebSocketService();
