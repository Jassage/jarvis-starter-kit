'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import Stars from '@/components/Stars';
import StatCard from '@/components/StatCard';
import { useGo } from '@/lib/navigation';
import { timeAgo } from '@/lib/time';

export default function TeacherReviewsPage() {
  const go = useGo();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teacher/reviews').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const reviews = data?.reviews ?? [];
  const courseAverages = data?.courseAverages ?? [];

  return (
    <AppShell role="teacher" active="treviews" go={go} search={false}
      title="Avis" subtitle="Ce que tes étudiants pensent de tes cours.">
      <div className="edu-content-narrow">
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="star" color="amber" label="Note moyenne" value={loading ? '…' : String(data?.overallAvg ?? 0)} />
          <StatCard icon="users" color="brand" label="Avis reçus" value={loading ? '…' : String(data?.total ?? 0)} />
          <StatCard icon="layers" color="violet" label="Cours notés" value={loading ? '…' : String(courseAverages.length)} />
          <StatCard icon="trending" color="green" label="Meilleur cours"
            value={loading ? '…' : (courseAverages.length ? String(Math.max(...courseAverages.map(c => c.avg))) : '—')} />
        </div>

        <div className="edu-cols">
          <div className="col gap-22">
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="row between card-pad" style={{ paddingBottom: 14 }}>
                <h3 className="h3">Tous les avis</h3>
              </div>
              {loading ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Chargement…</div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Aucun avis pour l'instant.</div>
              ) : (
                <div className="col" style={{ padding: '0 20px 16px' }}>
                  {reviews.map((r, i) => (
                    <div key={r.id} className="col gap-6" style={{
                      padding: '14px 0',
                      borderBottom: i < reviews.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div className="row between">
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.user?.name}</span>
                        <Stars rating={r.rating} size={13} />
                      </div>
                      <span className="tiny muted">{r.course?.title} · {timeAgo(r.createdAt)}</span>
                      {r.comment && <p className="small" style={{ marginTop: 4 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col gap-18">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 12 }}>Note par cours</h3>
              {loading ? (
                <div className="small muted">Chargement…</div>
              ) : courseAverages.length === 0 ? (
                <div className="small muted">Aucun avis pour l'instant.</div>
              ) : (
                <div className="col gap-12">
                  {courseAverages.map((c, i) => (
                    <div key={i} className="col gap-6">
                      <div className="row between">
                        <span className="small" style={{ fontWeight: 600 }}>{c.title}</span>
                        <Stars rating={c.avg} size={12} />
                      </div>
                      <div className="track">
                        <div className="track-fill" style={{ width: (c.avg / 5 * 100) + '%', background: `var(--${c.color || 'brand'})` }} />
                      </div>
                      <span className="tiny muted">{c.count} avis</span>
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
