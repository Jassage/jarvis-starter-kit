'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  ADMIN: { label: 'Admin', color: 'bg-orange-100 text-orange-700' },
  AGENCY: { label: 'Agence', color: 'bg-purple-100 text-purple-700' },
  AGENT: { label: 'Agent', color: 'bg-blue-100 text-blue-700' },
  OWNER: { label: 'Propriétaire', color: 'bg-green-100 text-green-700' },
  INDIVIDUAL: { label: 'Particulier', color: 'bg-gray-100 text-gray-700' },
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, role],
    queryFn: () => adminApi.getUsers({ page, limit: 20, q: search || undefined, role: role || undefined }).then(r => r.data),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.toggleUserActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, newRole }: { id: string; newRole: string }) =>
      adminApi.changeUserRole(id, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const users = data?.data?.users || [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Utilisateurs</h1>
        <span className="text-sm text-gray-500">{pagination?.total ?? 0} au total</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Nom, email..."
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm w-48 focus:outline-none focus:border-primary"
        />
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary"
        >
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun utilisateur trouvé.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Inscription</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                role: string;
                isActive: boolean;
                isVerified: boolean;
                createdAt: string;
                _count: { listings: number };
              }) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => {
                        if (confirm(`Changer le rôle de ${user.firstName} vers ${e.target.value} ?`)) {
                          changeRoleMutation.mutate({ id: user.id, newRole: e.target.value });
                        }
                      }}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${ROLE_CONFIG[user.role]?.color}`}
                    >
                      {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    {format(new Date(user.createdAt), 'd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">{user.isActive ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const action = user.isActive ? 'désactiver' : 'activer';
                        if (confirm(`Voulez-vous ${action} ${user.firstName} ?`)) {
                          toggleActiveMutation.mutate({ id: user.id, isActive: !user.isActive });
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {user.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} / {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Précédent
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
