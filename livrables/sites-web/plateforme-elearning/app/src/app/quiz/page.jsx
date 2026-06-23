'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import { useGo } from '@/lib/navigation';

export default function QuizPage() {
  const go = useGo();

  const [quizList, setQuizList] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null); // quiz data avec questions
  const [loadingList, setLoadingList] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [phase, setPhase] = useState('list'); // list | intro | playing | result
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [time, setTime] = useState(0);
  const [saving, setSaving] = useState(false);

  // Charge la liste des quizzes
  useEffect(() => {
    fetch('/api/quiz')
      .then(r => r.json())
      .then(data => { setQuizList(Array.isArray(data) ? data : []); setLoadingList(false); })
      .catch(() => setLoadingList(false));
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    if (time <= 0) { finishQuiz(); return; }
    const t = setTimeout(() => setTime(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, time]);

  const startQuiz = async (quizMeta) => {
    setLoadingQuiz(true);
    const res = await fetch(`/api/quiz/${quizMeta.id}`);
    const data = await res.json();
    if (data.error) { setLoadingQuiz(false); return; }
    setActiveQuiz(data);
    setTime(data.durationSeconds);
    setIdx(0);
    setAnswers({});
    setRevealed(false);
    setLoadingQuiz(false);
    setPhase('intro');
  };

  const finishQuiz = async () => {
    if (!activeQuiz) return;
    setPhase('result');
    const questions = activeQuiz.questions;
    const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;

    setSaving(true);
    try {
      await fetch(`/api/quiz/${activeQuiz.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: pct, passed }),
      });
      // Rafraîchit la liste
      const res = await fetch('/api/quiz');
      const data = await res.json();
      setQuizList(Array.isArray(data) ? data : []);
    } finally {
      setSaving(false);
    }
  };

  const pick = (oi) => { if (revealed) return; setAnswers(a => ({ ...a, [idx]: oi })); };
  const check = () => setRevealed(true);
  const next = () => {
    setRevealed(false);
    if (idx < activeQuiz.questions.length - 1) setIdx(idx + 1);
    else finishQuiz();
  };
  const restart = (quizMeta) => startQuiz(quizMeta);
  const backToList = () => { setPhase('list'); setActiveQuiz(null); };

  const q = activeQuiz?.questions?.[idx];
  const total = activeQuiz?.questions?.length || 0;
  const score = activeQuiz ? activeQuiz.questions.reduce((s, qq, i) => s + (answers[i] === qq.answer ? 1 : 0), 0) : 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= 60;
  const mm = String(Math.floor(time / 60)).padStart(2, '0');
  const ss = String(time % 60).padStart(2, '0');

  /* ────────────── LIST ────────────── */
  if (phase === 'list') {
    const doneQ = quizList.filter(qz => qz.status === 'passed' || qz.status === 'failed');
    const availableQ = quizList.filter(qz => qz.status === 'available');
    const avgScore = doneQ.length > 0
      ? Math.round(doneQ.reduce((s, qz) => s + (qz.lastAttempt?.score || 0), 0) / doneQ.length)
      : null;

    const QCard = ({ qz }) => (
      <div className="card card-pad row gap-16 anim-up" style={{ alignItems: 'flex-start' }}>
        <div className={'edu-notif-ic ' + (qz.status === 'passed' ? 'edu-ic-green' : qz.status === 'failed' ? 'edu-ic-rose' : 'edu-ic-violet')}
          style={{ marginTop: 2, flexShrink: 0 }}>
          <Icon name={qz.status === 'passed' ? 'checkCircle' : qz.status === 'failed' ? 'close' : 'quiz'} size={18} />
        </div>
        <div className="col grow" style={{ minWidth: 0 }}>
          <div className="row between gap-12" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{qz.title}</div>
              <div className="small muted" style={{ marginTop: 3 }}>{qz.module} · {qz.course}</div>
            </div>
            <span className={'badge ' + (qz.status === 'passed' ? 'badge-green' : qz.status === 'failed' ? 'badge-rose' : 'badge-brand')}
              style={{ flexShrink: 0 }}>
              {qz.status === 'passed' ? 'Réussi' : qz.status === 'failed' ? 'Échoué' : 'Disponible'}
            </span>
          </div>
          <div className="row gap-18" style={{ marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="quiz" size={13} />{qz.questionCount} questions
            </span>
            <span className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="clock" size={13} />{Math.round(qz.durationSeconds / 60)} min
            </span>
            {qz.lastAttempt && (
              <span className="tnum" style={{ fontWeight: 800, fontSize: 16, color: qz.status === 'passed' ? 'var(--green)' : 'var(--rose)', marginLeft: 'auto' }}>
                {qz.lastAttempt.score}%
              </span>
            )}
          </div>
        </div>
        <button
          className={'btn btn-sm ' + (qz.status === 'available' ? 'btn-primary' : 'btn-outline')}
          style={{ flexShrink: 0, alignSelf: 'center' }}
          disabled={loadingQuiz}
          onClick={() => qz.status === 'available' ? startQuiz(qz) : restart(qz)}>
          {qz.status === 'available' ? 'Commencer' : 'Repasser'}
        </button>
      </div>
    );

    return (
      <AppShell role="student" active="quiz" go={go} search={false}
        title="Évaluations" subtitle="Tes quiz et examens disponibles">
        <div className="edu-content-narrow" style={{ maxWidth: 720 }}>
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

          {loadingList ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 40 }}>Chargement…</div>
          ) : quizList.length === 0 ? (
            <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 40 }}>
              Aucun quiz disponible. Inscris-toi à un cours pour débloquer les évaluations.
            </div>
          ) : (
            <>
              {availableQ.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <h2 className="h3" style={{ marginBottom: 14 }}>Disponibles</h2>
                  <div className="col gap-12">{availableQ.map(qz => <QCard key={qz.id} qz={qz} />)}</div>
                </section>
              )}
              {doneQ.length > 0 && (
                <section>
                  <h2 className="h3" style={{ marginBottom: 14 }}>Complétés</h2>
                  <div className="col gap-12">{doneQ.map(qz => <QCard key={qz.id} qz={qz} />)}</div>
                </section>
              )}
            </>
          )}
        </div>
      </AppShell>
    );
  }

  if (!activeQuiz) return null;

  /* ────────────── INTRO ────────────── */
  if (phase === 'intro') {
    return (
      <AppShell role="student" active="quiz" go={go} search={false} title="Évaluation" subtitle="">
        <div className="edu-content-narrow" style={{ maxWidth: 680 }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={backToList}>
            <Icon name="chevL" size={16} />Retour aux évaluations
          </button>
          <div className="card anim-up" style={{ overflow: 'hidden' }}>
            <div className="edu-hero-banner" style={{ borderRadius: 0 }}>
              <div className="lp-stats-grid" />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{activeQuiz.title}</h1>
              </div>
            </div>
            <div className="card-pad">
              <div className="edu-grid edu-grid-3" style={{ gap: 12, marginBottom: 20 }}>
                {[
                  ['quiz', `${total} questions`, 'Choix multiples'],
                  ['clock', `${Math.round(activeQuiz.durationSeconds / 60)} min`, 'Temps limité'],
                  ['target', '60%', 'Pour réussir'],
                ].map(([ic, a, b], i) => (
                  <div key={i} className="panel card-pad col gap-6" style={{ alignItems: 'center', textAlign: 'center', padding: 16 }}>
                    <Icon name={ic} size={22} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontWeight: 750, fontSize: 15 }}>{a}</span>
                    <span className="tiny muted">{b}</span>
                  </div>
                ))}
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
      <AppShell role="student" active="quiz" go={go} search={false} title="Résultat du quiz" subtitle="">
        <div className="edu-content-narrow" style={{ maxWidth: 680 }}>
          <div className="card card-pad anim-up" style={{ textAlign: 'center', padding: '36px 28px' }}>
            <span className={'badge ' + (passed ? 'badge-green' : 'badge-rose')} style={{ height: 28 }}>
              {passed ? '🎉 Réussi !' : 'À retravailler'}
            </span>
            <div style={{ position: 'relative', margin: '22px auto 18px', width: 160, height: 160 }}>
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
            <h2 className="h2" style={{ fontSize: 22 }}>
              {passed ? 'Bravo, tu maîtrises le sujet !' : 'Encore un petit effort'}
            </h2>
            {saving && <p className="small muted" style={{ marginTop: 8 }}>Enregistrement du résultat…</p>}
            <div className="row gap-12" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={backToList}><Icon name="chevL" size={17} />Évaluations</button>
              <button className="btn btn-primary" onClick={() => go('course')}>Continuer le cours<Icon name="arrowR" size={17} /></button>
            </div>
          </div>

          <h3 className="h3" style={{ margin: '26px 0 14px' }}>Corrigé détaillé</h3>
          <div className="col gap-12">
            {activeQuiz.questions.map((qq, i) => {
              const ok = answers[i] === qq.answer;
              const opts = Array.isArray(qq.options) ? qq.options : JSON.parse(qq.options);
              return (
                <div key={i} className="card card-pad">
                  <div className="row gap-10" style={{ alignItems: 'flex-start' }}>
                    <div className="course-check" style={{ marginTop: 1, background: ok ? 'var(--green)' : 'var(--rose)', borderColor: ok ? 'var(--green)' : 'var(--rose)', color: '#fff' }}>
                      <Icon name={ok ? 'check' : 'close'} size={13} stroke={3} />
                    </div>
                    <div className="col grow gap-8">
                      <span style={{ fontWeight: 650, fontSize: 14.5 }}>{i + 1}. {qq.text}</span>
                      <div className="row gap-8 small">
                        <span className="muted">Ta réponse :</span>
                        <span style={{ fontWeight: 650, color: ok ? 'var(--green)' : 'var(--rose)' }}>
                          {answers[i] != null ? opts[answers[i]] : 'Non répondu'}
                        </span>
                      </div>
                      {!ok && (
                        <div className="row gap-8 small">
                          <span className="muted">Bonne réponse :</span>
                          <span style={{ fontWeight: 650, color: 'var(--green)' }}>{opts[qq.answer]}</span>
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
  if (!q) return null;
  const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options);
  const selected = answers[idx];

  return (
    <AppShell role="student" active="quiz" go={go} search={false}
      title={activeQuiz.title} subtitle={`Question ${idx + 1} sur ${total}`}>
      <div className="quiz-wrap anim-in">
        <div className="row between" style={{ marginBottom: 22 }}>
          <div className="quiz-dots">
            {activeQuiz.questions.map((_, i) => (
              <div key={i} className={'quiz-dot' + (i < idx ? ' done' : i === idx ? ' current' : '')} />
            ))}
          </div>
          <div className={'quiz-timer' + (time < 60 ? ' warn' : '')}>
            <Icon name="clock" size={17} />{mm}:{ss}
          </div>
        </div>

        <div className="card card-pad" key={idx} style={{ padding: '28px' }}>
          <span className="eyebrow">Question {idx + 1}</span>
          <h2 className="h2" style={{ fontSize: 21, marginTop: 10, lineHeight: 1.35 }}>{q.text}</h2>

          <div className="col gap-12" style={{ marginTop: 24 }}>
            {opts.map((opt, oi) => {
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
                onClick={check}>
                Valider<Icon name="check" size={17} />
              </button>
            : <button className="btn btn-primary" onClick={next}>
                {idx < total - 1 ? 'Question suivante' : 'Voir le résultat'}<Icon name="arrowR" size={17} />
              </button>
          }
        </div>
      </div>
    </AppShell>
  );
}
