'use client';
import { useState } from 'react';
import { usePretStore } from '@/stores/pretStore';
import { useClientStore } from '@/stores/clientStore';
import { useAuthStore } from '@/stores/authStore';
import { nomClient, formatMontant } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

function round2(n: number) { return Math.round(n * 100) / 100; }

function simulerAmortissement(montant: number, tauxMensuel: number, dureeMois: number) {
  if (!montant || !tauxMensuel || !dureeMois) return null;
  const mensualite = round2((montant * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois)));
  let capitalRestant = montant;
  let totalInterets = 0;
  for (let i = 0; i < dureeMois; i++) {
    const interet = round2(capitalRestant * tauxMensuel);
    totalInterets += interet;
    capitalRestant = round2(capitalRestant - (mensualite - interet));
  }
  return { mensualite, montantTotal: round2(montant + totalInterets), totalInterets };
}

const AMORTISSEMENT_LABELS: Record<string, { label: string; desc: string }> = {
  DEGRESSIF: { label: 'Dégressif', desc: 'Mensualités constantes (recommandé)' },
  CONSTANT:  { label: 'Constant',  desc: 'Capital remboursé constant chaque mois' },
  IN_FINE:   { label: 'In Fine',   desc: 'Capital remboursé en une seule fois à la fin' },
};

