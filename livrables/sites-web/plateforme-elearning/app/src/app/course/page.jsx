'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import Stars from '@/components/Stars';
import { useGo } from '@/lib/navigation';

export default function CoursePage() {
  const go = useGo();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [course, setCourse] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [currentId, setCurrentId] = useState(null);
  const [openMods, setOpenMods] = useState(new Set());
  const [tab, setTab] = useState('apercu');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState('');

  const courseId = searchParams.get('id');

  const loadCourse = useCallback(async (id) => {
    const [courseRes, enrollRes] = await Promise.all([
      fetch(`/api/courses/${id}`),
      fetch('/api/user/enrollments'),
    ]);
    const courseData = await courseRes.json();
    if (courseData.error) return null;

    const enrollments = await enrollRes.json();
    const enrollment = Array.isArray(enrollments)
      ? enrollments.find(e => e.courseId === courseData.id)
      : null;

    return { ...courseData, enrollment };
  }, []);

  const loadProgress = useCallback(async (id) => {
    const res = await fetch(`/api/lesson/progress?courseId=${id}`);
    const data = await res.json();
    if (!Array.isArray(data)) return {};
    return Object.fromEntries(data.map(p => [p.lessonId, p.completed]));
  }, []);

  const activateEnrollment = useCallback(async (courseId) => {
    const [refreshed, progress] = await Promise.all([
      loadCourse(courseId),
      loadProgress(courseId),
    ]);
    if (refreshed) {
      setCourse(refreshed);
      setLessonProgress(progress);
      if (refreshed.modules?.length > 0) {
        setOpenMods(new Set([refreshed.modules[0].id]));
        const allL = refreshed.modules.flatMap(m => m.lessons);
        const first = allL.find(l => !progress[l.id]);
        setCurrentId(first?.id || allL[0]?.id || null);
      }
    }
  }, [loadCourse, loadProgress]);

  const handleEnroll = useCallback(async () => {
    if (!course) return;
    setEnrolling(true);
    setEnrollMsg('');

    if (course.price > 0) {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setEnrollMsg(data.error || 'Impossible de créer la session de paiement.');
      setEnrolling(false);
      return;
    }

    const res = await fetch('/api/user/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id }),
    });
    const data = await res.json();
    if (res.ok) {
      await activateEnrollment(course.id);
    } else {
      setEnrollMsg(data.error || "Erreur lors de l'inscription.");
    }
    setEnrolling(false);
  }, [course, activateEnrollment]);

  useEffect(() => {
    async function init() {
      setLoading(true);

      let targetId = courseId;
      if (!targetId) {
        // Charge le premier cours inscrit par défaut
        const res = await fetch('/api/user/enrollments');
        const enrollments = await res.json();
        if (Array.isArray(enrollments) && enrollments.length > 0) {
          targetId = enrollments[0].courseId;
        }
      }

      if (!targetId) { setLoading(false); return; }

      const [courseData, progress] = await Promise.all([
        loadCourse(targetId),
        loadProgress(targetId),
      ]);

      if (courseData) {
        setCourse(courseData);
        setLessonProgress(progress);
        // Ouvre le premier module par défaut
        if (courseData.modules?.length > 0) {
          setOpenMods(new Set([courseData.modules[0].id]));
          // Sélectionne la première leçon non terminée
          const allLessons = courseData.modules.flatMap(m => m.lessons);
          const firstPending = allLessons.find(l => !progress[l.id]);
          setCurrentId(firstPending?.id || allLessons[0]?.id || null);
        }
      }
      setLoading(false);
    }
    init();
  }, [courseId, loadCourse, loadProgress]);

  const toggleDone = useCallback(async (lessonId) => {
    const newVal = !lessonProgress[lessonId];
    setLessonProgress(prev => ({ ...prev, [lessonId]: newVal }));
    await fetch('/api/lesson/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, completed: newVal }),
    });
  }, [lessonProgress]);

  const toggleMod = (id) => setOpenMods(m => {
    const n = new Set(m); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const goLesson = (l) => { setCurrentId(l.id); setPlaying(false); };

  if (loading) {
    return (
      <AppShell role="student" active="course" go={go} title="Chargement…" subtitle="">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
          Chargement du cours…
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell role="student" active="course" go={go} title="Mes cours" subtitle="">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
          <Icon name="book" size={40} style={{ opacity: .3, marginBottom: 16 }} />
          <p>Tu n'es inscrit à aucun cours pour l'instant.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => go('landing')}>
            Explorer le catalogue
          </button>
        </div>
      </AppShell>
    );
  }

  if (!course.enrollment) {
    const totalLessons = (course.modules || []).reduce((s, m) => s + (m.lessons?.length || 0), 0);
    const paymentJustDone = searchParams.get('payment') === 'success';
    return (
      <AppShell role="student" active="course" go={go}
        title={course.title}
        subtitle={`${course.category} · ${course.author?.name || 'Formateur'}`}>
        <div className="edu-content-narrow">
          {/* Banner */}
          <div className="course-video" style={{ marginBottom: 28, borderRadius: 12, overflow: 'hidden' }}>
            <div className="course-video-grid" />
            <div className="col" style={{ alignItems: 'center', gap: 8, color: '#fff', position: 'relative', zIndex: 1 }}>
              <Icon name="play" size={44} fill />
              <span style={{ fontWeight: 600, opacity: .9 }}>Aperçu du cours</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Left */}
            <div className="col gap-22" style={{ flex: '1 1 320px', minWidth: 0 }}>
              <div className="col gap-12">
                <div className="row gap-10 wrap">
                  <span className={'badge badge-' + (course.color || 'brand')}>{course.category}</span>
                  <span className="small muted">{course.level}</span>
                  <span className="small muted row gap-5"><Icon name="clock" size={14} />{course.hours}h</span>
                  <span className="small muted row gap-5"><Icon name="users" size={14} />{course._count?.enrollments ?? 0} inscrits</span>
                </div>
                <p style={{ lineHeight: 1.65, color: 'var(--ink-2)', fontSize: 15 }}>
                  {course.description || 'Aucune description disponible pour ce cours.'}
                </p>
              </div>

              <div className="card card-pad row gap-12" style={{ padding: '12px 16px' }}>
                <div className="avatar avatar-lg" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
                  {(course.author?.name || 'F').split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="col">
                  <span style={{ fontWeight: 700 }}>{course.author?.name || 'Formateur'}</span>
                  <span className="tiny muted">Formateur EduSpher</span>
                </div>
              </div>

              {(course.modules || []).length > 0 && (
                <div className="col gap-10">
                  <h3 className="h3">Contenu du cours</h3>
                  <span className="small muted">{course.modules.length} modules · {totalLessons} leçons</span>
                  <div className="col gap-6">
                    {(course.modules || []).map((m, mi) => (
                      <div key={m.id} className="card card-pad row between" style={{ padding: '10px 14px' }}>
                        <div className="row gap-10">
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' }}>{mi + 1}</span>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</span>
                        </div>
                        <span className="tiny muted" style={{ flexShrink: 0 }}>{m.lessons?.length ?? 0} leçons</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: enroll card */}
            <div style={{ flex: '0 0 260px', minWidth: 220 }}>
              <div className="card card-pad col gap-16" style={{ position: 'sticky', top: 16 }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: course.price === 0 ? 'var(--green)' : 'var(--ink)' }}>
                    {course.price === 0 ? 'Gratuit' : `${course.price} €`}
                  </div>
                  <span className="tiny muted">
                    {course.price === 0 ? 'Accès immédiat, sans carte' : 'Accès à vie après achat'}
                  </span>
                </div>

                {paymentJustDone && (
                  <div className="col gap-10" style={{ background: 'var(--green-soft, #f0fdf4)', border: '1px solid var(--green)', borderRadius: 8, padding: '12px 14px' }}>
                    <div className="row gap-8">
                      <Icon name="checkCircle" size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      <span className="small" style={{ fontWeight: 600, color: 'var(--green)' }}>Paiement confirmé !</span>
                    </div>
                    <span className="tiny muted">L'accès est en cours d'activation. Clique sur Actualiser dans quelques secondes.</span>
                    <button className="btn btn-outline btn-sm" onClick={() => activateEnrollment(course.id)}>
                      <Icon name="refresh" size={14} />Actualiser
                    </button>
                  </div>
                )}

                {enrollMsg && !paymentJustDone && (
                  <p className="small" style={{ background: 'var(--bg-2)', padding: '10px 12px', borderRadius: 8, margin: 0, color: 'var(--ink-2)' }}>
                    {enrollMsg}
                  </p>
                )}

                {!paymentJustDone && (
                  <button className="btn btn-primary btn-block" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling
                      ? course.price > 0 ? 'Redirection…' : 'Inscription…'
                      : course.price === 0
                        ? "S'inscrire gratuitement"
                        : `Acheter pour ${course.price} €`}
                  </button>
                )}

                <div className="col gap-10" style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  {[
                    ['clock', `${course.hours}h de contenu`],
                    ['layers', `${course.modules?.length ?? 0} modules`],
                    ['award', 'Certificat de réussite'],
                    ['refresh', 'Accès à vie'],
                  ].map(([icon, text]) => (
                    <div key={text} className="row gap-8 small">
                      <Icon name={icon} size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                      {text}
                    </div>
                  ))}
                </div>

                <button className="btn btn-ghost btn-sm btn-block" onClick={() => go('student')}>
                  <Icon name="chevL" size={14} />Retour au dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const allLessons = (course.modules || []).flatMap(m => m.lessons);
  const total = allLessons.length;
  const completed = allLessons.filter(l => lessonProgress[l.id]).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const current = allLessons.find(l => l.id === currentId) || allLessons[0];
  const idx = allLessons.findIndex(l => l.id === currentId);
  const isCurrentDone = lessonProgress[currentId];

  const next = () => {
    if (idx < total - 1) {
      if (!isCurrentDone) toggleDone(currentId);
      goLesson(allLessons[idx + 1]);
    }
  };

  const lessonIcon = { VIDEO: 'play', PDF: 'pdf', QUIZ: 'quiz', PROJECT: 'flag' };
  const tabs = [['apercu', 'Aperçu'], ['notes', 'Notes'], ['ressources', 'Ressources'], ['qa', 'Q&A']];

  return (
    <AppShell role="student" active="course" go={go} search={false}
      title={course.title}
      subtitle={`${course.category} · ${course.author?.name || 'Formateur'}`}
      contentClass="">
      <style>{`.edu-content:has(.course-layout){padding:0;overflow:hidden;height:100%}`}</style>
      <div className="course-layout">
        {/* MAIN */}
        <div className="course-main scroll-y">
          {/* Lesson content player */}
          {current?.type === 'VIDEO' && current?.contentUrl ? (
            <video
              key={current.id}
              src={current.contentUrl}
              controls
              style={{ width: '100%', display: 'block', background: '#000', maxHeight: 480 }}
              onEnded={() => { if (!isCurrentDone) toggleDone(currentId); }}
            />
          ) : current?.type === 'PDF' && current?.contentUrl ? (
            <div style={{ width: '100%', height: 500, background: '#f5f5f5' }}>
              <iframe
                key={current.id}
                src={current.contentUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={current.title}
              />
            </div>
          ) : (
            <div className="course-video">
              <div className="course-video-grid" />
              <div className="col" style={{ alignItems: 'center', color: '#fff', gap: 8, position: 'relative', zIndex: 1 }}>
                <Icon name={current?.type === 'QUIZ' ? 'quiz' : current?.type === 'PROJECT' ? 'flag' : 'video'} size={36} style={{ opacity: .85 }} />
                <span style={{ fontWeight: 600, opacity: .85, fontSize: 14 }}>
                  {current?.type === 'QUIZ'
                    ? 'Quiz — accès depuis le tableau de bord'
                    : current?.type === 'PROJECT'
                    ? 'Projet pratique'
                    : 'Aucun fichier pour cette leçon'}
                </span>
              </div>
              {current && (
                <div style={{ position: 'absolute', top: 16, left: 18, zIndex: 2 }}>
                  <span className="badge" style={{ background: 'rgba(0,0,0,.3)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                    Leçon {idx + 1} / {total}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Below video */}
          <div style={{ padding: '22px 28px 0' }}>
            <div className="row between wrap gap-16">
              <div className="col gap-6" style={{ minWidth: 0 }}>
                <h1 className="h2" style={{ fontSize: 22 }}>{current?.title}</h1>
                <div className="row gap-14 wrap small muted">
                  {current?.duration && (
                    <span className="row gap-6"><Icon name="clock" size={15} />{current.duration}</span>
                  )}
                  <span className="row gap-6">
                    <Icon name="users" size={15} />{course._count?.enrollments ?? 0} inscrits
                  </span>
                  <span className="row gap-6"><Stars rating={4.9} size={13} /></span>
                </div>
              </div>
              <div className="row gap-10">
                <button
                  className={'btn ' + (isCurrentDone ? 'btn-soft' : 'btn-primary')}
                  onClick={() => toggleDone(currentId)}>
                  <Icon name={isCurrentDone ? 'checkCircle' : 'check'} size={18} />
                  {isCurrentDone ? 'Terminé' : 'Marquer comme terminé'}
                </button>
              </div>
            </div>

            {/* Instructor */}
            <div className="row gap-12" style={{ margin: '18px 0', padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div className="avatar avatar-lg" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
                {(course.author?.name || 'F').split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="col grow">
                <span style={{ fontWeight: 700 }}>{course.author?.name || 'Formateur'}</span>
                <span className="small muted">Formateur EduSpher</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="course-tabs" style={{ padding: 0, marginBottom: 20 }}>
              {tabs.map(([k, l]) => (
                <button key={k} className={'course-tab' + (tab === k ? ' is-active' : '')} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>

            <div style={{ paddingBottom: 40, maxWidth: 720 }}>
              {tab === 'apercu' && (
                <div className="col gap-16 anim-in">
                  <p className="lead" style={{ fontSize: 15.5 }}>
                    {course.description || 'Aucune description disponible pour ce cours.'}
                  </p>
                  <div className="panel card-pad row gap-16" style={{ background: 'var(--bg-2)', border: 'none' }}>
                    <div className="col gap-4">
                      <span className="tiny muted">Durée totale</span>
                      <span style={{ fontWeight: 700 }}>{course.hours}h</span>
                    </div>
                    <div className="col gap-4">
                      <span className="tiny muted">Niveau</span>
                      <span style={{ fontWeight: 700 }}>{course.level}</span>
                    </div>
                    <div className="col gap-4">
                      <span className="tiny muted">Catégorie</span>
                      <span style={{ fontWeight: 700 }}>{course.category}</span>
                    </div>
                  </div>
                </div>
              )}
              {tab === 'notes' && (
                <div className="anim-in">
                  <textarea className="input" placeholder="Ajoute une note pour cette leçon…"
                    style={{ height: 120, paddingTop: 12, resize: 'none' }} />
                </div>
              )}
              {tab === 'ressources' && (
                <div className="anim-in" style={{ color: 'var(--ink-4)', fontSize: 14 }}>
                  Aucune ressource disponible pour cette leçon.
                </div>
              )}
              {tab === 'qa' && (
                <div className="col gap-16 anim-in">
                  <div className="input-icon">
                    <Icon name="message" />
                    <input className="input" placeholder="Pose une question sur cette leçon…" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDE — module list */}
        <aside className="course-side">
          <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="row between" style={{ marginBottom: 10 }}>
              <span className="h4">Contenu du cours</span>
              <span className="tiny muted">{completed}/{total} leçons</span>
            </div>
            <div className="track"><div className="track-fill" style={{ width: pct + '%' }} /></div>
            <span className="tiny muted" style={{ marginTop: 8, display: 'block' }}>
              <b style={{ color: 'var(--brand)' }}>{pct}%</b> complété · {course.modules?.length || 0} modules · {course.hours}h
            </span>
          </div>

          <div className="scroll-y" style={{ flex: 1 }}>
            {(course.modules || []).map((m, mi) => {
              const open = openMods.has(m.id);
              const mDone = (m.lessons || []).filter(l => lessonProgress[l.id]).length;
              return (
                <div key={m.id} className="course-module">
                  <div className="course-module-head" onClick={() => toggleMod(m.id)}>
                    <div className="course-check" style={mDone === m.lessons.length && m.lessons.length > 0
                      ? { background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' }
                      : undefined}>
                      {mDone === m.lessons.length && m.lessons.length > 0
                        ? <Icon name="check" size={13} stroke={3} />
                        : <span className="tiny tnum" style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{mi + 1}</span>}
                    </div>
                    <div className="col grow" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 650, fontSize: 13.5 }}>{m.title}</span>
                      <span className="tiny muted">{mDone}/{m.lessons.length} · {m.lessons.length} leçons</span>
                    </div>
                    <Icon name="chevD" size={17} style={{ color: 'var(--ink-4)', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .2s' }} />
                  </div>
                  {open && (m.lessons || []).map(l => (
                    <div key={l.id}
                      className={'course-lesson' + (l.id === currentId ? ' is-current' : '')}
                      onClick={() => goLesson(l)}>
                      <div className="course-check"
                        style={lessonProgress[l.id]
                          ? { background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' }
                          : undefined}
                        onClick={(e) => { e.stopPropagation(); toggleDone(l.id); }}>
                        {lessonProgress[l.id] && <Icon name="check" size={12} stroke={3} />}
                      </div>
                      <div className="course-lesson-ic">
                        <Icon name={lessonIcon[l.type] || 'play'} size={15} fill={l.type === 'VIDEO'} />
                      </div>
                      <div className="col grow" style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: l.id === currentId ? 700 : 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {l.title}
                        </span>
                        <span className="tiny muted">
                          {l.type === 'QUIZ' ? 'Quiz' : l.type === 'PDF' ? 'Ressource' : l.type === 'PROJECT' ? 'Projet' : 'Vidéo'} · {l.duration}
                        </span>
                      </div>
                      {l.type === 'QUIZ' && (
                        <button className="btn btn-soft btn-sm" style={{ height: 28, padding: '0 10px' }}
                          onClick={(e) => { e.stopPropagation(); go('quiz'); }}>
                          Lancer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-primary btn-block" onClick={next} disabled={idx >= total - 1}>
              Leçon suivante<Icon name="arrowR" size={17} />
            </button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
