'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import { useGo } from '@/lib/navigation';

export default function Auth() {
  const go = useGo();
  const [mode, setMode] = useState('login'); // login | signup
  const [role, setRole] = useState('student');
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const isSignup = mode === 'signup';
  const emailOk = /\S+@\S+\.\S+/.test(email);

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!email || !emailOk) return;
    go(role === 'teacher' ? 'teacher' : 'student');
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

          <button className="btn btn-outline btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => go(role === 'teacher' ? 'teacher' : 'student')}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.3-.18-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.6l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3.1a10 10 0 0 0 0 8.8z"/><path fill="#EA4335" d="M12 6.3c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.6l3.3 2.6C7.2 8 9.4 6.3 12 6.3z"/></svg>
            Continuer avec Google
          </button>

          <div className="auth-divider"><span>ou avec ton email</span></div>

          <form className="col gap-16" onSubmit={submit}>
            {isSignup && (
              <div className="field">
                <label className="label">Nom complet</label>
                <input className="input" placeholder="Julien Mercier" defaultValue="" />
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
                <input className="input" type={show ? 'text' : 'password'} placeholder="••••••••" defaultValue="" style={{ paddingRight: 44 }} />
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

            <button className="btn btn-primary btn-block btn-lg" type="submit" style={{ marginTop: 4 }}>
              {isSignup ? 'Créer mon compte' : 'Se connecter'}<Icon name="arrowR" size={18} />
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
