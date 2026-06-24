'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { formatMontant, formatDatetime, TYPE_TRANSACTION_LABELS } from '@/lib/utils';
import { generateRapportCaisse } from '@/lib/rapportCaisse';

export default function CaissePage() {
  const { utilisateur } = useAuthStore();
  const toast = useToastStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [soldeOuverture, setSoldeOuverture] = useState('');
  const [soldeFermeture, setSoldeFermeture] = useState('');
  const [action, setAction] = useState(false);
  const [showFermer, setShowFermer] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const loadSession = async () => {
    if (!utilisateur?.agenceId) { setLoading(false); return; }
    try {
      const { data } = await api.get('/caisse/active', { params: { agenceId: utilisateur.agenceId } });
      setSession(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSession(); }, []);

  const ouvrir = async () => {
    if (!soldeOuverture || !utilisateur?.agenceId) return;
    setAction(true);
    try {
      await api.post('/caisse', { agenceId: utilisateur.agenceId, soldeOuverture: parseFloat(soldeOuverture) });
      toast.success('Caisse ouverte', 'La session de caisse a démarré avec succès.');
      await loadSession();
      setSoldeOuverture('');
    } catch (e: any) {
      toast.error('Erreur d\'ouverture', e.response?.data?.error || 'Impossible d\'ouvrir la caisse.');
    } finally { setAction(false); }
  };

  const fermer = async () => {
    if (!session || !soldeFermeture) return;
    setAction(true);
    try {
      await api.patch(`/caisse/${session.id}/fermer`, { soldeFermeture: parseFloat(soldeFermeture) });
      toast.success('Caisse fermée', 'La session a été clôturée. Le rapport est disponible.');
      setShowFermer(false);
      setSoldeFermeture('');
      await loadSession();
    } catch (e: any) {
      toast.error('Erreur de fermeture', e.response?.data?.error || 'Impossible de fermer la caisse.');
    } finally { setAction(false); }
  };

  const handleRapport = async () => {
    if (!session) return;
    setGeneratingPdf(true);
    try {
      generateRapportCaisse(session, utilisateur?.agence?.nom || 'Siège Social');
      toast.success('Rapport généré', 'Le PDF a été téléchargé.');
    } catch {
      toast.error('Erreur', 'Impossible de générer le rapport.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
          <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <span className="ml-3 text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
      </div>
    );
  }

  if (!utilisateur?.agenceId) {
    return (
      <div className="flex items-start gap-3 p-5 rounded-2xl animate-slide-up" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#b45309' }}><path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <p className="text-sm font-medium" style={{ color: '#92400e' }}>Vous n'êtes pas associé à une agence. Contactez un administrateur.</p>
      </div>
    );
  }

  const totalDepots   = session?.transactions?.filter((t: any) => t.type === 'DEPOT').reduce((s: number, t: any) => s + Number(t.montant), 0) || 0;
  const totalRetraits = session?.transactions?.filter((t: any) => t.type === 'RETRAIT').reduce((s: number, t: any) => s + Number(t.montant), 0) || 0;
  const nbOps = session?.transactions?.length || 0;
  const soldeTheo = session ? Number(session.soldeOuverture) + totalDepots - totalRetraits : 0;

  return (
    <div className="space-y-5 animate-slide-up">

      {!session ? (
        /* ── Caisse fermée ── */
        <div className="card p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <h2 className="font-bold" style={{ color: 'white' }}>Caisse journalière</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Aucune session active</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }}></span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Caisse non ouverte pour aujourd'hui</span>
            </div>
          </div>

          <div className="px-6 py-6">
            <p className="text-sm font-semibold mb-1" style={{ color: '#0b1733' }}>Ouvrir la caisse du jour</p>
            <p className="text-xs mb-4" style={{ color: '#8b94b0' }}>Entrez le solde de départ constaté en caisse avant de commencer les opérations.</p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="label">Solde d'ouverture (HTG)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#4a5578' }}>HTG</span>
                  <input type="number" min="0" step="0.01" value={soldeOuverture} onChange={(e) => setSoldeOuverture(e.target.value)} className="input pl-14" placeholder="0.00" />
                </div>
              </div>
              <button onClick={ouvrir} disabled={!soldeOuverture || action} className="btn-primary disabled:opacity-40 flex items-center gap-2">
                {action
                  ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
                {action ? 'Ouverture...' : 'Ouvrir la caisse'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Caisse ouverte ── */}
          <div className="card overflow-hidden">
            <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6ee7b7' }}></span>
                    <span className="text-sm font-semibold" style={{ color: '#6ee7b7' }}>Caisse ouverte</span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Ouverte par {session.ouvertPar?.prenom} {session.ouvertPar?.nom}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatDatetime(session.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>Solde d'ouverture</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: 'white' }}>{formatMontant(session.soldeOuverture, 'HTG')}</p>
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-4 divide-x" style={{ borderBottom: '1px solid #f0f2f9' }}>
              {[
                { label: 'Dépôts',    value: `+${formatMontant(totalDepots, 'HTG')}`,   color: '#047857' },
                { label: 'Retraits',  value: `-${formatMontant(totalRetraits, 'HTG')}`, color: '#b91c1c' },
                { label: 'Solde théorique', value: formatMontant(soldeTheo, 'HTG'),     color: '#1e40af' },
                { label: 'Opérations', value: String(nbOps),                             color: '#0b1733' },
              ].map((s) => (
                <div key={s.label} className="px-4 py-4 text-center">
                  <p className="text-xs" style={{ color: '#8b94b0' }}>{s.label}</p>
                  <p className="font-bold mt-0.5 text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f0f2f9' }}>
              <button
                onClick={handleRapport}
                disabled={generatingPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: '#eef2ff', color: '#1e40af' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#eef2ff'}
              >
                {generatingPdf
                  ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
                {generatingPdf ? 'Génération...' : 'Rapport PDF'}
              </button>
              <button
                onClick={() => setShowFermer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ml-auto"
                style={{ background: '#1e3a8a', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1e40af'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1e3a8a'}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Fermer la caisse
              </button>
            </div>

            {/* Opérations de la session */}
            {session.transactions && session.transactions.length > 0 && (
              <div>
                <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f2f9' }}>
                  <h3 className="font-bold text-sm" style={{ color: '#0b1733' }}>Opérations de la session</h3>
                </div>
                <div className="divide-y" style={{ borderColor: '#f0f2f9' }}>
                  {session.transactions.map((tx: any) => {
                    const isDebit = ['RETRAIT', 'VIREMENT_DEBIT'].includes(tx.type);
                    return (
                      <div key={tx.id} className="px-5 py-3.5 flex items-center gap-3 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isDebit ? '#fef2f2' : '#ecfdf5', color: isDebit ? '#b91c1c' : '#047857' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                            {isDebit
                              ? <path d="M5 10l7-7 7 7M12 21V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              : <path d="M19 14l-7 7-7-7M12 3v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            }
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: '#0b1733' }}>{TYPE_TRANSACTION_LABELS[tx.type]}</p>
                          <p className="text-xs font-mono" style={{ color: '#8b94b0' }}>{tx.reference}</p>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0" style={{ color: isDebit ? '#b91c1c' : '#047857' }}>
                          {isDebit ? '-' : '+'}{formatMontant(tx.montant, tx.devise)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {session.transactions?.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={{ color: '#8b94b0' }}>Aucune opération enregistrée dans cette session.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Drawer — Fermer la caisse */}
      {showFermer && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowFermer(false); }}>
          <div className="drawer-panel" style={{ maxWidth: '480px' }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex-1">
                <h2 className="font-bold" style={{ color: 'white' }}>Fermer la caisse</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Clôture de session journalière</p>
              </div>
              <button onClick={() => setShowFermer(false)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="px-5 py-5 flex-1 space-y-4">
              {/* Récap */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Solde ouverture',  value: formatMontant(session?.soldeOuverture, 'HTG'), color: '#0b1733' },
                  { label: 'Solde théorique',  value: formatMontant(soldeTheo, 'HTG'),               color: '#1e40af' },
                  { label: 'Total dépôts',     value: `+${formatMontant(totalDepots, 'HTG')}`,        color: '#047857' },
                  { label: 'Total retraits',   value: `-${formatMontant(totalRetraits, 'HTG')}`,      color: '#b91c1c' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl" style={{ background: '#f7f8fc' }}>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>{item.label}</p>
                    <p className="font-bold mt-0.5 text-sm" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="label">Solde de fermeture constaté (HTG)</label>
                <p className="text-xs mb-2" style={{ color: '#8b94b0' }}>Comptez physiquement le contenu de la caisse.</p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#4a5578' }}>HTG</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={soldeFermeture}
                    onChange={(e) => setSoldeFermeture(e.target.value)}
                    className="input pl-14 text-lg font-semibold"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                {soldeFermeture && (
                  <div className="mt-2 p-2.5 rounded-xl text-xs font-semibold" style={{
                    background: Math.abs(parseFloat(soldeFermeture) - soldeTheo) < 1 ? '#ecfdf5' : '#fffbeb',
                    color: Math.abs(parseFloat(soldeFermeture) - soldeTheo) < 1 ? '#047857' : '#b45309',
                    border: `1px solid ${Math.abs(parseFloat(soldeFermeture) - soldeTheo) < 1 ? '#6ee7b7' : '#fcd34d'}`,
                  }}>
                    Écart : {(parseFloat(soldeFermeture) - soldeTheo >= 0 ? '+' : '')}{formatMontant(parseFloat(soldeFermeture) - soldeTheo, 'HTG')}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setShowFermer(false)} className="btn-ghost flex-1">Annuler</button>
              <button
                onClick={fermer}
                disabled={!soldeFermeture || action}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white' }}
              >
                {action
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Fermeture...</>
                  : 'Confirmer la fermeture'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
