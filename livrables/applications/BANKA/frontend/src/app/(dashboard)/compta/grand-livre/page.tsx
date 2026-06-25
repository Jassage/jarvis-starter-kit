'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant, formatDate } from '@/lib/utils';

interface LigneGrandLivre {
  date: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
}

interface CompteGL {
  id: string;
  numero: string;
  intitule: string;
  type: string;
  soldeDebit: number;
  soldeCredit: number;
  solde: number;
  lignes: LigneGrandLivre[];
}

interface CompteComptable { id: string; numero: string; intitule: string; type: string; }

const TYPE_META: Record<string, { color: string; bg: string }> = {
  ACTIF:    { color: '#047857', bg: '#d1fae5' },
  PASSIF:   { color: '#1d4ed8', bg: '#dbeafe' },
  CHARGE:   { color: '#b91c1c', bg: '#fee2e2' },
  PRODUIT:  { color: '#065f46', bg: '#d1fae5' },
  CAPITAUX: { color: '#6d28d9', bg: '#ede9fe' },
};

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function GrandLivrePage() {
  const [comptes, setComptes]     = useState<CompteComptable[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [gl, setGl]               = useState<CompteGL | null>(null);
  const [loading, setLoading]     = useState(false);
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    api.get('/compta/plan-comptable').then(({ data }) => setComptes(data.data));
  }, []);

  const loadGL = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ compteId: selectedId });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const { data } = await api.get(`/compta/grand-livre?${params}`);
      setGl(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadGL(); }, [selectedId, from, to]);

  const meta = gl ? (TYPE_META[gl.type] || { color: '#0b1733', bg: '#f0f2f9' }) : null;

  const TH_STYLE: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#94a3c4',
    whiteSpace: 'nowrap' as const,
    background: '#0b1733',
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Grand livre</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Mouvements détaillés par compte comptable</p>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: '250px' }}>
          <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#8b94b0' }}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="input w-full" style={{ paddingLeft: 36 }}>
            <option value="">Sélectionner un compte...</option>
            {comptes.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.intitule}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold" style={{ color: '#4a5578' }}>Du</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input text-sm" style={{ width: '145px', padding: '7px 10px' }} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold" style={{ color: '#4a5578' }}>Au</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input text-sm" style={{ width: '145px', padding: '7px 10px' }} />
        </div>
      </div>

      {!selectedId ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f0f2f9' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#8b94b0' }}>
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 22h16v-5H6.5M4 19.5V4a2 2 0 012-2h14v13H6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Sélectionnez un compte</p>
          <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Choisissez un compte dans la liste pour afficher ses mouvements</p>
        </div>
      ) : loading ? (
        <div className="card flex items-center justify-center gap-2 py-16" style={{ color: '#047857' }}>
          <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
        </div>
      ) : gl ? (
        <>
          {/* Fiche compte */}
          <div className="card p-5">
            <div className="flex items-center gap-4 flex-wrap">
              {meta && (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.bg }}>
                  <span className="font-bold text-lg" style={{ color: meta.color }}>{gl.type[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg" style={{ background: meta?.bg, color: meta?.color }}>{gl.numero}</span>
                  <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{gl.intitule}</p>
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f0f2f9', color: '#8b94b0' }}>{gl.type}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>{gl.lignes.length} mouvement{gl.lignes.length > 1 ? 's' : ''} sur la période</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="text-center px-4 py-2 rounded-xl" style={{ background: '#fee2e2' }}>
                  <p className="text-xs font-medium" style={{ color: '#b91c1c' }}>Total débit</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: '#b91c1c', whiteSpace: 'nowrap' }}>{formatMontant(gl.soldeDebit, 'HTG')}</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl" style={{ background: '#d1fae5' }}>
                  <p className="text-xs font-medium" style={{ color: '#047857' }}>Total crédit</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: '#047857', whiteSpace: 'nowrap' }}>{formatMontant(gl.soldeCredit, 'HTG')}</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl" style={{ background: '#f7f8fc', border: '1px solid #e4e7f0' }}>
                  <p className="text-xs font-medium" style={{ color: '#4a5578' }}>Solde</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: gl.solde >= 0 ? '#0b1733' : '#b91c1c', whiteSpace: 'nowrap' }}>
                    {formatMontant(Math.abs(gl.solde), 'HTG')}
                    <span className="text-xs font-normal ml-1" style={{ color: '#8b94b0' }}>{gl.solde < 0 ? 'Cr' : 'Dr'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table mouvements */}
          <div className="card overflow-hidden">
            {gl.lignes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Aucun mouvement sur cette période</p>
                <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Élargissez la plage de dates</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...TH_STYLE, width: '110px' }}>Date</th>
                      <th style={{ ...TH_STYLE }}>Libellé</th>
                      <th style={{ ...TH_STYLE, textAlign: 'right', width: '150px' }}>Débit</th>
                      <th style={{ ...TH_STYLE, textAlign: 'right', width: '150px' }}>Crédit</th>
                      <th style={{ ...TH_STYLE, textAlign: 'right', width: '160px' }}>Solde cumulé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gl.lignes.map((l, i) => (
                      <tr key={i} style={{
                        borderBottom: '1px solid #f0f2f9',
                        background: i % 2 === 0 ? 'white' : '#fafbfc',
                      }}>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span className="text-xs font-medium" style={{ color: '#4a5578' }}>{formatDate(l.date)}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="text-sm" style={{ color: '#4a5578' }}>{l.libelle}</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {l.debit > 0 ? (
                            <span className="text-sm font-semibold" style={{ color: '#b91c1c' }}>{formatMontant(l.debit, 'HTG')}</span>
                          ) : (
                            <span style={{ color: '#d1d5db' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {l.credit > 0 ? (
                            <span className="text-sm font-semibold" style={{ color: '#047857' }}>{formatMontant(l.credit, 'HTG')}</span>
                          ) : (
                            <span style={{ color: '#d1d5db' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span className="text-sm font-bold px-2.5 py-1 rounded-lg"
                            style={{ background: l.solde >= 0 ? '#f0f2f9' : '#fee2e2', color: l.solde >= 0 ? '#0b1733' : '#b91c1c' }}>
                            {formatMontant(Math.abs(l.solde), 'HTG')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
