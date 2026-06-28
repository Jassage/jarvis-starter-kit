'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatMontant, formatDate, nomClient, STATUT_PRET_LABELS, TYPE_TRANSACTION_LABELS } from '@/lib/utils';
import { openPrintWindow, formatMontantPrint, formatDatePrint, bankaHeader } from '@/lib/printBanka';

type Tab = 'journalier' | 'par' | 'impayes';

const TYPE_TX_COLORS: Record<string, string> = {
  DEPOT: '#047857', RETRAIT: '#b91c1c', VIREMENT_DEBIT: '#1e40af', VIREMENT_CREDIT: '#1e40af',
  DECAISSEMENT_PRET: '#0e7490', REMBOURSEMENT_PRET: '#0e7490', FRAIS: '#b45309', INTERET: '#b45309',
};

function printJournal(date: string, journal: any, txRows: any[], totalDepots: number, totalRetraits: number, totalOps: number) {
  const lignes = txRows.map((row) => `<tr>
    <td>${TYPE_TRANSACTION_LABELS[row.type] || row.type}</td>
    <td>${row.devise}</td>
    <td style="text-align:right">${row.count}</td>
    <td style="text-align:right;font-weight:700">${formatMontantPrint(row.montant, row.devise)}</td>
  </tr>`).join('');

  const html = `${bankaHeader(`Activité journalière — ${formatDatePrint(date)}`)}
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-label">Dépôts (HTG)</div><div class="kpi-value" style="color:#047857">${formatMontantPrint(totalDepots, 'HTG')}</div></div>
  <div class="kpi"><div class="kpi-label">Retraits (HTG)</div><div class="kpi-value" style="color:#b91c1c">${formatMontantPrint(totalRetraits, 'HTG')}</div></div>
  <div class="kpi"><div class="kpi-label">Net (HTG)</div><div class="kpi-value" style="color:#1e40af">${formatMontantPrint(totalDepots - totalRetraits, 'HTG')}</div></div>
  <div class="kpi"><div class="kpi-label">Total opérations</div><div class="kpi-value">${totalOps}</div></div>
</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-label">Nouveaux clients</div><div class="kpi-value">${journal.nouveauxClients}</div></div>
  <div class="kpi"><div class="kpi-label">Nouveaux comptes</div><div class="kpi-value">${journal.nouveauxComptes}</div></div>
  <div class="kpi"><div class="kpi-label">Demandes prêt</div><div class="kpi-value">${journal.nouveauxPrets}</div></div>
</div>
<h2>Détail par type d'opération</h2>
<table>
  <thead><tr><th>Type</th><th>Devise</th><th style="text-align:right">Opérations</th><th style="text-align:right">Montant total</th></tr></thead>
  <tbody>${lignes}</tbody>
</table>
<div class="footer"><span>BANKA — Rapport journalier</span><span>Document confidentiel</span></div>`;

  openPrintWindow(html, `Rapport journalier ${formatDatePrint(date)}`);
}

function printPAR(par: any) {
  const html = `${bankaHeader('Portefeuille à Risque (PAR)')}
<div class="kpi-grid">
  <div class="kpi" style="grid-column:span 2"><div class="kpi-label">Encours total de crédit</div><div class="kpi-value">${formatMontantPrint(par.encoursTotalCredit, 'HTG')}</div></div>
  <div class="kpi"><div class="kpi-label">PAR 30 (ratio)</div><div class="kpi-value" style="color:#b45309">${par.par30.ratio.toFixed(2)}%</div></div>
  <div class="kpi"><div class="kpi-label">PAR 90 (ratio)</div><div class="kpi-value" style="color:#b91c1c">${par.par90.ratio.toFixed(2)}%</div></div>
</div>
<table>
  <thead><tr><th>Indicateur</th><th style="text-align:right">Montant à risque</th><th style="text-align:right">Dossiers</th><th style="text-align:right">Ratio</th></tr></thead>
  <tbody>
    <tr><td>PAR 30 — Prêts en retard > 30 jours</td><td style="text-align:right;color:#b45309">${formatMontantPrint(par.par30.montant, 'HTG')}</td><td style="text-align:right">${par.par30.count}</td><td style="text-align:right;font-weight:700;color:#b45309">${par.par30.ratio.toFixed(2)}%</td></tr>
    <tr><td>PAR 90 — Prêts en retard > 90 jours</td><td style="text-align:right;color:#b91c1c">${formatMontantPrint(par.par90.montant, 'HTG')}</td><td style="text-align:right">${par.par90.count}</td><td style="text-align:right;font-weight:700;color:#b91c1c">${par.par90.ratio.toFixed(2)}%</td></tr>
  </tbody>
</table>
<div class="footer"><span>BANKA — Rapport PAR</span><span>Document confidentiel</span></div>`;

  openPrintWindow(html, 'PAR — Portefeuille à Risque');
}

