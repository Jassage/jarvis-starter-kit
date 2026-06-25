'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant } from '@/lib/utils';

interface LigneResultat { numero: string; intitule: string; montant: number; }
interface Resultat {
  produits: LigneResultat[];
  charges: LigneResultat[];
  totalProduits: number;
  totalCharges: number;
  resultatNet: number;
  marge: number;
}

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

function SectionTable({
  items, emptyMsg, amountColor,
}: { items: LigneResultat[]; emptyMsg: string; amountColor: string }) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-xs" style={{ color: '#8b94b0' }}>{emptyMsg}</p>
      </div>
    );
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f7f8fc', borderBottom: '1px solid #eef0f7' }}>
          <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#8b94b0' }}>Numéro</th>
          <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#8b94b0' }}>Intitulé</th>
          <th style={{ padding: '8px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#8b94b0' }}>Montant</th>
        </tr>
      </thead>
      <tbody>
        {items.map((l, idx) => (
          <tr key={l.numero} style={{ borderBottom: idx < items.length - 1 ? '1px solid #f0f2f9' : 'none', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
            <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: '#f0f2f9', color: '#4a5578' }}>{l.numero}</span>
            </td>
            <td style={{ padding: '11px 16px' }}>
              <span className="text-sm" style={{ color: '#4a5578' }}>{l.intitule}</span>
            </td>
            <td style={{ padding: '11px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <span className="text-sm font-bold" style={{ color: amountColor }}>{formatMontant(l.montant, 'HTG')}</span>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ background: '#f7f8fc', borderTop: '2px solid #e4e7f0' }}>
          <td colSpan={2} style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: '#0b1733' }}>Total</td>
          <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 800, color: amountColor }}>
            {formatMontant(items.reduce((s, l) => s + l.montant, 0), 'HTG')}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export default function ResultatPage() {
  const [data, setData]   = useState<Resultat | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom]   = useState(new Date().toISOString().slice(0, 8) + '01');
  const [to, setTo]       = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    setLoading(true);
    try {
      const { data: r } = await api.get(`/compta/resultat?from=${from}&to=${to}`);
      setData(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [from, to]);

  const beneficiaire = (data?.resultatNet ?? 0) >= 0;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Compte de résultat</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Produits, Charges et Résultat net de la période</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold" style={{ color: '#4a5578' }}>Du</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="input text-sm" style={{ width: '145px', padding: '7px 10px' }} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold" style={{ color: '#4a5578' }}>Au</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="input text-sm" style={{ width: '145px', padding: '7px 10px' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-20" style={{ color: '#047857' }}>
          <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Calcul en cours...</span>
        </div>
      ) : data ? (
        <>
          {/* 3 KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#d1fae5' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 w-5 h-5" style={{ color: '#047857' }}>
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total Produits</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#047857' }}>{formatMontant(data.totalProduits, 'HTG')}</p>
            </div>

            <div className="card p-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#fee2e2' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#b91c1c' }}>
                  <path d="M20 12H4M4 12l6 6M4 12l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total Charges</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#b91c1c' }}>{formatMontant(data.totalCharges, 'HTG')}</p>
            </div>

            <div className="card p-5" style={{ borderLeft: `4px solid ${beneficiaire ? '#10b981' : '#ef4444'}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: beneficiaire ? '#d1fae5' : '#fee2e2' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: beneficiaire ? '#047857' : '#b91c1c' }}>
                  {beneficiaire
                    ? <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    : <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>}
                </svg>
              </div>
              <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Résultat net</p>
              <p className="text-2xl font-bold mt-1" style={{ color: beneficiaire ? '#047857' : '#b91c1c' }}>
                {formatMontant(Math.abs(data.resultatNet), 'HTG')}
              </p>
              <p className="text-xs mt-1 font-semibold" style={{ color: beneficiaire ? '#047857' : '#b91c1c' }}>
                {beneficiaire ? 'Bénéfice' : 'Déficit'}
              </p>
            </div>
          </div>

          {/* Taux de marge */}
          {data.totalProduits > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0b1733' }}>Taux de marge nette</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Part du résultat dans les produits</p>
                </div>
                <span className="text-2xl font-bold" style={{ color: beneficiaire ? '#047857' : '#b91c1c' }}>
                  {data.marge.toFixed(1)} %
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#f0f2f9' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.abs(data.marge))}%`, background: beneficiaire ? '#10b981' : '#ef4444' }} />
              </div>
            </div>
          )}

          {/* Tables Produits / Charges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Produits */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: '#d1fae5', borderBottom: '1px solid #6ee7b7' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#047857' }}>
                    <span className="text-xs font-bold text-white">P</span>
                  </div>
                  <p className="font-bold text-sm" style={{ color: '#047857' }}>PRODUITS</p>
                </div>
                <p className="font-bold text-sm" style={{ color: '#047857', whiteSpace: 'nowrap' }}>{formatMontant(data.totalProduits, 'HTG')}</p>
              </div>
              <SectionTable items={data.produits} emptyMsg="Aucun produit sur cette période" amountColor="#047857" />
            </div>

            {/* Charges */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: '#fee2e2', borderBottom: '1px solid #fca5a5' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#b91c1c' }}>
                    <span className="text-xs font-bold text-white">C</span>
                  </div>
                  <p className="font-bold text-sm" style={{ color: '#b91c1c' }}>CHARGES</p>
                </div>
                <p className="font-bold text-sm" style={{ color: '#b91c1c', whiteSpace: 'nowrap' }}>{formatMontant(data.totalCharges, 'HTG')}</p>
              </div>
              <SectionTable items={data.charges} emptyMsg="Aucune charge sur cette période" amountColor="#b91c1c" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
