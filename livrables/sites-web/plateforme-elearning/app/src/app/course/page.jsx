'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import Stars from '@/components/Stars';
import { EDU } from '@/lib/data';
import { useGo } from '@/lib/navigation';

export default function CoursePage() {
  const go = useGo();
  const E = EDU;
  const course = E.byId('c1');
  const modules = E.modules;
  const allLessons = modules.flatMap(m => m.lessons);
  const [currentId, setCurrentId] = useState('l8');
  const [done, setDone] = useState(() => new Set(allLessons.filter(l => l.done).map(l => l.id)));
  const [openMods, setOpenMods] = useState(() => new Set(['m3']));
  const [tab, setTab] = useState('apercu');
  const [playing, setPlaying] = useState(false);

  const current = allLessons.find(l => l.id === currentId) || allLessons[0];
  const total = allLessons.length;
  const completed = done.size;
  const pct = Math.round((completed / total) * 100);
  const idx = allLessons.findIndex(l => l.id === currentId);

  const toggleDone = (id) => setDone(d => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleMod = (id) => setOpenMods(m => { const n = new Set(m); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const goLesson = (l) => { setCurrentId(l.id); setPlaying(false); };
  const next = () => { if (idx < total - 1) { setDone(d => new Set(d).add(currentId)); goLesson(allLessons[idx + 1]); } };
  const isCurrentDone = done.has(currentId);

  const tabs = [['apercu', 'Aperçu'], ['notes', 'Notes'], ['ressources', 'Ressources'], ['qa', 'Q&A']];
  const lessonIcon = { video: 'play', pdf: 'pdf', quiz: 'quiz', project: 'flag' };

  return (
    <AppShell role="student" active="course" go={go} search={false}
      title={course.title} subtitle={`${course.cat} · ${course.author}`} contentClass="" >
      <style>{`.edu-content:has(.course-layout){padding:0;overflow:hidden;height:100%}`}</style>
      <div className="course-layout">
        {/* MAIN */}
        <div className="course-main scroll-y">
          {/* Video */}
          <div className="course-video">
            <div className="course-video-grid" />
            {!playing ? (
              <button className="course-play" onClick={() => setPlaying(true)} aria-label="Lire"><Icon name="play" size={30} fill /></button>
            ) : (
              <div className="col" style={{ alignItems: 'center', color: '#fff', gap: 10 }}>
                <Icon name="video" size={40} style={{ opacity: .9 }} />
                <span style={{ fontWeight: 600, opacity: .85 }}>Lecture en cours…</span>
              </div>
            )}
            <div style={{ position: 'absolute', top: 16, left: 18 }}>
              <span className="badge" style={{ background: 'rgba(0,0,0,.3)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                Module {modules.findIndex(m => m.lessons.some(l => l.id === currentId)) + 1} · Leçon {idx + 1}
              </span>
            </div>
            <div className="course-controls">
              <button style={{ color: '#fff' }} onClick={() => setPlaying(p => !p)}><Icon name={playing ? 'pause' : 'play'} size={20} fill /></button>
              <div className="course-scrub" onClick={() => setPlaying(true)}><div className="course-scrub-fill" style={{ width: playing ? '42%' : '12%', transition: 'width .3s' }} /></div>
              <span className="small tnum" style={{ color: '#fff', fontWeight: 600 }}>{playing ? '4:58' : '1:24'} / {current.dur}</span>
              <button style={{ color: '#fff' }} aria-label="Plein écran"><Icon name="layers" size={18} /></button>
            </div>
          </div>

          {/* Below video */}
          <div style={{ padding: '22px 28px 0' }}>
            <div className="row between wrap gap-16">
              <div className="col gap-6" style={{ minWidth: 0 }}>
                <h1 className="h2" style={{ fontSize: 22 }}>{current.title}</h1>
                <div className="row gap-14 wrap small muted">
                  <span className="row gap-6"><Icon name="clock" size={15} />{current.dur}</span>
                  <span className="row gap-6"><Icon name="users" size={15} />{course.students.toLocaleString('fr')} inscrits</span>
                  <span className="row gap-6"><Stars rating={course.rating} size={13} /></span>
                </div>
              </div>
              <div className="row gap-10">
                <button className="btn btn-outline btn-icon" aria-label="Enregistrer"><Icon name="bookmark" size={18} /></button>
                <button className={'btn ' + (isCurrentDone ? 'btn-soft' : 'btn-primary')} onClick={() => toggleDone(currentId)}>
                  <Icon name={isCurrentDone ? 'checkCircle' : 'check'} size={18} />{isCurrentDone ? 'Terminé' : 'Marquer comme terminé'}
                </button>
              </div>
            </div>

            {/* Instructor */}
            <div className="row gap-12" style={{ margin: '18px 0', padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div className="avatar avatar-lg" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>SL</div>
              <div className="col grow">
                <span style={{ fontWeight: 700 }}>{course.author}</span>
                <span className="small muted">{course.authorRole}</span>
              </div>
              <button className="btn btn-outline btn-sm">Suivre</button>
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
                  <p className="lead" style={{ fontSize: 15.5 }}>Dans cette leçon, nous explorons la frontière entre <b>Server Components</b> et <b>Client Components</b> dans l'App Router de Next.js : quand utiliser chacun, comment les composer, et les pièges courants à éviter.</p>
                  <h3 className="h4">Ce que tu vas apprendre</h3>
                  <div className="col gap-10">
                    {['Distinguer rendu serveur et rendu client', 'Utiliser la directive "use client" au bon endroit', 'Composer Server et Client Components efficacement', "Éviter les erreurs d'hydratation courantes"].map((t, i) => (
                      <div key={i} className="row gap-10"><span className="course-check done" style={{ width: 20, height: 20 }}><Icon name="check" size={12} stroke={3} /></span><span className="small">{t}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'notes' && (
                <div className="anim-in">
                  <div className="panel card-pad" style={{ background: 'var(--amber-soft)', border: '1px solid #f2d3a9' }}>
                    <div className="row gap-8" style={{ marginBottom: 10 }}><Icon name="note" size={18} style={{ color: '#9a5500' }} /><span style={{ fontWeight: 700 }}>Mes notes</span><span className="tiny muted" style={{ marginLeft: 'auto' }}>Enregistré · 14:32</span></div>
                    <p className="small" style={{ lineHeight: 1.7 }}>• Server Components = par défaut, rendus côté serveur, pas de JS envoyé au client.<br/>• "use client" → nécessaire pour useState, useEffect, événements.<br/>• On peut passer un Server Component en children d'un Client Component. 👈 important !</p>
                  </div>
                  <textarea className="input" placeholder="Ajoute une note à cet instant de la vidéo…" style={{ height: 100, paddingTop: 12, marginTop: 14, resize: 'none' }} />
                </div>
              )}
              {tab === 'ressources' && (
                <div className="col gap-10 anim-in">
                  {[
                    { ic: 'pdf', col: 'rose', t: 'Cheat-sheet — Server vs Client', d: 'PDF · 1,2 Mo' },
                    { ic: 'doc', col: 'brand', t: 'Code de départ (repo GitHub)', d: 'Lien externe' },
                    { ic: 'link', col: 'violet', t: 'Documentation officielle Next.js', d: 'nextjs.org/docs' },
                    { ic: 'download', col: 'teal', t: 'Slides de la leçon', d: 'PDF · 3,4 Mo' },
                  ].map((r, i) => (
                    <div key={i} className="row gap-12 card card-pad" style={{ padding: '14px 16px', cursor: 'pointer' }}>
                      <div className={'edu-notif-ic edu-ic-' + r.col} style={{ width: 38, height: 38 }}><Icon name={r.ic} size={18} /></div>
                      <div className="col grow"><span style={{ fontWeight: 650, fontSize: 14.5 }}>{r.t}</span><span className="tiny muted">{r.d}</span></div>
                      <Icon name="download" size={18} style={{ color: 'var(--ink-3)' }} />
                    </div>
                  ))}
                </div>
              )}
              {tab === 'qa' && (
                <div className="col gap-16 anim-in">
                  <div className="input-icon"><Icon name="message" /><input className="input" placeholder="Pose une question sur cette leçon…" /></div>
                  {[
                    { n: 'Camille B.', col: 'brand', q: "Est-ce qu'on peut utiliser un hook dans un Server Component ?", a: 'Non — les hooks comme useState nécessitent "use client". C\'est exactement le sujet de cette leçon !', votes: 12 },
                    { n: 'Yanis M.', col: 'violet', q: 'Quelle est la différence entre layout.js et template.js ?', a: 'layout persiste entre les navigations, template se remonte à chaque fois.', votes: 8 },
                  ].map((item, i) => (
                    <div key={i} className="panel card-pad">
                      <div className="row gap-10"><div className="avatar avatar-sm" style={{ background: `var(--${item.col}-soft)`, color: `var(--${item.col})` }}>{item.n.split(' ').map(w=>w[0]).join('')}</div><span style={{ fontWeight: 650, fontSize: 14 }}>{item.n}</span><span className="badge" style={{ marginLeft: 'auto' }}><Icon name="heart" size={12} fill style={{ color: 'var(--rose)' }} />{item.votes}</span></div>
                      <p className="small" style={{ margin: '10px 0', fontWeight: 600 }}>{item.q}</p>
                      <div className="row gap-8" style={{ paddingLeft: 12, borderLeft: '2px solid var(--border-2)' }}>
                        <span className="tiny" style={{ color: 'var(--violet)', fontWeight: 700, whiteSpace: 'nowrap' }}>SL ·</span>
                        <span className="small muted">{item.a}</span>
                      </div>
                    </div>
                  ))}
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
            <span className="tiny muted" style={{ marginTop: 8, display: 'block' }}><b style={{ color: 'var(--brand)' }}>{pct}%</b> complété · {modules.length} modules · {course.hours}h</span>
          </div>
          <div className="scroll-y" style={{ flex: 1 }}>
            {modules.map((m, mi) => {
              const open = openMods.has(m.id);
              const mDone = m.lessons.filter(l => done.has(l.id)).length;
              return (
                <div key={m.id} className="course-module">
                  <div className="course-module-head" onClick={() => toggleMod(m.id)}>
                    <div className="course-check" style={mDone === m.lessons.length ? { background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' } : undefined}>
                      {mDone === m.lessons.length ? <Icon name="check" size={13} stroke={3} /> : <span className="tiny tnum" style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{mi+1}</span>}
                    </div>
                    <div className="col grow" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 650, fontSize: 13.5 }}>{m.title}</span>
                      <span className="tiny muted">{mDone}/{m.lessons.length} · {m.lessons.length} leçons</span>
                    </div>
                    <Icon name="chevD" size={17} style={{ color: 'var(--ink-4)', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .2s' }} />
                  </div>
                  {open && m.lessons.map(l => (
                    <div key={l.id} className={'course-lesson' + (l.id === currentId ? ' is-current' : '')} onClick={() => goLesson(l)}>
                      <div className="course-check" style={done.has(l.id) ? { background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' } : undefined} onClick={(e) => { e.stopPropagation(); toggleDone(l.id); }}>
                        {done.has(l.id) && <Icon name="check" size={12} stroke={3} />}
                      </div>
                      <div className="course-lesson-ic"><Icon name={lessonIcon[l.type] || 'play'} size={15} fill={l.type==='video'} /></div>
                      <div className="col grow" style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: l.id === currentId ? 700 : 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</span>
                        <span className="tiny muted">{l.type === 'quiz' ? 'Quiz' : l.type === 'pdf' ? 'Ressource' : l.type === 'project' ? 'Projet' : 'Vidéo'} · {l.dur}</span>
                      </div>
                      {l.type === 'quiz' && <button className="btn btn-soft btn-sm" style={{ height: 28, padding: '0 10px' }} onClick={(e) => { e.stopPropagation(); go('quiz'); }}>Lancer</button>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-primary btn-block" onClick={next}>Leçon suivante<Icon name="arrowR" size={17} /></button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