export default function PretForm({ onClose, onSuccess }: Props) {
  const { createPret } = usePretStore();
  const { searchClients } = useClientStore();
  const { utilisateur } = useAuthStore();

  const [form, setForm] = useState({
    clientId: '',
    montant: '',
    tauxMensuel: '3',
    dureeMois: '12',
    typeAmortissement: 'DEGRESSIF',
    devise: 'HTG',
    objet: '',
  });
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientOpen, setClientOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSearchClient = async (q: string) => {
    setClientSearch(q);
    setClientOpen(true);
    if (q.length >= 2) {
      const results = await searchClients(q);
      setClients(results);
    } else {
      setClients([]);
    }
  };

  const simulation = form.montant && form.tauxMensuel && form.dureeMois
    ? simulerAmortissement(parseFloat(form.montant), parseFloat(form.tauxMensuel) / 100, parseInt(form.dureeMois))
    : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.clientId) { setError('Sélectionnez un client'); return; }
    if (!utilisateur?.agenceId) { setError('Vous devez être associé à une agence'); return; }
    if (!form.montant || parseFloat(form.montant) <= 0) { setError('Entrez un montant valide'); return; }
    setError('');
    setLoading(true);
    try {
      await createPret({
        ...form,
        agenceId: utilisateur.agenceId,
        montant: parseFloat(form.montant),
        tauxMensuel: parseFloat(form.tauxMensuel),
        dureeMois: parseInt(form.dureeMois),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'white' }}>Nouveau dossier de prêt</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Demande de crédit client</p>
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
          <span className="text-xs" style={{ color: '#8b94b0' }}>Dossier monté par :</span>
          <span className="user-badge user-badge-blue">{utilisateur?.prenom} {utilisateur?.nom} · {utilisateur?.role}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Client search */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Client emprunteur *</label>
              <Tooltip content="Tapez le nom ou le numéro du client pour le trouver dans la base" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>

            {selectedClient ? (
              <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#eef2ff', border: '2px solid #2563eb' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                  {nomClient(selectedClient)[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{nomClient(selectedClient)}</p>
                  <p className="text-xs font-mono" style={{ color: '#8b94b0' }}>{selectedClient.numeroClient}</p>
                </div>
                <span className="chip chip-success">{selectedClient.statut}</span>
                <Tooltip content="Changer de client" position="top">
                  <button type="button" onClick={() => { setSelectedClient(null); set('clientId', ''); }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setClientOpen(false); }}>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8b94b0' }}>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    value={clientSearch}
                    onChange={(e) => handleSearchClient(e.target.value)}
                    onFocus={() => setClientOpen(true)}
                    placeholder="Rechercher par nom, prénom, N° client..."
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                {clientOpen && clients.length > 0 && (
                  <div className="combobox-dropdown">
                    {clients.map((c) => (
                      <div
                        key={c.id}
                        className="combobox-item"
                        onMouseDown={() => { setSelectedClient(c); set('clientId', c.id); setClients([]); setClientSearch(''); setClientOpen(false); }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                          {nomClient(c)[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{nomClient(c)}</p>
                          <p className="text-xs" style={{ color: '#8b94b0' }}>{c.numeroClient} · {c.telephone}</p>
                        </div>
                        <span className={`chip text-xs ${c.statut === 'ACTIF' ? 'chip-success' : 'chip-neutral'}`}>{c.statut}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Paramètres financiers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="label mb-0">Montant *</label>
                <Tooltip content="Montant net à décaisser au client" position="right">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </Tooltip>
              </div>
              <div className="relative">
                <input required type="number" min="1" step="0.01" value={form.montant} onChange={(e) => set('montant', e.target.value)} className="input font-semibold" style={{ paddingRight: '4rem' }} placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#f0f2f9', color: '#4a5578' }}>{form.devise}</span>
              </div>
            </div>

            <div>
              <label className="label">Devise</label>
              <select value={form.devise} onChange={(e) => set('devise', e.target.value)} className="input">
                <option value="HTG">🇭🇹 HTG — Gourde</option>
                <option value="USD">🇺🇸 USD — Dollar</option>
              </select>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="label mb-0">Taux mensuel (%)</label>
                <Tooltip content="Taux d'intérêt appliqué chaque mois sur le capital restant dû" position="right">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </Tooltip>
              </div>
              <div className="relative">
                <input required type="number" min="0.1" max="30" step="0.01" value={form.tauxMensuel} onChange={(e) => set('tauxMensuel', e.target.value)} className="input font-semibold" style={{ paddingRight: '2rem' }} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: '#8b94b0' }}>%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="label mb-0">Durée (mois)</label>
                <Tooltip content="Nombre de mensualités pour rembourser entièrement le prêt" position="right">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </Tooltip>
              </div>
              <input required type="number" min="1" max="360" value={form.dureeMois} onChange={(e) => set('dureeMois', e.target.value)} className="input font-semibold" />
            </div>
          </div>

          {/* Type amortissement */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="label mb-0">Méthode d'amortissement</label>
              <Tooltip content="Dégressif = mensualités fixes. Constant = capital fixe, intérêts décroissants. In Fine = intérêts mensuels + capital en fin." position="top">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </Tooltip>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(AMORTISSEMENT_LABELS).map(([v, meta]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('typeAmortissement', v)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: form.typeAmortissement === v ? '#eef2ff' : '#f7f8fc',
                    border: `2px solid ${form.typeAmortissement === v ? '#2563eb' : '#e7eaf3'}`,
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: form.typeAmortissement === v ? '#1e40af' : '#0b1733' }}>{meta.label}</p>
                  <p className="text-xs mt-0.5 leading-tight" style={{ color: '#8b94b0' }}>{meta.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Objet */}
          <div>
            <label className="label">Objet du prêt</label>
            <input value={form.objet} onChange={(e) => set('objet', e.target.value)} className="input" placeholder="ex: Fonds de roulement, achat véhicule, construction maison..." />
          </div>

          {/* Simulation live */}
          {simulation && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #bfdbfe' }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#eff6ff' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#1e40af' }}>
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1e40af' }}>Simulation de remboursement</p>
                <span className="ml-auto text-xs" style={{ color: '#60a5fa' }}>Mise à jour en temps réel</span>
              </div>
              <div className="grid grid-cols-3 divide-x bg-white" style={{ borderColor: '#bfdbfe' }}>
                <div className="px-4 py-4 text-center">
                  <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Mensualité</p>
                  <p className="font-bold text-base mt-1" style={{ color: '#1e40af' }}>{formatMontant(simulation.mensualite, form.devise)}</p>
                </div>
                <div className="px-4 py-4 text-center">
                  <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total à rembourser</p>
                  <p className="font-bold text-base mt-1" style={{ color: '#0b1733' }}>{formatMontant(simulation.montantTotal, form.devise)}</p>
                </div>
                <div className="px-4 py-4 text-center">
                  <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Coût des intérêts</p>
                  <p className="font-bold text-base mt-1" style={{ color: '#b45309' }}>{formatMontant(simulation.totalInterets, form.devise)}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="9" stroke="#b91c1c" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/></svg>
              <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Création...</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Créer le dossier</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
