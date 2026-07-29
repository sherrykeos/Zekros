import { api } from "@/services/client";

import type {
  CloseRoomRequest,
  CreateRematchRequest,
  CreateRoomRequest,
  EndMatchRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  RoomResponse,
  StartMatchRequest,
} from "@/types/room.types";

export const roomApi = {
  /**
   * ----------------------------------------------------------
   * Create Room
   * POST /rooms
   * ----------------------------------------------------------
   */
  async createRoom(data: CreateRoomRequest) {
    const response = await api.post<RoomResponse>("/rooms", data);

    return response.data.data;
  },

  /**
   * ----------------------------------------------------------
   * Regenerate Room Code
   * POST /rooms/:roomId/regenerate
   * ----------------------------------------------------------
   */
  async regenerateRoomCode(roomId: string) {
    const response = await api.post<RoomResponse>(
      `/rooms/${roomId}/regenerate`,
    );

    return response.data.data;
  },

  /**
   * ----------------------------------------------------------
   * Get Room
   * GET /rooms/:roomId
   * ----------------------------------------------------------
   */
  async getRoom(roomId: string) {
    const response = await api.get<RoomResponse>(`/rooms/${roomId}`);

    return response.data.data;
  },

  /**
   * ----------------------------------------------------------
   * Join Room
   * POST /rooms/:roomId/join
   * ----------------------------------------------------------
   */
  async joinRoom(data: JoinRoomRequest) {
    const response = await api.post<RoomResponse>(
      `/rooms/${data.roomId}/join`,
      data,
    );

    return response.data.data;
  },

  /**
   * ----------------------------------------------------------
   * Leave Room
   * POST /rooms/:roomId/leave
   * ----------------------------------------------------------
   */
  async leaveRoom(data: LeaveRoomRequest): Promise<void> {
    await api.post(`/rooms/${data.roomId}/leave`, data);
  },

  /**
   * ----------------------------------------------------------
   * Start Match
   * POST /rooms/:roomId/start
   * ----------------------------------------------------------
   */
  async startMatch(data: StartMatchRequest) {
    const response = await api.post(`/rooms/${data.roomId}/start`, data);
    return response.data.data;
  },

  /**
   * ----------------------------------------------------------
   * End Match
   * POST /rooms/:roomId/end
   * ----------------------------------------------------------
   */
  async endMatch(data: EndMatchRequest): Promise<void> {
    await api.post(`/rooms/${data.roomId}/end`, data);
  },

  /**
   * ----------------------------------------------------------
   * Create Rematch
   * POST /rooms/:roomId/rematch
   * ----------------------------------------------------------
   */
  async createRematch(data: CreateRematchRequest): Promise<void> {
    await api.post(`/rooms/${data.roomId}/rematch`, data);
  },

  /**
   * ----------------------------------------------------------
   * Close Room
   * DELETE /rooms/:roomId
   * ----------------------------------------------------------
   */
  async closeRoom(data: CloseRoomRequest): Promise<void> {
    await api.delete(`/rooms/${data.roomId}`);
  },
};
