'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConnectionQuality, Track, RoomEvent, RemoteParticipant } from 'livekit-client';
import { Video } from 'lucide-react';
import { RoomProvider, useRoomLiveKit } from '@/components/room/RoomProvider';
import VideoGrid from '@/components/room/VideoGrid';
import ScreenShareStage from '@/components/room/ScreenShareStage';
import ChatPanel from '@/components/room/ChatPanel';
import HostControlsPanel from '@/components/room/HostControlsPanel';
import RoomControls from '@/components/room/RoomControls';
import { chargerAccesSalle, AccesSalle } from '@/lib/participantSession';
import { obtenirDetailHote } from '@/lib/reunions';
import { quitterReunion, listerEnAttente, admettreParticipant, rejeterParticipant } from '@/lib/participants';
import { demarrerEnregistrement, arreterEnregistrement, obtenirEnregistrementEnCours } from '@/lib/enregistrements';
import { useAuthStore } from '@/stores/authStore';

const WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL as string;

export default function SallePage() {
  const params = useParams<{ codeReunion: string }>();
  const router = useRouter();
  const [acces, setAcces] = useState<AccesSalle | null | 'absent'>(null);

  useEffect(() => {
    const trouve = chargerAccesSalle(params.codeReunion);
    setAcces(trouve ?? 'absent');
  }, [params.codeReunion]);

  useEffect(() => {
    if (acces === 'absent') router.replace(`/rejoindre/${params.codeReunion}`);
  }, [acces, params.codeReunion, router]);

  if (!acces || acces === 'absent') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050e1a' }}>
        <span className="text-sm text-white/50">Chargement de la réunion...</span>
      </div>
    );
  }

  return (
    <RoomProvider wsUrl={WS_URL} token={acces.livekitToken}>
      <SalleContenu codeReunion={params.codeReunion} acces={acces} />
    </RoomProvider>
  );
}

