'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDatetime, formatMontant } from '@/lib/utils';

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  SEUIL_DECLARE:       { label: 'Seuil déclarable', color: '#b91c1c', bg: '#fef2f2', icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
  STRUCTURATION:       { label: 'Structuration',     color: '#92400e', bg: '#fffbeb', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  MANDATAIRE_BLACKLIST:{ label: 'Mandataire blacklisté', color: '#6d28d9', bg: '#f5f3ff', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  VELOCITE_ELEVEE:     { label: 'Vélocité élevée',   color: '#0e7490', bg: '#ecfeff', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
};

interface Alerte {
  id: string;
  type: string;
  compteId: string | null;
  clientId: string | null;
  montantTotal: number | null;
  details: string;
  statut: string;
  traitePar: string | null;
  traiteAt: string | null;
  createdAt: string;
}

export default function AMLPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [traitant, setTraitant] = useState<string | null>(null);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);
  const pages = Math.ceil(total / 50) || 1;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (filtreStatut) params.set('statut', filtreStatut);
      const { data } = await api.get(`/aml?${params}`);
      setAlertes(data.data.alertes);
      setTotal(data.data.total);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filtreStatut]);

  const handleTraiter = async (id: string) => {
    setTraitant(id);
    try {
      await api.patch(`/aml/${id}/traiter`);
      await load();
    } catch { /* ignore */ }
    setTraitant(null);
  };

  const nbNouvelles = alertes.filter((a) => a.statut === 'NOUVELLE').length;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total alertes', value: total, color: '#1e40af', bg: '#eef2ff' },
          { label: 'Non traitées', value: alertes.filter((a) => a.statut === 'NOUVELLE').length, color: '#b91c1c', bg: '#fef2f2' },
          { label: 'Traitées', value: alertes.filter((a) => a.statut === 'TRAITEE').length, color: '#047857', bg: '#ecfdf5' },
          { label: 'Seuil déclarable', value: alertes.filter((a) => a.type === 'SEUIL_DECLARE').length, color: '#92400e', bg: '#fffbeb' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8b94b0' }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
        <select
          value={filtreStatut}
          onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
          className="input"
          style={{ width: 200 }}
        >
          <option value="">Tous les statuts</option>
          <option value="NOUVELLE">Non traitées</option>
          <option value="TRAITEE">Traitées</option>
        </select>
        <button onClick={load} className="btn-ghost flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Actualiser
        </button>
        {nbNouvelles > 0 && (
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            {nbNouvelles} alerte(s) à traiter
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        ) : alertes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#ecfdf5' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#047857' }}>
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucune alerte AML</p>
            <p className="text-sm" style={{ color: '#8b94b0' }}>Aucune transaction suspecte détectée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f2f9', background: '#f7f8fc' }}>
                {['Date', 'Type', 'Montant', 'Détails', 'Statut', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alertes.map((a) => {
                const meta = TYPE_META[a.type] || { label: a.type, color: '#4a5578', bg: '#f7f8fc', icon: '' };
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f7f8fc' }}>
                    <td className="px-4 py-3 text-xs" style={{ color: '#4a5578', whiteSpace: 'nowrap' }}>{formatDatetime(a.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit" style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0">
                            <path d={meta.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: '#0b1733' }}>
                      {a.montantTotal ? formatMontant(a.montantTotal, 'HTG') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs" style={{ color: '#4a5578' }}>
                      <span className="line-clamp-2" title={a.details}>{a.details}</span>
                    </td>
                    <td className="px-4 py-3">
                      {a.statut === 'NOUVELLE' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef2f2', color: '#b91c1c' }}>Non traitée</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#ecfdf5', color: '#047857' }}>Traitée</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.statut === 'NOUVELLE' && (
                        <button
                          onClick={() => handleTraiter(a.id)}
                          disabled={traitant === a.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                          style={{ background: '#ecfdf5', color: '#047857' }}
                        >
                          {traitant === a.id ? 'En cours...' : 'Marquer traitée'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: '#8b94b0' }}>{total} alerte(s)</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost disabled:opacity-40">← Précédent</button>
            <span className="px-3 py-1.5 text-sm font-medium rounded-lg" style={{ background: '#eef2ff', color: '#1e40af' }}>Page {page}/{pages}</span>
            <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="btn-ghost disabled:opacity-40">Suivant →</button>
          </div>
        </div>
      )}
    </div>
  );
}
