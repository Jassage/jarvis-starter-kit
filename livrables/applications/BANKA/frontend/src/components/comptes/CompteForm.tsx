'use client';
import { useState, useEffect } from 'react';
import { useCompteStore } from '@/stores/compteStore';
import { useAuthStore } from '@/stores/authStore';
import { useConfigurationStore } from '@/stores/configurationStore';
import Tooltip from '@/components/ui/Tooltip';
import { formatMontant } from '@/lib/utils';

interface Props {
  clientId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  {
    value: 'EPARGNE',
    label: 'Épargne',
    desc: 'Dépôts réguliers, intérêts',
    icon: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
    color: '#047857', bg: '#ecfdf5', borderColor: '#10b981',
  },
  {
    value: 'COURANT',
    label: 'Courant',
    desc: 'Transactions quotidiennes',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    color: '#1e40af', bg: '#eef2ff', borderColor: '#2563eb',
  },
  {
    value: 'TERME',
    label: 'Terme fixe',
    desc: 'Fonds bloqués, rendement fixe',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#6d28d9', bg: '#f5f3ff', borderColor: '#7c3aed',
  },
  {
    value: 'JOINT',
    label: 'Compte joint',
    desc: 'Deux titulaires ou plus',
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
    color: '#0e7490', bg: '#ecfeff', borderColor: '#06b6d4',
  },
  {
    value: 'MICRO_EPARGNE',
    label: 'Micro-épargne',
    desc: 'Petits montants réguliers',
    icon: 'M12 22V12m0 0C10 9 11 4 12 2m0 10c2-3 1-8 0-10M8 18c-3-2-3-8 0-10M16 18c3-2 3-8 0-10',
    color: '#15803d', bg: '#f0fdf4', borderColor: '#22c55e',
  },
  {
    value: 'TONTINE',
    label: 'Tontine / Sol',
    desc: 'Épargne collective rotative',
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    color: '#c2410c', bg: '#fff7ed', borderColor: '#f97316',
  },
  {
    value: 'RETRAITE',
    label: 'Retraite',
    desc: 'Épargne à long terme',
    icon: 'M12 8v4l3 3M3 12a9 9 0 1018 0 9 9 0 00-18 0z',
    color: '#334155', bg: '#f1f5f9', borderColor: '#64748b',
  },
  {
    value: 'JEUNESSE',
    label: 'Jeunesse',
    desc: 'Compte pour mineurs',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
    color: '#0369a1', bg: '#f0f9ff', borderColor: '#38bdf8',
  },
  {
    value: 'CREDIT',
    label: 'Ligne de crédit',
    desc: 'Facilité de caisse revolving',
    icon: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM2 10h20',
    color: '#be123c', bg: '#fff1f2', borderColor: '#fb7185',
  },
];

