import { api } from "../client";

class MatchService {
  async getHistory(matchId: string) {
    const response = await api.get(`/matches/${matchId}/history`);
    return response.data;
  }

  async getReplay(matchId: string) {
    const response = await api.get(`/matches/${matchId}/replay`);
    return response.data;
  }

  async restartMatch(matchId: string) {
    const response = await api.post(`/matches/${matchId}/restart`);
    return response.data;
  }
}

export default new MatchService();