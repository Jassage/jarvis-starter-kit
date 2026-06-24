'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePretStore } from '@/stores/pretStore';
import { useAuthStore } from '@/stores/authStore';
import { useCompteStore } from '@/stores/compteStore';
import { useToastStore } from '@/stores/toastStore';
import { formatMontant, formatDate, nomClient, STATUT_PRET_LABELS } from '@/lib/utils';
import Combobox, { ComboboxOption } from '@/components/ui/Combobox';
import { generateDossierCredit } from '@/lib/rapportPret';

const STATUT_CHIP: Record<string, string> = {
  EN_ATTENTE: 'chip chip-warning',
  APPROUVE:   'chip chip-primary',
  DECAISSE:   'chip chip-primary',
  EN_COURS:   'chip chip-success',
  EN_RETARD:  'chip chip-danger',
  SOLDE:      'chip chip-neutral',
  REJETE:     'chip chip-danger',
  ANNULE:     'chip chip-neutral',
};

const STATUT_DOT: Record<string, string> = {
  EN_ATTENTE: '#f59e0b', APPROUVE: '#2563eb', DECAISSE: '#2563eb',
  EN_COURS: '#10b981', EN_RETARD: '#ef4444', SOLDE: '#8b94b0', REJETE: '#ef4444', ANNULE: '#8b94b0',
};

const LIGNE_STATUT_CHIP: Record<string, string> = {
  A_VENIR: 'chip chip-neutral',
  PAYE:    'chip chip-success',
  EN_RETARD: 'chip chip-danger',
};

