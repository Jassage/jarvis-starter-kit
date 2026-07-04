'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import { useGo } from '@/lib/navigation';

export default function AdminCoursesPage() {
  const go = useGo();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetch('/api/admin/courses').then(r => r.json()).then(data => {
      setCourses(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function runAction(id, action, nextStatus) {
    setSavingId(id);
    const prev = courses;
    setCourses(cs => cs.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    try {
      const r = await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!r.ok) setCourses(prev);
    } catch {
      setCourses(prev);
    } finally {
      setSavingId(null);
    }
  }

  const published = courses.filter(c => c.status === 'PUBLISHED').length;
  const pending = courses.filter(c => c.status === 'PENDING_REVIEW').length;
  const totalEnrollments = courses.reduce((s, c) => s + (c._count?.enrollments || 0), 0);

  return (
    <AppShell role="admin" active="acourses" go={go} search={false}
      title="Cours" subtitle="Modération des cours de la plateforme.">
      <div className="edu-content-narrow">
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="layers" color="brand" label="Total" value={String(courses.length)} />
          <StatCard icon="checkCircle" color="green" label="Publiés" value={String(published)} />
          <StatCard icon="flag" color="amber" label="En attente de validation" value={String(pending)} />
          <StatCard icon="users" color="violet" label="Inscriptions" value={String(totalEnrollments)} />
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row between card-pad" style={{ paddingBottom: 14 }}>
            <h3 className="h3">Tous les cours</h3>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Chargement…</div>
          ) : courses.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Aucun cours.</div>
          ) : (
            <div className="edu-table-scroll">
              <table className="edu-table">
                <thead>
                  <tr><th>Cours</th><th>Auteur</th><th>Inscrits</th><th>Avis</th><th>Statut</th><th></th></tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td style={{ maxWidth: 260 }}>
                        <div className="row gap-10">
                          <div style={{
                            width: 44, height: 32, borderRadius: 7, flexShrink: 0,
                            background: `linear-gradient(140deg, var(--${c.color || 'brand'}), var(--${c.color || 'brand'}-deep, var(--brand)))`,
                          }} />
                          <span style={{ fontWeight: 650, fontSize: 13.5 }}>{c.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="small muted">{c.author?.name || '—'}</span>
                      </td>
                      <td className="tnum">{c._count?.enrollments ?? 0}</td>
                      <td className="tnum">{c._count?.reviews ?? 0}</td>
                      <td>
                        <span className={'badge ' + (c.status === 'PUBLISHED' ? 'badge-green badge-dot' : c.status === 'PENDING_REVIEW' ? 'badge-amber badge-dot' : '')}
                          style={c.status === 'DRAFT' ? { background: 'var(--bg-2)', color: 'var(--ink-3)' } : undefined}>
                          {c.status === 'PUBLISHED' ? 'Publié' : c.status === 'PENDING_REVIEW' ? 'En validation' : 'Brouillon'}
                        </span>
                      </td>
                      <td>
                        <div className="row gap-8">
                          {c.status === 'PUBLISHED' && (
                            <button className="btn btn-outline btn-sm" disabled={savingId === c.id}
                              onClick={() => runAction(c.id, 'unpublish', 'DRAFT')}>Dépublier</button>
                          )}
                          {c.status === 'PENDING_REVIEW' && (
                            <>
                              <button className="btn btn-primary btn-sm" disabled={savingId === c.id}
                                onClick={() => runAction(c.id, 'approve', 'PUBLISHED')}>Valider</button>
                              <button className="btn btn-outline btn-sm" disabled={savingId === c.id}
                                onClick={() => runAction(c.id, 'reject', 'DRAFT')}>Rejeter</button>
                            </>
                          )}
                          {c.status === 'DRAFT' && <span className="tiny muted">En attente du formateur</span>}
                        </div>
                      </td>
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
