'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page],
    queryFn: () => adminApi.getAuditLogs({ page, limit: 30 }).then(r => r.data),
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Journal d'audit</h1>
        <span className="text-sm text-gray-500">{pagination?.total ?? 0} entrées</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucune entrée.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Utilisateur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Cible</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: {
                id: string;
                action: string;
                entity: string;
                entityId: string | null;
                ipAddress: string | null;
                createdAt: string;
                user: { firstName: string; lastName: string; email: string } | null;
              }) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{log.entity}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {log.user ? (
                      <>
                        <p className="text-sm text-gray-900">{log.user.firstName} {log.user.lastName}</p>
                        <p className="text-xs text-gray-500">{log.user.email}</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">Système</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {log.entityId && (
                      <span className="font-mono text-xs text-gray-500">{log.entityId.slice(0, 8)}...</span>
                    )}
                    {log.ipAddress && (
                      <p className="text-xs text-gray-400">{log.ipAddress}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'd MMM yyyy HH:mm', { locale: fr })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} / {pagination.pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Précédent</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
