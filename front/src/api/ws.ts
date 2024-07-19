// src/api/ws.ts
class WebSocketService {
    private socket: WebSocket | null = null;
    private onOpenCallbacks: Array<() => void> = [];
    private onCloseCallbacks: Array<() => void> = [];
    private onMessageCallbacks: Array<(event: MessageEvent) => void> = [];

    connect(roomId: string, playerSid: string, playerName: string) {
        this.socket = new WebSocket(`ws://localhost:8000/ws/room=${roomId}&playerid=${playerSid}&playername=${playerName}`);

        this.socket.onopen = () => {
            this.onOpenCallbacks.forEach(callback => callback());
        };

        this.socket.onmessage = (event) => {
            this.onMessageCallbacks.forEach(callback => callback(event));
        };

        this.socket.onclose = () => {
            this.onCloseCallbacks.forEach(callback => callback());
        };

        this.socket.onerror = (error) => {
            console.log('WebSocket error:', error);
        };
    }

    isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    onOpen(callback: () => void) {
        this.onOpenCallbacks.push(callback);
    }

    onClose(callback: () => void) {
        this.onCloseCallbacks.push(callback);
    }

    onMessage(callback: (event: MessageEvent) => void) {
        this.onMessageCallbacks.push(callback);
    }

    offOpen(callback: () => void) {
        this.onOpenCallbacks = this.onOpenCallbacks.filter(cb => cb !== callback);
    }

    offClose(callback: () => void) {
        this.onCloseCallbacks = this.onCloseCallbacks.filter(cb => cb !== callback);
    }

    offMessage(callback: (event: MessageEvent) => void) {
        this.onMessageCallbacks = this.onMessageCallbacks.filter(cb => cb !== callback);
    }

    send(data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
}

export default new WebSocketService();
