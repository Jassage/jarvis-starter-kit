'use client';
import { useEffect, useState } from 'react';
import { useConfigurationStore, Config } from '@/stores/configurationStore';
import { useAuthStore } from '@/stores/authStore';

const CATEGORIES: { label: string; cles: string[]; icon: string; color: string; bg: string }[] = [
  {
    label: 'Institution',
    icon: 'M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8',
    color: '#1e40af', bg: '#eef2ff',
    cles: ['NOM_INSTITUTION', 'ADRESSE_INSTITUTION', 'TELEPHONE_INSTITUTION', 'EMAIL_INSTITUTION'],
  },
  {
    label: 'Taux & Pénalités',
    icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
    color: '#b45309', bg: '#fffbeb',
    cles: ['TAUX_PENALITE_JOURNALIER', 'DELAI_GRACE_RETARD', 'TAUX_INTERET_EPARGNE'],
  },
  {
    label: 'Limites & Seuils',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: '#047857', bg: '#ecfdf5',
    cles: ['SOLDE_MINIMUM_OUVERTURE', 'PLAFOND_RETRAIT_JOURNALIER', 'DEVISE_PRINCIPALE'],
  },
];

const LABELS: Record<string, string> = {
  NOM_INSTITUTION: 'Nom de l\'institution',
  ADRESSE_INSTITUTION: 'Adresse',
  TELEPHONE_INSTITUTION: 'Téléphone',
  EMAIL_INSTITUTION: 'Email',
  TAUX_PENALITE_JOURNALIER: 'Taux de pénalité journalier',
  DELAI_GRACE_RETARD: 'Délai de grâce (jours)',
  TAUX_INTERET_EPARGNE: 'Taux d\'intérêt épargne (annuel)',
  SOLDE_MINIMUM_OUVERTURE: 'Solde minimum d\'ouverture (HTG)',
  PLAFOND_RETRAIT_JOURNALIER: 'Plafond de retrait journalier (HTG)',
  DEVISE_PRINCIPALE: 'Devise principale',
};

const HINTS: Record<string, string> = {
  TAUX_PENALITE_JOURNALIER: '0.001 = 0,1 % par jour. Calculé sur le capital restant dû.',
  DELAI_GRACE_RETARD: 'Nombre de jours après l\'échéance avant d\'appliquer les pénalités.',
  TAUX_INTERET_EPARGNE: '0.03 = 3 % par an. Utilisé par défaut pour les nouveaux comptes épargne.',
  SOLDE_MINIMUM_OUVERTURE: 'Montant minimum requis lors de l\'ouverture d\'un compte.',
  PLAFOND_RETRAIT_JOURNALIER: 'Maximum autorisé par retrait en une journée (0 = illimité).',
};

function ConfigField({ config, onSave, canEdit }: { config: Config; onSave: (cle: string, val: string) => Promise<void>; canEdit: boolean }) {
  const [value, setValue] = useState(config.valeur);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = value !== config.valeur;

  const save = async () => {
    setSaving(true);
    try {
      await onSave(config.cle, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <label className="label">{LABELS[config.cle] || config.cle}</label>
      {config.description && !HINTS[config.cle] && (
        <p className="text-xs mb-1.5" style={{ color: '#8b94b0' }}>{config.description}</p>
      )}
      {HINTS[config.cle] && (
        <p className="text-xs mb-1.5" style={{ color: '#8b94b0' }}>{HINTS[config.cle]}</p>
      )}
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setSaved(false); }}
          className="input flex-1"
          disabled={!canEdit}
        />
        {canEdit && dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: '#eef2ff', color: '#1e40af' }}
          >
            {saving ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            Sauvegarder
          </button>
        )}
        {saved && (
          <div className="px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5" style={{ background: '#ecfdf5', color: '#047857' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sauvegardé
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdministrationPage() {
  const { configs, isLoading, fetchConfigs, updateConfig } = useConfigurationStore();
  const { utilisateur } = useAuthStore();
  const canEdit = ['SUPER_ADMIN', 'DIRECTEUR'].includes(utilisateur?.role || '');

  useEffect(() => { fetchConfigs(); }, []);

  const configMap = Object.fromEntries(configs.map((c) => [c.cle, c]));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Administration</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Paramètres de l'institution et règles métier</p>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0" style={{ color: '#b45309' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm" style={{ color: '#92400e' }}>Lecture seule. Seuls les administrateurs et directeurs peuvent modifier ces paramètres.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
            <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="ml-3 text-sm" style={{ color: '#8b94b0' }}>Chargement des paramètres...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="card overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f0f2f9', background: cat.bg }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cat.color + '20', color: cat.color }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d={cat.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm" style={{ color: '#0b1733' }}>{cat.label}</h3>
              </div>
              <div className="px-5 py-5 space-y-4">
                {cat.cles.map((cle) => {
                  const cfg = configMap[cle];
                  if (!cfg) return null;
                  return (
                    <ConfigField
                      key={cle}
                      config={cfg}
                      canEdit={canEdit}
                      onSave={async (k, v) => {
                        await updateConfig(k, v);
                        await fetchConfigs();
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info penalite */}
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff7ed', color: '#c2410c' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Calcul automatique des pénalités</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8b94b0' }}>
              Les pénalités sont calculées automatiquement à chaque remboursement en retard :
              <strong style={{ color: '#4a5578' }}> Pénalité = Capital restant × Taux journalier × (Jours de retard - Délai de grâce)</strong>.
              La mise à jour des statuts EN_RETARD est déclenchée via le bouton "Rafraîchir" sur la page des prêts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
