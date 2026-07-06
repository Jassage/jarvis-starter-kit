'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Icon from './Icon';
import { ROLE_USER, ROLE_AVATAR, getInitials } from '@/lib/nav-config';
import { timeAgo } from '@/lib/time';

export default function Topbar({ role, go, title, subtitle, search = true, onMenu }) {
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const fallback = ROLE_USER[role] || ROLE_USER.student;
  const avatar = ROLE_AVATAR[session?.user?.role] || fallback;
  const user = {
    initials: session?.user?.name ? getInitials(session.user.name) : fallback.initials,
    avColor: avatar.avColor,
    avInk: avatar.avInk,
  };
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setNotifOpen(false); }};
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const loadNotifications = () => {
    fetch('/api/notifications').then(r => r.json()).then(data => {
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(data.unreadCount ?? 0);
    }).catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    fetch('/api/notifications', { method: 'PATCH' }).then(() => {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }).catch(() => {});
  };
  return (
    <header className="edu-topbar" ref={ref}>
      <div className="row gap-12" style={{ minWidth: 0 }}>
        <button className="btn btn-ghost btn-icon btn-sm edu-mobile-only" onClick={onMenu} aria-label="Menu">
          <Icon name="menu" size={20} />
        </button>
        <div className="col" style={{ minWidth: 0 }}>
          <h1 className="h3" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
          {subtitle && <span className="tiny muted edu-desktop-only" style={{ marginTop: 1 }}>{subtitle}</span>}
        </div>
      </div>

      <div className="row gap-10" style={{ marginLeft: 'auto' }}>
        {search && (
          <div className="input-icon edu-topsearch edu-desktop-only">
            <Icon name="search" />
            <input className="input" placeholder="Rechercher un cours, un sujet…" style={{ height: 42, width: 300, background: 'var(--bg-2)', border: '1px solid transparent' }} />
          </div>
        )}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-outline btn-icon" onClick={() => setNotifOpen(o => !o)} style={{ position: 'relative' }} aria-label="Notifications">
            <Icon name="bell" size={19} />
            {unreadCount > 0 && <span className="edu-notif-dot" />}
          </button>
          {notifOpen && (
            <div className="edu-menu anim-pop" style={{ right: 0, width: 340 }}>
              <div className="edu-menu-head between" style={{ display: 'flex' }}>
                <span>Notifications</span>
                {unreadCount > 0 && <span className="badge badge-brand">{unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="small muted" style={{ padding: '20px 16px', textAlign: 'center' }}>Aucune notification</div>
              ) : notifications.map((n) => (
                <div key={n.id} className="edu-notif-item" style={{ opacity: n.read ? 0.6 : 1 }}>
                  <div className={'edu-notif-ic edu-ic-' + n.color}><Icon name={n.icon} size={17} /></div>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{n.title}</span>
                    <span className="tiny muted">{n.body}</span>
                  </div>
                  <span className="tiny muted" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
                </div>
              ))}
              {unreadCount > 0 && (
                <button className="edu-menu-foot" onClick={markAllRead}>Tout marquer comme lu</button>
              )}
            </div>
          )}
        </div>

        <div className="avatar edu-desktop-only" style={{ background: user.avColor, color: user.avInk }}>{user.initials}</div>
      </div>
    </header>
  );
}
