'use client';
import { useState, useCallback } from 'react';
import { useMandatStore } from '@/stores/mandatStore';
import { useClientStore } from '@/stores/clientStore';
import Combobox, { ComboboxOption } from '@/components/ui/Combobox';
import Tooltip from '@/components/ui/Tooltip';

interface Props {
  compteId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DROITS_OPTIONS = [
  {
    value: 'CONSULTATION',
    label: 'Consultation',
    desc: 'Consulter le solde et le relevé',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    color: '#0369a1',
  },
  {
    value: 'DEPOT',
    label: 'Dépôt',
    desc: 'Effectuer des dépôts',
    icon: 'M19 14l-7 7-7-7M12 3v18',
    color: '#047857',
  },
  {
    value: 'RETRAIT',
    label: 'Retrait',
    desc: 'Effectuer des retraits',
    icon: 'M5 10l7-7 7 7M12 21V3',
    color: '#b91c1c',
  },
  {
    value: 'VIREMENT',
    label: 'Virement',
    desc: 'Effectuer des virements',
    icon: 'M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12',
    color: '#6d28d9',
  },
];

export default function MandatForm({ compteId, onClose, onSuccess }: Props) {
  const { createMandat } = useMandatStore();
  const { searchClients } = useClientStore();

  const [clientOptions, setClientOptions] = useState<ComboboxOption[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientLabel, setSelectedClientLabel] = useState('');
  const [droits, setDroits] = useState<string[]>(['CONSULTATION']);
  const [dateFin, setDateFin] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClientSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setClientOptions([]); return; }
    setClientLoading(true);
    try {
      const results = await searchClients(q);
      setClientOptions(results.map((c: any) => ({
        value: c.id,
        label: c.type === 'ENTREPRISE' ? c.raisonSociale : `${c.prenom} ${c.nom}`,
        sublabel: `${c.numeroClient} · ${c.telephone}`,
        badge: c.type,
      })));
    } finally {
      setClientLoading(false);
    }
  }, [searchClients]);

  const toggleDroit = (d: string) => {
    setDroits((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) { setError('Sélectionnez le bénéficiaire du mandat'); return; }
    if (droits.length === 0) { setError('Sélectionnez au moins un droit'); return; }
    setError('');
    setLoading(true);
    try {
      await createMandat(compteId, {
        mandataireId: selectedClientId,
        droits,
        dateFin: dateFin || undefined,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'white' }}>Nouveau mandat</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Délégation de droits sur ce compte</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Bénéficiaire */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="label mb-0">Bénéficiaire du mandat</label>
              <Tooltip content="Le client qui recevra les droits délégués sur ce compte" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <Combobox
              options={clientOptions}
              value={selectedClientId}
              displayValue={selectedClientLabel}
              onChange={(val, opt) => { setSelectedClientId(val); setSelectedClientLabel(opt?.label || ''); }}
              onSearch={handleClientSearch}
              loading={clientLoading}
              placeholder="Rechercher un client..."
              emptyMessage="Tapez au moins 2 caractères"
            />
          </div>

          {/* Droits */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="label mb-0">Droits accordés</label>
              <Tooltip content="Sélectionnez les opérations autorisées pour ce mandataire" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DROITS_OPTIONS.map((opt) => {
                const active = droits.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleDroit(opt.value)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{
                      background: active ? `${opt.color}15` : '#f7f8fc',
                      border: `2px solid ${active ? opt.color : '#e7eaf3'}`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: active ? `${opt.color}20` : '#f0f2f9', color: active ? opt.color : '#8b94b0' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d={opt.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: active ? opt.color : '#0b1733' }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: '#8b94b0' }}>{opt.desc}</p>
                    </div>
                    {active && (
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: opt.color }}>
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date de fin */}
          <div>
            <label className="label">Date d'expiration (optionnel)</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Sans date, le mandat reste actif jusqu'à révocation manuelle.</p>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Motif / Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="ex: Procuration générale, Gestion en l'absence du titulaire..."
            />
          </div>

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
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Enregistrement...</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Créer le mandat</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
