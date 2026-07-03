'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import CourseThumb from '@/components/CourseThumb';
import Stars from '@/components/Stars';
import StatCard from '@/components/StatCard';
import Ring from '@/components/Ring';
import { useGo } from '@/lib/navigation';

export default function StudentDashboard() {
  const go = useGo();
  const router = useRouter();
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [certCount, setCertCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekly, setWeekly] = useState({ lessonsCompleted: 0, hours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/enrollments').then(r => r.json()),
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/certificates').then(r => r.json()),
      fetch('/api/user/streak').then(r => r.json()),
      fetch('/api/user/weekly-progress').then(r => r.json()),
    ]).then(([enrollData, coursesData, certs, streakData, weeklyData]) => {
      setEnrollments(Array.isArray(enrollData) ? enrollData : []);
      setAllCourses(Array.isArray(coursesData) ? coursesData : []);
      setCertCount(Array.isArray(certs) ? certs.length : 0);
      setStreak(streakData?.current ?? 0);
      setWeekly(weeklyData?.lessonsCompleted != null ? weeklyData : { lessonsCompleted: 0, hours: 0 });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || 'là';
  const enrolled = enrollments.slice(0, 3);
  const enrolledIds = new Set(enrollments.map(e => e.courseId));
  const recs = allCourses.filter(c => !enrolledIds.has(c.id)).slice(0, 3);

  const weeklyDone = Math.min(weekly.lessonsCompleted, 7);
  const weeklyGoal = 7;

  if (loading) {
    return (
      <AppShell role="student" active="student" go={go} title="Chargement…" subtitle="">
        <div className="edu-content-narrow" style={{ paddingTop: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
          Chargement de ton tableau de bord…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="student" active="student" go={go}
      title={`Bonjour, ${firstName} 👋`}
      subtitle="Reprends là où tu t'es arrêté et continue ta progression.">
      <div className="edu-content-narrow">
        {/* Stats */}
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="book" color="brand" label="Cours en cours" value={String(enrollments.length)} />
          <StatCard icon="clock" color="violet" label="Heures cette semaine" value={`${weekly.hours}h`} />
          <StatCard icon="award" color="amber" label="Certificats obtenus" value={String(certCount)} />
          <StatCard icon="fire" color="rose" label="Série d'apprentissage" value={`${streak}j`} />
        </div>

        <div className="edu-cols">
          {/* LEFT */}
          <div className="col gap-24">
            {/* Continue learning */}
            <section>
              <div className="edu-section-title">
                <h2 className="h3">Reprendre l'apprentissage</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => go('course')}>
                  Tout voir<Icon name="chevR" size={15} />
                </button>
              </div>
              <div className="col gap-12">
                {enrolled.length === 0 && (
                  <div className="card card-pad" style={{ color: 'var(--ink-4)', fontSize: 14 }}>
                    Pas encore de cours. Explore le catalogue et inscris-toi !
                  </div>
                )}
                {enrolled.map((e, i) => {
                  const c = e.course;
                  if (!c) return null;
                  return (
                    <div key={e.id} className="edu-continue anim-up" style={{ animationDelay: `${i * 0.05}s` }}
                      onClick={() => router.push('/course?id=' + e.courseId)}>
                      <div className="edu-continue-thumb">
                        <CourseThumb course={{ color: c.color, title: c.title }} h={86} />
                      </div>
                      <div className="col grow" style={{ minWidth: 0, justifyContent: 'center' }}>
                        <div className="row between gap-12">
                          <span className={'badge badge-' + (c.color || 'brand')}>{c.category}</span>
                        </div>
                        <h3 className="h4" style={{ marginTop: 8, fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.title}
                        </h3>
                        <div className="row gap-8 small muted" style={{ marginTop: 4 }}>
                          <Icon name="user" size={15} />
                          <span>{c.author?.name || 'Formateur'}</span>
                        </div>
                        <div className="row gap-12" style={{ marginTop: 11 }}>
                          <div className="track grow">
                            <div className="track-fill" style={{ width: e.progress + '%' }} />
                          </div>
                          <span className="tiny tnum" style={{ fontWeight: 700, color: 'var(--brand)' }}>{e.progress}%</span>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-icon edu-desktop-only"
                        style={{ alignSelf: 'center' }} aria-label="Reprendre">
                        <Icon name="play" size={16} fill />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recommendations */}
            {recs.length > 0 && (
              <section>
                <div className="edu-section-title">
                  <div className="row gap-8">
                    <Icon name="sparkle" size={18} style={{ color: 'var(--violet)' }} />
                    <h2 className="h3">Recommandé pour toi</h2>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => go('landing')}>
                    Explorer<Icon name="chevR" size={15} />
                  </button>
                </div>
                <div className="edu-grid edu-grid-3">
                  {recs.map((c, i) => (
                    <div key={c.id} className="edu-rec-card anim-up" style={{ animationDelay: `${i * 0.05}s` }}
                      onClick={() => router.push('/course?id=' + c.id)}>
                      <div style={{ padding: 9 }}>
                        <CourseThumb course={{ color: c.color, title: c.title }} h={120} />
                      </div>
                      <div style={{ padding: '4px 14px 16px' }}>
                        <h3 className="h4" style={{ fontSize: 14.5, lineHeight: 1.3, minHeight: 38 }}>{c.title}</h3>
                        <div className="row between" style={{ marginTop: 10 }}>
                          {c.rating > 0 ? <Stars rating={c.rating} size={13} /> : <span />}
                          <span style={{ fontWeight: 800, fontSize: 14.5 }}>
                            {c.price === 0 ? 'Gratuit' : c.price + '€'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT */}
          <div className="col gap-18">
            {/* Weekly goal */}
            <div className="card card-pad col" style={{ alignItems: 'center', textAlign: 'center' }}>
              <h3 className="h4" style={{ alignSelf: 'flex-start' }}>Objectif de la semaine</h3>
              <div style={{ position: 'relative', margin: '14px 0 6px' }}>
                <Ring value={Math.round((weeklyDone / weeklyGoal) * 100)} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="tnum" style={{ fontSize: 26, fontWeight: 800 }}>{weeklyDone}/{weeklyGoal}</span>
                  <span className="tiny muted">leçons</span>
                </div>
              </div>
              <p className="small muted">
                {weeklyDone >= weeklyGoal
                  ? 'Objectif atteint cette semaine !'
                  : <>Plus que <b style={{ color: 'var(--ink)' }}>{weeklyGoal - weeklyDone} leçons</b> pour valider ta semaine.</>}
              </p>
              <button className="btn btn-soft btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => go('course')}>
                Continuer maintenant
              </button>
            </div>

            {/* Catalog teaser */}
            <div className="edu-hero-banner" style={{ padding: '22px 22px' }}>
              <div className="lp-stats-grid" />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Icon name="sparkle" size={26} />
                <h3 style={{ fontSize: 17, fontWeight: 750, marginTop: 10, color: '#fff' }}>
                  {allCourses.length} cours disponibles
                </h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>
                  Des formations expertes sur le développement, le design, la data et plus encore.
                </p>
                <button className="btn btn-sm" style={{ background: '#fff', color: 'var(--brand-ink)', marginTop: 14 }}
                  onClick={() => go('landing')}>
                  Explorer le catalogue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
