"use client";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import api from "@/lib/api";
import { useSocketStore } from "@/store/socket.store";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "À l'instant";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} j`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { socket } = useSocketStore();

  const load = async () => {
    try {
      const r = await api.get("/notifications?limit=15");
      const data: Notif[] = r.data.data ?? [];
      setNotifs(data);
      setUnread(data.filter((n) => !n.isRead).length);
    } catch { /* silently fail */ }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { setUnread((n) => n + 1); load(); };
    socket.on("notification:new", handler);
    return () => { socket.off("notification:new", handler); };
  }, [socket]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifs((n) => n.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } catch { /* silently fail */ }
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) markAllRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
        <Bell size={20} className="text-gray-500" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "#D4537E" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 w-80 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-700">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-pink-400 hover:underline">
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">Aucune notification</div>
            ) : (
              notifs.map((n) => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3 border-b border-gray-50 hover:bg-gray-50 transition-colors" style={{ background: n.isRead ? "white" : "#FBEAF0" }}>
                  <span className="text-lg mt-0.5">
                    {n.type === "NEW_MATCH" ? "❤️" : n.type === "NEW_MESSAGE" ? "💬" : "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
