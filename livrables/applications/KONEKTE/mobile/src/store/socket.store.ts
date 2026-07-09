import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { env } from "../config/env";

interface SocketState {
  socket: Socket | null;
  unreadMessages: number;
  connect: (token: string) => void;
  disconnect: () => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  setUnread: (count: number) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  unreadMessages: 0,

  connect: (token: string) => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io(env.socketUrl, { auth: { token } });

    socket.on("notification:new", (data: { type: string }) => {
      if (data.type === "NEW_MESSAGE") {
        set((s) => ({ unreadMessages: s.unreadMessages + 1 }));
      }
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, unreadMessages: 0 });
  },

  incrementUnread: () => set((s) => ({ unreadMessages: s.unreadMessages + 1 })),
  clearUnread: () => set({ unreadMessages: 0 }),
  setUnread: (count: number) => set({ unreadMessages: count }),
}));