export default function PretDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { fetchPret, approuver, rejeter, decaisser, rembourser } = usePretStore();
  const { searchComptes } = useCompteStore();
  const { utilisateur } = useAuthStore();
  const toast = useToastStore();

  const [pret, setPret] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Drawers
  const [showConfirmApprouver, setShowConfirmApprouver] = useState(false);
  const [showConfirmRejeter, setShowConfirmRejeter] = useState(false);
  const [showDecaisser, setShowDecaisser] = useState(false);
  const [showRembourser, setShowRembourser] = useState(false);

  // Décaissement
  const [decaisCompte, setDecaisCompte] = useState('');
  const [decaisOptions, setDecaisOptions] = useState<ComboboxOption[]>([]);
  const [decaisLoading, setDecaisLoading] = useState(false);
  const [decaisDisplay, setDecaisDisplay] = useState('');

  // Remboursement
  const [rembMontant, setRembMontant] = useState('');
  const [rembCompte, setRembCompte] = useState('');
  const [rembOptions, setRembOptions] = useState<ComboboxOption[]>([]);
  const [rembLoading, setRembLoading] = useState(false);
  const [rembDisplay, setRembDisplay] = useState('');

  const load = async () => {
    const data = await fetchPret(id);
    setPret(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handlePdf = async () => {
    if (!pret || pdfLoading) return;
    setPdfLoading(true);
    try { generateDossierCredit(pret); }
    finally { setPdfLoading(false); }
  };

  const canValidate = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'].includes(utilisateur?.role || '');

  const searchCompteOptions = useCallback(async (q: string, setter: (opts: ComboboxOption[]) => void, loadingSetter: (v: boolean) => void) => {
    if (q.length < 2) { setter([]); return; }
    loadingSetter(true);
    const items = await searchComptes(q);
    setter(items.map((c: any) => ({
      value: c.id,
      label: c.numeroCompte,
      sublabel: c.client ? (c.client.type === 'ENTREPRISE' ? c.client.raisonSociale : `${c.client.prenom} ${c.client.nom}`) : undefined,
      badge: formatMontant(c.solde, c.devise),
      badgeColor: '#047857',
    })));
    loadingSetter(false);
  }, [searchComptes]);

  const handleApprouver = async () => {
    setAction(true);
    try {
      await approuver(id);
      toast.success('Prêt approuvé', 'Le dossier a été approuvé avec succès.');
      setShowConfirmApprouver(false);
      await load();
    } catch {
      toast.error('Erreur', 'Impossible d\'approuver ce dossier.');
    } finally {
      setAction(false);
    }
  };

  const handleRejeter = async () => {
    setAction(true);
    try {
      await rejeter(id);
      toast.warning('Prêt rejeté', 'Le dossier a été rejeté.');
      setShowConfirmRejeter(false);
      await load();
    } catch {
      toast.error('Erreur', 'Impossible de rejeter ce dossier.');
    } finally {
      setAction(false);
    }
  };

  const handleDecaisser = async () => {
    if (!decaisCompte) { toast.warning('Compte manquant', 'Sélectionnez le compte de destination.'); return; }
    setAction(true);
    try {
      await decaisser(id, { compteDestinationId: decaisCompte });
      toast.success('Prêt décaissé', 'Les fonds ont été virés sur le compte client.');
      setShowDecaisser(false);
      setDecaisCompte(''); setDecaisDisplay(''); setDecaisOptions([]);
      await load();
    } catch (err: any) {
      toast.error('Erreur de décaissement', err.response?.data?.error || 'Opération impossible.');
    } finally {
      setAction(false);
    }
  };

  const handleRembourser = async () => {
    if (!rembMontant || !rembCompte) { toast.warning('Champs manquants', 'Remplissez le montant et sélectionnez le compte source.'); return; }
    setAction(true);
    try {
      await rembourser(id, { montant: parseFloat(rembMontant), compteSourceId: rembCompte });
      toast.success('Remboursement enregistré', `${formatMontant(parseFloat(rembMontant), pret.devise)} débité du compte.`);
      setShowRembourser(false);
      setRembMontant(''); setRembCompte(''); setRembDisplay(''); setRembOptions([]);
      await load();
    } catch (err: any) {
      toast.error('Erreur', err.response?.data?.error || 'Remboursement impossible.');
    } finally {
      setAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
          <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <span className="ml-3 text-sm" style={{ color: '#8b94b0' }}>Chargement du dossier...</span>
      </div>
    );
  }

  if (!pret) {
    return (
      <div className="card p-12 text-center">
        <p className="font-semibold" style={{ color: '#0b1733' }}>Dossier introuvable</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">← Retour</button>
      </div>
    );
  }

  const progressPct = pret.montantTotal > 0 ? Math.min(100, (Number(pret.montantRembourse) / Number(pret.montantTotal)) * 100) : 0;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: '#8b94b0' }}>
          <button onClick={() => router.back()} className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Prêts
          </button>
          <span>/</span>
          <span className="font-mono" style={{ color: '#4a5578' }}>{pret.reference}</span>
        </div>
        <button
          onClick={handlePdf}
          disabled={pdfLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
          style={{ background: '#eef2ff', color: '#1e40af' }}
        >
          {pdfLoading
            ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
          {pdfLoading ? 'Génération...' : 'Dossier PDF'}
        </button>
      </div>

      {/* Fiche principale */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="font-mono font-bold text-lg" style={{ color: '#0b1733' }}>{pret.reference}</p>
              <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>{pret.client ? nomClient(pret.client) : '—'}</p>
              {pret.objet && <p className="text-sm mt-1 italic" style={{ color: '#4a5578' }}>"{pret.objet}"</p>}
            </div>
            <span className={STATUT_CHIP[pret.statut] || 'chip chip-neutral'}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUT_DOT[pret.statut] || '#8b94b0' }}></span>
              {STATUT_PRET_LABELS[pret.statut]}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Montant accordé', value: formatMontant(pret.montant, pret.devise) },
              { label: 'Taux mensuel', value: `${(Number(pret.tauxMensuel) * 100).toFixed(2)}%` },
              { label: 'Durée', value: `${pret.dureeMois} mois` },
              { label: 'Date demande', value: formatDate(pret.dateDemande) },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl" style={{ background: '#f7f8fc' }}>
                <p className="text-xs" style={{ color: '#8b94b0' }}>{m.label}</p>
                <p className="font-bold mt-0.5" style={{ color: '#0b1733' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Intervenants */}
          {(pret.agentCredit || pret.validateur) && (
            <div className="flex items-center gap-3 mt-4 pt-4 flex-wrap" style={{ borderTop: '1px solid #f0f2f9' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Intervenants</span>
              {pret.agentCredit && (
                <span className="user-badge user-badge-blue">
                  <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 inline mr-0.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Dossier · {pret.agentCredit.prenom} {pret.agentCredit.nom}
                </span>
              )}
              {pret.validateur && (
                <span className="user-badge user-badge-green">
                  <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 inline mr-0.5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Approuvé · {pret.validateur.prenom} {pret.validateur.nom}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Barre de progression */}
        {['EN_COURS', 'EN_RETARD', 'SOLDE'].includes(pret.statut) && (
          <div className="mx-6 mb-5 p-4 rounded-2xl" style={{ background: '#f7f8fc', border: '1px solid #e7eaf3' }}>
            <div className="flex justify-between text-sm mb-2.5">
              <span style={{ color: '#4a5578' }}>Progression du remboursement</span>
              <span className="font-semibold" style={{ color: '#0b1733' }}>
                {formatMontant(pret.montantRembourse, pret.devise)} / {formatMontant(pret.montantTotal, pret.devise)}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e7eaf3' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: pret.statut === 'EN_RETARD' ? '#ef4444' : pret.statut === 'SOLDE' ? '#10b981' : '#2563eb' }} />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span style={{ color: '#8b94b0' }}>{progressPct.toFixed(1)}% remboursé</span>
              <span className="font-semibold" style={{ color: '#b45309' }}>Reste : {formatMontant(pret.resteARegler, pret.devise)}</span>
            </div>
          </div>
        )}

        {/* Actions EN_ATTENTE */}
        {canValidate && pret.statut === 'EN_ATTENTE' && (
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f0f2f9' }}>
            <p className="text-sm font-semibold mr-2" style={{ color: '#0b1733' }}>Décision :</p>
            <button onClick={() => setShowConfirmApprouver(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background: '#ecfdf5', color: '#047857' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Approuver
            </button>
            <button onClick={() => setShowConfirmRejeter(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Rejeter
            </button>
          </div>
        )}

        {/* Actions APPROUVE */}
        {canValidate && pret.statut === 'APPROUVE' && (
          <div className="px-6 py-4" style={{ borderTop: '1px solid #f0f2f9' }}>
            <button onClick={() => setShowDecaisser(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ background: '#eef2ff', color: '#1e40af' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M19 14l-7 7-7-7M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Procéder au décaissement
            </button>
          </div>
        )}

        {/* Actions EN_COURS / EN_RETARD */}
        {['EN_COURS', 'EN_RETARD'].includes(pret.statut) && (
          <div className="px-6 py-4" style={{ borderTop: '1px solid #f0f2f9' }}>
            <button onClick={() => setShowRembourser(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ background: '#ecfeff', color: '#0e7490' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M3 12l6-6 6 6M9 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Enregistrer un remboursement
            </button>
          </div>
        )}
      </div>

      {/* Tableau d'amortissement */}
      {pret.lignes?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f2f9' }}>
            <h3 className="font-bold" style={{ color: '#0b1733' }}>Tableau d'amortissement</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{pret.lignes.length} échéances</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#f7f8fc' }}>
                  {['N°', 'Échéance', 'Mensualité', 'Capital', 'Intérêt', 'Cap. restant', 'Statut'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 2 && i <= 5 ? 'text-right' : 'text-left'}`} style={{ color: '#8b94b0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pret.lignes.map((ligne: any) => (
                  <tr key={ligne.id} style={{ borderTop: '1px solid #f0f2f9', opacity: ligne.statut === 'PAYE' ? 0.5 : 1, background: ligne.statut === 'EN_RETARD' ? '#fff5f5' : 'transparent' }}>
                    <td className="px-4 py-3"><span className="text-xs font-semibold" style={{ color: '#4a5578' }}>#{ligne.numeroEcheance}</span></td>
                    <td className="px-4 py-3"><span className="text-sm" style={{ color: '#0b1733' }}>{formatDate(ligne.dateEcheance)}</span></td>
                    <td className="px-4 py-3 text-right"><span className="font-semibold text-sm" style={{ color: '#0b1733' }}>{formatMontant(ligne.mensualite, pret.devise)}</span></td>
                    <td className="px-4 py-3 text-right"><span className="text-sm" style={{ color: '#4a5578' }}>{formatMontant(ligne.capital, pret.devise)}</span></td>
                    <td className="px-4 py-3 text-right"><span className="text-sm" style={{ color: '#b45309' }}>{formatMontant(ligne.interet, pret.devise)}</span></td>
                    <td className="px-4 py-3 text-right"><span className="text-sm" style={{ color: '#8b94b0' }}>{formatMontant(ligne.capitalRestant, pret.devise)}</span></td>
                    <td className="px-4 py-3">
                      <span className={LIGNE_STATUT_CHIP[ligne.statut] || 'chip chip-neutral'}>
                        {ligne.statut === 'PAYE' ? 'Payé' : ligne.statut === 'EN_RETARD' ? 'En retard' : 'À venir'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer — Approuver */}
      {showConfirmApprouver && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmApprouver(false); }}>
          <div className="drawer-panel" style={{ maxWidth: '460px' }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #047857, #10b981)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex-1"><h2 className="font-bold" style={{ color: 'white' }}>Approuver le dossier</h2><p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{pret.reference} · {formatMontant(pret.montant, pret.devise)}</p></div>
              <button onClick={() => setShowConfirmApprouver(false)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
            <div className="px-5 py-5 flex-1">
              <p className="text-sm" style={{ color: '#4a5578' }}>Vous allez approuver la demande de prêt de <strong>{pret.client ? nomClient(pret.client) : '—'}</strong> pour <strong>{formatMontant(pret.montant, pret.devise)}</strong> sur <strong>{pret.dureeMois} mois</strong>.</p>
              <p className="text-xs mt-3 p-3 rounded-xl" style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a' }}>
                Après approbation, le prêt passera en statut "Approuvé" et pourra être décaissé.
              </p>
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setShowConfirmApprouver(false)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleApprouver} disabled={action} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#10b981', color: 'white' }}>
                {action ? 'En cours...' : 'Confirmer l\'approbation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer — Rejeter */}
      {showConfirmRejeter && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmRejeter(false); }}>
          <div className="drawer-panel" style={{ maxWidth: '460px' }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div className="flex-1"><h2 className="font-bold" style={{ color: 'white' }}>Rejeter le dossier</h2><p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Cette action est irréversible</p></div>
              <button onClick={() => setShowConfirmRejeter(false)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
            <div className="px-5 py-5 flex-1">
              <p className="text-sm mb-4" style={{ color: '#4a5578' }}>Vous allez rejeter le dossier <strong>{pret.reference}</strong> de <strong>{pret.client ? nomClient(pret.client) : '—'}</strong>.</p>
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setShowConfirmRejeter(false)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleRejeter} disabled={action} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#b91c1c', color: 'white' }}>
                {action ? 'En cours...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer — Décaisser */}
      {showDecaisser && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDecaisser(false); }}>
          <div className="drawer-panel" style={{ maxWidth: '500px' }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M19 14l-7 7-7-7M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex-1"><h2 className="font-bold" style={{ color: 'white' }}>Décaissement du prêt</h2><p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{formatMontant(pret.montant, pret.devise)} à virer</p></div>
              <button onClick={() => setShowDecaisser(false)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
            <div className="px-5 py-5 flex-1 space-y-4">
              <div>
                <label className="label">Compte de destination du client</label>
                <Combobox
                  options={decaisOptions}
                  value={decaisCompte}
                  displayValue={decaisDisplay}
                  onChange={(val, opt) => { setDecaisCompte(val); setDecaisDisplay(opt?.label || ''); }}
                  onSearch={(q) => searchCompteOptions(q, setDecaisOptions, setDecaisLoading)}
                  loading={decaisLoading}
                  placeholder="N° compte ou nom du client..."
                  emptyMessage="Aucun compte trouvé"
                />
              </div>
              <div className="p-3 rounded-xl text-xs" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' }}>
                Le montant <strong>{formatMontant(pret.montant, pret.devise)}</strong> sera crédité sur le compte sélectionné et une transaction de décaissement sera générée.
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setShowDecaisser(false)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleDecaisser} disabled={action || !decaisCompte} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white' }}>
                {action ? 'En cours...' : 'Confirmer le décaissement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer — Rembourser */}
      {showRembourser && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowRembourser(false); }}>
          <div className="drawer-panel" style={{ maxWidth: '500px' }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M3 12l6-6 6 6M9 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex-1"><h2 className="font-bold" style={{ color: 'white' }}>Remboursement</h2><p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Reste : {formatMontant(pret.resteARegler, pret.devise)}</p></div>
              <button onClick={() => setShowRembourser(false)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
            <div className="px-5 py-5 flex-1 space-y-4">
              <div>
                <label className="label">Montant du remboursement ({pret.devise})</label>
                <input
                  type="number"
                  value={rembMontant}
                  onChange={(e) => setRembMontant(e.target.value)}
                  className="input text-lg font-semibold"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Compte source du client</label>
                <Combobox
                  options={rembOptions}
                  value={rembCompte}
                  displayValue={rembDisplay}
                  onChange={(val, opt) => { setRembCompte(val); setRembDisplay(opt?.label || ''); }}
                  onSearch={(q) => searchCompteOptions(q, setRembOptions, setRembLoading)}
                  loading={rembLoading}
                  placeholder="N° compte ou nom du client..."
                  emptyMessage="Aucun compte trouvé"
                />
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setShowRembourser(false)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleRembourser} disabled={action || !rembMontant || !rembCompte} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)', color: 'white' }}>
                {action ? 'En cours...' : 'Enregistrer le remboursement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
