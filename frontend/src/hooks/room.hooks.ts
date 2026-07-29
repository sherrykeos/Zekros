import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "@/services/api/room.api";

import type {
  CreateRoomRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  StartMatchRequest,
  CloseRoomRequest,
  CreateRematchRequest,
  EndMatchRequest,
} from "@/types/room.types";

/**
 * ==========================================================
 * Query Keys
 * ==========================================================
 */

export const ROOM_QUERY_KEY = ["room"] as const;

/**
 * ==========================================================
 * Get Room
 * ==========================================================
 */

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: [...ROOM_QUERY_KEY, roomId],
    queryFn: () => roomApi.getRoom(roomId),

    enabled: !!roomId,

    retry: false,

    refetchOnWindowFocus: false,
  });
}

/**
 * ==========================================================
 * Create Room
 * ==========================================================
 */

export function useCreateRoom() {
  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomApi.createRoom(data),
  });
}

/**
 * ==========================================================
 * Regenerate Room Code
 * ==========================================================
 */

export function useRegenerateRoomCode() {
  return useMutation({
    mutationFn: (roomId: string) => roomApi.regenerateRoomCode(roomId),
  });
}

/**
 * ==========================================================
 * Join Room
 * ==========================================================
 */

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinRoomRequest) => roomApi.joinRoom(data),

    onSuccess: (room) => {
      queryClient.setQueryData([...ROOM_QUERY_KEY, room.id], room);
    },
  });
}

/**
 * ==========================================================
 * Leave Room
 * ==========================================================
 */

export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LeaveRoomRequest) => roomApi.leaveRoom(data),

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ROOM_QUERY_KEY,
      });
    },
  });
}

/**
 * ==========================================================
 * Start Match
 * ==========================================================
 */

export function useStartMatch() {
  return useMutation({
    mutationFn: (data: StartMatchRequest) => roomApi.startMatch(data),
  });
}

/**
 * ==========================================================
 * End Match
 * ==========================================================
 */

export function useEndMatch() {
  return useMutation({
    mutationFn: (data: EndMatchRequest) => roomApi.endMatch(data),
  });
}

/**
 * ==========================================================
 * Rematch
 * ==========================================================
 */

export function useCreateRematch() {
  return useMutation({
    mutationFn: (data: CreateRematchRequest) => roomApi.createRematch(data),
  });
}

/**
 * ==========================================================
 * Close Room
 * ==========================================================
 */

export function useCloseRoom() {
  return useMutation({
    mutationFn: (data: CloseRoomRequest) => roomApi.closeRoom(data),
  });
}
