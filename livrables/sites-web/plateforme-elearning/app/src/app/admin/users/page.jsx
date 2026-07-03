'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import { ROLE_LABEL, ROLE_AVATAR, getInitials } from '@/lib/nav-config';
import { useGo } from '@/lib/navigation';
import { timeAgo } from '@/lib/time';

export default function AdminUsersPage() {
  const go = useGo();
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function changeRole(userId, role) {
    setSavingId(userId);
    const prev = users;
    setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x));
    try {
      const r = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (!r.ok) setUsers(prev);
    } catch {
      setUsers(prev);
    } finally {
      setSavingId(null);
    }
  }

  const students = users.filter(u => u.role === 'STUDENT').length;
  const teachers = users.filter(u => u.role === 'TEACHER').length;
  const admins = users.filter(u => u.role === 'ADMIN').length;

  return (
    <AppShell role="admin" active="ausers" go={go} search={false}
      title="Utilisateurs" subtitle="Gestion des comptes de la plateforme.">
      <div className="edu-content-narrow">
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="users" color="brand" label="Total" value={String(users.length)} />
          <StatCard icon="user" color="teal" label="Étudiants" value={String(students)} />
          <StatCard icon="briefcase" color="violet" label="Formateurs" value={String(teachers)} />
          <StatCard icon="shield" color="amber" label="Administrateurs" value={String(admins)} />
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row between card-pad" style={{ paddingBottom: 14 }}>
            <h3 className="h3">Tous les utilisateurs</h3>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Chargement…</div>
          ) : (
            <div className="edu-table-scroll">
              <table className="edu-table">
                <thead>
                  <tr><th>Utilisateur</th><th>Rôle</th><th>Cours suivis</th><th>Cours créés</th><th>Inscrit</th></tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const av = ROLE_AVATAR[u.role] || ROLE_AVATAR.STUDENT;
                    const isMe = u.id === session?.user?.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="row gap-10">
                            <div className="avatar avatar-sm" style={{ background: av.avColor, color: av.avInk }}>
                              {getInitials(u.name)}
                            </div>
                            <div className="col" style={{ lineHeight: 1.25 }}>
                              <span style={{ fontWeight: 650, fontSize: 13.5 }}>{u.name}{isMe && ' (toi)'}</span>
                              <span className="tiny muted">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select className="input" style={{ height: 34, padding: '0 10px', fontSize: 12.5, width: 140 }}
                            value={u.role} disabled={isMe || savingId === u.id}
                            onChange={(e) => changeRole(u.id, e.target.value)}>
                            {Object.entries(ROLE_LABEL).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="tnum">{u.enrollments}</td>
                        <td className="tnum">{u.taughtCourses}</td>
                        <td className="tiny muted">{timeAgo(u.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
