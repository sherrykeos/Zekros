export interface CreateRoomPayload {
  roomOptions: {
    host: {
      id: string;
      name: string;
    };
    settings: {
      gameMode: string;
    };
  };
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  playerId?: string;
}

export interface LeaveRoomPayload {
  roomCode: string;
  playerId: string;
}

export interface StartRoomPayload {
  roomCode: string;
  config: {
    boardSize: number;
    winLength: number;
    maxActivePieces: number;
    reclaimTokens: number;
    gameMode: string;
  };
  metadata: {
    gameType?: string;
    gameMode?: string;
    playerId?: string;
    source?: string;
  };
}

export interface PlayMovePayload {
  matchId: string;
  playerId: string;
  move: string;
  roomCode: string;
}
