import api from "./client";
import { LikeReceived, MatchListItem, SwipeAction, SwipeResult } from "../types";

export const sendSwipe = async (receiverId: string, action: SwipeAction) => {
  const { data } = await api.post<{ success: boolean; data: SwipeResult }>("/swipes", {
    receiverId,
    action,
  });
  return data.data;
};

export const undoLastSwipe = async () => {
  const { data } = await api.delete<{ success: boolean; data: { undoneUserId: string; firstName?: string } }>(
    "/swipes/undo"
  );
  return data.data;
};

export const fetchMatches = async () => {
  const { data } = await api.get<{ success: boolean; data: MatchListItem[] }>("/swipes/matches");
  return data.data;
};

export const fetchLikesReceived = async () => {
  const { data } = await api.get<{ success: boolean; data: LikeReceived[] }>("/swipes/likes-received");
  return data.data;
};

export const fetchSuperLikesRemaining = async () => {
  const { data } = await api.get<{ success: boolean; data: { remaining: number } }>(
    "/swipes/super-likes-remaining"
  );
  return data.data;
};

export const activateBoost = async () => {
  const { data } = await api.post<{ success: boolean; data: { boostedUntil: string } }>("/swipes/boost");
  return data.data;
};
