'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RadioTower, AlertTriangle, CheckCircle2, Users, Smartphone, Monitor, Trophy,
  CalendarClock, Handshake, ShieldAlert, PlayCircle, Clock,
} from 'lucide-react';
import { useMoniteurStore, CreneauMoniteur } from '@/stores/moniteurStore';
import { useToastStore, messageErreur } from '@/stores/toastStore';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';

// Rafraîchissement du moniteur. Plus court que le player public : un opérateur doit
// voir un trou d'antenne apparaître, pas l'apprendre une minute plus tard.
const INTERVALLE_MS = 20_000;

const TYPE_LABEL: Record<string, string> = {
  PROGRAMME: 'Programme',
  MATCH_DIRECT: 'Match direct',
  PUB: 'Pub',
};

function heure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Une grille déborde sur les jours suivants : n'afficher que l'heure ferait lire
// « 19:00, 20:00, 18:00 » comme une liste mal triée, alors que le dernier créneau est
// celui de demain. Le jour n'apparaît que lorsqu'il change.
function heureAvecJour(iso: string) {
  const d = new Date(iso);
  const aujourdhui = new Date();
  const memeJour =
    d.getDate() === aujourdhui.getDate() &&
    d.getMonth() === aujourdhui.getMonth() &&
    d.getFullYear() === aujourdhui.getFullYear();

  const demain = new Date(aujourdhui);
  demain.setDate(demain.getDate() + 1);
  const estDemain =
    d.getDate() === demain.getDate() && d.getMonth() === demain.getMonth() && d.getFullYear() === demain.getFullYear();

  if (memeJour) return heure(iso);
  if (estDemain) return `dem. ${heure(iso)}`;
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} ${heure(iso)}`;
}

// Les trous de grille se comptent souvent en centaines de minutes : « 1266 min » ne
// veut rien dire pour un opérateur, « 21 h 06 » se lit d'un coup d'œil.
function dureeMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

function duree(secondes: number) {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  if (m >= 60) return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

function titreCreneau(c: CreneauMoniteur) {
  if (c.match) return `${c.match.nomEvenement} — ${c.match.equipes}`;
  return c.contenu?.titre ?? 'Programme';
}

function sponsorCreneau(c: CreneauMoniteur) {
  return c.match?.sponsorPrincipal?.nomSponsor ?? c.contenu?.sponsor?.nomSponsor ?? null;
}

export default function MoniteurPage() {
  const { moniteur, isLoading, fetchMoniteur } = useMoniteurStore();
  const erreur = useToastStore((s) => s.erreur);
  // Décompte local : le serveur donne le reste au moment de l'appel, le compteur
  // descend ensuite tout seul plutôt que d'attendre le prochain rafraîchissement.
  const [reste, setReste] = useState<number | null>(null);

  const charger = useCallback(async () => {
    try {
      await fetchMoniteur();
    } catch (e) {
      erreur(messageErreur(e, 'Moniteur indisponible'));
    }
  }, [fetchMoniteur, erreur]);

  useEffect(() => {
    charger();
    const t = setInterval(charger, INTERVALLE_MS);
    return () => clearInterval(t);
  }, [charger]);

  useEffect(() => {
    setReste(moniteur?.resteSecondes ?? null);
  }, [moniteur?.resteSecondes]);

  useEffect(() => {
    if (reste === null) return;
    const t = setInterval(() => setReste((r) => (r === null ? null : Math.max(0, r - 1))), 1000);
    return () => clearInterval(t);
  }, [reste === null]);

  const m = moniteur;
  const alertes = m?.alertes;
  const nbAlertes =
    (alertes?.trous.length ?? 0) +
    (alertes?.brouillons ? 1 : 0) +
    (alertes?.contratsExpirant.length ?? 0) +
    (alertes && !alertes.repliDefini ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
            Moniteur d&apos;antenne
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-3)' }}>
            {m ? `Actualisé à ${heure(m.horodatage)}` : 'Chargement...'}
          </p>
        </div>
        <Link href="/regarder" target="_blank" className="btn btn-secondary">
          <PlayCircle className="w-4 h-4" /> Ouvrir le player public
        </Link>
      </div>

      {/* ── À l'antenne ─────────────────────────────────────── */}
      <div
        className="card p-5 sm:p-6"
        style={
          m?.enCours
            ? { borderLeft: '3px solid var(--color-live)' }
            : { borderLeft: '3px solid var(--color-danger)' }
        }
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {m?.enCours ? (
                <Badge tone="live" pulse>
                  <RadioTower className="w-3 h-3" /> À L&apos;ANTENNE
                </Badge>
              ) : (
                <Badge tone="danger">
                  <AlertTriangle className="w-3 h-3" /> HORS ANTENNE
                </Badge>
              )}
              {m?.enCours && <Badge tone="neutral">{TYPE_LABEL[m.enCours.typeCreneau]}</Badge>}
            </div>

            {m?.enCours ? (
              <>
                <p className="text-lg font-bold truncate" style={{ color: 'var(--color-ink)' }}>
                  {titreCreneau(m.enCours)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>
                  {heure(m.enCours.dateHeureDebut)} → {heure(m.enCours.dateHeureFin)}
                  {sponsorCreneau(m.enCours) && ` · Sponsor : ${sponsorCreneau(m.enCours)}`}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
                {isLoading ? 'Chargement...' : 'Aucun créneau synchronisé ne couvre cet instant.'}
              </p>
            )}
          </div>

          {reste !== null && (
            <div className="text-right shrink-0">
              <p className="text-[11px] font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>
                TEMPS RESTANT
              </p>
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: reste < 60 ? 'var(--color-warning)' : 'var(--color-ink)' }}>
                {duree(reste)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Audience et alertes ─────────────────────────────── */}
      {/* Quatre cartes de même densité : mélanger la variante haute (audience) et les
          variantes compactes laissait un grand vide sous les trois petites. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          theme="brand"
          label="AUDIENCE"
          value={String(m?.audience.total ?? 0)}
          compact
        />
        <StatCard icon={Monitor} theme="blue" label="WEB" value={String(m?.audience.web ?? 0)} compact />
        <StatCard icon={Smartphone} theme="violet" label="MOBILE" value={String(m?.audience.mobile ?? 0)} compact />
        <StatCard
          icon={nbAlertes ? ShieldAlert : CheckCircle2}
          theme={nbAlertes ? 'amber' : 'brand'}
          label="ALERTES"
          value={String(nbAlertes)}
          compact
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Ce qui suit ───────────────────────────────────── */}
        <div className="card p-5">
          <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
            <CalendarClock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> À suivre
          </p>
          {m?.aSuivre.length ? (
            <ul className="space-y-2.5">
              {m.aSuivre.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: 'var(--color-primary)' }}>
                    {heureAvecJour(c.dateHeureDebut)}
                  </span>
                  <span className="text-sm truncate flex-1" style={{ color: 'var(--color-ink-2)' }}>
                    {titreCreneau(c)}
                  </span>
                  <Badge tone={c.typeCreneau === 'MATCH_DIRECT' ? 'live' : 'neutral'}>
                    {TYPE_LABEL[c.typeCreneau]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm py-3" style={{ color: 'var(--color-ink-3)' }}>
              Plus rien de programmé et synchronisé après le créneau courant.
            </p>
          )}
        </div>

        {/* ── Alertes ───────────────────────────────────────── */}
        <div className="card p-5">
          <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--color-warning)' }} /> Ce qui demande une action
          </p>

          {nbAlertes === 0 && (
            <p className="text-sm py-3 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
              <CheckCircle2 className="w-4 h-4" /> Antenne continue, grille synchronisée, contrats à jour.
            </p>
          )}

          <ul className="space-y-2.5">
            {alertes?.trous.length ? (
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-danger)' }} />
                <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                  <Link href="/grille" className="font-bold" style={{ color: 'var(--color-danger)' }}>
                    {alertes.trous.length} trou{alertes.trous.length > 1 ? 's' : ''} de grille
                  </Link>{' '}
                  dans les 24 h ({dureeMinutes(alertes.totalMinutesTrous)} sans programme synchronisé)
                  {alertes.repliDefini
                    ? ' — le contenu de repli prendra le relais.'
                    : ' — aucun contenu de repli, ce sera un écran noir.'}
                </span>
              </li>
            ) : null}

            {alertes?.brouillons ? (
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-warning)' }} />
                <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                  <Link href="/grille" className="font-bold" style={{ color: 'var(--color-warning)' }}>
                    {alertes.brouillons} créneau{alertes.brouillons > 1 ? 'x' : ''} en brouillon
                  </Link>{' '}
                  jamais répercuté{alertes.brouillons > 1 ? 's' : ''} vers le playout.
                </span>
              </li>
            ) : null}

            {alertes && !alertes.repliDefini && !alertes.trous.length ? (
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-warning)' }} />
                <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                  Aucun <Link href="/contenus" className="font-bold" style={{ color: 'var(--color-warning)' }}>contenu de repli</Link> désigné :
                  le moindre trou de grille deviendra un écran noir.
                </span>
              </li>
            ) : null}

            {alertes?.contratsExpirant.map((s) => (
              <li key={s.id} className="flex items-start gap-2.5">
                <Handshake className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                  Contrat <Link href="/sponsors" className="font-bold" style={{ color: 'var(--color-accent)' }}>{s.nomSponsor}</Link>{' '}
                  expire le {new Date(s.dateFinContrat).toLocaleDateString('fr-FR')}.
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Directs en cours ────────────────────────────────── */}
      {m?.matchsEnCours.length ? (
        <div className="card p-5" style={{ borderLeft: '3px solid var(--color-live)' }}>
          <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
            <Trophy className="w-4 h-4" style={{ color: 'var(--color-live)' }} /> Directs déclarés en cours
          </p>
          <ul className="space-y-2">
            {m.matchsEnCours.map((match) => (
              <li key={match.id} className="flex items-center gap-3">
                <Badge tone="live" pulse>EN DIRECT</Badge>
                <span className="text-sm truncate" style={{ color: 'var(--color-ink-2)' }}>
                  {match.nomEvenement} — {match.equipes}
                </span>
                <Link href="/matchs" className="text-xs font-bold ml-auto shrink-0" style={{ color: 'var(--color-primary)' }}>
                  Gérer
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs mt-3" style={{ color: 'var(--color-ink-3)' }}>
            Un direct laissé ouvert après la fin du match fausse l&apos;EPG public : pensez à le terminer.
          </p>
        </div>
      ) : null}
    </div>
  );
}
