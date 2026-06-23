'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Icon from './Icon';
import Logo from './Logo';
import { NAV, ROLE_USER, ROLE_LABEL, ROLE_AVATAR, getInitials } from '@/lib/nav-config';

export default function Sidebar({ role, active, go, mobileOpen, onClose }) {
  const router = useRouter();
  const { data: session } = useSession();
  const items = NAV[role] || NAV.student;

  const sessionRole = session?.user?.role || '';
  const avatarColors = ROLE_AVATAR[sessionRole] || ROLE_AVATAR.STUDENT;
  const user = {
    name: session?.user?.name || ROLE_USER[role]?.name || '',
    role: ROLE_LABEL[sessionRole] || ROLE_USER[role]?.role || '',
    initials: getInitials(session?.user?.name || ROLE_USER[role]?.name || ''),
    avColor: avatarColors.avColor,
    avInk: avatarColors.avInk,
  };
  const map = { teacher: 'teacher', tcourses: 'teacher', tstudents: 'teacher', trevenue: 'teacher', treviews: 'teacher',
    admin: 'admin', ausers: 'admin', acourses: 'admin', arevenue: 'admin',
    student: 'student', course: 'course', quiz: 'quiz', explore: 'student', certs: 'certificate', messages: 'student' };
  return (
    <>
      <div className={'edu-sidebar-overlay' + (mobileOpen ? ' is-open' : '')} onClick={onClose} />
      <aside className={'edu-sidebar' + (mobileOpen ? ' is-open' : '')}>
        <div style={{ padding: '20px 18px 14px' }}>
          <div className="between" style={{ display: 'flex' }}>
            <button onClick={() => go('landing')} style={{ display: 'flex' }}><Logo size={28} /></button>
            <button className="btn btn-ghost btn-icon btn-sm edu-mobile-only" onClick={onClose} aria-label="Fermer">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        <nav className="col gap-2 scroll-y" style={{ padding: '6px 12px', flex: 1 }}>
          <div className="edu-nav-label">Menu</div>
          {items.map(it => {
            const isActive = active === it.key;
            return (
              <button key={it.key}
                className={'edu-nav-item' + (isActive ? ' is-active' : '')}
                onClick={() => { go(map[it.key] || role); onClose && onClose(); }}>
                <Icon name={it.icon} size={20} stroke={isActive ? 2.3 : 2} />
                <span>{it.label}</span>
                {it.badge && <span className="edu-nav-badge">{it.badge}</span>}
              </button>
            );
          })}

          <div className="edu-nav-label" style={{ marginTop: 14 }}>Compte</div>
          <button className={'edu-nav-item' + (active === 'settings' ? ' is-active' : '')} onClick={() => router.push(`/${role}/settings`)}>
            <Icon name="settings" size={20} /><span>Réglages</span>
          </button>
          <button className="edu-nav-item" onClick={() => signOut({ callbackUrl: '/' })}>
            <Icon name="logout" size={20} /><span>Déconnexion</span>
          </button>
        </nav>

        {role === 'student' && (
          <div style={{ padding: '12px' }}>
            <div className="edu-streak">
              <div className="row gap-8" style={{ color: 'var(--amber)' }}>
                <Icon name="fire" size={18} fill /><span style={{ fontWeight: 750, fontSize: 14, color: 'var(--ink)' }}>Série de 7 jours</span>
              </div>
              <div className="row gap-4" style={{ marginTop: 10 }}>
                {['L','M','M','J','V','S','D'].map((d, i) => (
                  <div key={i} className="edu-streak-dot" data-on={i < 5 ? '1' : '0'}>{d}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div className="edu-userchip">
            <div className="avatar" style={{ background: user.avColor, color: user.avInk }}>{user.initials}</div>
            <div className="col" style={{ lineHeight: 1.2, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
              <span className="tiny muted">{user.role}</span>
            </div>
            <Icon name="chevR" size={16} style={{ color: 'var(--ink-4)', marginLeft: 'auto' }} />
          </div>
        </div>
      </aside>
    </>
  );
}
