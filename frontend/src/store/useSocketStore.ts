import { create } from "zustand";
import { socketService } from "@/services/socket.service";
import { Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  connect: () => {
    const socket = socketService.connect();

    // We bind these listeners to update Zustand state
    socket.on("connect", () => set({ isConnected: true, socket }));
    socket.on("disconnect", () => set({ isConnected: false }));

    // Initialize immediately just in case it's already connected
    set({ socket, isConnected: socket.connected });
  },
  disconnect: () => {
    socketService.disconnect();
    set({ socket: null, isConnected: false });
  },
}));
