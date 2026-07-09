import api from "./client";
import { Message } from "../types";

export interface ConversationOtherUser {
  userId: string;
  firstName: string;
  mainPhoto: string | null;
  isOnline: boolean;
}

// otherUser/matchId sont renvoyés en frères de `data` (pas dans `data`),
// voir backend/src/routes/message.routes.ts.
export const fetchMessages = async (conversationId: string, page = 1, limit = 30) => {
  const { data } = await api.get<{
    success: boolean;
    data: Message[];
    otherUser: ConversationOtherUser | null;
    matchId: string;
  }>(`/messages/${conversationId}`, { params: { page, limit } });
  return { messages: data.data, otherUser: data.otherUser, matchId: data.matchId };
};

export const fetchUnreadCount = async () => {
  const { data } = await api.get<{ success: boolean; data: { count: number } }>(
    "/messages/unread-count"
  );
  return data.data;
};

export const sendMediaMessage = async (conversationId: string, file: { uri: string; name: string; type: string }) => {
  const form = new FormData();
  form.append("file", file as unknown as Blob);
  const { data } = await api.post(`/messages/${conversationId}/media`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};
