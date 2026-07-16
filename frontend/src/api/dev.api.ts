import { api } from "@/services/client";

export const devApi = {
  async health() {
    const response = await api.get("/health");
    return response.data;
  },

  async room(roomCode: string) {
    const response = await api.get(`/rooms/${roomCode}`);
    return response.data;
  },

  async gameState(matchId: string) {
    const response = await api.get(`/games/${matchId}/state`);
    return response.data;
  },

  async match(matchId: string) {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  async matchHistory(matchId: string) {
    const response = await api.get(`/matches/${matchId}/history`);
    return response.data;
  },

  async replay(matchId: string) {
    const response = await api.get(`/matches/${matchId}/replay`);
    return response.data;
  },
};
