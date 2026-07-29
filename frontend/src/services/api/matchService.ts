import { api } from "../client";

export interface MatchHistoryItem {
  id: string;
  status: string;
  result: string | null;
  gameMode: string;
  gameType: string;
  boardSize: number;
  winLength: number;
  maxActivePieces: number;
  reclaimTokens: number;
  startedAt: string | null;
  endedAt: string | null;
  durationMs: number | null;
  totalMoves: number;
  isRated: boolean;
  createdAt: string;
  participants: Array<{
    id: string;
    matchId: string;
    userId: string | null;
    guestName: string | null;
    symbol: "X" | "O";
    isWinner: boolean;
    ratingBefore?: number | null;
    ratingAfter?: number | null;
    ratingChange?: number | null;
    user?: {
      id?: string;
      username?: string;
      displayName?: string;
      avatar?: string | null;
      avatarUrl?: string | null;
    } | null;
  }>;
  moves?: Array<{
    id: string;
    moveNumber: number;
    row: number;
    column: number;
    removedRow?: number | null;
    removedColumn?: number | null;
    createdAt: string;
    playerId: string;
  }>;
}

class MatchService {
  async listMatches(params?: { userId?: string; limit?: number }) {
    const response = await api.get("/matches", { params });
    return response.data;
  }

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

  async deleteMatch(matchId: string, params?: { userId?: string }) {
    const response = await api.delete(`/matches/${matchId}`, { params });
    return response.data;
  }
}

export default new MatchService();
