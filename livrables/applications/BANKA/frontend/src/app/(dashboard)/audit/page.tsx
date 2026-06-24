'use client';
import { useEffect, useState } from 'react';
import { useAuditStore } from '@/stores/auditStore';
import { formatDatetime } from '@/lib/utils';

const ACTION_META: Record<string, { label: string; color: string; bg: string }> = {
  CREATE:   { label: 'Création',    color: '#047857', bg: '#ecfdf5' },
  UPDATE:   { label: 'Modification', color: '#1e40af', bg: '#eef2ff' },
  DELETE:   { label: 'Suppression', color: '#b91c1c', bg: '#fef2f2' },
  DEPOT:    { label: 'Dépôt',       color: '#047857', bg: '#ecfdf5' },
  RETRAIT:  { label: 'Retrait',     color: '#b91c1c', bg: '#fef2f2' },
  VIREMENT: { label: 'Virement',    color: '#1e40af', bg: '#eef2ff' },
  VALIDATION: { label: 'Validation', color: '#0e7490', bg: '#ecfeff' },
  REJET:    { label: 'Rejet',       color: '#92400e', bg: '#fffbeb' },
  LOGIN:    { label: 'Connexion',   color: '#6d28d9', bg: '#f5f3ff' },
  LOGOUT:   { label: 'Déconnexion', color: '#4a5578', bg: '#f7f8fc' },
};

const TABLE_LABELS: Record<string, string> = {
  Transaction: 'Transaction',
  Compte: 'Compte',
  Client: 'Client',
  Pret: 'Prêt',
  Utilisateur: 'Utilisateur',
  Caisse: 'Caisse',
  Agence: 'Agence',
};

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  SUPER_ADMIN:  { color: '#6d28d9', bg: '#f5f3ff' },
  DIRECTEUR:    { color: '#1e40af', bg: '#eef2ff' },
  SUPERVISEUR:  { color: '#0e7490', bg: '#ecfeff' },
  CAISSIER:     { color: '#047857', bg: '#ecfdf5' },
  AGENT_CREDIT: { color: '#b45309', bg: '#fffbeb' },
  COMPTABLE:    { color: '#4a5578', bg: '#f7f8fc' },
  AUDITEUR:     { color: '#1e40af', bg: '#eef2ff' },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action] || { label: action, color: '#4a5578', bg: '#f7f8fc' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_COLORS[role] || { color: '#4a5578', bg: '#f7f8fc' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: meta.bg, color: meta.color }}>
      {role}
    </span>
  );
}

