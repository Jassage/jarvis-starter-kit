'use client';
import { useState } from 'react';
import { useClientStore } from '@/stores/clientStore';
import { useAuthStore } from '@/stores/authStore';
import Tooltip from '@/components/ui/Tooltip';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initial?: any;
}

const PIECE_OPTIONS = [
  { value: 'NIN',       label: 'NIN (Carte d\'identification)' },
  { value: 'PASSEPORT', label: 'Passeport' },
  { value: 'PERMIS',    label: 'Permis de conduire' },
  { value: 'MATRICULE', label: 'Matricule fiscal' },
];

export default function ClientForm({ onClose, onSuccess, initial }: Props) {
  const { createClient, updateClient } = useClientStore();
  const { utilisateur } = useAuthStore();
  const isEdit = !!initial?.id;

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState({
    type: initial?.type || 'INDIVIDUEL',
    nom: initial?.nom || '',
    prenom: initial?.prenom || '',
    raisonSociale: initial?.raisonSociale || '',
    nif: initial?.nif || '',
    telephone: initial?.telephone || '',
    email: initial?.email || '',
    adresse: initial?.adresse || '',
    profession: initial?.profession || '',
    dateNaissance: initial?.dateNaissance ? new Date(initial.dateNaissance).toISOString().slice(0, 10) : '',
    pieceIdentite: initial?.pieceIdentite || 'NIN',
    numeroPiece: initial?.numeroPiece || '',
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isValidTelephone = (t: string) => t.length >= 8 && /^[0-9+\s\-()]+$/.test(t);
  const isValidEmail = (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const getAge = (ddn: string): number | null => {
    if (!ddn) return null;
    const d = new Date(ddn);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
    return age;
  };
  const ageDdn = form.dateNaissance ? getAge(form.dateNaissance) : null;
  const ageError = ageDdn !== null && ageDdn < 18;

  const canAdvance = step === 0
    ? true
    : step === 1
    ? (form.type === 'INDIVIDUEL'
        ? !!(form.nom && form.prenom && form.numeroPiece && !ageError)
        : !!form.raisonSociale)
    : !!(form.telephone && form.adresse && isValidTelephone(form.telephone) && isValidEmail(form.email));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isEdit) await updateClient(initial.id, form);
      else await createClient(form);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ['Type', 'Identité', 'Coordonnées'];

  const gradientFrom = form.type === 'ENTREPRISE' ? '#064e3b' : '#1e3a8a';
  const gradientTo   = form.type === 'ENTREPRISE' ? '#059669' : '#2563eb';

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
              {form.type === 'ENTREPRISE'
                ? <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              }
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'white' }}>{isEdit ? 'Modifier le client' : 'Nouveau client'}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Étape {step + 1} sur 3 · {STEPS[step]}</p>
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
          <span className="text-xs" style={{ color: '#8b94b0' }}>{isEdit ? 'Modifié par :' : 'Enregistré par :'}</span>
          <span className="user-badge user-badge-blue">{utilisateur?.prenom} {utilisateur?.nom} · {utilisateur?.role}</span>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-4 pb-1 flex-shrink-0">
          <div className="flex gap-1.5">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className="h-1.5 rounded-full transition-all" style={{ background: i <= step ? (form.type === 'ENTREPRISE' ? '#059669' : '#2563eb') : '#e7eaf3' }} />
                <p className="text-xs font-medium mt-1" style={{ color: i <= step ? (form.type === 'ENTREPRISE' ? '#047857' : '#1e40af') : '#8b94b0' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Step 0 — Type */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#4a5578' }}>Sélectionnez le type de client à enregistrer.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'INDIVIDUEL', label: 'Particulier', desc: 'Personne physique', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z', color: '#1e40af', bg: '#eef2ff', border: '#2563eb' },
                  { value: 'ENTREPRISE', label: 'Entreprise',  desc: 'Personne morale',  icon: 'M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8', color: '#047857', bg: '#ecfdf5', border: '#10b981' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('type', opt.value)}
                    className="p-5 rounded-2xl text-left transition-all"
                    style={{
                      background: form.type === opt.value ? opt.bg : '#f7f8fc',
                      border: `2px solid ${form.type === opt.value ? opt.border : '#e7eaf3'}`,
                      transform: form.type === opt.value ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: form.type === opt.value ? opt.bg : '#f0f2f9', color: form.type === opt.value ? opt.color : '#4a5578' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d={opt.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="font-bold" style={{ color: form.type === opt.value ? opt.color : '#0b1733' }}>{opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Identité */}
          {step === 1 && (
            <div className="space-y-4">
              {form.type === 'INDIVIDUEL' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <label className="label mb-0">Prénom *</label>
                        <Tooltip content="Prénom officiel tel que sur la pièce d'identité" position="right">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        </Tooltip>
                      </div>
                      <input value={form.prenom} onChange={(e) => set('prenom', e.target.value)} className="input" placeholder="Marie" />
                    </div>
                    <div>
                      <label className="label">Nom *</label>
                      <input value={form.nom} onChange={(e) => set('nom', e.target.value)} className="input" placeholder="PIERRE" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Profession</label>
                    <input value={form.profession} onChange={(e) => set('profession', e.target.value)} className="input" placeholder="Commerçante, Agriculteur, Enseignant..." />
                  </div>
                  <div>
                    <label className="label">Date de naissance</label>
                    <input
                      type="date"
                      value={form.dateNaissance}
                      onChange={(e) => set('dateNaissance', e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className="input"
                    />
                    {ageError && (
                      <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Le client doit être majeur (18 ans minimum)</p>
                    )}
                    {ageDdn !== null && !ageError && (
                      <p className="text-xs mt-1" style={{ color: '#059669' }}>{ageDdn} ans</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <label className="label mb-0">Pièce d'identité *</label>
                        <Tooltip content="Document officiel obligatoire pour l'inscription KYC" position="right">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        </Tooltip>
                      </div>
                      <select value={form.pieceIdentite} onChange={(e) => set('pieceIdentite', e.target.value)} className="input">
                        {PIECE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Numéro de pièce *</label>
                      <input value={form.numeroPiece} onChange={(e) => set('numeroPiece', e.target.value)} className="input font-mono" placeholder="00-00-00-XXXX" />
                      {!form.numeroPiece && <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Requis</p>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="label">Raison sociale *</label>
                    <input value={form.raisonSociale} onChange={(e) => set('raisonSociale', e.target.value)} className="input font-semibold" placeholder="Nom officiel de l'entreprise" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label className="label mb-0">NIF</label>
                      <Tooltip content="Numéro d'Identification Fiscale, délivré par la DGI haïtienne" position="right">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </Tooltip>
                    </div>
                    <input value={form.nif} onChange={(e) => set('nif', e.target.value)} className="input font-mono" placeholder="00-00-000-000-X" />
                  </div>
                  <div>
                    <label className="label">Représentant légal</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={form.prenom} onChange={(e) => set('prenom', e.target.value)} className="input" placeholder="Prénom du représentant" />
                      <input value={form.nom} onChange={(e) => set('nom', e.target.value)} className="input" placeholder="Nom du représentant" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2 — Coordonnées */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="label mb-0">Téléphone *</label>
                    <Tooltip content="Numéro principal pour contacter le client" position="right">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </Tooltip>
                  </div>
                  <input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} className="input" placeholder="+509 3700-0000" />
                  {form.telephone && !isValidTelephone(form.telephone) && (
                    <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Format invalide (min. 8 chiffres, ex : +509 3700-0000)</p>
                  )}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input" placeholder="client@exemple.ht" />
                  {form.email && !isValidEmail(form.email) && (
                    <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Adresse email invalide</p>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="label mb-0">Adresse complète *</label>
                  <Tooltip content="Adresse de résidence ou siège social, utilisée pour la correspondance officielle" position="right">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </Tooltip>
                </div>
                <input value={form.adresse} onChange={(e) => set('adresse', e.target.value)} className="input" placeholder="Rue des Palmistes, Pignon, Nord" />
              </div>
              <div>
                <label className="label">Notes internes (optionnel)</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className="input resize-none" placeholder="Informations complémentaires, historique, particularités..." />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="9" stroke="#b91c1c" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/></svg>
              <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
          <button type="button" onClick={onClose} className="btn-ghost">Annuler</button>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2)} className="btn-ghost">← Retour</button>
            )}
            {step < 2 ? (
              <button type="button" onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2)} disabled={!canAdvance} className="btn-primary disabled:opacity-40">
                Continuer →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading || !canAdvance} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Enregistrement...</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{isEdit ? 'Enregistrer' : 'Créer le client'}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
