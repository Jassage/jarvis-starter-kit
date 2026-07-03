'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import { useGo } from '@/lib/navigation';

export default function AdminRevenuePage() {
  const go = useGo();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/revenue').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const monthly = data?.monthly ?? Array(12).fill(0);
  const topCourses = data?.topCourses ?? [];
  const W = 520, H = 150;
  const maxVal = Math.max(...monthly, 1);
  const pts = monthly.map((v, i) => [i * (W / (monthly.length - 1)), H - (v / maxVal) * H]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  const thisMonth = monthly[monthly.length - 1] ?? 0;
  const lastMonth = monthly[monthly.length - 2] ?? 0;
  const trend = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  return (
    <AppShell role="admin" active="arevenue" go={go} search={false}
      title="Revenus" subtitle="Revenu estimé de la plateforme.">
      <div className="edu-content-narrow">
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="award" color="brand" label="Revenu total" value={loading ? '…' : `${(data?.totalRevenue ?? 0).toFixed(0)} €`} />
          <StatCard icon="trending" color="green" label="Ce mois-ci" value={loading ? '…' : `${thisMonth.toFixed(0)} €`} />
          <StatCard icon="chart" color="violet" label="Évolution" value={loading ? '…' : (trend === null ? '—' : `${trend > 0 ? '+' : ''}${trend}%`)} />
          <StatCard icon="layers" color="amber" label="Cours monétisés" value={loading ? '…' : String(topCourses.filter(c => c.revenue > 0).length)} />
        </div>

        <div className="card card-pad" style={{ marginBottom: 22 }}>
          <div className="row between" style={{ marginBottom: 16 }}>
            <div className="col gap-2">
              <h3 className="h3">Revenu mensuel</h3>
              <span className="small muted">12 derniers mois · toute la plateforme</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map(i => (
              <line key={i} x1="0" y1={i * H / 3} x2={W} y2={i * H / 3} stroke="var(--border)" strokeWidth="1" />
            ))}
            <path d={area} fill="url(#adminRevGrad)" />
            <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => i === pts.length - 1 && (
              <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill="var(--brand)" stroke="#fff" strokeWidth="2.5" />
            ))}
          </svg>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row between card-pad" style={{ paddingBottom: 14 }}>
            <h3 className="h3">Top cours par revenu</h3>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Chargement…</div>
          ) : topCourses.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Aucun cours.</div>
          ) : (
            <div className="edu-table-scroll">
              <table className="edu-table">
                <thead>
                  <tr><th>Cours</th><th>Auteur</th><th>Prix</th><th>Étudiants</th><th>Revenu</th></tr>
                </thead>
                <tbody>
                  {topCourses.map(c => (
                    <tr key={c.id}>
                      <td style={{ maxWidth: 240 }}>
                        <div className="row gap-10">
                          <div style={{
                            width: 44, height: 32, borderRadius: 7, flexShrink: 0,
                            background: `linear-gradient(140deg, var(--${c.color || 'brand'}), var(--${c.color || 'brand'}-deep, var(--brand)))`,
                          }} />
                          <span style={{ fontWeight: 650, fontSize: 13.5 }}>{c.title}</span>
                        </div>
                      </td>
                      <td className="small muted">{c.author || '—'}</td>
                      <td style={{ fontWeight: 650 }}>{c.price === 0 ? 'Gratuit' : `${c.price} €`}</td>
                      <td className="tnum">{c.students}</td>
                      <td className="tnum" style={{ fontWeight: 750, color: 'var(--brand)' }}>{c.revenue.toFixed(0)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