function SalleContenu({ codeReunion, acces }: { codeReunion: string; acces: AccesSalle }) {
  const router = useRouter();
  const { room, participants, connecte, erreur } = useRoomLiveKit();
  const [panneau, setPanneau] = useState<'aucun' | 'chat' | 'participants'>('aucun');
  const [estHote, setEstHote] = useState(false);
  const [degradeAuto, setDegradeAuto] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; texte: string }[]>([]);
  const [enAttente, setEnAttente] = useState<Array<{ id: string; nomAffiche: string }>>([]);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [enregistrementChargement, setEnregistrementChargement] = useState(false);
  const publicationInitiale = useRef(false);

  const localIdentity = room?.localParticipant.identity ?? '';
  const localParticipant = participants.find((p) => p.identity === localIdentity);
  const participantEnPartage = participants.find((p) => p.getTrackPublication(Track.Source.ScreenShare)?.track);

  // /salle n'est pas sous le layout (dashboard) protégé — le hydrate() qui
  // restaure normalement l'access token depuis le cookie refresh n'a donc
  // jamais lieu ici. Sans lui, un hôte arrivant sur un onglet neuf ou après un
  // rechargement de page se voit traité comme un simple invité (aucun
  // Authorization envoyé), et le panneau hôte n'apparaît jamais alors qu'il
  // est bien connecté côté cookie.
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    let annule = false;
    hydrate().finally(() => {
      if (annule) return;
      obtenirDetailHote(codeReunion)
        .then(() => {
          if (!annule) setEstHote(true);
        })
        .catch(() => {
          if (!annule) setEstHote(false);
        });
    });
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeReunion]);

  // Statut de l'enregistrement — pertinent uniquement côté hôte (seul à
  // pouvoir démarrer/arrêter), interrogé une fois l'hôte confirmé pour
  // refléter un enregistrement déjà en cours (ex. après un rechargement de page).
  useEffect(() => {
    if (!estHote) return;
    obtenirEnregistrementEnCours(codeReunion)
      .then((e) => setEnregistrementEnCours(!!e))
      .catch(() => {});
  }, [estHote, codeReunion]);

  // Liste d'attente — remontée au niveau de la salle (pas seulement dans
  // HostControlsPanel) pour que l'hôte soit alerté même si le panneau
  // "Participants" n'est pas ouvert : sans ça, il n'avait aucun moyen de
  // savoir que quelqu'un patiente sans cliquer dessus par réflexe.
  useEffect(() => {
    if (!estHote) return;
    let annule = false;
    const rafraichir = async () => {
      try {
        const liste = await listerEnAttente(codeReunion);
        if (!annule) setEnAttente(liste);
      } catch {
        // Ignoré, retente au prochain intervalle.
      }
    };
    rafraichir();
    const interval = setInterval(rafraichir, 3000);
    return () => {
      annule = true;
      clearInterval(interval);
    };
  }, [estHote, codeReunion]);

  const admettre = async (participantId: string) => {
    await admettreParticipant(participantId);
    setEnAttente((prev) => prev.filter((p) => p.id !== participantId));
  };

  const rejeter = async (participantId: string) => {
    await rejeterParticipant(participantId);
    setEnAttente((prev) => prev.filter((p) => p.id !== participantId));
  };

  const toggleEnregistrement = async () => {
    setEnregistrementChargement(true);
    try {
      if (enregistrementEnCours) {
        await arreterEnregistrement(codeReunion);
        setEnregistrementEnCours(false);
      } else {
        await demarrerEnregistrement(codeReunion);
        setEnregistrementEnCours(true);
      }
    } catch {
      // Message d'erreur simple suffisant ici — ex. Egress pas encore prêt,
      // ou un enregistrement déjà en cours détecté côté serveur.
      alert("Impossible de modifier l'état de l'enregistrement pour le moment.");
    } finally {
      setEnregistrementChargement(false);
    }
  };

  // Publication initiale des pistes locales une fois connecté — jamais
  // automatique côté LiveKit lui-même. Le mode données minimales (choisi
  // consciemment à l'écran de pré-jointe) garde la caméra désactivée par défaut.
  useEffect(() => {
    if (!room || !connecte || publicationInitiale.current) return;
    publicationInitiale.current = true;
    room.localParticipant.setMicrophoneEnabled(true).catch(() => {});
    if (!acces.modeDonneesMinimales) {
      room.localParticipant.setCameraEnabled(true).catch(() => {});
    }
  }, [room, connecte, acces.modeDonneesMinimales]);

  // Dégradation automatique vers audio seul — le cœur du différenciateur du
  // brief. Debounce de 5s anti-flapping (une chute ponctuelle de qualité ne
  // doit pas couper la caméra pour un simple pic de latence). Volontairement
  // PAS de retour auto à la vidéo à l'amélioration de la qualité : réactiver
  // la caméra doit rester un choix explicite du participant (bouton caméra),
  // jamais une surprise côté hôte/autres participants.
  useEffect(() => {
    if (!room || !localParticipant || degradeAuto) return;
    if (localParticipant.connectionQuality !== ConnectionQuality.Poor) return;

    const minuteur = setTimeout(async () => {
      if (room.localParticipant.isCameraEnabled) {
        await room.localParticipant.setCameraEnabled(false);
      }
      await room.localParticipant.setMetadata(JSON.stringify({ audioSeul: true }));
      setDegradeAuto(true);
    }, 5000);

    return () => clearTimeout(minuteur);
  }, [room, localParticipant, degradeAuto]);

  // Notifications "X a rejoint / a quitté la réunion" — LiveKit émet déjà ces
  // événements à tous les participants connectés, donc aucun aller-retour
  // backend supplémentaire n'est nécessaire pour les afficher en direct.
  // Couvre aussi bien un départ volontaire qu'un retrait par l'hôte ou une
  // perte de connexion : dans les trois cas, les autres voient juste "X a
  // quitté", sans distinction (pas demandé plus finement).
  useEffect(() => {
    if (!room) return;

    const notifier = (texte: string) => {
      const id = `${texte}-${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, texte }]);
      setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
    };

    const onConnected = (p: RemoteParticipant) => notifier(`${p.name || p.identity} a rejoint la réunion`);
    const onDisconnected = (p: RemoteParticipant) => notifier(`${p.name || p.identity} a quitté la réunion`);

    room.on(RoomEvent.ParticipantConnected, onConnected);
    room.on(RoomEvent.ParticipantDisconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.ParticipantConnected, onConnected);
      room.off(RoomEvent.ParticipantDisconnected, onDisconnected);
    };
  }, [room]);

  const quitter = async () => {
    try {
      await quitterReunion(acces.participantId, acces.reconnectToken);
    } catch {
      // Non bloquant : même si l'enregistrement du départ échoue (ex. déjà
      // marqué parti), l'utilisateur doit pouvoir quitter la salle.
    }
    await room?.disconnect();
    router.push(estHote ? `/dashboard/reunions/${codeReunion}` : '/');
  };

  if (erreur) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#050e1a' }}>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">Connexion au serveur média impossible</p>
          <p className="text-sm text-white/50">{erreur}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050e1a' }}>
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        {estHote && enAttente.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
            style={{ background: 'rgba(23,184,146,0.16)', border: '1px solid rgba(23,184,146,0.4)' }}
          >
            <span>{p.nomAffiche} demande à rejoindre la réunion</span>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => admettre(p.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'var(--color-accent)', color: '#04241c' }}
              >
                Admettre
              </button>
              <button
                onClick={() => rejeter(p.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
              >
                Rejeter
              </button>
            </div>
          </div>
        ))}
        {notifications.map((n) => (
          <div
            key={n.id}
            className="px-3.5 py-2 rounded-xl text-sm font-medium text-white shadow-lg"
            style={{ background: 'rgba(11,26,43,0.92)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {n.texte}
          </div>
        ))}
      </div>

      <header className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4" style={{ color: '#4ee0bd' }} />
          <span className="text-sm font-semibold text-white">{acces.titre}</span>
          {enregistrementEnCours && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'rgba(239,68,68,0.16)', color: '#fca5a5' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
              REC
            </span>
          )}
        </div>
        <span className="text-xs text-white/40">{connecte ? `${participants.length} participant(s)` : 'Connexion...'}</span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {participantEnPartage && <ScreenShareStage participant={participantEnPartage} />}
          <VideoGrid participants={participants} localIdentity={localIdentity} />
        </div>

        {panneau !== 'aucun' && (
          <div className="w-80 shrink-0 border-l flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--color-surface)' }}>
            {panneau === 'chat' && (
              <ChatPanel room={room} codeReunion={codeReunion} participantId={acces.participantId} reconnectToken={acces.reconnectToken} />
            )}
            {panneau === 'participants' && estHote && (
              <HostControlsPanel
                codeReunion={codeReunion}
                participants={participants}
                enAttente={enAttente}
                onAdmettre={admettre}
                onRejeter={rejeter}
              />
            )}
            {panneau === 'participants' && !estHote && (
              <div className="p-4 space-y-2 overflow-y-auto">
                {participants.map((p) => (
                  <div key={p.identity} className="text-sm font-medium p-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink)' }}>
                    {p.name || p.identity}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }}>
        <RoomControls
          room={room}
          localParticipant={localParticipant}
          onQuitter={quitter}
          onToggleChat={() => setPanneau((p) => (p === 'chat' ? 'aucun' : 'chat'))}
          onToggleParticipants={() => setPanneau((p) => (p === 'participants' ? 'aucun' : 'participants'))}
          afficherParticipants={panneau === 'participants'}
          estHote={estHote}
          enregistrementEnCours={enregistrementEnCours}
          enregistrementChargement={enregistrementChargement}
          onToggleEnregistrement={toggleEnregistrement}
        />
      </div>
    </div>
  );
}
