'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant } from '@/lib/utils';

interface LigneBilan { numero: string; intitule: string; solde: number; }
interface Bilan {
  actifs: LigneBilan[];
  passifs: LigneBilan[];
  capitaux: LigneBilan[];
  totalActif: number;
  totalPassif: number;
  totalCapitaux: number;
  equilibre: boolean;
}

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

function SectionTable({
  items, emptyMsg, amountColor,
}: { items: LigneBilan[]; emptyMsg: string; amountColor: string }) {
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
          <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b94b0' }}>Numéro</th>
          <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b94b0' }}>Intitulé</th>
          <th style={{ padding: '8px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b94b0' }}>Solde</th>
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
              <span className="text-sm font-bold" style={{ color: amountColor }}>{formatMontant(l.solde, 'HTG')}</span>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ background: '#f7f8fc', borderTop: '2px solid #e4e7f0' }}>
          <td colSpan={2} style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: '#0b1733' }}>Total</td>
          <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 800, color: amountColor }}>
            {formatMontant(items.reduce((s, l) => s + l.solde, 0), 'HTG')}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export default function BilanPage() {
  const [bilan, setBilan]   = useState<Bilan | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/compta/bilan?date=${date}`);
      setBilan(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [date]);

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Bilan</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Situation patrimoniale à une date donnée</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold" style={{ color: '#4a5578' }}>Au</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="input text-sm" style={{ width: '155px', padding: '7px 10px' }} />
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-20" style={{ color: '#047857' }}>
          <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Calcul du bilan...</span>
        </div>
      ) : bilan ? (
        <>
          {/* Equilibre banner */}
          <div className="card p-4 flex items-center gap-3"
            style={{ borderLeft: `4px solid ${bilan.equilibre ? '#10b981' : '#ef4444'}`, background: bilan.equilibre ? '#f0fdf4' : '#fef2f2' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: bilan.equilibre ? '#d1fae5' : '#fee2e2' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: bilan.equilibre ? '#047857' : '#b91c1c' }}>
                {bilan.equilibre
                  ? <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M12 9v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: bilan.equilibre ? '#047857' : '#b91c1c' }}>
                {bilan.equilibre ? 'Bilan équilibré' : 'Bilan déséquilibré'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: bilan.equilibre ? '#065f46' : '#991b1b' }}>
                {bilan.equilibre
                  ? `Actif = Passif + Capitaux = ${formatMontant(bilan.totalActif, 'HTG')}`
                  : `Actif (${formatMontant(bilan.totalActif, 'HTG')}) ≠ Passif + Capitaux (${formatMontant(bilan.totalPassif + bilan.totalCapitaux, 'HTG')})`}
              </p>
            </div>
          </div>

          {/* 3 KPI */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Actif',    value: bilan.totalActif,    color: '#047857', bg: '#d1fae5' },
              { label: 'Total Passif',   value: bilan.totalPassif,   color: '#1d4ed8', bg: '#dbeafe' },
              { label: 'Capitaux propres', value: bilan.totalCapitaux, color: '#6d28d9', bg: '#ede9fe' },
            ].map((k) => (
              <div key={k.label} className="card p-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: k.bg }}>
                  <span className="font-bold text-sm" style={{ color: k.color }}>{k.label[6]}</span>
                </div>
                <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>{k.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: k.color }}>{formatMontant(k.value, 'HTG')}</p>
              </div>
            ))}
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ACTIF */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: '#d1fae5', borderBottom: '1px solid #6ee7b7' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#047857' }}>
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <p className="font-bold text-sm" style={{ color: '#047857' }}>ACTIF</p>
                </div>
                <p className="font-bold text-sm" style={{ color: '#047857', whiteSpace: 'nowrap' }}>{formatMontant(bilan.totalActif, 'HTG')}</p>
              </div>
              <SectionTable items={bilan.actifs} emptyMsg="Aucun compte actif" amountColor="#047857" />
            </div>

            {/* PASSIF + CAPITAUX */}
            <div className="space-y-4">
              <div className="card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: '#dbeafe', borderBottom: '1px solid #93c5fd' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1d4ed8' }}>
                      <span className="text-xs font-bold text-white">P</span>
                    </div>
                    <p className="font-bold text-sm" style={{ color: '#1d4ed8' }}>PASSIF</p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: '#1d4ed8', whiteSpace: 'nowrap' }}>{formatMontant(bilan.totalPassif, 'HTG')}</p>
                </div>
                <SectionTable items={bilan.passifs} emptyMsg="Aucun compte passif" amountColor="#1d4ed8" />
              </div>

              <div className="card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: '#ede9fe', borderBottom: '1px solid #c4b5fd' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#6d28d9' }}>
                      <span className="text-xs font-bold text-white">C</span>
                    </div>
                    <p className="font-bold text-sm" style={{ color: '#6d28d9' }}>CAPITAUX PROPRES</p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: '#6d28d9', whiteSpace: 'nowrap' }}>{formatMontant(bilan.totalCapitaux, 'HTG')}</p>
                </div>
                <SectionTable items={bilan.capitaux} emptyMsg="Aucun compte capitaux" amountColor="#6d28d9" />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
