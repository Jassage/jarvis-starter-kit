'use client';
import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { formatMontant, formatDatetime, nomClient, TYPE_TRANSACTION_LABELS, STATUT_TX_LABELS } from '@/lib/utils';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useToastStore } from '@/stores/toastStore';

const STATUT_CHIP: Record<string, string> = {
  VALIDEE: 'chip chip-success',
  EN_ATTENTE: 'chip chip-warning',
  REJETEE: 'chip chip-danger',
  ANNULEE: 'chip chip-neutral',
};

const TYPE_META: Record<string, { color: string; bg: string; icon: string }> = {
  DEPOT: { color: '#047857', bg: '#ecfdf5', icon: 'M19 14l-7 7-7-7M12 3v18' },
  RETRAIT: { color: '#b91c1c', bg: '#fef2f2', icon: 'M5 10l7-7 7 7M12 21V3' },
  VIREMENT_DEBIT: { color: '#1e40af', bg: '#eef2ff', icon: 'M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3' },
  VIREMENT_CREDIT: { color: '#1e40af', bg: '#eef2ff', icon: 'M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3' },
  DECAISSEMENT_PRET: { color: '#6d28d9', bg: '#f5f3ff', icon: 'M12 5v14M5 12h14' },
  REMBOURSEMENT_PRET: { color: '#0e7490', bg: '#ecfeff', icon: 'M3 12l6-6 6 6M9 18V6' },
};

