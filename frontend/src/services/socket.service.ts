import { io, Socket } from "socket.io-client";
import { api, getAccessToken } from "./client";
import { audioManager } from "./audio/AudioManager";

class SocketService {
  private socket: Socket | null = null;
  private baseURL: string;

  constructor() {
    let socketBaseURL =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
      api.defaults.baseURL?.replace(/\/api$/, "") ||
      "http://localhost:5000";

    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      socketBaseURL = `http://${window.location.hostname}:5000`;
    }

    this.baseURL = socketBaseURL;
  }

  public connect(): Socket {
    if (this.socket) {
      return this.socket;
    }

    const token = getAccessToken();
    const auth = token ? { token } : {};

    this.socket = io(this.baseURL, {
      auth,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.io.on("reconnect", () => {
      audioManager.play("reconnect");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
