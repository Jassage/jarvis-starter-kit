'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import Stars from '@/components/Stars';
import StatCard from '@/components/StatCard';
import { useGo } from '@/lib/navigation';

export default function TeacherDashboard() {
  const go = useGo();
  const { data: session } = useSession();

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/teacher/courses').then(r => r.json()),
      fetch('/api/teacher/students').then(r => r.json()),
    ]).then(([c, s]) => {
      setCourses(Array.isArray(c) ? c : []);
      setStudents(Array.isArray(s) ? s : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || 'là';
  const totalStudents = courses.reduce((s, c) => s + (c._count?.enrollments || 0), 0);
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED');
  const draftCourses = courses.filter(c => c.status === 'DRAFT');

  const COLORS = ['brand', 'violet', 'teal', 'amber', 'green', 'rose'];

  if (loading) {
    return (
      <AppShell role="teacher" active="teacher" go={go} search={false} title="Tableau de bord" subtitle="">
        <div className="edu-content-narrow" style={{ paddingTop: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
          Chargement…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="teacher" active="teacher" go={go} search={false}
      title="Tableau de bord"
      subtitle={`Bonjour ${firstName} — voici l'activité de tes cours.`}>
      <div className="edu-content-narrow">
        {/* Header actions */}
        <div className="row between wrap gap-12" style={{ marginBottom: 22 }}>
          <div className="edu-tabbar">
            <button className="is-active">Vue d'ensemble</button>
          </div>
          <button className="btn btn-primary" onClick={() => go('tcourses')}>
            <Icon name="plus" size={18} />Créer un cours
          </button>
        </div>

        {/* Stats */}
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="users" color="brand" label="Étudiants inscrits" value={String(totalStudents)} />
          <StatCard icon="book" color="violet" label="Cours publiés" value={String(publishedCourses.length)} />
          <StatCard icon="layers" color="amber" label="Brouillons" value={String(draftCourses.length)} />
          <StatCard icon="target" color="green" label="Cours au total" value={String(courses.length)} />
        </div>

        <div className="edu-cols">
          {/* LEFT */}
          <div className="col gap-22">
            {/* Tableau mes cours */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="row between card-pad" style={{ paddingBottom: 14 }}>
                <h3 className="h3">Mes cours</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => go('tcourses')}>
                  Gérer<Icon name="chevR" size={15} />
                </button>
              </div>

              {courses.length === 0 ? (
                <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--ink-4)' }}>
                  <p className="small">Aucun cours encore. Crée ton premier cours !</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => go('tcourses')}>
                    <Icon name="plus" size={16} />Créer un cours
                  </button>
                </div>
              ) : (
                <div className="edu-table-scroll">
                  <table className="edu-table">
                    <thead>
                      <tr>
                        <th>Cours</th>
                        <th>Étudiants</th>
                        <th>Modules</th>
                        <th>Prix</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c, i) => (
                        <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => go('tcourses')}>
                          <td style={{ maxWidth: 260 }}>
                            <div className="row gap-10">
                              <div style={{
                                width: 44, height: 32, borderRadius: 7, flexShrink: 0,
                                background: `linear-gradient(140deg, var(--${c.color || 'brand'}), var(--${c.color || 'brand'}-deep, var(--brand)))`
                              }} />
                              <span style={{ fontWeight: 650, fontSize: 13.5, lineHeight: 1.3 }}>{c.title}</span>
                            </div>
                          </td>
                          <td className="tnum">{c._count?.enrollments ?? 0}</td>
                          <td className="tnum">{c._count?.modules ?? 0}</td>
                          <td style={{ fontWeight: 650 }}>{c.price === 0 ? 'Gratuit' : `${c.price} €`}</td>
                          <td>
                            <span className={'badge ' + (c.status === 'PUBLISHED' ? 'badge-green badge-dot' : 'badge-amber badge-dot')}>
                              {c.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Étudiants récents */}
            {students.length > 0 && (
              <div className="card card-pad">
                <div className="row between" style={{ marginBottom: 14 }}>
                  <h3 className="h3">Inscriptions récentes</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => go('tcourses')}>Voir tout</button>
                </div>
                <div className="edu-table-scroll">
                  <table className="edu-table">
                    <thead>
                      <tr><th>Étudiant</th><th>Cours</th><th>Progression</th></tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 8).map((e, i) => (
                        <tr key={e.id}>
                          <td>
                            <div className="row gap-8">
                              <div className="avatar avatar-sm" style={{
                                background: `var(--${COLORS[i % COLORS.length]}-soft)`,
                                color: `var(--${COLORS[i % COLORS.length]})`
                              }}>
                                {(e.user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </div>
                              <div className="col" style={{ minWidth: 0 }}>
                                <span style={{ fontWeight: 650, fontSize: 13.5 }}>{e.user?.name}</span>
                                <span className="tiny muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{e.user?.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="tiny muted" style={{ maxWidth: 160, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {e.course?.title}
                            </span>
                          </td>
                          <td>
                            <div className="row gap-8">
                              <div className="track" style={{ width: 60 }}>
                                <div className="track-fill" style={{ width: e.progress + '%' }} />
                              </div>
                              <span className="tiny tnum muted">{e.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="col gap-18">
            {/* Course builder CTA */}
            <div className="card card-pad">
              <div className="row gap-8" style={{ marginBottom: 8 }}>
                <Icon name="layers" size={18} style={{ color: 'var(--brand)' }} />
                <h3 className="h4">Créateur de cours</h3>
              </div>
              <p className="small muted" style={{ marginBottom: 16 }}>
                {draftCourses.length > 0
                  ? `${draftCourses.length} brouillon${draftCourses.length > 1 ? 's' : ''} en attente de publication.`
                  : 'Crée un nouveau cours et commence à partager tes connaissances.'}
              </p>
              {draftCourses.slice(0, 3).map(c => (
                <div key={c.id} className="row gap-10" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-2)', marginBottom: 8 }}>
                  <div className={'edu-notif-ic edu-ic-' + (c.color || 'brand')} style={{ width: 30, height: 30 }}>
                    <Icon name="book" size={15} />
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  <span className="tiny muted">Brouillon</span>
                </div>
              ))}
              <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: 8 }} onClick={() => go('tcourses')}>
                {draftCourses.length > 0 ? 'Continuer l\'édition' : 'Créer un cours'}
              </button>
            </div>

            {/* Résumé par cours */}
            {publishedCourses.length > 0 && (
              <div className="card card-pad">
                <h3 className="h4" style={{ marginBottom: 12 }}>Cours publiés</h3>
                {publishedCourses.slice(0, 4).map((c, i) => (
                  <div key={c.id} className="edu-list-row" style={{ cursor: 'pointer' }} onClick={() => go('tcourses')}>
                    <div className={'edu-notif-ic edu-ic-' + (c.color || 'brand')}>
                      <Icon name="book" size={16} />
                    </div>
                    <div className="col grow" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 650, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                      <span className="tiny muted">{c._count?.enrollments ?? 0} inscrits · {c.hours}h</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--brand)', flexShrink: 0 }}>
                      {c.price === 0 ? 'Gratuit' : `${c.price} €`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state si aucun cours */}
            {courses.length === 0 && (
              <div className="edu-hero-banner" style={{ padding: '22px 22px' }}>
                <div className="lp-stats-grid" />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <Icon name="sparkle" size={26} />
                  <h3 style={{ fontSize: 17, fontWeight: 750, marginTop: 10, color: '#fff' }}>
                    Lance ton premier cours
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>
                    Crée, publie et partage tes formations avec des milliers d'apprenants.
                  </p>
                  <button className="btn btn-sm" style={{ background: '#fff', color: 'var(--brand-ink)', marginTop: 14 }}
                    onClick={() => go('tcourses')}>
                    Commencer maintenant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
