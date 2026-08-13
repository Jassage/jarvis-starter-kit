'use client';

import { useEffect, useState, useCallback } from 'react';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { activityLogApi } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

const ACTION_LABELS: Record<string, string> = { CREATE: 'Création', UPDATE: 'Modification', DELETE: 'Suppression' };
const ACTION_TONE: Record<string, 'success' | 'warning' | 'danger'> = { CREATE: 'success', UPDATE: 'warning', DELETE: 'danger' };

interface ActivityLog {
  id: string;
  adminNom: string;
  action: string;
  entite: string;
  entiteId: string | null;
  chemin: string;
  createdAt: string;
}

export default function JournalActivitePage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [entites, setEntites] = useState<string[]>([]);
  const [filtre, setFiltre] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await activityLogApi.list({ entite: filtre || undefined, page, limit: 30 });
      setLogs(data.data.logs);
      setTotalPages(data.data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [filtre, page]);

  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { activityLogApi.listEntites().then(({ data }) => setEntites(data.data.entites)); }, []);
  useEffect(() => { setPage(1); }, [filtre]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Journal d&apos;activité</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Chaque action admin (création, modification, suppression) réussie, capturée automatiquement.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setFiltre('')} className={filtre === '' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '0.4rem 0.9rem' }}>Tout</button>
          {entites.map((e) => (
            <button key={e} onClick={() => setFiltre(e)} className={filtre === e ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '0.4rem 0.9rem' }}>
              {e}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : logs.length === 0 ? (
          <EmptyState icon={History} title="Aucune activité" hint="Les actions admin apparaîtront ici" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-shell">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Chemin</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="whitespace-nowrap">{new Date(l.createdAt).toLocaleString('fr-FR')}</td>
                      <td>{l.adminNom}</td>
                      <td><Badge tone={ACTION_TONE[l.action] ?? 'neutral'}>{ACTION_LABELS[l.action] ?? l.action}</Badge></td>
                      <td className="font-semibold">{l.entite}</td>
                      <td className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{l.chemin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Page {page} / {totalPages}</span>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
