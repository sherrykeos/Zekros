import { io, Socket } from "socket.io-client";
import { api, getAccessToken } from "./client";

class SocketService {
  private socket: Socket | null = null;
  private baseURL: string;

  constructor() {
    // Determine the base URL from the API client or environment. Strip /api if it exists.
    const apiBaseURL =
      api.defaults.baseURL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000";
    this.baseURL = apiBaseURL.replace(/\/api$/, "");
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
