'use client';
import { useEffect, useRef, useState } from 'react';
import { UploadCloud, Save, RadioTower } from 'lucide-react';
import { useConfigStore, PositionOverlay } from '@/stores/configStore';

const POSITIONS: { value: PositionOverlay; label: string }[] = [
  { value: 'HAUT_GAUCHE', label: 'Haut gauche' },
  { value: 'HAUT_DROITE', label: 'Haut droite' },
  { value: 'BAS_GAUCHE', label: 'Bas gauche' },
  { value: 'BAS_DROITE', label: 'Bas droite' },
];

const PREVIEW_POS: Record<PositionOverlay, React.CSSProperties> = {
  HAUT_GAUCHE: { top: '8%', left: '5%' },
  HAUT_DROITE: { top: '8%', right: '5%' },
  BAS_GAUCHE: { bottom: '8%', left: '5%' },
  BAS_DROITE: { bottom: '8%', right: '5%' },
};

export default function ParametresPage() {
  const { config, fetchConfig, updateConfig, uploadLogo } = useConfigStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nomChaine, setNomChaine] = useState('');
  const [logoPosition, setLogoPosition] = useState<PositionOverlay>('HAUT_DROITE');
  const [logoOpacite, setLogoOpacite] = useState(0.9);
  const [logoActif, setLogoActif] = useState(true);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  const initialise = useRef(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Initialisation des champs une seule fois (au premier chargement de la config).
  // Ne pas resynchroniser à chaque changement de `config` : sinon l'upload du logo
  // (qui met à jour `config`) écraserait les saisies non encore enregistrées.
  useEffect(() => {
    if (config && !initialise.current) {
      initialise.current = true;
      setNomChaine(config.nomChaine);
      setLogoPosition(config.logoPosition);
      setLogoOpacite(config.logoOpacite);
      setLogoActif(config.logoActif);
    }
  }, [config]);

  const handleSave = async () => {
    setErreur(''); setMessage('');
    try {
      await updateConfig({ nomChaine, logoPosition, logoOpacite, logoActif });
      setMessage('Configuration enregistrée.');
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Enregistrement impossible');
    }
  };

  const handleUpload = async (file: File) => {
    setErreur(''); setMessage('');
    try {
      await uploadLogo(file);
      setMessage('Logo mis à jour.');
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Upload impossible');
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2">
        <RadioTower className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Identité de la chaîne</h1>
      </div>

      {message && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>{message}</div>}
      {erreur && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}

      <div className="card p-5 space-y-5">
        <div>
          <label className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>NOM DE LA CHAÎNE</label>
          <input className="input mt-2" value={nomChaine} onChange={(e) => setNomChaine(e.target.value)} maxLength={60} />
        </div>

        <div>
          <label className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>LOGO PERMANENT</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative w-48 aspect-video rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-line)' }}>
              {config?.logoUrl && logoActif && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.logoUrl} alt="logo" className="absolute h-6 w-auto" style={{ ...PREVIEW_POS[logoPosition], opacity: logoOpacite }} />
              )}
              <span className="absolute inset-0 flex items-center justify-center text-[10px]" style={{ color: 'var(--color-ink-3)' }}>aperçu écran</span>
            </div>
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink)' }}>
                <UploadCloud className="w-4 h-4" /> Téléverser un logo
              </button>
              <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>PNG, JPEG ou WebP, 5 Mo max.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>POSITION</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setLogoPosition(p.value)}
                className="px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={logoPosition === p.value
                  ? { background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }
                  : { background: 'var(--color-surface-2)', color: 'var(--color-ink-2)' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>OPACITÉ — {Math.round(logoOpacite * 100)}%</label>
          <input type="range" min={0.1} max={1} step={0.05} value={logoOpacite} onChange={(e) => setLogoOpacite(Number(e.target.value))} className="w-full mt-2" />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={logoActif} onChange={(e) => setLogoActif(e.target.checked)} className="w-4 h-4" />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Afficher le logo à l'antenne</span>
        </label>

        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: 'var(--gradient-brand)', color: '#001018' }}>
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </div>
    </div>
  );
}
