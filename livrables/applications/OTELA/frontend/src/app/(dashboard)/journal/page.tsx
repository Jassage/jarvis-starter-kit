'use client';
import { useEffect, useMemo, useState } from 'react';
import { Download, ScrollText } from 'lucide-react';
import { useAuditStore, EntreeAudit } from '@/stores/auditStore';
import EmptyState from '@/components/ui/EmptyState';

function ilYa(jours: number) { return new Date(Date.now() - jours * 86400000).toISOString().slice(0, 10); }
const AUJOURDHUI = new Date().toISOString().slice(0, 10);

// Libellés lisibles des actions techniques. Une action inconnue s'affiche telle
// quelle plutôt que de casser (nouvelles actions ajoutées côté backend).
const LABELS: Record<string, string> = {
  CONNEXION_REUSSIE: 'Connexion',
  CONNEXION_ECHOUEE: 'Connexion échouée',
  DECONNEXION: 'Déconnexion',
  EMPLOYE_CREE: 'Employé créé',
  EMPLOYE_MODIFIE: 'Employé modifié',
  MOT_DE_PASSE_REINITIALISE: 'Mot de passe réinitialisé',
  PAIEMENT_ENCAISSE: 'Paiement encaissé',
  RESERVATION_CREEE: 'Réservation créée',
  RESERVATION_ANNULEE: 'Réservation annulée',
  CHECK_IN: 'Check-in',
  CHECK_OUT: 'Check-out',
  ETABLISSEMENT_MODIFIE: 'Établissement modifié',
  LOGO_MODIFIE: 'Logo modifié',
  PHOTO_AJOUTEE: 'Photo ajoutée',
  PHOTO_SUPPRIMEE: 'Photo supprimée',
};

// Les échecs et actions sensibles ressortent en rose, le reste en neutre.
function couleurAction(action: string): string {
  if (action.includes('ECHOUEE') || action.includes('SUPPRIMEE') || action.includes('ANNULEE')) return 'var(--color-rose, #e11d48)';
  if (action.includes('PAIEMENT') || action.includes('CREE') || action.includes('CHECK')) return 'var(--color-primary-2)';
  return 'var(--color-ink-2)';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function versCsv(entrees: EntreeAudit[]): string {
  const entete = ['Date', 'Auteur', 'Rôle', 'Action', 'Entité', 'ID entité', 'IP', 'Détails'];
  const lignes = entrees.map((e) => [
    formatDate(e.createdAt),
    e.employeNom ?? '(anonyme)',
    e.employeRole ?? '',
    LABELS[e.action] ?? e.action,
    e.entite,
    e.entiteId ?? '',
    e.ip ?? '',
    e.details ? JSON.stringify(e.details) : '',
  ]);
  // Échappement CSV : guillemets doublés, chaque cellule entre guillemets.
  return [entete, ...lignes]
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export default function JournalPage() {
  const { entrees, actions, total, isLoading, fetch, fetchActions } = useAuditStore();
  const [action, setAction] = useState('');
  const [periode, setPeriode] = useState(30);

  useEffect(() => { fetchActions(); }, [fetchActions]);
  useEffect(() => {
    fetch({ action: action || undefined, from: ilYa(periode), to: AUJOURDHUI });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, periode]);

  const csvUrl = useMemo(() => {
    if (entrees.length === 0) return null;
    const blob = new Blob(['﻿' + versCsv(entrees)], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }, [entrees]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <select className="input sm:max-w-[220px]" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Toutes les actions</option>
            {actions.map((a) => <option key={a} value={a}>{LABELS[a] ?? a}</option>)}
          </select>
          <select className="input sm:max-w-[180px]" value={periode} onChange={(e) => setPeriode(Number(e.target.value))}>
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
            <option value={365}>12 derniers mois</option>
          </select>
        </div>
        {csvUrl && (
          <a href={csvUrl} download={`journal-audit-${AUJOURDHUI}.csv`} className="btn-secondary inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Exporter CSV
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
      ) : entrees.length === 0 ? (
        <EmptyState icon={ScrollText} title="Aucune entrée" hint="Aucune action journalisée sur cette période." />
      ) : (
        <div className="card overflow-hidden">
          <p className="px-4 pt-4 text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>
            {total} entrée(s){total > entrees.length ? ` — ${entrees.length} affichées (200 plus récentes)` : ''}
          </p>
          <div className="overflow-x-auto">
            <table className="table-shell mt-2">
              <thead>
                <tr>
                  <th>Date</th><th>Auteur</th><th>Action</th><th>Entité</th><th>IP</th>
                </tr>
              </thead>
              <tbody>
                {entrees.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap text-sm">{formatDate(e.createdAt)}</td>
                    <td className="text-sm">
                      <span className="font-medium">{e.employeNom ?? '(anonyme)'}</span>
                      {e.employeRole && <span className="block text-xs" style={{ color: 'var(--color-ink-3)' }}>{e.employeRole}</span>}
                    </td>
                    <td className="text-sm font-semibold" style={{ color: couleurAction(e.action) }}>{LABELS[e.action] ?? e.action}</td>
                    <td className="text-sm">
                      {e.entite}
                      {e.details && <span className="block text-xs truncate max-w-[280px]" style={{ color: 'var(--color-ink-3)' }}>{JSON.stringify(e.details)}</span>}
                    </td>
                    <td className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{e.ip ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