export default function CompteForm({ clientId, onClose, onSuccess }: Props) {
  const { createCompte } = useCompteStore();
  const { utilisateur } = useAuthStore();
  const { configs, fetchConfigs } = useConfigurationStore();
  const [form, setForm] = useState({
    clientId: clientId || '',
    agenceId: utilisateur?.agenceId || '',
    type: 'EPARGNE',
    devise: 'HTG',
    soldeInitial: '',
    soldeMinimum: '',
    intitule: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (configs.length === 0) fetchConfigs(); }, []);

  const getConf = (cle: string) => parseFloat(configs.find(c => c.cle === cle)?.valeur || '0');
  const soldeMinInstitution = getConf('SOLDE_MINIMUM_OUVERTURE');
  const fraisOuverture      = getConf('FRAIS_OUVERTURE_COMPTE');
  const minimumRequis       = soldeMinInstitution + fraisOuverture;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const initial = form.soldeInitial ? parseFloat(form.soldeInitial) : 0;
    const minimum = form.soldeMinimum ? parseFloat(form.soldeMinimum) : 0;
    if (minimum > initial) {
      setError('Le solde minimum ne peut pas dépasser le solde initial');
      return;
    }
    if (minimumRequis > 0 && initial < minimumRequis) {
      const detail = fraisOuverture > 0
        ? ` (minimum ${soldeMinInstitution} + frais ${fraisOuverture} ${form.devise})`
        : ` (minimum institutionnel : ${soldeMinInstitution} ${form.devise})`;
      setError(`Solde d'ouverture insuffisant${detail}`);
      return;
    }
    setLoading(true);
    try {
      await createCompte({ ...form, soldeInitial: initial, soldeMinimum: minimum });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = TYPE_OPTIONS.find(t => t.value === form.type)!;

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel">
        {/* Header gradient */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: `linear-gradient(135deg, #1e3a8a, #2563eb)` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'white' }}>Ouvrir un compte</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Nouveau compte bancaire client</p>
          </div>
          <Tooltip content="Fermer sans enregistrer" position="left">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </Tooltip>
        </div>

        {/* Opérateur */}
        <div className="px-5 py-2 flex items-center gap-2 flex-shrink-0" style={{ background: '#f7f8fc', borderBottom: '1px solid #e7eaf3' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs" style={{ color: '#8b94b0' }}>Ouvert par :</span>
          <span className="user-badge user-badge-blue">{utilisateur?.prenom} {utilisateur?.nom} · {utilisateur?.role}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Type selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="label mb-0">Type de compte</label>
              <Tooltip content="Définit les règles de gestion et les opérations autorisées sur le compte" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const active = form.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('type', opt.value)}
                    className="p-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: active ? opt.bg : '#f7f8fc',
                      border: `2px solid ${active ? opt.borderColor : '#e7eaf3'}`,
                      transform: active ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: active ? opt.bg : '#f0f2f9', color: active ? opt.color : '#8b94b0' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d={opt.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="text-xs font-bold" style={{ color: active ? opt.color : '#0b1733' }}>{opt.label.replace('Compte ', '')}</p>
                    <p className="text-xs mt-0.5 leading-tight" style={{ color: '#8b94b0' }}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Devise */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="label mb-0">Devise</label>
              <Tooltip content="La devise ne peut pas être changée après la création du compte" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#f59e0b' }}>
                  <path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              {[
                { v: 'HTG', label: 'HTG — Gourde haïtienne', flag: '🇭🇹', from: '#1e3a8a', to: '#2563eb' },
                { v: 'USD', label: 'USD — Dollar américain', flag: '🇺🇸', from: '#065f46', to: '#059669' },
              ].map((d) => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => set('devise', d.v)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: form.devise === d.v ? `linear-gradient(135deg, ${d.from}, ${d.to})` : '#f7f8fc',
                    color: form.devise === d.v ? 'white' : '#4a5578',
                    border: form.devise === d.v ? '2px solid transparent' : '2px solid #e7eaf3',
                    transform: form.devise === d.v ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <span>{d.flag}</span> {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Montants */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="label mb-0">Solde initial</label>
                <Tooltip content="Montant déposé à l'ouverture du compte" position="top">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </Tooltip>
              </div>
              <div className="relative">
                <input type="number" min="0" step="0.01" value={form.soldeInitial} onChange={(e) => set('soldeInitial', e.target.value)} className="input" style={{ paddingRight: '3.5rem' }} placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#f0f2f9', color: '#4a5578' }}>{form.devise}</span>
              </div>
              {minimumRequis > 0 && (
                <p className="text-xs mt-1" style={{ color: form.soldeInitial && parseFloat(form.soldeInitial) < minimumRequis ? '#b91c1c' : '#8b94b0' }}>
                  Minimum requis : <strong>{minimumRequis.toLocaleString('fr-HT')} {form.devise}</strong>
                  {fraisOuverture > 0 && ` (dont ${fraisOuverture.toLocaleString('fr-HT')} ${form.devise} de frais d'ouverture)`}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="label mb-0">Solde minimum</label>
                <Tooltip content="Le solde ne peut pas descendre en dessous de ce seuil lors des retraits" position="top">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </Tooltip>
              </div>
              <div className="relative">
                <input type="number" min="0" step="0.01" value={form.soldeMinimum} onChange={(e) => set('soldeMinimum', e.target.value)} className="input" style={{ paddingRight: '3.5rem' }} placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#f0f2f9', color: '#4a5578' }}>{form.devise}</span>
              </div>
              {form.soldeMinimum && form.soldeInitial && parseFloat(form.soldeMinimum) > parseFloat(form.soldeInitial) && (
                <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Le minimum ne peut pas dépasser le solde initial</p>
              )}
            </div>
          </div>

          {/* Intitulé */}
          <div>
            <label className="label">Intitulé personnalisé (optionnel)</label>
            <input value={form.intitule} onChange={(e) => set('intitule', e.target.value)} className="input" placeholder="ex: Compte principal, Épargne scolaire, Fonds de roulement..." />
          </div>

          {/* Récapitulatif */}
          {(form.soldeInitial || form.soldeMinimum) && (
            <div className="p-3.5 rounded-xl" style={{ background: selectedType.bg, border: `1px solid ${selectedType.borderColor}40` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: selectedType.color }}>Récapitulatif</p>
              <div className="flex gap-4 text-xs" style={{ color: selectedType.color }}>
                {form.soldeInitial && <span>Ouverture : <strong>{formatMontant(parseFloat(form.soldeInitial), form.devise)}</strong></span>}
                {form.soldeMinimum && <span>Minimum : <strong>{formatMontant(parseFloat(form.soldeMinimum), form.devise)}</strong></span>}
                <span>Type : <strong>{selectedType.label}</strong></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="9" stroke="#b91c1c" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/></svg>
              <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
            </div>
          )}
        </form>

        <div className="px-5 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
          <button type="button" onClick={handleSubmit as any} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Ouverture...</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Ouvrir le compte</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
