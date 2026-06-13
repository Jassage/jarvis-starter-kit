'use client';

import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import { useGo } from '@/lib/navigation';

export default function ComingSoon() {
  const go = useGo();

  return (
    <div className="col" style={{
      minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
      gap: 22, padding: 24, textAlign: 'center', background: 'var(--bg-2)',
    }}>
      <button onClick={() => go('landing')} style={{ display: 'flex' }}><Logo size={32} /></button>
      <div className="edu-stat-ic edu-ic-violet" style={{ width: 60, height: 60, borderRadius: 'var(--r-xl)' }}>
        <Icon name="sparkle" size={28} />
      </div>
      <div className="col gap-8">
        <h1 className="h2" style={{ fontSize: 26 }}>Cette page arrive bientôt</h1>
        <p className="muted" style={{ maxWidth: 420 }}>
          Nous travaillons encore sur cette section d'EduSpher. Reviens un peu plus tard, elle sera prête !
        </p>
      </div>
      <button className="btn btn-primary" onClick={() => go('landing')}>
        <Icon name="arrowR" size={17} style={{ transform: 'scaleX(-1)' }} />Retour à l'accueil
      </button>
    </div>
  );
}