function JsonDiff({ ancien, nouveau }: { ancien: any; nouveau: any }) {
  if (!ancien && !nouveau) return null;
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs flex items-center gap-1 transition-colors"
        style={{ color: '#2563eb' }}
      >
        <svg viewBox="0 0 24 24" fill="none" className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}>
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {open ? 'Masquer le détail' : 'Voir le détail'}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ancien && (
            <div className="p-3 rounded-xl text-xs font-mono whitespace-pre-wrap break-all" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#7f1d1d', maxHeight: '150px', overflowY: 'auto' }}>
              <p className="font-bold mb-1 non-mono font-sans text-red-600">Avant</p>
              {JSON.stringify(ancien, null, 2)}
            </div>
          )}
          {nouveau && (
            <div className="p-3 rounded-xl text-xs font-mono whitespace-pre-wrap break-all" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', maxHeight: '150px', overflowY: 'auto' }}>
              <p className="font-bold mb-1 non-mono font-sans text-green-700">Après</p>
              {JSON.stringify(nouveau, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  const { logs, total, pages, isLoading, fetchLogs } = useAuditStore();
  const [filters, setFilters] = useState({ table: '', action: '' });
  const [page, setPage] = useState(1);

  const load = () => fetchLogs({ ...filters, page });
  useEffect(() => { load(); }, [filters, page]);

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Journal d'audit</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Traçabilité complète de toutes les opérations effectuées sur le système</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#92400e' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-semibold" style={{ color: '#92400e' }}>Accès restreint · Lecture seule</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card card-blue p-4">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8b94b0' }}>Total opérations</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>{total.toLocaleString()}</p>
        </div>
        <div className="card card-green p-4">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8b94b0' }}>Opérations financières</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>
            {logs.filter(l => ['DEPOT', 'RETRAIT', 'VIREMENT', 'VALIDATION'].includes(l.action)).length}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>sur cette page</p>
        </div>
        <div className="card card-amber p-4">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8b94b0' }}>Opérateurs actifs</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>
            {new Set(logs.filter(l => l.utilisateur).map(l => l.utilisateur!.id)).size}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>sur cette page</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: '#8b94b0' }}>Filtres</p>
          <select value={filters.table} onChange={(e) => { setFilters({ ...filters, table: e.target.value }); setPage(1); }} className="input max-w-[200px]">
            <option value="">Toutes les tables</option>
            {Object.entries(TABLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={filters.action} onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }} className="input max-w-[200px]">
            <option value="">Toutes les actions</option>
            {Object.entries(ACTION_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
          </select>
          <p className="text-sm ml-auto" style={{ color: '#8b94b0' }}>
            <span className="font-semibold" style={{ color: '#0b1733' }}>{total.toLocaleString()}</span> entrée{total > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <svg className="animate-spin w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p className="text-sm mt-3" style={{ color: '#8b94b0' }}>Chargement du journal...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#eef2ff' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#2563eb' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucune entrée d'audit</p>
            <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Les opérations effectuées sur le système apparaîtront ici.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[52px] top-0 bottom-0 w-px" style={{ background: '#e7eaf3' }} />

            <div className="divide-y" style={{ borderColor: '#f0f2f9' }}>
              {logs.map((entry) => {
                const meta = ACTION_META[entry.action] || { label: entry.action, color: '#4a5578', bg: '#f7f8fc' };
                const tableLabel = TABLE_LABELS[entry.table] || entry.table;
                return (
                  <div key={entry.id} className="px-5 py-4 flex gap-5 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5" style={{ background: meta.bg, color: meta.color }}>
                        {entry.action === 'DEPOT' && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M19 14l-7 7-7-7M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        )}
                        {entry.action === 'RETRAIT' && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M5 10l7-7 7 7M12 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        )}
                        {(entry.action === 'VALIDATION' || entry.action === 'CREATE') && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                        {entry.action === 'REJET' && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        )}
                        {entry.action === 'UPDATE' && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        )}
                        {entry.action === 'DELETE' && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        )}
                        {!['DEPOT','RETRAIT','VALIDATION','CREATE','REJET','UPDATE','DELETE'].includes(entry.action) && (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8"/></svg>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActionBadge action={entry.action} />
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f0f2f9', color: '#4a5578' }}>{tableLabel}</span>
                          <span className="font-mono text-xs" style={{ color: '#8b94b0' }}>{entry.entiteId.slice(0, 8)}…</span>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: '#8b94b0' }}>{formatDatetime(entry.createdAt)}</span>
                      </div>

                      {/* Opérateur */}
                      {entry.utilisateur && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                            {entry.utilisateur.prenom[0]}{entry.utilisateur.nom[0]}
                          </div>
                          <span className="text-xs font-medium" style={{ color: '#0b1733' }}>{entry.utilisateur.prenom} {entry.utilisateur.nom}</span>
                          <RoleBadge role={entry.utilisateur.role} />
                          {entry.ip && <span className="text-xs font-mono" style={{ color: '#8b94b0' }}>· {entry.ip}</span>}
                        </div>
                      )}

                      <JsonDiff ancien={entry.ancienneValeur} nouveau={entry.nouvelleValeur} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {pages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #f0f2f9' }}>
            <p className="text-sm" style={{ color: '#8b94b0' }}>
              Page <span className="font-semibold" style={{ color: '#0b1733' }}>{page}</span> sur {pages}
            </p>
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
