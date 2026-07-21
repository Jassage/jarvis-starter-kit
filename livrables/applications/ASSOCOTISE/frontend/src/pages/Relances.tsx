import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Mail, BellRing, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../components/ui/Table';
import { useAuth } from '../contexts/AuthContext';
import { useParametres } from '../contexts/ParametresContext';
import { ecouterMembres } from '../services/membres.service';
import { ecouterCotisationsDuMois, valeursCourantes } from '../services/cotisations.service';
import {
  ecouterRelancesDuMois,
  enregistrerRelance,
  derniereRelanceParMembre,
} from '../services/relances.service';
import { construireMessageRelance, lienEmail, lienWhatsApp, normaliserTelephone } from '../lib/relance';
import { ajouterMois, formatDate, formatMoisLabel, formatMontant, moisCourant } from '../lib/format';
import type { CanalRelance, Cotisation, Membre, Relance } from '../types';

export function Relances() {
  const { profil } = useAuth();
  const { montantCotisation, nomAssociation, indicatifPays, modeleRelance } = useParametres();
  const [mois, setMois] = useState(moisCourant());
  const [membres, setMembres] = useState<Membre[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => ecouterMembres(setMembres), []);
  useEffect(() => ecouterCotisationsDuMois(mois, setCotisations), [mois]);
  useEffect(() => ecouterRelancesDuMois(mois, setRelances), [mois]);

  const payeParMembre = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of valeursCourantes(cotisations).values()) map.set(c.memberId, c.montant);
    return map;
  }, [cotisations]);

  const relanceParMembre = useMemo(() => derniereRelanceParMembre(relances), [relances]);

  // Seuls les membres actifs sont relancés : un membre inactif ne cotise plus.
  const enRetard = useMemo(
    () =>
      membres
        .filter((m) => m.statut === 'actif')
        .map((m) => ({ membre: m, paye: payeParMembre.get(m.id) ?? 0 }))
        .filter(({ paye }) => paye < montantCotisation)
        .sort((a, b) => a.membre.nom.localeCompare(b.membre.nom)),
    [membres, payeParMembre, montantCotisation]
  );

  const nbRelances = useMemo(
    () => enRetard.filter(({ membre }) => relanceParMembre.has(membre.id)).length,
    [enRetard, relanceParMembre]
  );

  function messagePour(membre: Membre, reste: number) {
    return construireMessageRelance(modeleRelance, {
      nom: membre.nom,
      mois,
      montant: reste,
      association: nomAssociation,
    });
  }

  async function relancer(membre: Membre, canal: CanalRelance, lien: string) {
    setErreur(null);
    // La fenêtre est ouverte avant l'écriture : un échec d'enregistrement ne doit pas
    // empêcher le membre du bureau d'envoyer son message.
    window.open(lien, '_blank', 'noopener');
    if (!profil) return;
    try {
      await enregistrerRelance({ memberId: membre.id, mois, canal, envoyeePar: profil.id });
    } catch {
      setErreur(`Le message a été ouvert, mais la trace de la relance de ${membre.nom} n'a pas pu être enregistrée.`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMois((m) => ajouterMois(m, -1))}
            className="rounded-lg border border-[var(--color-border)] p-1.5 hover:bg-[var(--color-bg)]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="w-40 text-center text-sm font-medium text-[var(--color-ink)]">{formatMoisLabel(mois)}</span>
          <button
            onClick={() => setMois((m) => ajouterMois(m, 1))}
            className="rounded-lg border border-[var(--color-border)] p-1.5 hover:bg-[var(--color-bg)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {erreur && (
        <p className="rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">{erreur}</p>
      )}

      <Card className="flex items-center gap-8 p-4">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Membres à relancer</p>
          <p className="text-lg font-semibold text-[var(--color-danger)]">{enRetard.length}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">Déjà relancés ce mois-ci</p>
          <p className="text-lg font-semibold text-[var(--color-ink)]">
            {nbRelances} / {enRetard.length}
          </p>
        </div>
      </Card>

      {enRetard.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={32} />}
          title="Personne à relancer"
          hint={`Tous les membres actifs sont à jour pour ${formatMoisLabel(mois)}.`}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Membre</Th>
              <Th className="hidden sm:table-cell">Téléphone</Th>
              <Th>Reste à payer</Th>
              <Th className="hidden md:table-cell">Dernière relance</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {enRetard.map(({ membre, paye }) => {
              const reste = montantCotisation - paye;
              const message = messagePour(membre, reste);
              const numero = normaliserTelephone(membre.telephone, indicatifPays);
              const relance = relanceParMembre.get(membre.id);
              return (
                <Tr key={membre.id}>
                  <Td className="font-medium text-[var(--color-ink)]">{membre.nom}</Td>
                  <Td className="hidden sm:table-cell">{membre.telephone}</Td>
                  <Td className="text-[var(--color-danger)]">
                    {formatMontant(reste)}
                    {paye > 0 && (
                      <span className="ml-1 text-xs text-[var(--color-muted)]">
                        (a payé {formatMontant(paye)})
                      </span>
                    )}
                  </Td>
                  <Td className="hidden md:table-cell">
                    {relance ? (
                      <Badge tone="success">
                        {relance.canal === 'whatsapp' ? 'WhatsApp' : 'Email'} · {formatDate(relance.envoyeeLe)}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Jamais relancé</Badge>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3">
                      {numero ? (
                        <button
                          onClick={() => relancer(membre, 'whatsapp', lienWhatsApp(numero, message))}
                          className="flex items-center gap-1 text-xs font-medium text-[var(--color-success)] hover:underline"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--color-muted)]" title="Numéro inexploitable">
                          Numéro invalide
                        </span>
                      )}
                      {membre.email && (
                        <button
                          onClick={() =>
                            relancer(
                              membre,
                              'email',
                              lienEmail(membre.email!, `Cotisation ${formatMoisLabel(mois)}`, message)
                            )
                          }
                          className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
                        >
                          <Mail size={13} /> Email
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <p className="flex items-start gap-1.5 text-xs text-[var(--color-muted)]">
        <BellRing size={13} className="mt-0.5 shrink-0" />
        L'application n'envoie rien elle-même : elle ouvre WhatsApp ou ton client mail avec le
        message déjà rédigé. La trace enregistrée atteste de la démarche, pas de la réception.
        Le modèle de message se règle dans Paramètres, par le responsable finances.
      </p>
    </div>
  );
}
