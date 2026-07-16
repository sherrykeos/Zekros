import { api } from "../client";


class GameService {
  async getGameState(matchId: string) {
    const response = await api.get(`/games/${matchId}/state`);
    return response.data;
  }

  async playMove({
    matchId,
    playerId,
    move,
    roomCode,
  }: any) {
    const response = await api.post(
      `/games/${matchId}/move`,
      {
        playerId,
        move,
        roomCode,
      }
    );

    return response.data;
  }

  async resetGame(matchId: string) {
    const response = await api.post(
      `/games/${matchId}/reset`
    );

    return response.data;
  }
}

export default new GameService();

// class GameService {
//   async getGameState(matchId: string) {
//     const response = await api.get(`/games/${matchId}/state`);
//     return response.data;
//   }

//   async playMove(matchId: string, data: any) {
//     const response = await api.post(`/games/${matchId}/move`, data);
//     return response.data;
//   }

//   async resetGame(matchId: string) {
//     const response = await api.post(`/games/${matchId}/reset`);
//     return response.data;
//   }
// }

// export default new GameService();