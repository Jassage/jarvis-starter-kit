'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam', FRAUD: 'Arnaque', INAPPROPRIATE: 'Contenu inapproprié',
  WRONG_INFO: 'Infos incorrectes', DUPLICATE: 'Doublon', OTHER: 'Autre',
};

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page, status],
    queryFn: () => adminApi.getReports({ page, limit: 20, status: status || undefined }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: 'RESOLVED' | 'DISMISSED'; adminNote?: string }) =>
      adminApi.resolveReport(id, status, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  const reports = data?.data?.reports || [];
  const pagination = data?.data?.pagination;

  const handleResolve = (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    const note = prompt(`Note admin (optionnel) :`);
    if (note === null) return;
    resolveMutation.mutate({ id, status, adminNote: note || undefined });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Signalements</h1>
        <span className="text-sm text-gray-500">{pagination?.total ?? 0} au total</span>
      </div>

      <div className="flex gap-2">
        {[
          { val: 'PENDING', label: 'En attente' },
          { val: 'UNDER_REVIEW', label: 'En révision' },
          { val: 'RESOLVED', label: 'Résolus' },
          { val: 'DISMISSED', label: 'Ignorés' },
          { val: '', label: 'Tous' },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => { setStatus(val); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === val ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun signalement.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((report: {
              id: string;
              reason: string;
              description: string | null;
              status: string;
              createdAt: string;
              reporter: { firstName: string; lastName: string };
              listing: { id: string; title: string } | null;
            }) => (
              <div key={report.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        report.status === 'PENDING' ? 'bg-red-100 text-red-700' :
                        report.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                        report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {report.status === 'PENDING' ? 'En attente' :
                         report.status === 'UNDER_REVIEW' ? 'En révision' :
                         report.status === 'RESOLVED' ? 'Résolu' : 'Ignoré'}
                      </span>
                      <span className="text-xs text-gray-500">{REASON_LABELS[report.reason]}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(report.createdAt), 'd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    {report.listing && (
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Annonce : <span className="text-primary">{report.listing.title}</span>
                      </p>
                    )}
                    {report.description && (
                      <p className="text-sm text-gray-600">{report.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Signalé par {report.reporter.firstName} {report.reporter.lastName}
                    </p>
                  </div>
                  {(report.status === 'PENDING' || report.status === 'UNDER_REVIEW') && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleResolve(report.id, 'RESOLVED')}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                      >
                        Résoudre
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'DISMISSED')}
                        className="px-3 py-1.5 bg-gray-400 text-white text-xs font-medium rounded-lg hover:bg-gray-500"
                      >
                        Ignorer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} / {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Précédent</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
