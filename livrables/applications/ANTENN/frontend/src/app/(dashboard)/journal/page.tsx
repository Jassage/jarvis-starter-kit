'use client';
import { useCallback, useEffect, useState } from 'react';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuditStore } from '@/stores/auditStore';
import { useToastStore, messageErreur } from '@/stores/toastStore';
import Badge, { BadgeTone } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

// Regroupement visuel : ce qui touche à l'antenne, au commerce, aux comptes. Le ton du
// badge suit l'enjeu, pas l'ordre alphabétique.
const ACTIONS: Record<string, { label: string; tone: BadgeTone }> = {
  CONNEXION: { label: 'Connexion', tone: 'neutral' },
  CRENEAU_CREE: { label: 'Créneau créé', tone: 'info' },
  CRENEAU_MODIFIE: { label: 'Créneau modifié', tone: 'info' },
  CRENEAU_SUPPRIME: { label: 'Créneau supprimé', tone: 'danger' },
  CRENEAU_SYNCHRONISE: { label: 'Grille synchronisée', tone: 'success' },
  SPONSOR_CREE: { label: 'Sponsor créé', tone: 'gold' },
  SPONSOR_MODIFIE: { label: 'Sponsor modifié', tone: 'gold' },
  SPONSOR_SUPPRIME: { label: 'Sponsor supprimé', tone: 'danger' },
  HABILLAGE_CREE: { label: 'Habillage posé', tone: 'violet' },
  HABILLAGE_SUPPRIME: { label: 'Habillage retiré', tone: 'danger' },
  CONFIG_CHAINE_MODIFIEE: { label: 'Identité de chaîne', tone: 'brand' },
  CONTENU_SUPPRIME: { label: 'Contenu supprimé', tone: 'danger' },
  REPLAY_PUBLIE: { label: 'Replay publié', tone: 'success' },
  REPLAY_RETIRE: { label: 'Replay retiré', tone: 'warning' },
  REPLAY_SUPPRIME: { label: 'Replay supprimé', tone: 'danger' },
  UTILISATEUR_CREE: { label: 'Compte créé', tone: 'info' },
  UTILISATEUR_MODIFIE: { label: 'Compte modifié', tone: 'info' },
  UTILISATEUR_MOT_DE_PASSE_REINITIALISE: { label: 'Mot de passe réinitialisé', tone: 'warning' },
  MATCH_DEMARRE: { label: 'Direct démarré', tone: 'live' },
  MATCH_TERMINE: { label: 'Direct terminé', tone: 'neutral' },
};

export default function JournalPage() {
  const { entrees, total, page, isLoading, fetchAudit } = useAuditStore();
  const erreur = useToastStore((s) => s.erreur);
  const [filtre, setFiltre] = useState('');

  const charger = useCallback(
    async (p = 1, action = filtre) => {
      try {
        await fetchAudit({ page: p, action: action || undefined });
      } catch (e) {
        erreur(messageErreur(e, 'Journal indisponible'));
      }
    },
    [fetchAudit, erreur, filtre]
  );

  useEffect(() => {
    charger(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  const pages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
          Journal d&apos;audit
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-3)' }}>
          Trace des actions qui engagent la chaîne vis-à-vis d&apos;un tiers. Lecture seule : aucune entrée ne peut être
          modifiée ni effacée depuis l&apos;application.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="input"
          style={{ width: 'auto', minWidth: 220 }}
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          aria-label="Filtrer par type d'action"
        >
          <option value="">Toutes les actions</option>
          {Object.entries(ACTIONS).map(([cle, a]) => (
            <option key={cle} value={cle}>{a.label}</option>
          ))}
        </select>
        <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
          {total} entrée{total > 1 ? 's' : ''}
        </span>
      </div>

      <div className="card overflow-hidden">
        {entrees.length === 0 ? (
          <EmptyState icon={ScrollText} title={isLoading ? 'Chargement...' : 'Aucune entrée'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Horodatage</th>
                  <th>Action</th>
                  <th>Auteur</th>
                  <th>Détail</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {entrees.map((e) => {
                  const a = ACTIONS[e.action] ?? { label: e.action, tone: 'neutral' as BadgeTone };
                  return (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap tabular-nums">
                        {new Date(e.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td><Badge tone={a.tone}>{a.label}</Badge></td>
                      <td className="whitespace-nowrap">
                        <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{e.utilisateurNom}</span>
                        <br />
                        <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{e.utilisateurEmail}</span>
                      </td>
                      <td>{e.details ?? '—'}</td>
                      <td className="text-xs">{e.adresseIp ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button className="btn btn-secondary py-1.5 px-3" disabled={page <= 1} onClick={() => charger(page - 1)}>
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>
          <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Page {page} / {pages}</span>
          <button className="btn btn-secondary py-1.5 px-3" disabled={page >= pages} onClick={() => charger(page + 1)}>
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
