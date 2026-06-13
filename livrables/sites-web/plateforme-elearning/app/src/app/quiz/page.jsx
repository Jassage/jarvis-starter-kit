'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import { EDU } from '@/lib/data';
import { useGo } from '@/lib/navigation';

export default function QuizPage() {
  const go = useGo();
  const Q = EDU.quiz;
  const quizList = EDU.quizzes || [];

  const [phase, setPhase] = useState('list'); // list | intro | playing | result
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [time, setTime] = useState(Q.duration);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (time <= 0) { setPhase('result'); return; }
    const t = setTimeout(() => setTime(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, time]);

  const q = Q.questions[idx];
  const total = Q.questions.length;
  const selected = answers[idx];
  const score = Q.questions.reduce((s, qq, i) => s + (answers[i] === qq.answer ? 1 : 0), 0);
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;
  const mm = String(Math.floor(time / 60)).padStart(2, '0');
  const ss = String(time % 60).padStart(2, '0');

  const pick = (oi) => { if (revealed) return; setAnswers(a => ({ ...a, [idx]: oi })); };
  const check = () => setRevealed(true);
  const next = () => { setRevealed(false); if (idx < total - 1) setIdx(idx + 1); else setPhase('result'); };
  const restart = () => { setPhase('intro'); setIdx(0); setAnswers({}); setRevealed(false); setTime(Q.duration); };
  const backToList = () => { setPhase('list'); setIdx(0); setAnswers({}); setRevealed(false); setTime(Q.duration); };

  /* ────────────── LIST ────────────── */
  if (phase === 'list') {
    const doneQ = quizList.filter(qz => qz.status === 'done');
    const availableQ = quizList.filter(qz => qz.status === 'available');
    const lockedQ = quizList.filter(qz => qz.status === 'locked');
    const avgScore = doneQ.length > 0 ? Math.round(doneQ.reduce((s, qz) => s + qz.score, 0) / doneQ.length) : null;

    const QCard = ({ qz }) => (
      <div className="card card-pad row gap-16 anim-up"
        style={{ alignItems: 'flex-start', opacity: qz.status === 'locked' ? 0.55 : 1 }}>
        <div className={'edu-notif-ic ' + (qz.status === 'done' ? 'edu-ic-green' : qz.status === 'locked' ? '' : 'edu-ic-violet')}
          style={{ marginTop: 2, flexShrink: 0 }}>
          <Icon name={qz.status === 'done' ? 'checkCircle' : qz.status === 'locked' ? 'circle' : 'quiz'} size={18} />
        </div>
        <div className="col grow" style={{ minWidth: 0 }}>
          <div className="row between gap-12" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{qz.title}</div>
              <div className="small muted" style={{ marginTop: 3 }}>{qz.module} · {qz.course}</div>
            </div>
            <span className={'badge ' + (qz.status === 'done' ? (qz.passed ? 'badge-green' : 'badge-rose') : qz.status === 'locked' ? '' : 'badge-brand')}
              style={{ flexShrink: 0 }}>
              {qz.status === 'done' ? (qz.passed ? 'Réussi' : 'Échoué') : qz.status === 'locked' ? 'Verrouillé' : 'Disponible'}
            </span>
          </div>
          <div className="row gap-18" style={{ marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="quiz" size={13} />{qz.questions} questions
            </span>
            <span className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="clock" size={13} />{qz.minutes} min
            </span>
            {qz.status === 'done' && (
              <span className="tnum" style={{ fontWeight: 800, fontSize: 16, color: qz.passed ? 'var(--green)' : 'var(--rose)', marginLeft: 'auto' }}>
                {qz.score}%
              </span>
            )}
          </div>
        </div>
        {qz.status !== 'locked' && (
          <button
            className={'btn btn-sm ' + (qz.status === 'available' ? 'btn-primary' : 'btn-outline')}
            style={{ flexShrink: 0, alignSelf: 'center' }}
            onClick={qz.status === 'available' ? () => setPhase('intro') : restart}>
            {qz.status === 'available' ? 'Commencer' : 'Repasser'}
          </button>
        )}
      </div>
    );

    return (
      <AppShell role="student" active="quiz" go={go} search={false}
        title="Évaluations" subtitle="Tes quiz et examens disponibles">
        <div className="edu-content-narrow" style={{ maxWidth: 720 }}>
          {/* Stats summary */}
          <div className="edu-grid edu-grid-3" style={{ marginBottom: 28 }}>
            {[
              { val: doneQ.length, label: 'Complétés', color: 'var(--green)' },
              { val: availableQ.length, label: 'Disponibles', color: 'var(--brand)' },
              { val: avgScore != null ? avgScore + '%' : '–', label: 'Score moyen', color: 'var(--ink)' },
            ].map((s, i) => (
              <div key={i} className="card card-pad col" style={{ alignItems: 'center', textAlign: 'center', gap: 4 }}>
                <span className="tnum" style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.val}</span>
                <span className="small muted">{s.label}</span>
              </div>
            ))}
          </div>

          {availableQ.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 className="h3" style={{ marginBottom: 14 }}>Disponibles</h2>
              <div className="col gap-12">{availableQ.map(qz => <QCard key={qz.id} qz={qz} />)}</div>
            </section>
          )}

          {doneQ.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 className="h3" style={{ marginBottom: 14 }}>Complétés</h2>
              <div className="col gap-12">{doneQ.map(qz => <QCard key={qz.id} qz={qz} />)}</div>
            </section>
          )}

          {lockedQ.length > 0 && (
            <section>
              <h2 className="h3" style={{ marginBottom: 14, color: 'var(--ink-3)' }}>Verrouillés</h2>
              <div className="col gap-12">{lockedQ.map(qz => <QCard key={qz.id} qz={qz} />)}</div>
            </section>
          )}
        </div>
      </AppShell>
    );
  }

  /* ────────────── INTRO ────────────── */
  if (phase === 'intro') {
    return (
      <AppShell role="student" active="quiz" go={go} search={false} title="Évaluation" subtitle={Q.course}>
        <div className="edu-content-narrow" style={{ maxWidth: 680 }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={backToList}>
            <Icon name="chevL" size={16} />Retour aux évaluations
          </button>
          <div className="card anim-up" style={{ overflow: 'hidden' }}>
            <div className="edu-hero-banner" style={{ borderRadius: 0 }}>
              <div className="lp-stats-grid" />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', whiteSpace: 'nowrap' }}>
                  <Icon name="quiz" size={14} />Quiz du module 3
                </span>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 14, letterSpacing: '-0.02em' }}>{Q.title}</h1>
                <p style={{ color: 'rgba(255,255,255,.8)', marginTop: 8 }}>Valide tes acquis sur le routing et les Server Components.</p>
              </div>
            </div>
            <div className="card-pad">
              <div className="edu-grid edu-grid-3" style={{ gap: 12, marginBottom: 20 }}>
                {[['quiz', total + ' questions', 'Choix multiples'], ['clock', '10 min', 'Temps limité'], ['target', '60%', 'Pour réussir']].map(([ic, a, b], i) => (
                  <div key={i} className="panel card-pad col gap-6" style={{ alignItems: 'center', textAlign: 'center', padding: 16 }}>
                    <Icon name={ic} size={22} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontWeight: 750, fontSize: 15, whiteSpace: 'nowrap' }}>{a}</span>
                    <span className="tiny muted" style={{ whiteSpace: 'nowrap' }}>{b}</span>
                  </div>
                ))}
              </div>
              <div className="panel card-pad" style={{ background: 'var(--bg-2)', border: 'none' }}>
                <h3 className="h4" style={{ marginBottom: 8 }}>Consignes</h3>
                <div className="col gap-7">
                  {['Une seule bonne réponse par question.', 'Le chronomètre démarre dès que tu commences.', "Un feedback s'affiche après chaque réponse.", 'Tu peux repasser le quiz autant de fois que tu veux.'].map((t, i) => (
                    <div key={i} className="row gap-8 small muted">
                      <Icon name="check" size={15} style={{ color: 'var(--green)', flexShrink: 0 }} stroke={2.6} />{t}
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} onClick={() => setPhase('playing')}>
                Commencer le quiz<Icon name="arrowR" size={18} />
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ────────────── RESULT ────────────── */
  if (phase === 'result') {
    const r = 70, c = 2 * Math.PI * r;
    return (
      <AppShell role="student" active="quiz" go={go} search={false} title="Résultat du quiz" subtitle={Q.course}>
        <div className="edu-content-narrow" style={{ maxWidth: 680 }}>
          <div className="card card-pad anim-up" style={{ textAlign: 'center', padding: '36px 28px' }}>
            <span className={'badge ' + (passed ? 'badge-green' : 'badge-rose')} style={{ height: 28 }}>
              {passed ? '🎉 Réussi !' : 'À retravailler'}
            </span>
            <div className="quiz-result-ring" style={{ margin: '22px auto 18px' }}>
              <svg width="160" height="160" className="edu-ring">
                <circle cx="80" cy="80" r={r} fill="none" strokeWidth="13" className="edu-ring-track" />
                <circle cx="80" cy="80" r={r} fill="none" strokeWidth="13"
                  stroke={passed ? 'var(--green)' : 'var(--rose)'}
                  strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - c * pct / 100}
                  className="edu-ring-fill" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="tnum" style={{ fontSize: 38, fontWeight: 800 }}>{pct}%</span>
                <span className="small muted">{score}/{total} correct</span>
              </div>
            </div>
            <h2 className="h2" style={{ fontSize: 22 }}>{passed ? 'Bravo, tu maîtrises le sujet !' : 'Encore un petit effort'}</h2>
            <p className="muted" style={{ marginTop: 8, maxWidth: 420, marginInline: 'auto' }}>
              {passed ? 'Tu as débloqué la suite du module. Continue sur ta lancée !' : 'Revois la leçon sur les Server Components puis retente ta chance.'}
            </p>
            <div className="row gap-12" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={backToList}><Icon name="chevL" size={17} />Évaluations</button>
              <button className="btn btn-outline" onClick={restart}><Icon name="refresh" size={17} />Recommencer</button>
              <button className="btn btn-primary" onClick={() => go('course')}>Continuer le cours<Icon name="arrowR" size={17} /></button>
            </div>
          </div>

          <h3 className="h3" style={{ margin: '26px 0 14px' }}>Corrigé détaillé</h3>
          <div className="col gap-12">
            {Q.questions.map((qq, i) => {
              const ok = answers[i] === qq.answer;
              return (
                <div key={i} className="card card-pad">
                  <div className="row gap-10" style={{ alignItems: 'flex-start' }}>
                    <div className="course-check" style={{ marginTop: 1, background: ok ? 'var(--green)' : 'var(--rose)', borderColor: ok ? 'var(--green)' : 'var(--rose)', color: '#fff' }}>
                      <Icon name={ok ? 'check' : 'close'} size={13} stroke={3} />
                    </div>
                    <div className="col grow gap-8">
                      <span style={{ fontWeight: 650, fontSize: 14.5 }}>{i + 1}. {qq.q}</span>
                      <div className="row gap-8 small">
                        <span className="muted">Ta réponse :</span>
                        <span style={{ fontWeight: 650, color: ok ? 'var(--green)' : 'var(--rose)' }}>
                          {answers[i] != null ? qq.options[answers[i]] : 'Non répondu'}
                        </span>
                      </div>
                      {!ok && (
                        <div className="row gap-8 small">
                          <span className="muted">Bonne réponse :</span>
                          <span style={{ fontWeight: 650, color: 'var(--green)' }}>{qq.options[qq.answer]}</span>
                        </div>
                      )}
                      <p className="tiny muted" style={{ background: 'var(--bg-2)', padding: '9px 11px', borderRadius: 8, lineHeight: 1.5 }}>
                        💡 {qq.explain}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  /* ────────────── PLAYING ────────────── */
  return (
    <AppShell role="student" active="quiz" go={go} search={false} title={Q.title} subtitle={`Question ${idx + 1} sur ${total}`}>
      <div className="quiz-wrap anim-in">
        <div className="row between" style={{ marginBottom: 22 }}>
          <div className="quiz-dots">
            {Q.questions.map((_, i) => <div key={i} className={'quiz-dot' + (i < idx ? ' done' : i === idx ? ' current' : '')} />)}
          </div>
          <div className={'quiz-timer' + (time < 60 ? ' warn' : '')}>
            <Icon name="clock" size={17} />{mm}:{ss}
          </div>
        </div>

        <div className="card card-pad" key={idx} style={{ padding: '28px' }}>
          <span className="eyebrow">Question {idx + 1}</span>
          <h2 className="h2" style={{ fontSize: 21, marginTop: 10, lineHeight: 1.35 }}>{q.q}</h2>

          <div className="col gap-12" style={{ marginTop: 24 }}>
            {q.options.map((opt, oi) => {
              let cls = 'quiz-opt';
              if (revealed) {
                if (oi === q.answer) cls += ' correct';
                else if (oi === selected) cls += ' wrong';
              } else if (selected === oi) cls += ' selected';
              return (
                <button key={oi} className={cls} onClick={() => pick(oi)}>
                  <span className="quiz-opt-key">{String.fromCharCode(65 + oi)}</span>
                  <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1 }}>{opt}</span>
                  {revealed && oi === q.answer && <Icon name="checkCircle" size={20} style={{ color: 'var(--green)' }} />}
                  {revealed && oi === selected && oi !== q.answer && <Icon name="close" size={18} style={{ color: 'var(--rose)' }} />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="panel card-pad anim-up" style={{ marginTop: 18, background: selected === q.answer ? 'var(--green-soft)' : 'var(--bg-2)', border: 'none' }}>
              <div className="row gap-8" style={{ marginBottom: 6 }}>
                <Icon name={selected === q.answer ? 'checkCircle' : 'sparkle'} size={18}
                  style={{ color: selected === q.answer ? '#006836' : 'var(--brand)' }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{selected === q.answer ? 'Correct !' : 'Explication'}</span>
              </div>
              <p className="small muted" style={{ lineHeight: 1.55 }}>{q.explain}</p>
            </div>
          )}
        </div>

        <div className="row between" style={{ marginTop: 22 }}>
          <button className="btn btn-ghost" onClick={backToList}>Quitter</button>
          {!revealed
            ? <button className="btn btn-primary" disabled={selected == null}
                style={selected == null ? { opacity: .5, pointerEvents: 'none' } : undefined}
                onClick={check}>Valider<Icon name="check" size={17} /></button>
            : <button className="btn btn-primary" onClick={next}>
                {idx < total - 1 ? 'Question suivante' : 'Voir le résultat'}<Icon name="arrowR" size={17} />
              </button>
          }
        </div>
      </div>
    </AppShell>
  );
}
