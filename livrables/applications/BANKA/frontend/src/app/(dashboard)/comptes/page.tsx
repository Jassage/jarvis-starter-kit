'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCompteStore } from '@/stores/compteStore';
import { formatMontant, nomClient, TYPE_COMPTE_LABELS, STATUT_COMPTE_LABELS } from '@/lib/utils';

const TYPE_META: Record<string, { bg: string; color: string; icon: string }> = {
  EPARGNE:      { bg: '#ecfdf5', color: '#047857', icon: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z' },
  COURANT:      { bg: '#eef2ff', color: '#1e40af', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  TERME:        { bg: '#f5f3ff', color: '#6d28d9', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  JOINT:        { bg: '#ecfeff', color: '#0e7490', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z' },
  MICRO_EPARGNE:{ bg: '#f0fdf4', color: '#15803d', icon: 'M12 22V12m0 0C10 9 11 4 12 2m0 10c2-3 1-8 0-10M8 18c-3-2-3-8 0-10M16 18c3-2 3-8 0-10' },
  TONTINE:      { bg: '#fff7ed', color: '#c2410c', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  RETRAITE:     { bg: '#f1f5f9', color: '#334155', icon: 'M12 8v4l3 3M3 12a9 9 0 1018 0 9 9 0 00-18 0z' },
  JEUNESSE:     { bg: '#f0f9ff', color: '#0369a1', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
  CREDIT:       { bg: '#fff1f2', color: '#be123c', icon: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM2 10h20' },
};

const STATUT_CHIP: Record<string, string> = {
  ACTIF:    'chip chip-success',
  SUSPENDU: 'chip chip-warning',
  CLOTURE:  'chip chip-neutral',
};

export default function ComptesPage() {
  const { comptes, total, pages, isLoading, fetchComptes } = useCompteStore();
  const [filters, setFilters] = useState({ type: '', statut: 'ACTIF', devise: '' });
  const [page, setPage] = useState(1);

  useEffect(() => { fetchComptes({ ...filters, page }); }, [filters, page]);

  const totalSoldeHTG = comptes.filter(c => c.devise === 'HTG').reduce((s, c) => s + Number(c.solde), 0);
  const totalSoldeUSD = comptes.filter(c => c.devise === 'USD').reduce((s, c) => s + Number(c.solde), 0);
  const nbActifs = comptes.filter(c => c.statut === 'ACTIF').length;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-blue p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total comptes</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#0b1733' }}>{total}</p>
        </div>
        <div className="card card-green p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Comptes actifs</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#047857' }}>{nbActifs}</p>
        </div>
        <div className="card card-indigo p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Encours HTG</p>
          <p className="text-xl font-bold mt-1 tracking-tight" style={{ color: '#0b1733' }}>{formatMontant(totalSoldeHTG, 'HTG')}</p>
        </div>
        <div className="card card-teal p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Encours USD</p>
          <p className="text-xl font-bold mt-1 tracking-tight" style={{ color: '#0b1733' }}>{formatMontant(totalSoldeUSD, 'USD')}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: '#8b94b0' }}>Filtres</p>
          <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }} className="input max-w-[200px]">
            <option value="">Tous les types</option>
            <option value="EPARGNE">Épargne</option>
            <option value="COURANT">Courant</option>
            <option value="TERME">Terme fixe</option>
            <option value="JOINT">Compte joint</option>
            <option value="MICRO_EPARGNE">Micro-épargne</option>
            <option value="TONTINE">Tontine / Sol</option>
            <option value="RETRAITE">Épargne retraite</option>
            <option value="JEUNESSE">Compte jeunesse</option>
            <option value="CREDIT">Ligne de crédit</option>
          </select>
          <select value={filters.statut} onChange={(e) => { setFilters({ ...filters, statut: e.target.value }); setPage(1); }} className="input max-w-[180px]">
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="SUSPENDU">Suspendus</option>
            <option value="CLOTURE">Clôturés</option>
          </select>
          <select value={filters.devise} onChange={(e) => { setFilters({ ...filters, devise: e.target.value }); setPage(1); }} className="input max-w-[160px]">
            <option value="">Toutes devises</option>
            <option value="HTG">HTG</option>
            <option value="USD">USD</option>
          </select>
          <p className="text-sm ml-auto" style={{ color: '#8b94b0' }}><span className="font-semibold" style={{ color: '#0b1733' }}>{total}</span> compte{total > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <svg className="animate-spin w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p className="text-sm mt-3" style={{ color: '#8b94b0' }}>Chargement des comptes...</p>
          </div>
        ) : comptes.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f0f2f9' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: '#8b94b0' }}>
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucun compte trouvé</p>
            <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Les comptes ouverts via les fiches clients apparaîtront ici.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f7f8fc' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Compte</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Client</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Devise</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Solde</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {comptes.map((compte) => {
                const meta = TYPE_META[compte.type] || TYPE_META.COURANT;
                return (
                  <tr key={compte.id} className="transition-colors" style={{ borderTop: '1px solid #f0f2f9' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg, color: meta.color }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d={meta.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <p className="font-mono text-xs font-semibold" style={{ color: '#0b1733' }}>{compte.numeroCompte}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium" style={{ color: '#0b1733' }}>{compte.client ? nomClient(compte.client as any) : '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: '#4a5578' }}>{TYPE_COMPTE_LABELS[compte.type]}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="chip chip-neutral">{compte.devise}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-sm" style={{ color: Number(compte.solde) < 0 ? '#b91c1c' : '#0b1733' }}>
                        {formatMontant(compte.solde, compte.devise)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={STATUT_CHIP[compte.statut] || 'chip chip-neutral'}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: compte.statut === 'ACTIF' ? '#10b981' : compte.statut === 'SUSPENDU' ? '#f59e0b' : '#8b94b0' }}></span>
                        {STATUT_COMPTE_LABELS[compte.statut]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/comptes/${compte.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={{ background: '#eef2ff', color: '#1e40af' }}>
                        Détail →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    </div>
  );
}
