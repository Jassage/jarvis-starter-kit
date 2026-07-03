'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import { useGo } from '@/lib/navigation';
import { timeAgo } from '@/lib/time';

const COLORS = ['brand', 'violet', 'teal', 'amber', 'green', 'rose'];

export default function TeacherStudentsPage() {
  const go = useGo();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactingId, setContactingId] = useState(null);

  useEffect(() => {
    fetch('/api/teacher/students').then(r => r.json()).then(data => {
      setEnrollments(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const uniqueStudents = new Set(enrollments.map(e => e.user.id)).size;
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
    : 0;
  const completedCount = enrollments.filter(e => e.progress === 100).length;

  async function contactStudent(studentId, courseId) {
    setContactingId(studentId);
    try {
      const r = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: studentId, courseId }),
      });
      const data = await r.json();
      if (r.ok && data.id) router.push(`/teacher/messages?c=${data.id}`);
    } catch {
      // silencieux — le bouton reste utilisable, l'utilisateur peut réessayer
    } finally {
      setContactingId(null);
    }
  }

  return (
    <AppShell role="teacher" active="tstudents" go={go} search={false}
      title="Étudiants" subtitle="Toutes les inscriptions à tes cours.">
      <div className="edu-content-narrow">
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="users" color="brand" label="Étudiants uniques" value={String(uniqueStudents)} />
          <StatCard icon="layers" color="violet" label="Inscriptions" value={String(enrollments.length)} />
          <StatCard icon="trending" color="amber" label="Progression moy." value={`${avgProgress}%`} />
          <StatCard icon="award" color="green" label="Cours terminés" value={String(completedCount)} />
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row between card-pad" style={{ paddingBottom: 14 }}>
            <h3 className="h3">Tous les étudiants</h3>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Chargement…</div>
          ) : enrollments.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)' }}>Aucun étudiant inscrit pour l'instant.</div>
          ) : (
            <div className="edu-table-scroll">
              <table className="edu-table">
                <thead>
                  <tr>
                    <th>Étudiant</th><th>Cours</th><th>Progression</th><th>Dernière activité</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e, i) => (
                    <tr key={e.id}>
                      <td>
                        <div className="row gap-8">
                          <div className="avatar avatar-sm" style={{
                            background: `var(--${COLORS[i % COLORS.length]}-soft)`,
                            color: `var(--${COLORS[i % COLORS.length]})`,
                          }}>
                            {(e.user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div className="col" style={{ minWidth: 0 }}>
                            <span style={{ fontWeight: 650, fontSize: 13.5 }}>{e.user?.name}</span>
                            <span className="tiny muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{e.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tiny muted" style={{ maxWidth: 200, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {e.course?.title}
                        </span>
                      </td>
                      <td>
                        <div className="row gap-8">
                          <div className="track" style={{ width: 70 }}>
                            <div className="track-fill" style={{ width: e.progress + '%' }} />
                          </div>
                          <span className="tiny tnum muted">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="tiny muted">{timeAgo(e.lastSeenAt)}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" disabled={contactingId === e.user.id}
                          onClick={() => contactStudent(e.user.id, e.courseId)}>
                          <Icon name="message" size={14} />Message
                        </button>
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
