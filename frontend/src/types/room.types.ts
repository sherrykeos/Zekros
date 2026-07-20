/**
 * ==========================================================
 * Requests
 * ==========================================================
 */

export interface CreateRoomRequest {
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

export interface JoinRoomRequest {
  roomId: string;
  playerName: string;
}

export interface LeaveRoomRequest {
  roomId: string;
}

export interface StartMatchRequest {
  roomId: string;
}

export interface EndMatchRequest {
  roomId: string;
}

export interface CreateRematchRequest {
  roomId: string;
}

export interface CloseRoomRequest {
  roomId: string;
}

/**
 * ==========================================================
 * Models
 * ==========================================================
 */

export interface RoomPlayer {
  id: string;
  userId: string | null;

  name: string;

  symbol: "X" | "O" | null;

  type: "HUMAN" | "BOT";

  status: "ONLINE" | "OFFLINE";

  socketId: string | null;

  joinedAt: string;

  metadata: Record<string, unknown>;
}

export interface RoomSettings {
  maxPlayers: number;

  allowSpectators: boolean;

  isPrivate: boolean;

  gameMode: string;
}

export interface Room {
  id: string;

  code: string;

  host: RoomPlayer;

  players: RoomPlayer[];

  spectators: RoomPlayer[];

  currentMatch: unknown | null;

  matches: unknown[];

  status: string;

  createdAt: string;

  settings: RoomSettings;

  metadata: Record<string, unknown>;
}

/**
 * ==========================================================
 * Responses
 * ==========================================================
 */

export interface RoomResponse {
  success: boolean;

  data: Room;

  error: string | null;
}