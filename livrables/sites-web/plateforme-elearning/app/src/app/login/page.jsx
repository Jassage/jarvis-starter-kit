'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession, getCsrfToken } from 'next-auth/react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import { useGo } from '@/lib/navigation';
import { registerUser } from '@/lib/actions/auth';

export default function Auth() {
  const go = useGo();
  const [mode, setMode] = useState('login'); // login | signup
  const [role, setRole] = useState('student');
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isSignup = mode === 'signup';
  const emailOk = /\S+@\S+\.\S+/.test(email);

  // Pre-charge le cookie CSRF des l'affichage du formulaire pour eviter une
  // course entre la recuperation du token et la soumission du login.
  useEffect(() => { getCsrfToken(); }, []);

  const redirectByRole = (r) => {
    const role = (r || 'STUDENT').toLowerCase();
    go(role === 'teacher' ? 'teacher' : role === 'admin' ? 'admin' : 'student');
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (!email || !emailOk || !password) return;
    if (isSignup && !name) { setError('Indique ton nom complet.'); return; }

    setLoading(true);
    try {
      if (isSignup) {
        const res = await registerUser({ name, email, password, role });
        if (res?.error) { setError(res.error); setLoading(false); return; }
      }

      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Email ou mot de passe incorrect.');
        setLoading(false);
        return;
      }

      const session = await getSession();
      if (!session?.user) {
        setError('La connexion a échoué. Réessaie.');
        setLoading(false);
        return;
      }
      redirectByRole(session.user.role);
    } catch (err) {
      setError('Une erreur est survenue. Réessaie.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* Left — brand panel */}
      <aside className="auth-aside">
        <div className="auth-aside-grid" />
        <div className="lp-blob" style={{ width: 360, height: 360, background: 'var(--violet)', top: -80, left: -60, opacity: .55 }} />
        <div className="lp-blob" style={{ width: 320, height: 320, background: 'var(--brand)', bottom: -100, right: -40, opacity: .5 }} />
        <div className="auth-aside-inner">
          <button onClick={() => go('landing')} style={{ display: 'flex' }}><Logo size={32} light /></button>
          <div style={{ marginTop: 'auto' }}>
            <div className="row gap-4" style={{ color: 'var(--amber)', marginBottom: 18 }}>{[0,1,2,3,4].map(i => <Icon key={i} name="star" size={18} fill />)}</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, textWrap: 'balance' }}>
              « EduSpher a complètement changé ma façon d'apprendre. Tout est clair, motivant et concret. »
            </h2>
            <div className="row gap-12" style={{ marginTop: 22 }}>
              <div className="avatar avatar-lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>CB</div>
              <div className="col">
                <span style={{ fontWeight: 700, color: '#fff' }}>Camille Bernard</span>
                <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 13.5 }}>Devenue développeuse front-end</span>
              </div>
            </div>
          </div>
          <div className="row gap-24" style={{ marginTop: 40, paddingTop: 26, borderTop: '1px solid rgba(255,255,255,.15)' }}>
            {[['48k+','Apprenants'],['312','Cours'],['94%','Satisfaction']].map(([n, l], i) => (
              <div key={i} className="col">
                <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }} className="tnum">{n}</span>
                <span style={{ color: 'rgba(255,255,255,.65)', fontSize: 13 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <main className="auth-main scroll-y">
        <div className="auth-topbar">
          <button className="btn btn-ghost btn-sm edu-mobile-only" onClick={() => go('landing')}><Icon name="chevL" size={16} />Retour</button>
          <span className="small muted" style={{ marginLeft: 'auto' }}>
            {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button onClick={() => { setMode(isSignup ? 'login' : 'signup'); setTouched(false); }} style={{ color: 'var(--brand)', fontWeight: 700 }}>
              {isSignup ? 'Se connecter' : 'Créer un compte'}
            </button>
          </span>
        </div>

        <div className="auth-form anim-up">
          <h1 className="h1" style={{ fontSize: 28 }}>{isSignup ? 'Créer ton compte' : 'Content de te revoir'}</h1>
          <p className="muted" style={{ marginTop: 8 }}>{isSignup ? "Commence à apprendre gratuitement en moins d'une minute." : "Connecte-toi pour reprendre là où tu t'es arrêté."}</p>

          {isSignup && (
            <div className="auth-roletabs" style={{ marginTop: 24 }}>
              {[['student','user','Je suis étudiant'],['teacher','briefcase','Je suis formateur']].map(([r, ic, lbl]) => (
                <button key={r} className={'auth-roletab' + (role === r ? ' is-active' : '')} onClick={() => setRole(r)}>
                  <Icon name={ic} size={18} /><span>{lbl}</span>
                </button>
              ))}
            </div>
          )}

          <form className="col gap-16" onSubmit={submit}>
            {isSignup && (
              <div className="field">
                <label className="label">Nom complet</label>
                <input className="input" placeholder="Julien Mercier" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label className="label">Adresse email</label>
              <div className="input-icon">
                <Icon name="message" />
                <input className="input" type="email" placeholder="julien@exemple.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={touched && !emailOk ? { borderColor: 'var(--rose)' } : undefined} />
              </div>
              {touched && !emailOk && <span className="tiny" style={{ color: 'var(--rose)', fontWeight: 600 }}>Entre une adresse email valide.</span>}
            </div>
            <div className="field">
              <div className="row between">
                <label className="label">Mot de passe</label>
                {!isSignup && <button type="button" className="tiny" style={{ color: 'var(--brand)', fontWeight: 650 }} onClick={() => go('auth')}>Oublié ?</button>}
              </div>
              <div className="input-icon">
                <Icon name="shield" />
                <input className="input" type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} aria-label="Afficher">
                  <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
              {isSignup && <span className="tiny muted">Au moins 8 caractères, avec un chiffre.</span>}
            </div>

            {isSignup && (
              <label className="row gap-10" style={{ cursor: 'pointer', alignItems: 'flex-start' }}>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18, marginTop: 1, accentColor: 'var(--brand)' }} />
                <span className="tiny muted">J'accepte les <a style={{ color: 'var(--brand)', fontWeight: 600 }}>conditions d'utilisation</a> et la <a style={{ color: 'var(--brand)', fontWeight: 600 }}>politique de confidentialité</a>.</span>
              </label>
            )}

            {error && <p className="tiny" style={{ color: 'var(--rose)', fontWeight: 600 }}>{error}</p>}

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Patiente…' : isSignup ? 'Créer mon compte' : 'Se connecter'}{!loading && <Icon name="arrowR" size={18} />}
            </button>
          </form>

          <p className="tiny muted" style={{ textAlign: 'center', marginTop: 22 }}>
            🔒 Connexion sécurisée · Tes données ne sont jamais revendues.
          </p>
        </div>
      </main>
    </div>
  );
}
