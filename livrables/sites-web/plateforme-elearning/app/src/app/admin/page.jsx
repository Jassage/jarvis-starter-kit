'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import Stars from '@/components/Stars';
import StatCard from '@/components/StatCard';
import { ROLE_LABEL, ROLE_AVATAR, getInitials } from '@/lib/nav-config';
import { useGo } from '@/lib/navigation';
import { timeAgo } from '@/lib/time';

const CAT_COLORS = ['brand', 'violet', 'teal', 'amber', 'green', 'rose'];

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + ' k';
  return String(n);
}

export default function AdminPanel() {
  const go = useGo();
  const router = useRouter();
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const loadStats = () => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);

  async function runAction(id, action) {
    setActingId(id);
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      loadStats();
    } finally {
      setActingId(null);
    }
  }

  // SVG chart
  const chartData = stats?.monthlyEnrollments ?? Array(12).fill(0);
  const W = 520, H = 150;
  const maxVal = Math.max(...chartData, 1);
  const pts = chartData.map((d, i) => [i * (W / (chartData.length - 1)), H - (d / maxVal) * H]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  const queue = stats?.pendingCourses ?? [];

  const kpis = stats?.kpis;
  const users = stats?.users ?? [];
  const courses = stats?.courses ?? [];
  const cats = stats?.categoryDistribution ?? [];

  return (
    <AppShell role="admin" active="admin" go={go} search={false}
      title="Vue d'ensemble" subtitle="Santé de la plateforme · données en temps réel">
      <div className="edu-content-narrow">

        {/* KPI cards */}
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="users" color="brand" label="Utilisateurs" value={loading ? '…' : fmt(kpis?.totalUsers ?? 0)} />
          <StatCard icon="layers" color="violet" label="Cours publiés" value={loading ? '…' : String(kpis?.publishedCourses ?? 0)} />
          <StatCard icon="trending" color="green" label="Inscriptions totales" value={loading ? '…' : fmt(kpis?.totalEnrollments ?? 0)} />
          <StatCard icon="award" color="amber" label="Revenu estimé" value={loading ? '…' : `${(kpis?.totalRevenue ?? 0).toFixed(0)} €`} />
        </div>

        <div className="edu-cols">
          {/* LEFT */}
          <div className="col gap-22">
            {/* Inscriptions chart */}
            <div className="card card-pad">
              <div className="row between" style={{ marginBottom: 16 }}>
                <div className="col gap-2">
                  <h3 className="h3">Inscriptions</h3>
                  <span className="small muted">12 derniers mois</span>
                </div>
                <span className="badge badge-brand">{loading ? '…' : fmt(kpis?.totalEnrollments ?? 0)} au total</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map(i => (
                  <line key={i} x1="0" y1={i * H / 3} x2={W} y2={i * H / 3} stroke="var(--border)" strokeWidth="1" />
                ))}
                <path d={area} fill="url(#adminGrad)" />
                <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => i === pts.length - 1 && (
                  <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill="var(--brand)" stroke="#fff" strokeWidth="2.5" />
                ))}
              </svg>
            </div>

            {/* Users / Courses table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="row between card-pad" style={{ paddingBottom: 14 }}>
                <div className="edu-tabbar">
                  <button className={tab === 'users' ? 'is-active' : ''} onClick={() => setTab('users')}>Utilisateurs</button>
                  <button className={tab === 'courses' ? 'is-active' : ''} onClick={() => setTab('courses')}>Cours</button>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Chargement…</div>
              ) : (
                <div className="edu-table-scroll">
                  {tab === 'users' ? (
                    <table className="edu-table">
                      <thead>
                        <tr><th>Utilisateur</th><th>Rôle</th><th>Cours</th><th>Progression moy.</th></tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 24 }}>Aucun utilisateur</td></tr>
                        ) : users.map((u, i) => {
                          const av = ROLE_AVATAR[u.role] || ROLE_AVATAR.STUDENT;
                          return (
                            <tr key={u.id}>
                              <td>
                                <div className="row gap-10">
                                  <div className="avatar avatar-sm" style={{ background: av.avColor, color: av.avInk }}>
                                    {getInitials(u.name)}
                                  </div>
                                  <div className="col" style={{ lineHeight: 1.25 }}>
                                    <span style={{ fontWeight: 650, fontSize: 13.5 }}>{u.name}</span>
                                    <span className="tiny muted">{u.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td><span className="badge">{ROLE_LABEL[u.role] || u.role}</span></td>
                              <td className="tnum">{u.enrollments}</td>
                              <td style={{ minWidth: 120 }}>
                                <div className="row gap-8">
                                  <div className="track" style={{ width: 56 }}>
                                    <div className="track-fill" style={{ width: u.avgProgress + '%' }} />
                                  </div>
                                  <span className="tiny tnum muted">{u.avgProgress}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="edu-table">
                      <thead>
                        <tr><th>Cours</th><th>Auteur</th><th>Inscrits</th><th>Statut</th></tr>
                      </thead>
                      <tbody>
                        {courses.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 24 }}>Aucun cours publié</td></tr>
                        ) : courses.map(c => (
                          <tr key={c.id}>
                            <td style={{ maxWidth: 230 }}>
                              <span style={{ fontWeight: 650, fontSize: 13.5 }}>{c.title}</span>
                            </td>
                            <td className="small muted">{c.author?.name || '—'}</td>
                            <td className="tnum">{c._count?.enrollments ?? 0}</td>
                            <td><span className="badge badge-green badge-dot">Publié</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="col gap-18">
            {/* System health */}
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 12 }}>État du système</h3>
              {[['API', 'Opérationnel', 'green'], ['Base de données', 'Opérationnel', 'green'], ['Paiements', 'Opérationnel', 'green'], ['Emails', 'Non configuré', 'amber']].map(([n, st, col], i, arr) => (
                <div key={i} className="row between" style={{ padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span className="small" style={{ fontWeight: 600 }}>{n}</span>
                  <span className={'badge badge-dot badge-' + col}>{st}</span>
                </div>
              ))}
            </div>

            {/* Moderation queue */}
            <div className="card card-pad">
              <div className="row between" style={{ marginBottom: 10 }}>
                <h3 className="h4">À valider</h3>
                {queue.length > 0 && <span className="badge badge-amber">{queue.length}</span>}
              </div>
              {loading ? (
                <div className="small muted">Chargement…</div>
              ) : queue.length === 0 ? (
                <div className="small muted">Aucun cours en attente de validation.</div>
              ) : (
                <div className="col gap-12">
                  {queue.map((q, i) => (
                    <div key={q.id} className="col gap-8" style={{ paddingBottom: 12, borderBottom: i < queue.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontWeight: 650, fontSize: 13.5, lineHeight: 1.3 }}>{q.title}</span>
                      <span className="tiny muted">{q.author} · {timeAgo(q.submittedAt)}</span>
                      <div className="row gap-8">
                        <button className="btn btn-primary btn-sm" style={{ height: 30, flex: 1 }} disabled={actingId === q.id}
                          onClick={() => runAction(q.id, 'approve')}>
                          <Icon name="check" size={15} />Valider
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ height: 30 }} disabled={actingId === q.id}
                          onClick={() => runAction(q.id, 'reject')}>
                          Rejeter
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ height: 30 }}
                          onClick={() => router.push(`/course?id=${q.id}`)}>
                          Voir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Cours par catégorie</h3>
              {loading ? (
                <div className="small muted">Chargement…</div>
              ) : cats.length === 0 ? (
                <div className="small muted">Aucun cours publié</div>
              ) : (
                <div className="col gap-12">
                  {cats.map(({ category, pct }, i) => (
                    <div key={category} className="col gap-6">
                      <div className="row between">
                        <span className="small" style={{ fontWeight: 600 }}>{category}</span>
                        <span className="tiny tnum muted">{pct}%</span>
                      </div>
                      <div className="track">
                        <div className="track-fill" style={{ width: pct + '%', background: `var(--${CAT_COLORS[i] || 'brand'})` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
