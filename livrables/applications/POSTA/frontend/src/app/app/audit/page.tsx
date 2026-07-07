'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AuditLog } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

const ACTION_LABELS: Record<string, string> = {
  CONNEXION: 'Connexion',
  DECONNEXION: 'Déconnexion',
  DOMAINE_CREE: 'Domaine créé',
  DOMAINE_SUPPRIME: 'Domaine supprimé',
  BOITE_MAIL_CREEE: 'Boîte mail créée',
  BOITE_MAIL_MODIFIEE: 'Boîte mail modifiée',
  BOITE_MAIL_SUPPRIMEE: 'Boîte mail supprimée',
  ALIAS_CREE: 'Alias créé',
  ALIAS_MODIFIE: 'Alias modifié',
  ALIAS_SUPPRIME: 'Alias supprimé',
  UTILISATEUR_CREE: 'Compte client créé',
  UTILISATEUR_DESACTIVE: 'Compte client désactivé',
  UTILISATEUR_REACTIVE: 'Compte client réactivé',
};

export default function AuditPage() {
  const router = useRouter();
  const { utilisateur, chargement: chargementAuth } = useAuthStore();
  const [logs, setLogs] = useState<AuditLog[] | null>(null);

  useEffect(() => {
    if (!chargementAuth && utilisateur && utilisateur.role !== 'SUPER_ADMIN') {
      router.replace('/app');
    }
  }, [chargementAuth, utilisateur, router]);

  useEffect(() => {
    if (utilisateur?.role === 'SUPER_ADMIN') {
      api.get('/audit', { params: { take: 100 } }).then(({ data }) => setLogs(data.data.logs));
    }
  }, [utilisateur]);

  if (chargementAuth || utilisateur?.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Journal d&apos;audit</h1>
        <p className="text-sm text-neutral-500">
          Historique des actions effectuées sur la plateforme (100 plus récentes).
        </p>
      </div>

      <div className="overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Détails</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  Aucune activité pour l&apos;instant.
                </td>
              </tr>
            )}
            {logs?.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  {log.user ? `${log.user.prenom} ${log.user.nom}` : <span className="text-neutral-400">—</span>}
                </td>
                <td className="px-4 py-3 font-medium">{ACTION_LABELS[log.action] || log.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                  {log.changes ? JSON.stringify(log.changes) : ''}
                </td>
                <td className="px-4 py-3 text-neutral-400">{log.ipAddress || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
