'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePretStore } from '@/stores/pretStore';
import { formatMontant, formatDate, nomClient, STATUT_PRET_LABELS } from '@/lib/utils';
import PretForm from '@/components/prets/PretForm';

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
  EN_ATTENTE: '#f59e0b',
  APPROUVE:   '#2563eb',
  DECAISSE:   '#2563eb',
  EN_COURS:   '#10b981',
  EN_RETARD:  '#ef4444',
  SOLDE:      '#8b94b0',
  REJETE:     '#ef4444',
  ANNULE:     '#8b94b0',
};

export default function PretsPage() {
  const { prets, total, pages, isLoading, fetchPrets } = usePretStore();
  const [filters, setFilters] = useState({ statut: '' });
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const load = () => fetchPrets({ ...filters, page });
  useEffect(() => { load(); }, [filters, page]);

  const enAttente = prets.filter(p => p.statut === 'EN_ATTENTE').length;
  const enRetard  = prets.filter(p => p.statut === 'EN_RETARD').length;
  const encours   = prets.filter(p => p.statut === 'EN_COURS').length;
  const totalEncours = prets.filter(p => ['EN_COURS','EN_RETARD'].includes(p.statut)).reduce((s, p) => s + Number(p.resteARegler), 0);

  return (
    <div className="space-y-5 animate-slide-up">

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-blue p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total dossiers</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#0b1733' }}>{total}</p>
        </div>
        <div className="card card-amber p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>En attente</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: enAttente > 0 ? '#b45309' : '#0b1733' }}>{enAttente}</p>
        </div>
        <div className="card card-green p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>En cours</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#047857' }}>{encours}</p>
        </div>
        <div className="card card-red p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>En retard</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: enRetard > 0 ? '#b91c1c' : '#0b1733' }}>{enRetard}</p>
        </div>
      </div>

      {enRetard > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: '#991b1b' }}>{enRetard} prêt{enRetard > 1 ? 's' : ''} en retard de paiement</p>
            <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>Consultez les dossiers concernés et contactez les emprunteurs.</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: '#8b94b0' }}>Filtrer</p>
          <select value={filters.statut} onChange={(e) => { setFilters({ statut: e.target.value }); setPage(1); }} className="input max-w-[200px]">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="APPROUVE">Approuvés</option>
            <option value="EN_COURS">En cours</option>
            <option value="EN_RETARD">En retard</option>
            <option value="SOLDE">Soldés</option>
          </select>
          <p className="text-sm ml-auto" style={{ color: '#8b94b0' }}><span className="font-semibold" style={{ color: '#0b1733' }}>{total}</span> dossier{total > 1 ? 's' : ''}</p>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            Nouveau dossier
          </button>
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
            <p className="text-sm mt-3" style={{ color: '#8b94b0' }}>Chargement des dossiers...</p>
          </div>
        ) : prets.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f0f2f9' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: '#8b94b0' }}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucun dossier de prêt</p>
            <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Créez le premier dossier de crédit.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-5">+ Nouveau dossier</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f7f8fc' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Référence</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Client</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Montant</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Taux / Durée</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Restant</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Demande</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {prets.map((pret) => (
                <tr key={pret.id} className="transition-colors" style={{ borderTop: '1px solid #f0f2f9' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-semibold" style={{ color: '#4a5578' }}>{pret.reference}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium" style={{ color: '#0b1733' }}>{pret.client ? nomClient(pret.client) : '—'}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{formatMontant(pret.montant, pret.devise)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm" style={{ color: '#4a5578' }}>{(Number(pret.tauxMensuel) * 100).toFixed(2)}% · {pret.dureeMois} mois</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-semibold text-sm" style={{ color: Number(pret.resteARegler) > 0 ? '#b45309' : '#047857' }}>
                      {formatMontant(pret.resteARegler, pret.devise)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs" style={{ color: '#8b94b0' }}>{formatDate(pret.dateDemande)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={STATUT_CHIP[pret.statut] || 'chip chip-neutral'}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUT_DOT[pret.statut] || '#8b94b0' }}></span>
                      {STATUT_PRET_LABELS[pret.statut]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/prets/${pret.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={{ background: '#eef2ff', color: '#1e40af' }}>
                      Détail →
                    </Link>
                  </td>
                </tr>
              ))}
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

      {showForm && <PretForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); load(); }} />}
    </div>
  );
}
