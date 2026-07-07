'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import api from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: { orderId?: string } | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    api
      .get('/notifications')
      .then((r) => setNotifications(r.data.data.notifications))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      api.patch(`/notifications/${n.id}/read`).catch(() => {});
    }
    setOpen(false);
    if (n.data?.orderId) router.push(`/dashboard/orders/${n.data.orderId}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--color-line-2)' }}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--color-danger)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 card overflow-hidden"
          style={{ width: 340, maxHeight: 420, overflowY: 'auto', zIndex: 20 }}
        >
          <div className="px-4 py-3 border-b font-bold text-sm" style={{ borderColor: 'var(--color-line)' }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--color-ink-3)' }}>Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className="w-full text-left px-4 py-3 border-b transition-colors"
                style={{
                  borderColor: 'var(--color-line)',
                  background: n.isRead ? 'transparent' : 'var(--color-primary-soft)',
                }}
              >
                <p className="text-sm font-semibold mb-0.5">{n.title}</p>
                <p className="text-xs mb-1" style={{ color: 'var(--color-ink-2)' }}>{n.message}</p>
                <p className="text-[11px]" style={{ color: 'var(--color-ink-3)' }}>{timeAgo(n.createdAt)}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