export default function TransactionsPage() {
  const { transactions, total, pages, isLoading, fetchTransactions, valider, rejeter } = useTransactionStore();
  const { utilisateur } = useAuthStore();
  const toast = useToastStore();
  const [filters, setFilters] = useState({ statut: '', type: '' });
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState<'depot' | 'retrait' | 'virement' | null>(null);
  const canValidate = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'].includes(utilisateur?.role || '');

  const load = () => fetchTransactions({ ...filters, page, limit: 30 });
  useEffect(() => { load(); }, [filters, page]);

  const [rejetId, setRejetId] = useState<string | null>(null);
  const [rejetMotif, setRejetMotif] = useState('');
  const [rejetLoading, setRejetLoading] = useState(false);

  const handleValider = async (id: string) => {
    try {
      await valider(id);
      toast.success('Transaction validée', 'L\'opération a été approuvée avec succès.');
      load();
    } catch {
      toast.error('Erreur de validation', 'Impossible de valider cette transaction.');
    }
  };

  const handleRejeter = async () => {
    if (!rejetId) return;
    setRejetLoading(true);
    try {
      await rejeter(rejetId, rejetMotif);
      toast.warning('Transaction rejetée', rejetMotif || 'L\'opération a été rejetée.');
      setRejetId(null); setRejetMotif('');
      load();
    } catch {
      toast.error('Erreur', 'Impossible de rejeter cette transaction.');
    } finally {
      setRejetLoading(false);
    }
  };

  const totalEnAttente = transactions.filter(t => t.statut === 'EN_ATTENTE').length;

  return (
    <div className="space-y-5 animate-slide-up min-w-0">
      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setShowForm('depot')} className="card card-hover p-4 text-left flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#ecfdf5', color: '#047857' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M19 14l-7 7-7-7M12 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Dépôt</p>
            <p className="text-xs" style={{ color: '#8b94b0' }}>Créditer un compte</p>
          </div>
        </button>
        <button onClick={() => setShowForm('retrait')} className="card card-hover p-4 text-left flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M5 10l7-7 7 7M12 21V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Retrait</p>
            <p className="text-xs" style={{ color: '#8b94b0' }}>Débiter un compte</p>
          </div>
        </button>
        <button onClick={() => setShowForm('virement')} className="card card-hover p-4 text-left flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#eef2ff', color: '#1e40af' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Virement</p>
            <p className="text-xs" style={{ color: '#8b94b0' }}>Entre deux comptes</p>
          </div>
        </button>
      </div>

      {/* Alert validation */}
      {totalEnAttente > 0 && canValidate && (
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7', color: '#b45309' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: '#92400e' }}>{totalEnAttente} transaction{totalEnAttente > 1 ? 's' : ''} en attente de validation</p>
            <p className="text-sm mt-0.5" style={{ color: '#b45309' }}>Examinez et validez les opérations dépassant le seuil de validation.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: '#8b94b0' }}>Filtres</p>
          <select value={filters.statut} onChange={(e) => { setFilters({ ...filters, statut: e.target.value }); setPage(1); }} className="input max-w-[200px]">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="VALIDEE">Validées</option>
            <option value="REJETEE">Rejetées</option>
          </select>
          <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }} className="input max-w-[200px]">
            <option value="">Tous les types</option>
            <option value="DEPOT">Dépôts</option>
            <option value="RETRAIT">Retraits</option>
            <option value="VIREMENT_DEBIT">Virements</option>
            <option value="REMBOURSEMENT_PRET">Remboursements</option>
          </select>
          <p className="text-sm ml-auto" style={{ color: '#8b94b0' }}><span className="font-semibold" style={{ color: '#0b1733' }}>{total}</span> opération{total > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <svg className="animate-spin w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p className="text-sm mt-3" style={{ color: '#8b94b0' }}>Chargement...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucune transaction</p>
            <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Commencez par effectuer un dépôt ou un retrait.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f2f9' }}>
            {transactions.map((tx) => {
              const meta = TYPE_META[tx.type] || TYPE_META.DEPOT;
              const isDebit = ['RETRAIT', 'VIREMENT_DEBIT', 'REMBOURSEMENT_PRET'].includes(tx.type);
              const compte = tx.compteCredit || tx.compteDebit;
              const clientName = compte?.client ? nomClient(compte.client) : '—';
              return (
                <div key={tx.id} className="px-5 py-4 flex items-center gap-4 transition-colors" style={{ borderTop: '1px solid #f0f2f9' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg, color: meta.color }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d={meta.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className="font-semibold truncate" style={{ color: '#0b1733' }}>{TYPE_TRANSACTION_LABELS[tx.type]}</p>
                      <span className={STATUT_CHIP[tx.statut]}>{STATUT_TX_LABELS[tx.statut]}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>
                      <span className="font-mono">{tx.reference}</span> · {clientName} · {formatDatetime(tx.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {tx.creePar && (
                        <span className="user-badge user-badge-blue">
                          <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 inline mr-0.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          {tx.creePar.prenom} {tx.creePar.nom}
                        </span>
                      )}
                      {tx.validePar && (
                        <span className="user-badge user-badge-green">
                          <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 inline mr-0.5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Validé · {tx.validePar.prenom} {tx.validePar.nom}
                        </span>
                      )}
                    </div>
                    {tx.motif && <p className="text-xs italic mt-0.5" style={{ color: '#8b94b0' }}>"{tx.motif}"</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base" style={{ color: isDebit ? '#b91c1c' : '#047857' }}>
                      {isDebit ? '-' : '+'} {formatMontant(tx.montant, tx.devise)}
                    </p>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>Solde : {formatMontant(tx.soldeApres, tx.devise)}</p>
                  </div>
                  {canValidate && tx.statut === 'EN_ATTENTE' && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleValider(tx.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={{ background: '#10b981', color: 'white' }}>Valider</button>
                      <button onClick={() => { setRejetId(tx.id); setRejetMotif(''); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={{ background: '#fef2f2', color: '#b91c1c' }}>Rejeter</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #f0f2f9' }}>
            <p className="text-sm" style={{ color: '#8b94b0' }}>Page <span className="font-semibold" style={{ color: '#0b1733' }}>{page}</span> sur {pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost text-xs disabled:opacity-40">← Précédent</button>
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="btn-ghost text-xs disabled:opacity-40">Suivant →</button>
            </div>
          </div>
        )}
      </div>

      {showForm && <TransactionForm type={showForm} onClose={() => setShowForm(null)} onSuccess={() => { setShowForm(null); load(); toast.success('Transaction enregistrée', 'Elle sera visible après validation.'); }} />}

      {/* Modal rejet */}
      {rejetId && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setRejetId(null); }}>
          <div className="drawer-panel" style={{ maxWidth: '460px' }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div className="flex-1"><h2 className="font-bold" style={{ color: 'white' }}>Rejeter la transaction</h2><p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Cette action est irréversible</p></div>
              <button onClick={() => setRejetId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
            <div className="px-5 py-5 flex-1">
              <label className="label">Motif du rejet</label>
              <textarea value={rejetMotif} onChange={(e) => setRejetMotif(e.target.value)} rows={3} className="input resize-none" placeholder="Expliquez la raison du rejet (montant incorrect, compte bloqué, fraude suspectée...)" />
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setRejetId(null)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleRejeter} disabled={rejetLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#b91c1c', color: 'white' }}>
                {rejetLoading ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
