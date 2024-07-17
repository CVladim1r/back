// src/api/ws.ts

type EventCallback = (data?: any) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private eventListeners: { [key: string]: Function[] } = {};

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(roomId: string, playerId: string) {
    if (this.socket) {
      this.disconnect();
    }
    this.socket = new WebSocket(`ws://localhost:8000/ws/${roomId}/${playerId}`);

    this.socket.onopen = () => {
      this.emit('open');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit('message', data);
    };

    this.socket.onclose = () => {
      this.emit('close');
    };

    this.socket.onerror = (error) => {
      this.emit('error', error);
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public send(data: any) {
    if (this.socket) {
      this.socket.send(JSON.stringify(data));
    }
  }

  public on(event: string, listener: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  public off(event: string, listener: Function) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter((l) => l !== listener);
  }

  private emit(event: string, ...args: any[]) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((listener) => listener(...args));
    }
  }

  public isConnected() {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService.getInstance();