function printImpayes(impayes: any[]) {
  const total = impayes.reduce((s: number, p: any) => s + Number(p.resteARegler), 0);
  const lignes = impayes.map((p: any) => `<tr>
    <td style="font-family:monospace">${p.reference}</td>
    <td>${p.client?.type === 'ENTREPRISE' ? p.client.raisonSociale : `${p.client?.prenom || ''} ${p.client?.nom || ''}`.trim()}<br/><span style="font-size:10px;color:#8b94b0">${p.client?.numeroClient}</span></td>
    <td>${p.agence?.code || '—'}</td>
    <td style="text-align:right">${formatMontantPrint(p.montant, p.devise)}</td>
    <td style="text-align:right;color:#b91c1c;font-weight:700">${formatMontantPrint(p.resteARegler, p.devise)}</td>
    <td>${p.dateDecaissement ? formatDatePrint(p.dateDecaissement) : '—'}</td>
  </tr>`).join('');

  const html = `${bankaHeader(`État des impayés — ${new Date().toLocaleDateString('fr-FR')}`)}
<div class="kpi-grid">
  <div class="kpi" style="grid-column:span 2"><div class="kpi-label">Total créances en retard</div><div class="kpi-value" style="color:#b91c1c">${formatMontantPrint(total, 'HTG')}</div></div>
  <div class="kpi" style="grid-column:span 2"><div class="kpi-label">Nombre de dossiers en retard</div><div class="kpi-value">${impayes.length}</div></div>
</div>
<h2>Liste des prêts en retard</h2>
<table>
  <thead><tr><th>Référence</th><th>Client</th><th>Agence</th><th style="text-align:right">Montant accordé</th><th style="text-align:right">Reste à régler</th><th>Décaissement</th></tr></thead>
  <tbody>${lignes}</tbody>
  <tr class="total-row"><td colspan="3">TOTAL</td><td></td><td style="text-align:right">${formatMontantPrint(total, 'HTG')}</td><td></td></tr>
</table>
<div class="footer"><span>BANKA — État des impayés</span><span>Document confidentiel</span></div>`;

  openPrintWindow(html, 'État des impayés');
}

