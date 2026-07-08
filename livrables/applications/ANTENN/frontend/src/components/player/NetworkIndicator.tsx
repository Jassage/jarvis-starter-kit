'use client';
import { useEffect, useState } from 'react';
import { SignalHigh, SignalMedium, SignalLow } from 'lucide-react';

// navigator.connection (Network Information API) n'est pas supporté par tous les
// navigateurs (notamment Safari/iOS) — dégradation propre vers un simple libellé
// générique plutôt qu'un indicateur silencieusement absent.
export default function NetworkIndicator() {
  const [effectiveType, setEffectiveType] = useState<string | null>(null);

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (!conn) return;
    const update = () => setEffectiveType(conn.effectiveType);
    update();
    conn.addEventListener('change', update);
    return () => conn.removeEventListener('change', update);
  }, []);

  if (!effectiveType) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-ink-3)' }}>
        <SignalMedium className="w-3.5 h-3.5" /> Réseau
      </span>
    );
  }

  const isFast = effectiveType === '4g';
  const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g';
  const Icon = isFast ? SignalHigh : isSlow ? SignalLow : SignalMedium;
  const color = isFast ? 'var(--color-success)' : isSlow ? 'var(--color-danger)' : 'var(--color-warning)';
  const label = isFast ? '4G/Wi-Fi' : isSlow ? '2G — qualité réduite' : '3G';

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}
