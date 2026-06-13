'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { ROLE_USER } from '@/lib/nav-config';
import { notifications } from '@/lib/data';

export default function Topbar({ role, go, title, subtitle, search = true, onMenu }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const user = ROLE_USER[role] || ROLE_USER.student;
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setNotifOpen(false); setRoleOpen(false); } };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
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

        {/* Role switcher */}
        <div style={{ position: 'relative' }}>
          <button className="chip" onClick={() => { setRoleOpen(o => !o); setNotifOpen(false); }} style={{ height: 42 }}>
            <Icon name={role === 'student' ? 'user' : role === 'teacher' ? 'briefcase' : 'shield'} size={17} />
            <span className="edu-desktop-only">{user.role}</span>
            <Icon name="chevD" size={15} />
          </button>
          {roleOpen && (
            <div className="edu-menu anim-pop" style={{ right: 0, width: 220 }}>
              <div className="edu-menu-head">Changer de vue (démo)</div>
              {[['student','user','Espace étudiant'],['teacher','briefcase','Espace formateur'],['admin','shield','Espace admin']].map(([r, ic, lbl]) => (
                <button key={r} className={'edu-menu-item' + (role === r ? ' is-active' : '')} onClick={() => { go(r); setRoleOpen(false); }}>
                  <Icon name={ic} size={18} /><span>{lbl}</span>
                  {role === r && <Icon name="check" size={16} style={{ marginLeft: 'auto', color: 'var(--brand)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-outline btn-icon" onClick={() => { setNotifOpen(o => !o); setRoleOpen(false); }} style={{ position: 'relative' }} aria-label="Notifications">
            <Icon name="bell" size={19} />
            <span className="edu-notif-dot" />
          </button>
          {notifOpen && (
            <div className="edu-menu anim-pop" style={{ right: 0, width: 340 }}>
              <div className="edu-menu-head between" style={{ display: 'flex' }}>
                <span>Notifications</span><span className="badge badge-brand">4 nouvelles</span>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="edu-notif-item">
                  <div className={'edu-notif-ic edu-ic-' + n.color}><Icon name={n.icon} size={17} /></div>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{n.title}</span>
                    <span className="tiny muted">{n.body}</span>
                  </div>
                  <span className="tiny muted" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>{n.time}</span>
                </div>
              ))}
              <button className="edu-menu-foot">Tout marquer comme lu</button>
            </div>
          )}
        </div>

        <div className="avatar edu-desktop-only" style={{ background: user.avColor, color: user.avInk }}>{user.initials}</div>
      </div>
    </header>
  );
}
