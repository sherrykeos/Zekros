import { api } from "../client";

class RoomService {
  async createRoom(data: any) {
    const response = await api.post("/rooms", { roomOptions: data });
    return response.data;
  }

  async getRoom(roomCode: string) {
    const response = await api.get(`/rooms/${roomCode}`);
    return response.data;
  }

  async joinRoom({
    roomCode,
    playerName,
    playerId,
  }: {
    roomCode: string;
    playerName: string;
    playerId?: string;
  }) {
    const response = await api.post(`/rooms/${roomCode}/join`, {
      playerInfo: {
        id: playerId ?? `player_${Date.now()}`,
        name: playerName,
      },
    });

    return response.data;
  }

  async leaveRoom({
    roomCode,
    playerId,
  }: {
    roomCode: string;
    playerId: string;
  }) {
    const response = await api.post(`/rooms/${roomCode}/leave`, {
      playerId,
    });

    return response.data;
  }

  async startRoom({ roomCode, config, metadata }: any) {
    const response = await api.post(`/rooms/${roomCode}/start`, {
      config,
      metadata,
    });

    return response.data;
  }
}

export default new RoomService();
