'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import Stars from '@/components/Stars';
import StatCard from '@/components/StatCard';
import { EDU } from '@/lib/data';
import { useGo } from '@/lib/navigation';

export default function AdminPanel() {
  const go = useGo();
  const E = EDU;
  const [tab, setTab] = useState('users');

  // area chart points
  const data = [28, 33, 31, 40, 44, 42, 52, 58, 55, 66, 72, 84];
  const W = 520, H = 150, max = 90;
  const pts = data.map((d, i) => [i * (W / (data.length - 1)), H - (d / max) * H]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  const cats = [['Développement web', 38, 'brand'], ['Data & IA', 26, 'violet'], ['Design', 18, 'teal'], ['Marketing', 11, 'amber'], ['Langues', 7, 'green']];
  const queue = [
    { t: 'Rust pour les systèmes embarqués', a: 'Lucas Fontaine', when: 'il y a 2 h' },
    { t: 'Figma avancé : auto-layout', a: 'Marc Dubois', when: 'il y a 5 h' },
    { t: 'Growth hacking B2B', a: 'Thomas Roy', when: 'hier' },
  ];
  const statusBadge = { active: ['badge-green', 'Actif'], certified: ['badge-brand', 'Certifié'], risk: ['badge-rose', 'À risque'] };

  return (
    <AppShell role="admin" active="admin" go={go} search={false}
      title="Vue d'ensemble" subtitle="Santé de la plateforme · données en temps réel">
      <div className="edu-content-narrow">
        {/* stats */}
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="users" color="brand" label="Utilisateurs totaux" value="48 210" delta="+1 240" />
          <StatCard icon="layers" color="violet" label="Cours publiés" value="312" delta="+6" />
          <StatCard icon="trending" color="green" label="Revenu mensuel (MRR)" value="22 400 €" delta="+9%" />
          <StatCard icon="refresh" color="rose" label="Taux de remboursement" value="1,4%" delta="-0,3%" deltaUp={false} />
        </div>

        <div className="edu-cols">
          {/* LEFT */}
          <div className="col gap-22">
            {/* growth chart */}
            <div className="card card-pad">
              <div className="row between" style={{ marginBottom: 16 }}>
                <div className="col gap-2"><h3 className="h3">Croissance des utilisateurs</h3><span className="small muted">+72% sur les 12 derniers mois</span></div>
                <div className="edu-tabbar"><button className="is-active">12 mois</button><button>30 j</button></div>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0,1,2,3].map(i => <line key={i} x1="0" y1={i*H/3} x2={W} y2={i*H/3} stroke="var(--border)" strokeWidth="1" />)}
                <path d={area} fill="url(#adminGrad)" />
                <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => i === pts.length - 1 && <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill="var(--brand)" stroke="#fff" strokeWidth="2.5" />)}
              </svg>
            </div>

            {/* management tabs + table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="row between card-pad" style={{ paddingBottom: 14 }}>
                <div className="edu-tabbar">
                  <button className={tab === 'users' ? 'is-active' : ''} onClick={() => setTab('users')}>Utilisateurs</button>
                  <button className={tab === 'courses' ? 'is-active' : ''} onClick={() => setTab('courses')}>Cours</button>
                </div>
                <div className="input-icon edu-desktop-only" style={{ width: 200 }}>
                  <Icon name="search" /><input className="input" placeholder="Rechercher…" style={{ height: 38, background: 'var(--bg-2)', border: '1px solid transparent' }} />
                </div>
              </div>
              <div className="edu-table-scroll">
                {tab === 'users' ? (
                  <table className="edu-table">
                    <thead><tr><th>Utilisateur</th><th>Cours</th><th>Progression</th><th>Dernière activité</th><th>Statut</th><th></th></tr></thead>
                    <tbody>
                      {E.students.map((s, i) => (
                        <tr key={i}>
                          <td>
                            <div className="row gap-10">
                              <div className="avatar avatar-sm" style={{ background: `var(--${['brand','violet','teal','amber','green','rose'][i]}-soft)`, color: `var(--${['brand','violet','teal','amber','green','rose'][i]})` }}>{s.name.split(' ').map(w=>w[0]).join('')}</div>
                              <div className="col" style={{ lineHeight: 1.25 }}><span style={{ fontWeight: 650, fontSize: 13.5 }}>{s.name}</span><span className="tiny muted">{s.email}</span></div>
                            </div>
                          </td>
                          <td className="tnum">{s.courses}</td>
                          <td style={{ minWidth: 110 }}><div className="row gap-8"><div className="track" style={{ width: 56 }}><div className="track-fill" style={{ width: s.progress + '%' }} /></div><span className="tiny tnum muted">{s.progress}%</span></div></td>
                          <td className="muted small">{s.active}</td>
                          <td><span className={'badge badge-dot ' + statusBadge[s.status][0]}>{statusBadge[s.status][1]}</span></td>
                          <td>
                            <div className="row gap-8">
                              {s.status === 'risk'
                                ? <button className="btn btn-sm" style={{ background: 'var(--green-soft)', color: 'var(--green)', height: 28, fontSize: 12, padding: '0 10px', border: 'none', borderRadius: 6, fontWeight: 650, cursor: 'pointer', flexShrink: 0 }}>Activer</button>
                                : <button className="btn btn-sm" style={{ background: 'var(--rose-soft)', color: 'var(--rose)', height: 28, fontSize: 12, padding: '0 10px', border: 'none', borderRadius: 6, fontWeight: 650, cursor: 'pointer', flexShrink: 0 }}>Suspendre</button>
                              }
                              <button className="btn btn-ghost btn-icon btn-sm"><Icon name="dots" size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="edu-table">
                    <thead><tr><th>Cours</th><th>Auteur</th><th>Inscrits</th><th>Note</th><th>Statut</th></tr></thead>
                    <tbody>
                      {E.courses.map((c, i) => (
                        <tr key={i}>
                          <td style={{ maxWidth: 230 }}><span style={{ fontWeight: 650, fontSize: 13.5 }}>{c.title}</span></td>
                          <td className="small muted">{c.author}</td>
                          <td className="tnum">{c.students.toLocaleString('fr')}</td>
                          <td><Stars rating={c.rating} size={13} /></td>
                          <td><span className="badge badge-green badge-dot">Publié</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col gap-18">
            {/* system health */}
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 12 }}>État du système</h3>
              {[['API', 'Opérationnel', 'green'], ['Streaming vidéo', 'Opérationnel', 'green'], ['Paiements', 'Opérationnel', 'green'], ['Emails', 'Dégradé', 'amber']].map(([n, st, col], i) => (
                <div key={i} className="row between" style={{ padding: '9px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <span className="small" style={{ fontWeight: 600 }}>{n}</span>
                  <span className={'badge badge-dot badge-' + col}>{st}</span>
                </div>
              ))}
            </div>

            {/* moderation queue */}
            <div className="card card-pad">
              <div className="row between" style={{ marginBottom: 10 }}>
                <h3 className="h4">À valider</h3>
                <span className="badge badge-amber">{queue.length}</span>
              </div>
              <div className="col gap-12">
                {queue.map((q, i) => (
                  <div key={i} className="col gap-8" style={{ paddingBottom: 12, borderBottom: i < queue.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontWeight: 650, fontSize: 13.5, lineHeight: 1.3 }}>{q.t}</span>
                    <span className="tiny muted">{q.a} · {q.when}</span>
                    <div className="row gap-8">
                      <button className="btn btn-primary btn-sm" style={{ height: 30, flex: 1 }}><Icon name="check" size={15} />Valider</button>
                      <button className="btn btn-outline btn-sm" style={{ height: 30 }}>Voir</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* categories */}
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Cours par catégorie</h3>
              <div className="col gap-12">
                {cats.map(([n, v, col], i) => (
                  <div key={i} className="col gap-6">
                    <div className="row between"><span className="small" style={{ fontWeight: 600 }}>{n}</span><span className="tiny tnum muted">{v}%</span></div>
                    <div className="track"><div className="track-fill" style={{ width: v + '%', background: `var(--${col})` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
