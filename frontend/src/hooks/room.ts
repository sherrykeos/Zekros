import { useMutation, useQuery } from "@tanstack/react-query";

import roomService from "../services/api/roomService";

export function useCreateRoom() {
  return useMutation({
    mutationFn: roomService.createRoom,
  });
}

export function useGetRoom(roomCode: string) {
  return useQuery({
    queryKey: ["room", roomCode],
    queryFn: () => roomService.getRoom(roomCode),
    enabled: !!roomCode,
  });
}

export function useJoinRoom() {
  return useMutation({
    mutationFn: roomService.joinRoom,
  });
}

export function useLeaveRoom() {
  return useMutation({
    mutationFn: roomService.leaveRoom,
  });
}

export function useStartRoom() {
  return useMutation({
    mutationFn: roomService.startRoom,
  });
}
