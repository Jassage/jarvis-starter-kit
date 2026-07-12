import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Gift, Clock, Wallet, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { PaiementRetardModal } from '../../components/tontine/PaiementRetardModal';
import {
  ecouterCycle,
  ecouterParticipants,
  ecouterPaiements,
  saisirPaiementTontine,
  marquerTourRecu,
  cloturerCycle,
} from '../../services/tontine.service';
import { ecouterMembres } from '../../services/membres.service';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatMontant } from '../../lib/format';
import type { CycleTontine, Membre, ParticipantTontine, PaiementTontine } from '../../types';

export function TontineCycleDetail() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const navigate = useNavigate();
  const { profil } = useAuth();
  const [cycle, setCycle] = useState<CycleTontine | null | undefined>(undefined);
  const [participants, setParticipants] = useState<ParticipantTontine[]>([]);
  const [paiements, setPaiements] = useState<PaiementTontine[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [retardCible, setRetardCible] = useState<ParticipantTontine | null>(null);

  useEffect(() => {
    if (!cycleId) return;
    return ecouterCycle(cycleId, setCycle);
  }, [cycleId]);
  useEffect(() => {
    if (!cycleId) return;
    return ecouterParticipants(cycleId, setParticipants);
  }, [cycleId]);
  useEffect(() => {
    if (!cycleId) return;
    return ecouterPaiements(cycleId, setPaiements);
  }, [cycleId]);
  useEffect(() => ecouterMembres(setMembres), []);

  const nomMembre = (id: string) => membres.find((m) => m.id === id)?.nom ?? '—';

  const tourEnCours = useMemo(
    () => [...participants].sort((a, b) => a.position - b.position).find((p) => !p.aRecuSonTour),
    [participants]
  );

  const paiementsTourEnCours = useMemo(
    () => (tourEnCours ? paiements.filter((p) => p.periode === tourEnCours.position) : []),
    [paiements, tourEnCours]
  );

  const cagnotteAttendue = cycle ? cycle.montantCotisation * participants.length : 0;
  const cagnotteCollectee = paiementsTourEnCours.reduce((sum, p) => sum + p.montant, 0);
  const joursRestants = tourEnCours
    ? Math.max(
        0,
        Math.ceil((new Date(tourEnCours.dateReceptionPrevue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;

  function paiementDe(memberId: string) {
    return paiementsTourEnCours.find((p) => p.memberId === memberId);
  }

  async function marquerPaye(memberId: string) {
    if (!profil || !cycle || !tourEnCours) return;
    await saisirPaiementTontine({
      cycleId: cycle.id,
      periode: tourEnCours.position,
      memberId,
      montant: cycle.montantCotisation,
      date: new Date().toISOString().slice(0, 10),
      statut: 'paye',
      saisiPar: profil.id,
    });
  }

  async function recevoirCagnotte() {
    if (!tourEnCours) return;
    await marquerTourRecu(tourEnCours.id, new Date().toISOString().slice(0, 10));
  }

  if (cycle === undefined) return <p className="text-[var(--color-muted)]">Chargement…</p>;
  if (cycle === null) return <EmptyState title="Cycle introuvable" />;

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/tontine')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Retour aux cycles
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">{cycle.nom}</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Début le {formatDate(cycle.dateDebut)} · {formatMontant(cycle.montantCotisation)} / membre / tour
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={cycle.statut === 'en_cours' ? 'success' : 'neutral'}>
            {cycle.statut === 'en_cours' ? 'En cours' : 'Clos'}
          </Badge>
          {profil?.role === 'responsable_finances' && cycle.statut === 'en_cours' && !tourEnCours && (
            <button
              onClick={() => cloturerCycle(cycle.id)}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg)]"
            >
              Clôturer le cycle
            </button>
          )}
        </div>
      </div>

      {tourEnCours && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<Wallet size={18} />} theme="gold" label="Cagnotte du tour" value={formatMontant(cagnotteAttendue)} />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            theme="brand"
            label="Collecté"
            value={formatMontant(cagnotteCollectee)}
            sub={`sur ${formatMontant(cagnotteAttendue)} attendu`}
          />
          <StatCard icon={<Gift size={18} />} theme="violet" label="Prochain bénéficiaire" value={nomMembre(tourEnCours.memberId)} />
          <StatCard icon={<Clock size={18} />} theme="blue" label="Jours restants" value={`${joursRestants}`} />
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">
          Participants et tours {tourEnCours ? `— paiements du tour ${tourEnCours.position}` : ''}
        </h3>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Membre</Th>
              <Th>Date prévue</Th>
              <Th>Tour reçu</Th>
              {tourEnCours && <Th>Paiement de ce tour</Th>}
            </tr>
          </thead>
          <tbody>
            {[...participants]
              .sort((a, b) => a.position - b.position)
              .map((p) => {
                const paiement = tourEnCours?.position === p.position ? paiementDe(p.memberId) : undefined;
                return (
                  <Tr key={p.id}>
                    <Td>{p.position}</Td>
                    <Td className="font-medium text-[var(--color-ink)]">{nomMembre(p.memberId)}</Td>
                    <Td>{formatDate(p.dateReceptionPrevue)}</Td>
                    <Td>
                      {p.aRecuSonTour ? (
                        <Badge tone="success">Reçu le {p.dateReception && formatDate(p.dateReception)}</Badge>
                      ) : tourEnCours?.id === p.id ? (
                        <div className="flex items-center gap-2">
                          <Badge tone="warning">Tour en cours</Badge>
                          {profil?.role === 'responsable_finances' && cagnotteCollectee >= cagnotteAttendue && (
                            <button
                              onClick={recevoirCagnotte}
                              className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                            >
                              Marquer reçu
                            </button>
                          )}
                        </div>
                      ) : (
                        <Badge tone="neutral">À venir</Badge>
                      )}
                    </Td>
                    {tourEnCours && (
                      <Td>
                        {tourEnCours.position === p.position ? (
                          paiement ? (
                            paiement.statut === 'paye' ? (
                              <Badge tone="success">Payé — {formatMontant(paiement.montant)}</Badge>
                            ) : (
                              <Badge tone="danger">
                                Retard — solde dû {formatMontant(cycle.montantCotisation - paiement.montant)}
                              </Badge>
                            )
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => marquerPaye(p.memberId)}
                                className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                              >
                                Marquer payé
                              </button>
                              <button
                                onClick={() => setRetardCible(p)}
                                className="text-xs font-medium text-[var(--color-danger)] hover:underline"
                              >
                                Marquer en retard
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-[var(--color-muted)]">—</span>
                        )}
                      </Td>
                    )}
                  </Tr>
                );
              })}
          </tbody>
        </Table>
      </div>

      {retardCible && cycle && (
        <PaiementRetardModal
          open={!!retardCible}
          onClose={() => setRetardCible(null)}
          cycleId={cycle.id}
          periode={retardCible.position}
          memberId={retardCible.memberId}
          membreNom={nomMembre(retardCible.memberId)}
          montantAttendu={cycle.montantCotisation}
        />
      )}
    </div>
  );
}
