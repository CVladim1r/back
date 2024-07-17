// src/api/ws.ts

type EventCallback = (data?: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: { [key: string]: EventCallback[] } = {};
    private activeRoomId: string | null = null;
    private activePlayerSid: string | null = null;

    isConnected(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }

    connect(roomId: string, playerSid: string): void {
        if (this.isConnected() && this.activePlayerSid === playerSid && this.activeRoomId === roomId) {
            console.warn(`Player ${playerSid} is already connected to room ${roomId}`);
            return;
        }

        this.disconnect();

        this.socket = new WebSocket(`ws://localhost:8000/ws/${roomId}/${playerSid}`);
        this.activeRoomId = roomId;
        this.activePlayerSid = playerSid;

        this.socket.onopen = () => {
            this.emit('open');
        };

        this.socket.onclose = () => {
            this.emit('close');
            this.disconnect();
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            this.emit('message', data);
        };

        this.socket.onerror = (error: Event) => {
            this.emit('error', error);
        };
    }

    disconnect(): void {
        if (this.isConnected()) {
            this.socket!.close();
        }
        this.socket = null;
        this.activeRoomId = null;
        this.activePlayerSid = null;
    }

    send(data: any): void {
        if (this.isConnected()) {
            this.socket!.send(JSON.stringify(data));
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
