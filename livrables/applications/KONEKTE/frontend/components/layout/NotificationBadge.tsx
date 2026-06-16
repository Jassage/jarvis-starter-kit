"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useSocketStore } from "@/store/socket.store";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function NotificationBadge() {
  const { token } = useAuthStore();
  const { connect, unreadMessages, clearUnread, setUnread, socket } = useSocketStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) return;
    connect(token);
    api.get("/messages/unread-count")
      .then((r) => {
        const count = r.data.data?.count ?? 0;
        if (count > 0) setUnread(count);
      })
      .catch(() => {});
  }, [token, connect, setUnread]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { type: string; senderName?: string }) => {
      if (data.type === "NEW_MESSAGE" && !pathname.includes("/messages/")) {
        toast(`💬 Message de ${data.senderName ?? "quelqu'un"}`, {
          duration: 4000,
          position: "top-center",
          style: { background: "#D4537E", color: "white", fontWeight: 500 },
        });
      }
    };
    socket.on("notification:new", handler);
    return () => { socket.off("notification:new", handler); };
  }, [socket, pathname]);

  useEffect(() => {
    if (pathname.includes("/messages/")) clearUnread();
  }, [pathname, clearUnread]);

  if (unreadMessages === 0) return null;

  return (
    <span
      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
      style={{ background: "#D4537E" }}
    >
      {unreadMessages > 9 ? "9+" : unreadMessages}
    </span>
  );
}
