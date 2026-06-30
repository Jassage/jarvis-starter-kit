'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCompteStore } from '@/stores/compteStore';
import { useAuthStore } from '@/stores/authStore';
import { formatMontant } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

interface Props {
  type: 'depot' | 'retrait' | 'virement';
  compteId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_CONFIG = {
  depot: {
    label: 'Dépôt',
    sublabel: 'Créditer un compte',
    gradientFrom: '#047857', gradientTo: '#10b981',
    iconPath: 'M19 14l-7 7-7-7M12 3v18',
    bg: '#ecfdf5', color: '#047857',
    confirmLabel: 'Confirmer le dépôt',
  },
  retrait: {
    label: 'Retrait',
    sublabel: 'Débiter un compte',
    gradientFrom: '#b91c1c', gradientTo: '#ef4444',
    iconPath: 'M5 10l7-7 7 7M12 21V3',
    bg: '#fef2f2', color: '#b91c1c',
    confirmLabel: 'Confirmer le retrait',
  },
  virement: {
    label: 'Virement interne',
    sublabel: 'Transfert entre comptes',
    gradientFrom: '#1e3a8a', gradientTo: '#2563eb',
    iconPath: 'M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3',
    bg: '#eef2ff', color: '#1e40af',
    confirmLabel: 'Confirmer le virement',
  },
};

const SEUIL_HTG = 50000;
const SEUIL_USD = 500;

function AccountCard({ compte, cfgBg, cfgColor }: { compte: any; cfgBg: string; cfgColor: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f7f8fc', border: '1px solid #e7eaf3' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfgBg, color: cfgColor }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-bold truncate" style={{ color: '#0b1733' }}>{compte.numeroCompte}</p>
        <p className="text-xs truncate" style={{ color: '#8b94b0' }}>
          {compte.client ? (compte.client.type === 'ENTREPRISE' ? compte.client.raisonSociale : `${compte.client.prenom} ${compte.client.nom}`) : '—'}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{formatMontant(compte.solde, compte.devise)}</p>
        <p className="text-xs" style={{ color: '#8b94b0' }}>{compte.devise} · {compte.type}</p>
      </div>
    </div>
  );
}

function SearchAccountField({
  label, tooltip, selected, onSelect, search, onSearch, options, open, setOpen, loading: srchLoading, cfgBg, cfgColor,
}: {
  label: string; tooltip: string; selected: any; onSelect: (c: any) => void;
  search: string; onSearch: (q: string) => void; options: any[];
  open: boolean; setOpen: (v: boolean) => void; loading: boolean;
  cfgBg: string; cfgColor: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="label mb-0">{label} *</label>
        <Tooltip content={tooltip} position="right">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </Tooltip>
      </div>
      {selected ? (
        <div className="relative">
          <AccountCard compte={selected} cfgBg={cfgBg} cfgColor={cfgColor} />
          <button type="button" onClick={() => onSelect(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      ) : (
        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8b94b0' }}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { onSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="N° compte ou nom du client..."
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
            {srchLoading && (
              <svg className="animate-spin w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          {open && (options.length > 0 || search.length >= 2) && (
            <div className="combobox-dropdown">
              {options.length === 0 ? (
                <div className="px-4 py-4 text-center text-sm" style={{ color: '#8b94b0' }}>Aucun compte trouvé</div>
              ) : options.map((c: any) => (
                <div
                  key={c.id}
                  className="combobox-item"
                  onMouseDown={() => { onSelect(c); setOpen(false); }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfgBg, color: cfgColor }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-mono" style={{ color: '#0b1733' }}>{c.numeroCompte}</p>
                    <p className="text-xs truncate" style={{ color: '#8b94b0' }}>
                      {c.client ? (c.client.type === 'ENTREPRISE' ? c.client.raisonSociale : `${c.client.prenom} ${c.client.nom}`) : '—'}
                    </p>
                  </div>
                  <span className="font-bold text-sm flex-shrink-0" style={{ color: '#047857' }}>{formatMontant(c.solde, c.devise)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TransactionForm({ type, compteId, onClose, onSuccess }: Props) {
  const { depot, retrait, virement } = useTransactionStore();
  const { searchComptes } = useCompteStore();
  const { utilisateur } = useAuthStore();
  const cfg = TYPE_CONFIG[type];

  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Account source
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [sourceOpen, setSourceOpen] = useState(false);

  // Account destination (virement only)
  const [destSearch, setDestSearch] = useState('');
  const [destOptions, setDestOptions] = useState<any[]>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [selectedDest, setSelectedDest] = useState<any>(null);
  const [destOpen, setDestOpen] = useState(false);

  // If compteId is pre-set, load the account
  useEffect(() => {
    if (compteId) {
      searchComptes('', 'ACTIF').then(items => {
        const found = items.find(c => c.id === compteId);
        if (found) setSelectedSource(found);
      });
    }
  }, [compteId]);

  const searchSource = useCallback(async (q: string) => {
    if (q.length < 2) { setSourceOptions([]); return; }
    setSourceLoading(true);
    const items = await searchComptes(q);
    setSourceOptions(items);
    setSourceLoading(false);
  }, []);

  const searchDest = useCallback(async (q: string) => {
    if (q.length < 2) { setDestOptions([]); return; }
    setDestLoading(true);
    const items = await searchComptes(q);
    setDestOptions(items);
    setDestLoading(false);
  }, []);

  const montantNum = parseFloat(montant) || 0;
  const needsValidation = selectedSource
    ? (selectedSource.devise === 'HTG' ? montantNum >= SEUIL_HTG : montantNum >= SEUIL_USD)
    : false;

  const soldeDisponible = selectedSource ? Number(selectedSource.solde) : null;
  const depasseSolde = (type === 'retrait' || type === 'virement') && soldeDisponible !== null && montantNum > soldeDisponible;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!montantNum || montantNum <= 0) { setError('Entrez un montant valide'); return; }
    const sourceId = compteId || selectedSource?.id;
    if (!sourceId) { setError('Sélectionnez un compte'); return; }
    if (type === 'virement' && !selectedDest?.id) { setError('Sélectionnez le compte destination'); return; }
    if (depasseSolde) { setError(`Solde insuffisant — solde disponible : ${formatMontant(soldeDisponible!, selectedSource.devise)}`); return; }

    setLoading(true);
    try {
      if (type === 'depot') {
        await depot({ compteId: sourceId, montant: montantNum, motif });
      } else if (type === 'retrait') {
        await retrait({ compteId: sourceId, montant: montantNum, motif });
      } else {
        await virement({ compteSourceId: sourceId, compteDestinationId: selectedDest.id, montant: montantNum, motif });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel">
        {/* Colored header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
              <path d={cfg.iconPath} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'white' }}>{cfg.label}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{cfg.sublabel}</p>
          </div>
          <Tooltip content="Fermer la fenêtre" position="left">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </Tooltip>
        </div>

        {/* Opérateur connecté */}
        <div className="px-5 py-2 flex items-center gap-2 flex-shrink-0" style={{ background: '#f7f8fc', borderBottom: '1px solid #e7eaf3' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs" style={{ color: '#8b94b0' }}>Opération par :</span>
          <span className="user-badge user-badge-blue">{utilisateur?.prenom} {utilisateur?.nom} · {utilisateur?.role}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Compte source */}
          {!compteId && (
            <SearchAccountField
              label={type === 'virement' ? 'Compte source' : 'Compte'}
              tooltip="Tapez le numéro de compte ou le nom du client pour rechercher"
              selected={selectedSource}
              onSelect={setSelectedSource}
              search={sourceSearch}
              onSearch={(q: string) => { setSourceSearch(q); searchSource(q); }}
              options={sourceOptions}
              open={sourceOpen}
              setOpen={setSourceOpen}
              loading={sourceLoading}
              cfgBg={cfg.bg}
              cfgColor={cfg.color}
            />
          )}
          {compteId && selectedSource && <AccountCard compte={selectedSource} cfgBg={cfg.bg} cfgColor={cfg.color} />}

          {/* Compte destination (virement) */}
          {type === 'virement' && (
            <SearchAccountField
              label="Compte destination"
              tooltip="Compte qui va recevoir les fonds du virement"
              selected={selectedDest}
              onSelect={setSelectedDest}
              search={destSearch}
              onSearch={(q: string) => { setDestSearch(q); searchDest(q); }}
              options={destOptions}
              open={destOpen}
              setOpen={setDestOpen}
              loading={destLoading}
              cfgBg={cfg.bg}
              cfgColor={cfg.color}
            />
          )}

          {/* Montant */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Montant *</label>
              <Tooltip content="Montant de l'opération en gourdes (HTG) ou dollars (USD) selon la devise du compte" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="input text-lg font-semibold"
                placeholder="0.00"
                style={{ fontSize: '1.125rem', paddingRight: '5.5rem' }}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#f0f2f9', color: '#4a5578' }}>
                {selectedSource?.devise || 'HTG'}
              </span>
            </div>
          </div>

          {/* Motif */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Motif</label>
              <Tooltip content="Description de l'opération pour la traçabilité. Recommandé pour les gros montants." position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="input"
              placeholder="ex: Retrait guichet, dépôt commercial, paiement facture..."
            />
          </div>

          {/* Alerte solde insuffisant */}
          {depasseSolde && montantNum > 0 && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#b91c1c' }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#991b1b' }}>Solde insuffisant</p>
                <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>
                  Solde disponible : {formatMontant(soldeDisponible!, selectedSource.devise)}
                </p>
              </div>
            </div>
          )}

          {/* Alerte seuil de validation */}
          {needsValidation && montantNum > 0 && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#b45309' }}>
                <path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Validation superviseur requise</p>
                <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                  Ce montant dépasse le seuil ({selectedSource?.devise === 'USD' ? `$${SEUIL_USD}` : `${SEUIL_HTG.toLocaleString()} HTG`}). La transaction sera mise en attente d'approbation.
                </p>
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

        {/* Footer sticky */}
        <div className="px-5 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
          <Tooltip content="Annuler et fermer sans enregistrer" position="top">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
          </Tooltip>
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={loading || !montantNum}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})` }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                En cours...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d={cfg.iconPath} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {cfg.confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
