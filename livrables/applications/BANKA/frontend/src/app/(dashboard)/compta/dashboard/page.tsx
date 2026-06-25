'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatMontant } from '@/lib/utils';

interface ComptaDashboard {
  totalActif: number;
  totalPassif: number;
  totalProduits: number;
  totalCharges: number;
  resultatNet: number;
  nbEcrituresMois: number;
  equilibre: boolean;
}

const NAV_COMPTA = [
  { href: '/compta/plan-comptable', label: 'Plan comptable',       desc: 'Nomenclature des comptes',    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',                                                                                              color: '#047857', bg: '#ecfdf5' },
  { href: '/compta/journal',        label: 'Journal des écritures', desc: 'Saisie et consultation',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#1e40af', bg: '#eef2ff' },
  { href: '/compta/grand-livre',    label: 'Grand livre',           desc: 'Mouvements par compte',       icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: '#7c3aed', bg: '#f5f3ff' },
  { href: '/compta/bilan',          label: 'Bilan',                 desc: 'Situation patrimoniale',      icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', color: '#b45309', bg: '#fffbeb' },
  { href: '/compta/resultat',       label: 'Compte de résultat',    desc: 'Produits et charges',         icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#b91c1c', bg: '#fef2f2' },
];

export default function ComptaDashboardPage() {
  const [data, setData] = useState<ComptaDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/compta/dashboard')
      .then(({ data: r }) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const marge = data && data.totalProduits > 0 ? (data.resultatNet / data.totalProduits) * 100 : 0;
  const chargesPct = data && data.totalProduits > 0 ? (data.totalCharges / data.totalProduits) * 100 : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Comptabilité</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Synthèse financière en temps réel</p>
      </div>

      {/* Équilibre banner */}
      {!loading && data && (
        <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: data.equilibre ? '#ecfdf5' : '#fef2f2', border: `1px solid ${data.equilibre ? '#a7f3d0' : '#fecaca'}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: data.equilibre ? '#dcfce7' : '#fee2e2' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: data.equilibre ? '#047857' : '#b91c1c' }}>
              {data.equilibre
                ? <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: data.equilibre ? '#047857' : '#b91c1c' }}>
              {data.equilibre ? 'Comptabilité équilibrée — Actif = Passif + Capitaux' : 'Déséquilibre détecté — vérifiez les écritures'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: data.equilibre ? '#065f46' : '#991b1b' }}>
              {data.equilibre ? `${data.nbEcrituresMois} écriture(s) ce mois` : 'Le bilan n\'est pas équilibré'}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 w-20 rounded" style={{ background: '#f0f2f9' }} />
              <div className="h-7 w-28 rounded mt-3" style={{ background: '#f0f2f9' }} />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Actif',      value: data.totalActif,      color: '#047857', bg: '#ecfdf5', icon: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z' },
              { label: 'Total Passif',     value: data.totalPassif,     color: '#1e40af', bg: '#eef2ff', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
              { label: 'Résultat net',     value: data.resultatNet,     color: data.resultatNet >= 0 ? '#047857' : '#b91c1c', bg: data.resultatNet >= 0 ? '#f0fdf4' : '#fef2f2', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              { label: 'Total Produits',   value: data.totalProduits,   color: '#047857', bg: '#ecfdf5', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Total Charges',    value: data.totalCharges,    color: '#b91c1c', bg: '#fef2f2', icon: 'M20 12H4' },
              { label: 'Écritures ce mois', value: data.nbEcrituresMois, color: '#4a5578', bg: '#f7f8fc', isCount: true, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            ].map((k: any) => (
              <div key={k.label} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>{k.label}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: k.color }}>
                      <path d={k.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: k.color }}>
                  {k.isCount ? k.value.toLocaleString('fr-FR') : formatMontant(k.value, 'HTG')}
                </p>
              </div>
            ))}
          </div>

          {/* Barre Produits / Charges */}
          {data.totalProduits > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Répartition Produits / Charges</p>
                <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: marge >= 0 ? '#ecfdf5' : '#fef2f2', color: marge >= 0 ? '#047857' : '#b91c1c' }}>
                  Marge {marge.toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-0.5 h-4 rounded-lg overflow-hidden mb-3">
                <div style={{ width: `${Math.min(100, chargesPct).toFixed(1)}%`, background: '#fca5a5' }} />
                <div style={{ flex: 1, background: '#6ee7b7' }} />
              </div>
              <div className="flex items-center gap-5 text-xs" style={{ color: '#4a5578' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#fca5a5', display: 'inline-block' }} />
                  Charges {formatMontant(data.totalCharges, 'HTG')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#6ee7b7', display: 'inline-block' }} />
                  Résultat net {formatMontant(data.resultatNet, 'HTG')}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-sm" style={{ color: '#8b94b0' }}>Impossible de charger les données. Vérifiez que le backend est actif.</p>
        </div>
      )}

      {/* Modules */}
      <div>
        <p className="text-sm font-semibold mb-3" style={{ color: '#4a5578' }}>Modules</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {NAV_COMPTA.map((m) => (
            <Link key={m.href} href={m.href} className="card p-4 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" style={{ color: m.color, width: '18px', height: '18px' }}>
                  <path d={m.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{m.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#8b94b0' }}>{m.desc}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#8b94b0' }}>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