export default function RapportsPage() {
  const [tab, setTab] = useState<Tab>('journalier');

  // ── Journalier ──────────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [journal, setJournal] = useState<any>(null);
  const [journalLoading, setJournalLoading] = useState(false);

  const loadJournal = async (d: string) => {
    setJournalLoading(true);
    try {
      const { data } = await api.get('/stats/rapport-journalier', { params: { date: d } });
      setJournal(data.data);
    } finally {
      setJournalLoading(false);
    }
  };

  // ── PAR ─────────────────────────────────────────────────────────────────────
  const [par, setPar] = useState<any>(null);
  const [parLoading, setParLoading] = useState(false);

  const loadPar = async () => {
    setParLoading(true);
    try {
      const { data } = await api.get('/stats/par');
      setPar(data.data);
    } finally {
      setParLoading(false);
    }
  };

  // ── Impayés ─────────────────────────────────────────────────────────────────
  const [impayes, setImpayes] = useState<any[]>([]);
  const [impayesLoading, setImpayesLoading] = useState(false);

  const loadImpayes = async () => {
    setImpayesLoading(true);
    try {
      const { data } = await api.get('/prets', { params: { statut: 'EN_RETARD', limit: 100 } });
      setImpayes(data.data?.items || []);
    } finally {
      setImpayesLoading(false);
    }
  };

  useEffect(() => { loadJournal(todayStr); loadPar(); loadImpayes(); }, []);

  // ── Computed: journal ────────────────────────────────────────────────────────
  const txMap: Record<string, { type: string; devise: string; montant: number; count: number }> = {};
  (journal?.transactions || []).forEach((t: any) => {
    const key = `${t.type}:${t.devise}`;
    txMap[key] = { type: t.type, devise: t.devise, montant: Number(t._sum?.montant || 0), count: Number(t._count?.id || 0) };
  });
  const txRows = Object.values(txMap).sort((a, b) => b.montant - a.montant);
  const totalDepots   = txRows.filter(r => r.type === 'DEPOT').reduce((s, r) => s + r.montant, 0);
  const totalRetraits = txRows.filter(r => r.type === 'RETRAIT').reduce((s, r) => s + r.montant, 0);
  const totalVirements = txRows.filter(r => r.type === 'VIREMENT_DEBIT').reduce((s, r) => s + r.montant, 0);
  const totalOps = txRows.reduce((s, r) => s + r.count, 0);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'journalier', label: 'Activité journalière', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'par', label: 'Portefeuille à Risque', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'impayes', label: 'État des impayés', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Rapports</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Analyses opérationnelles et indicateurs de risque</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#f0f2f9' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1 justify-center transition-all"
            style={tab === t.id
              ? { background: 'white', color: '#1e40af', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: '#4a5578' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0">
              <path d={t.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: Activité journalière ──────────────────────────────────────────── */}
      {tab === 'journalier' && (
        <div className="space-y-5">
          {/* Date picker */}
          <div className="card p-5 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-semibold" style={{ color: '#0b1733' }}>Date</label>
              <input
                type="date"
                value={date}
                max={todayStr}
                onChange={(e) => { setDate(e.target.value); loadJournal(e.target.value); }}
                className="input"
                style={{ width: '180px' }}
              />
            </div>
            <button
              onClick={() => loadJournal(date)}
              disabled={journalLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              {journalLoading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
              Actualiser
            </button>
            {journal && (
              <button
                onClick={() => printJournal(date, journal, txRows, totalDepots, totalRetraits, totalOps)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: '#f0f2f9', color: '#4a5578' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Imprimer
              </button>
            )}
          </div>

          {journalLoading && (
            <div className="card p-10 flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              <span className="text-sm" style={{ color: '#4a5578' }}>Chargement...</span>
            </div>
          )}

          {!journalLoading && journal && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total dépôts (HTG)', value: formatMontant(totalDepots, 'HTG'), color: '#047857', bg: '#ecfdf5' },
                  { label: 'Total retraits (HTG)', value: formatMontant(totalRetraits, 'HTG'), color: '#b91c1c', bg: '#fef2f2' },
                  { label: 'Virements (HTG)', value: formatMontant(totalVirements, 'HTG'), color: '#1e40af', bg: '#eef2ff' },
                  { label: 'Total opérations', value: String(totalOps), color: '#0b1733', bg: '#f7f8fc' },
                ].map((kpi) => (
                  <div key={kpi.label} className="card p-4" style={{ borderLeft: `3px solid ${kpi.color}` }}>
                    <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>{kpi.label}</p>
                    <p className="text-xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Activité : nouveaux */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Nouveaux clients', value: journal.nouveauxClients, icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z' },
                  { label: 'Nouveaux comptes', value: journal.nouveauxComptes, icon: 'M20 12V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-2M22 12h-6a2 2 0 100 4h6v-4z' },
                  { label: 'Nouvelles demandes prêt', value: journal.nouveauxPrets, icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
                ].map((item) => (
                  <div key={item.label} className="card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eef2ff' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#2563eb' }}>
                        <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#8b94b0' }}>{item.label}</p>
                      <p className="text-2xl font-bold" style={{ color: '#0b1733' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Détail par type */}
              <div className="card overflow-hidden">
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f2f9' }}>
                  <h3 className="font-bold" style={{ color: '#0b1733' }}>Détail par type d'opération</h3>
                </div>
                {txRows.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm" style={{ color: '#8b94b0' }}>Aucune opération ce jour</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#f7f8fc' }}>
                        {['Type', 'Devise', 'Opérations', 'Montant total'].map((h, i) => (
                          <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 2 ? 'text-right' : 'text-left'}`} style={{ color: '#8b94b0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txRows.map((row, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #f0f2f9' }}>
                          <td className="px-5 py-3">
                            <span className="text-sm font-medium" style={{ color: TYPE_TX_COLORS[row.type] || '#0b1733' }}>
                              {TYPE_TRANSACTION_LABELS[row.type] || row.type}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="chip chip-neutral">{row.devise}</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="font-semibold text-sm" style={{ color: '#0b1733' }}>{row.count}</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="font-bold text-sm" style={{ color: TYPE_TX_COLORS[row.type] || '#0b1733' }}>
                              {formatMontant(row.montant, row.devise)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: PAR ──────────────────────────────────────────────────────────── */}
      {tab === 'par' && (
        <div className="space-y-5">
          {parLoading && (
            <div className="card p-10 flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              <span className="text-sm" style={{ color: '#4a5578' }}>Calcul en cours...</span>
            </div>
          )}

          {!parLoading && par && (
            <>
              <div className="flex justify-end mb-1">
                <button onClick={() => printPAR(par)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium" style={{ background: '#f0f2f9', color: '#4a5578' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Imprimer
                </button>
              </div>
              {/* Encours total */}
              <div className="card overflow-hidden">
                <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Encours total de crédit</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: 'white' }}>{formatMontant(par.encoursTotalCredit, 'HTG')}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Base de calcul des ratios PAR</p>
                </div>
              </div>

              {/* PAR cards */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'PAR 30', sub: 'Prêts en retard > 30 jours', data: par.par30, color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
                  { label: 'PAR 90', sub: 'Prêts en retard > 90 jours', data: par.par90, color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5' },
                ].map((item) => (
                  <div key={item.label} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#0b1733' }}>{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{item.sub}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: item.bg, color: item.color, border: `1px solid ${item.border}` }}>
                        {item.data.ratio.toFixed(2)}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: '#f0f2f9' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, item.data.ratio)}%`, background: item.color }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl" style={{ background: '#f7f8fc' }}>
                        <p className="text-xs" style={{ color: '#8b94b0' }}>Montant à risque</p>
                        <p className="font-bold mt-0.5 text-sm" style={{ color: item.color }}>{formatMontant(item.data.montant, 'HTG')}</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: '#f7f8fc' }}>
                        <p className="text-xs" style={{ color: '#8b94b0' }}>Dossiers concernés</p>
                        <p className="font-bold mt-0.5 text-sm" style={{ color: '#0b1733' }}>{item.data.count} prêt(s)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicateur de santé */}
              <div className="card p-5">
                <h3 className="font-bold mb-3" style={{ color: '#0b1733' }}>Interprétation</h3>
                <div className="space-y-2">
                  {[
                    { seuil: '< 5%', label: 'Portefeuille sain', color: '#047857', bg: '#ecfdf5' },
                    { seuil: '5% – 10%', label: 'Attention requise', color: '#b45309', bg: '#fffbeb' },
                    { seuil: '> 10%', label: 'Portefeuille à risque élevé', color: '#b91c1c', bg: '#fef2f2' },
                  ].map((guide) => {
                    const parRatio = par.par30?.ratio || 0;
                    const active = guide.seuil === '< 5%' ? parRatio < 5 : guide.seuil === '5% – 10%' ? parRatio >= 5 && parRatio <= 10 : parRatio > 10;
                    return (
                      <div key={guide.seuil} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: active ? guide.bg : 'transparent', border: active ? `1px solid ${guide.color}30` : '1px solid transparent' }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: guide.color }} />
                        <span className="text-sm font-semibold" style={{ color: active ? guide.color : '#8b94b0' }}>{guide.seuil}</span>
                        <span className="text-sm" style={{ color: active ? guide.color : '#8b94b0' }}>{guide.label}</span>
                        {active && <span className="ml-auto text-xs font-bold" style={{ color: guide.color }}>← Votre situation</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: État des impayés ─────────────────────────────────────────────── */}
      {tab === 'impayes' && (
        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f2f9' }}>
              <div>
                <h3 className="font-bold" style={{ color: '#0b1733' }}>Prêts en retard</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
                  {impayesLoading ? 'Chargement...' : `${impayes.length} dossier(s) en retard de paiement`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {impayes.length > 0 && (
                  <button onClick={() => printImpayes(impayes)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#f0f2f9', color: '#4a5578' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Imprimer
                  </button>
                )}
              <button
                onClick={loadImpayes}
                disabled={impayesLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: '#f0f2f9', color: '#4a5578' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Actualiser
              </button>
              </div>
            </div>

            {impayesLoading ? (
              <div className="px-5 py-10 flex items-center justify-center gap-3">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                <span className="text-sm" style={{ color: '#4a5578' }}>Chargement...</span>
              </div>
            ) : impayes.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#ecfdf5' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" style={{ color: '#047857' }}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="font-semibold" style={{ color: '#0b1733' }}>Aucun impayé</p>
                <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Tous les prêts actifs sont à jour</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#f7f8fc' }}>
                      {['Référence', 'Client', 'Agence', 'Montant initial', 'Reste à régler', 'Date décaissement', 'Actions'].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 3 && i <= 4 ? 'text-right' : 'text-left'}`} style={{ color: '#8b94b0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {impayes.map((pret: any) => (
                      <tr key={pret.id} style={{ borderTop: '1px solid #f0f2f9' }}>
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm font-semibold" style={{ color: '#1e40af' }}>{pret.reference}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium" style={{ color: '#0b1733' }}>{nomClient(pret.client)}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{pret.client?.numeroClient}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm" style={{ color: '#4a5578' }}>{pret.agence?.code || '—'}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-semibold text-sm" style={{ color: '#0b1733' }}>{formatMontant(pret.montant, pret.devise)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-bold text-sm" style={{ color: '#b91c1c' }}>{formatMontant(pret.resteARegler, pret.devise)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm" style={{ color: '#4a5578' }}>{pret.dateDecaissement ? formatDate(pret.dateDecaissement) : '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/prets/${pret.id}`} className="text-xs font-semibold" style={{ color: '#2563eb' }}>Voir dossier →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Total impayés */}
          {impayes.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Total des créances en retard</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Somme des restants à régler de tous les prêts EN_RETARD</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: '#b91c1c' }}>
                    {formatMontant(impayes.reduce((s: number, p: any) => s + Number(p.resteARegler), 0), 'HTG')}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{impayes.length} dossier(s)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
