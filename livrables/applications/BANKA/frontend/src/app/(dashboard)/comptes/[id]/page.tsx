'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCompteStore } from '@/stores/compteStore';
import { useMandatStore } from '@/stores/mandatStore';
import api from '@/lib/api';
import { formatMontant, formatDatetime, formatDate, TYPE_COMPTE_LABELS, TYPE_TRANSACTION_LABELS, STATUT_TX_LABELS } from '@/lib/utils';
import { openPrintWindow, formatMontantPrint, formatDatetimePrint, formatDatePrint, bankaHeader } from '@/lib/printBanka';
import TransactionForm from '@/components/transactions/TransactionForm';
import MandatForm from '@/components/comptes/MandatForm';

const STATUT_CHIP: Record<string, string> = {
  VALIDEE: 'chip chip-success', EN_ATTENTE: 'chip chip-warning', REJETEE: 'chip chip-danger', ANNULEE: 'chip chip-neutral',
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
  const [showCloture, setShowCloture] = useState(false);
  const [cloturing, setCloturing] = useState(false);
  const [clotureError, setClotureError] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(todayStr);
  const [releveLoading, setReleveLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    await Promise.all([fetchCompte(id), fetchReleve(id, { from: from || undefined, to }), fetchMandats(id)]);
    setLoading(false);
  };

  const reloadReleve = async () => {
    setReleveLoading(true);
    await fetchReleve(id, { from: from || undefined, to });
    setReleveLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleCloturer = async () => {
    setCloturing(true);
    setClotureError('');
    try {
      await api.post(`/comptes/${id}/cloturer`);
      await load();
      setShowCloture(false);
    } catch (err: any) {
      setClotureError(err.response?.data?.message || 'Erreur lors de la clôture');
    } finally {
      setCloturing(false);
    }
  };

  const handlePrint = () => {
    if (!selected || !releve) return;
    const client = selected.client;
    const clientNom = client?.type === 'ENTREPRISE' ? client.raisonSociale : `${client?.prenom || ''} ${client?.nom || ''}`.trim();

    const periodeTitre = from
      ? `Du ${formatDatePrint(from)} au ${formatDatePrint(to)}`
      : `Jusqu'au ${formatDatePrint(to)}`;

    const lignes = releve.transactions.map((tx: any) => {
      const isCredit = tx.compteCreditId === id;
      return `<tr>
        <td>${formatDatetimePrint(tx.createdAt)}</td>
        <td><span style="font-family:monospace;font-size:11px">${tx.reference}</span><br/><span style="font-size:10px;color:#4a5578">${TYPE_TRANSACTION_LABELS[tx.type] || tx.type}</span>${tx.motif ? `<br/><i style="font-size:10px;color:#8b94b0">"${tx.motif}"</i>` : ''}</td>
        <td class="${isCredit ? 'credit' : ''}" style="text-align:right">${isCredit ? '+' + formatMontantPrint(tx.montant, tx.devise) : ''}</td>
        <td class="${!isCredit ? 'debit' : ''}" style="text-align:right">${!isCredit ? '-' + formatMontantPrint(tx.montant, tx.devise) : ''}</td>
        <td style="text-align:right">${formatMontantPrint(tx.soldeApres, tx.devise)}</td>
      </tr>`;
    }).join('');

    const html = `
${bankaHeader('Relevé de compte')}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
  <div class="kpi"><div class="kpi-label">Compte</div><div class="kpi-value" style="font-size:14px;font-family:monospace">${selected.numeroCompte}</div></div>
  <div class="kpi"><div class="kpi-label">Titulaire</div><div class="kpi-value" style="font-size:14px">${clientNom}</div></div>
  <div class="kpi"><div class="kpi-label">Type</div><div class="kpi-value" style="font-size:14px">${TYPE_COMPTE_LABELS[selected.type] || selected.type}</div></div>
  <div class="kpi"><div class="kpi-label">Période</div><div class="kpi-value" style="font-size:13px">${periodeTitre}</div></div>
</div>
<div style="background:#eef2ff;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
  <span style="font-size:12px;color:#4a5578">Solde actuel</span>
  <span style="font-size:20px;font-weight:700;color:#1e40af">${formatMontantPrint(selected.solde, selected.devise)}</span>
</div>
<h2>Détail des opérations (${releve.total})</h2>
${releve.transactions.length === 0 ? '<p style="color:#8b94b0;font-style:italic">Aucune opération sur cette période.</p>' : `
<table>
  <thead><tr>
    <th>Date</th><th>Description</th>
    <th style="text-align:right">Crédit</th>
    <th style="text-align:right">Débit</th>
    <th style="text-align:right">Solde après</th>
  </tr></thead>
  <tbody>${lignes}</tbody>
</table>`}
<div class="footer">
  <span>BANKA — Système de Gestion Bancaire</span>
  <span>Document confidentiel — usage interne</span>
</div>`;

    openPrintWindow(html, `Relevé ${selected.numeroCompte}`);
  };

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
          <div className="ml-auto flex items-center gap-2">
            <span className={`chip ${selected.statut === 'ACTIF' ? 'chip-success' : selected.statut === 'SUSPENDU' ? 'chip-warning' : 'chip-neutral'}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: selected.statut === 'ACTIF' ? '#10b981' : selected.statut === 'SUSPENDU' ? '#f59e0b' : '#8b94b0' }}></span>
              {selected.statut}
            </span>
            {selected.statut !== 'CLOTURE' && (
              <button
                onClick={() => { setShowCloture(true); setClotureError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Clôturer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal clôture */}
      {showCloture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef2f2' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#b91c1c' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold" style={{ color: '#0b1733' }}>Clôturer ce compte</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{selected.numeroCompte}</p>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: '#4a5578' }}>
              Cette action est <strong>irréversible</strong>. Le compte sera fermé définitivement. Le solde doit être à <strong>0</strong> avant la clôture.
            </p>
            <div className="p-3 rounded-xl mb-4 flex items-center justify-between" style={{ background: Number(selected.solde) === 0 ? '#ecfdf5' : '#fef2f2' }}>
              <span className="text-sm font-medium" style={{ color: '#4a5578' }}>Solde actuel</span>
              <span className="font-bold" style={{ color: Number(selected.solde) === 0 ? '#047857' : '#b91c1c' }}>{formatMontant(selected.solde, selected.devise)}</span>
            </div>
            {clotureError && (
              <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: '#fef2f2', color: '#b91c1c' }}>{clotureError}</div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowCloture(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f7f8fc', color: '#4a5578' }}>
                Annuler
              </button>
              <button
                onClick={handleCloturer}
                disabled={cloturing || Number(selected.solde) !== 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: '#b91c1c', color: 'white' }}
              >
                {cloturing && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}
                Confirmer la clôture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relevé */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid #f0f2f9' }}>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold" style={{ color: '#0b1733' }}>Relevé de compte</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{releve?.total || 0} opération{(releve?.total || 0) > 1 ? 's' : ''}</p>
          </div>

          {/* Filtres dates */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#4a5578' }}>Du</label>
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="input text-sm" style={{ width: '140px', padding: '6px 10px' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#4a5578' }}>Au</label>
              <input type="date" value={to} max={todayStr} onChange={(e) => setTo(e.target.value)} className="input text-sm" style={{ width: '140px', padding: '6px 10px' }} />
            </div>
            <button onClick={reloadReleve} disabled={releveLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all" style={{ background: '#eef2ff', color: '#1e40af' }}>
              {releveLoading
                ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
              Filtrer
            </button>
          </div>

          {/* Bouton impression */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: '#f0f2f9', color: '#4a5578' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Imprimer
          </button>
        </div>

        {!releve || releve.transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucune opération</p>
            <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Aucune transaction validée sur cette période.</p>
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

      {/* Mandats */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f2f9' }}>
          <div>
            <h3 className="font-bold" style={{ color: '#0b1733' }}>Mandats & Procurations</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
              {mandats.filter(m => m.actif).length} mandat{mandats.filter(m => m.actif).length > 1 ? 's' : ''} actif{mandats.filter(m => m.actif).length > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowMandat(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]" style={{ background: '#eef2ff', color: '#1e40af' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouveau mandat
          </button>
        </div>
        {mandats.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Aucun mandat</p>
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Accordez des droits à un tiers pour agir sur ce compte.</p>
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
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{nom}</p>
                      <span className="text-xs font-mono" style={{ color: '#8b94b0' }}>{m.mandataire.numeroClient}</span>
                      <span className={`chip ${m.actif ? 'chip-success' : 'chip-neutral'} ml-auto`}>{m.actif ? 'Actif' : 'Révoqué'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {m.droits.map((d: string) => <span key={d} className="chip chip-primary" style={{ fontSize: '10px' }}>{d}</span>)}
                    </div>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>
                      Depuis le {formatDate(m.dateDebut)}{m.dateFin && ` · Expire le ${formatDate(m.dateFin)}`}{m.notes && ` · "${m.notes}"`}
                    </p>
                  </div>
                  {m.actif && (
                    <button
                      onClick={async () => { setRevoquant(m.id); await revoquerMandat(id, m.id); await fetchMandats(id); setRevoquant(null); }}
                      disabled={revoquant === m.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 disabled:opacity-50"
                      style={{ background: '#fef2f2', color: '#b91c1c' }}
                    >
                      {revoquant === m.id
                        ? <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      }
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
        <TransactionForm type={showTx} compteId={id} onClose={() => setShowTx(null)} onSuccess={() => { setShowTx(null); load(); }} />
      )}
      {showMandat && (
        <MandatForm compteId={id} onClose={() => setShowMandat(false)} onSuccess={() => { setShowMandat(false); fetchMandats(id); }} />
      )}
    </div>
  );
}
