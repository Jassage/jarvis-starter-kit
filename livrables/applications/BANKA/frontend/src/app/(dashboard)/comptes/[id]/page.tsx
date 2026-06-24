'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCompteStore } from '@/stores/compteStore';
import { useMandatStore } from '@/stores/mandatStore';
import { formatMontant, formatDatetime, formatDate, TYPE_COMPTE_LABELS, TYPE_TRANSACTION_LABELS, STATUT_TX_LABELS } from '@/lib/utils';
import TransactionForm from '@/components/transactions/TransactionForm';
import MandatForm from '@/components/comptes/MandatForm';

const STATUT_CHIP: Record<string, string> = {
  VALIDEE:    'chip chip-success',
  EN_ATTENTE: 'chip chip-warning',
  REJETEE:    'chip chip-danger',
  ANNULEE:    'chip chip-neutral',
};

export default function CompteDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { fetchCompte, fetchReleve, selected, releve } = useCompteStore();
  const { mandats, fetchMandats, revoquerMandat } = useMandatStore();
  const [loading, setLoading] = useState(true);
  const [showTx, setShowTx] = useState<'depot' | 'retrait' | null>(null);
  const [showMandat, setShowMandat] = useState(false);
  const [revoquant, setRevoquant] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    await Promise.all([fetchCompte(id), fetchReleve(id), fetchMandats(id)]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
          <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <span className="ml-3 text-sm" style={{ color: '#8b94b0' }}>Chargement du compte...</span>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="card p-12 text-center">
        <p className="font-semibold" style={{ color: '#0b1733' }}>Compte introuvable</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">← Retour</button>
      </div>
    );
  }

  const client = selected.client;
  const soldePositif = Number(selected.solde) >= 0;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: '#8b94b0' }}>
        <button onClick={() => router.back()} className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Comptes
        </button>
        <span>/</span>
        <span className="font-mono" style={{ color: '#4a5578' }}>{selected.numeroCompte}</span>
      </div>

      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {TYPE_COMPTE_LABELS[selected.type]} · {selected.devise}
              </p>
              <p className="font-mono text-xl font-bold mt-1" style={{ color: 'white' }}>{selected.numeroCompte}</p>
              {client && (
                <Link href={`/clients/${client.id}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  {client.type === 'ENTREPRISE' ? client.raisonSociale : `${client.prenom} ${client.nom}`}
                </Link>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>Solde disponible</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'white' }}>{formatMontant(selected.solde, selected.devise)}</p>
              {selected.soldeMinimum && Number(selected.soldeMinimum) > 0 && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Min. requis : {formatMontant(selected.soldeMinimum, selected.devise)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f0f2f9' }}>
          <button onClick={() => setShowTx('depot')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: '#ecfdf5', color: '#047857' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M19 14l-7 7-7-7M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dépôt
          </button>
          <button onClick={() => setShowTx('retrait')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 10l7-7 7 7M12 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Retrait
          </button>
          <span className={`ml-auto chip ${selected.statut === 'ACTIF' ? 'chip-success' : selected.statut === 'SUSPENDU' ? 'chip-warning' : 'chip-neutral'}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: selected.statut === 'ACTIF' ? '#10b981' : selected.statut === 'SUSPENDU' ? '#f59e0b' : '#8b94b0' }}></span>
            {selected.statut}
          </span>
        </div>
      </div>

      {/* Relevé */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f2f9' }}>
          <div>
            <h3 className="font-bold" style={{ color: '#0b1733' }}>Relevé de compte</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{releve?.total || 0} opération{(releve?.total || 0) > 1 ? 's' : ''}</p>
          </div>
        </div>

        {!releve || releve.transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucune opération</p>
            <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Effectuez un dépôt pour démarrer l'activité du compte.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f2f9' }}>
            {releve.transactions.map((tx: any) => {
              const isCredit = tx.compteCreditId === id;
              return (
                <div key={tx.id} className="px-5 py-4 flex items-center gap-4 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isCredit ? '#ecfdf5' : '#fef2f2', color: isCredit ? '#047857' : '#b91c1c' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      {isCredit
                        ? <path d="M19 14l-7 7-7-7M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        : <path d="M5 10l7-7 7 7M12 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      }
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{TYPE_TRANSACTION_LABELS[tx.type]}</p>
                      <span className={STATUT_CHIP[tx.statut] || 'chip chip-neutral'}>{STATUT_TX_LABELS[tx.statut]}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>
                      <span className="font-mono">{tx.reference}</span> · {formatDatetime(tx.createdAt)}
                    </p>
                    {tx.motif && <p className="text-xs italic mt-0.5" style={{ color: '#8b94b0' }}>"{tx.motif}"</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold" style={{ color: isCredit ? '#047857' : '#b91c1c' }}>
                      {isCredit ? '+' : '-'}{formatMontant(tx.montant, tx.devise)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Solde : {formatMontant(tx.soldeApres, tx.devise)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandats / Procurations */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f2f9' }}>
          <div>
            <h3 className="font-bold" style={{ color: '#0b1733' }}>Mandats & Procurations</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
              {mandats.filter(m => m.actif).length} mandat{mandats.filter(m => m.actif).length > 1 ? 's' : ''} actif{mandats.filter(m => m.actif).length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowMandat(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: '#eef2ff', color: '#1e40af' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouveau mandat
          </button>
        </div>

        {mandats.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#f0f2f9' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" style={{ color: '#8b94b0' }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Aucun mandat</p>
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Accordez des droits à un tiers pour qu'il agisse sur ce compte en l'absence du titulaire.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f2f9' }}>
            {mandats.map((m) => {
              const nom = m.mandataire.type === 'ENTREPRISE'
                ? m.mandataire.raisonSociale
                : `${m.mandataire.prenom || ''} ${m.mandataire.nom || ''}`.trim();
              return (
                <div key={m.id} className="px-5 py-4 flex items-start gap-4" style={{ opacity: m.actif ? 1 : 0.5 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.actif ? '#eef2ff' : '#f0f2f9', color: m.actif ? '#1e40af' : '#8b94b0' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{nom}</p>
                      <span className="text-xs font-mono" style={{ color: '#8b94b0' }}>{m.mandataire.numeroClient}</span>
                      <span className={`chip ${m.actif ? 'chip-success' : 'chip-neutral'} ml-auto`}>
                        {m.actif ? 'Actif' : 'Révoqué'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {m.droits.map((d) => (
                        <span key={d} className="chip chip-primary" style={{ fontSize: '10px' }}>{d}</span>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>
                      Depuis le {formatDate(m.dateDebut)}
                      {m.dateFin && ` · Expire le ${formatDate(m.dateFin)}`}
                      {m.notes && ` · "${m.notes}"`}
                    </p>
                  </div>
                  {m.actif && (
                    <button
                      onClick={async () => {
                        setRevoquant(m.id);
                        await revoquerMandat(id, m.id);
                        await fetchMandats(id);
                        setRevoquant(null);
                      }}
                      disabled={revoquant === m.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 disabled:opacity-50"
                      style={{ background: '#fef2f2', color: '#b91c1c' }}
                    >
                      {revoquant === m.id ? (
                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      )}
                      Révoquer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showTx && (
        <TransactionForm
          type={showTx}
          compteId={id}
          onClose={() => setShowTx(null)}
          onSuccess={() => { setShowTx(null); load(); }}
        />
      )}

      {showMandat && (
        <MandatForm
          compteId={id}
          onClose={() => setShowMandat(false)}
          onSuccess={() => { setShowMandat(false); fetchMandats(id); }}
        />
      )}
    </div>
  );
}
