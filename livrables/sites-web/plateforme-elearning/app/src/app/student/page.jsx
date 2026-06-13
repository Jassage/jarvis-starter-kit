'use client';

import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import CourseThumb from '@/components/CourseThumb';
import Stars from '@/components/Stars';
import StatCard from '@/components/StatCard';
import Ring from '@/components/Ring';
import { EDU } from '@/lib/data';
import { useGo } from '@/lib/navigation';

export default function StudentDashboard() {
  const go = useGo();
  const E = EDU;
  const enrolled = E.enrolled.map(e => ({ ...e, c: E.byId(e.id) }));
  const recs = [E.byId('c4'), E.byId('c6'), E.byId('c5')];

  return (
    <AppShell role="student" active="student" go={go} title="Bonjour, Julien 👋" subtitle="Tu es à 2 leçons de ton objectif hebdomadaire. Continue comme ça !">
      <div className="edu-content-narrow">
        {/* Stats */}
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="book" color="brand" label="Cours en cours" value="3" delta="+1" />
          <StatCard icon="clock" color="violet" label="Heures cette semaine" value="8,5 h" delta="+2,1h" />
          <StatCard icon="award" color="amber" label="Certificats obtenus" value="2" />
          <StatCard icon="fire" color="rose" label="Série d'apprentissage" value="7 j" delta="record" />
        </div>

        <div className="edu-cols">
          {/* LEFT */}
          <div className="col gap-24">
            {/* Continue learning */}
            <section>
              <div className="edu-section-title">
                <h2 className="h3">Reprendre l'apprentissage</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => go('course')}>Tout voir<Icon name="chevR" size={15} /></button>
              </div>
              <div className="col gap-12">
                {enrolled.map((e, i) => (
                  <div key={e.id} className="edu-continue anim-up" style={{ animationDelay: `${i*0.05}s` }} onClick={() => go('course')}>
                    <div className="edu-continue-thumb"><CourseThumb course={e.c} h={86} /></div>
                    <div className="col grow" style={{ minWidth: 0, justifyContent: 'center' }}>
                      <div className="row between gap-12">
                        <span className={'badge badge-' + e.c.color}>{e.c.cat}</span>
                        <span className="tiny muted edu-desktop-only">{e.lastSeen}</span>
                      </div>
                      <h3 className="h4" style={{ marginTop: 8, fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.c.title}</h3>
                      <div className="row gap-8 small muted" style={{ marginTop: 4 }}>
                        <Icon name="playCircle" size={15} /><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Suivant : {e.nextLesson}</span>
                      </div>
                      <div className="row gap-12" style={{ marginTop: 11 }}>
                        <div className="track grow"><div className="track-fill" style={{ width: e.progress + '%' }} /></div>
                        <span className="tiny tnum" style={{ fontWeight: 700, color: 'var(--brand)' }}>{e.progress}%</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-icon edu-desktop-only" style={{ alignSelf: 'center' }} aria-label="Reprendre"><Icon name="play" size={16} fill /></button>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            <section>
              <div className="edu-section-title">
                <div className="row gap-8"><Icon name="sparkle" size={18} style={{ color: 'var(--violet)' }} /><h2 className="h3">Recommandé pour toi</h2></div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('landing')}>Explorer<Icon name="chevR" size={15} /></button>
              </div>
              <div className="edu-grid edu-grid-3">
                {recs.map((c, i) => (
                  <div key={c.id} className="edu-rec-card anim-up" style={{ animationDelay: `${i*0.05}s` }} onClick={() => go('course')}>
                    <div style={{ padding: 9 }}><CourseThumb course={c} h={120} /></div>
                    <div style={{ padding: '4px 14px 16px' }}>
                      <h3 className="h4" style={{ fontSize: 14.5, lineHeight: 1.3, minHeight: 38 }}>{c.title}</h3>
                      <div className="row between" style={{ marginTop: 10 }}>
                        <Stars rating={c.rating} size={13} />
                        <span style={{ fontWeight: 800, fontSize: 14.5 }}>{c.price === 0 ? 'Gratuit' : c.price + '€'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certificats obtenus */}
            <section>
              <div className="edu-section-title">
                <div className="row gap-8"><Icon name="award" size={18} style={{ color: 'var(--amber)' }} /><h2 className="h3">Mes certificats</h2></div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('certificate')}>Voir tout<Icon name="chevR" size={15} /></button>
              </div>
              <div className="edu-grid edu-grid-2" style={{ gap: 12 }}>
                {(E.certificates || []).map((cert, i) => (
                  <div key={i} className="card anim-up" style={{ cursor: 'pointer', overflow: 'hidden', animationDelay: `${i * 0.05}s` }} onClick={() => go('certificate')}>
                    <div style={{ height: 4, background: `var(--${cert.color})` }} />
                    <div className="card-pad" style={{ paddingTop: 14 }}>
                      <div className="row gap-10" style={{ alignItems: 'flex-start' }}>
                        <div className={'edu-notif-ic edu-ic-' + cert.color} style={{ flexShrink: 0 }}>
                          <Icon name="award" size={18} />
                        </div>
                        <div className="col grow" style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.title}</div>
                          <div className="tiny muted" style={{ marginTop: 3 }}>{cert.instructor} · {cert.date}</div>
                          <div className="row between" style={{ marginTop: 10 }}>
                            <span className="badge badge-green badge-dot">Obtenu</span>
                            <span className="tnum" style={{ fontWeight: 800, fontSize: 14, color: `var(--${cert.color})` }}>{cert.score}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="col gap-18">
            {/* Weekly goal */}
            <div className="card card-pad col" style={{ alignItems: 'center', textAlign: 'center' }}>
              <h3 className="h4" style={{ alignSelf: 'flex-start' }}>Objectif de la semaine</h3>
              <div style={{ position: 'relative', margin: '14px 0 6px' }}>
                <Ring value={71} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="tnum" style={{ fontSize: 26, fontWeight: 800 }}>5/7</span>
                  <span className="tiny muted">leçons</span>
                </div>
              </div>
              <p className="small muted">Plus que <b style={{ color: 'var(--ink)' }}>2 leçons</b> pour valider ta semaine.</p>
              <button className="btn btn-soft btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => go('course')}>Continuer maintenant</button>
            </div>

            {/* Agenda */}
            <div className="card card-pad">
              <div className="row between" style={{ marginBottom: 6 }}>
                <h3 className="h4">À venir</h3>
                <Icon name="calendar" size={17} style={{ color: 'var(--ink-3)' }} />
              </div>
              {[
                { ic: 'quiz', col: 'violet', t: 'Quiz — Routing Next.js', d: "Aujourd'hui · 10 questions", cta: () => go('quiz') },
                { ic: 'video', col: 'brand', t: 'Live : Q&A Server Actions', d: 'Demain · 18:00' },
                { ic: 'flag', col: 'amber', t: 'Projet final à rendre', d: 'Dans 5 jours' },
              ].map((a, i) => (
                <div key={i} className="edu-list-row" style={{ cursor: a.cta ? 'pointer' : 'default' }} onClick={a.cta}>
                  <div className={'edu-notif-ic edu-ic-' + a.col}><Icon name={a.ic} size={16} /></div>
                  <div className="col" style={{ lineHeight: 1.3 }}>
                    <span style={{ fontWeight: 650, fontSize: 13.5 }}>{a.t}</span>
                    <span className="tiny muted">{a.d}</span>
                  </div>
                  {a.cta && <Icon name="chevR" size={16} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }} />}
                </div>
              ))}
            </div>

            {/* Certificate teaser */}
            <div className="edu-hero-banner" style={{ padding: '22px 22px' }}>
              <div className="lp-stats-grid" />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Icon name="award" size={26} />
                <h3 style={{ fontSize: 17, fontWeight: 750, marginTop: 10, color: '#fff' }}>Tu y es presque !</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>« Design UI/UX » est à 92%. Termine-le pour débloquer ton certificat.</p>
                <button className="btn btn-sm" style={{ background: '#fff', color: 'var(--brand-ink)', marginTop: 14 }} onClick={() => go('course')}>Terminer le cours</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
