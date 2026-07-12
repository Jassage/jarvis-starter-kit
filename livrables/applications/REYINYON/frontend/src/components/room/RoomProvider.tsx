'use client';
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Room, RoomEvent, Participant } from 'livekit-client';

interface RoomContextValue {
  room: Room | null;
  participants: Participant[];
  connecte: boolean;
  erreur: string;
}

const RoomContext = createContext<RoomContextValue>({ room: null, participants: [], connecte: false, erreur: '' });

export function useRoomLiveKit() {
  return useContext(RoomContext);
}

// Plutôt que des mises à jour partielles fragiles (facile à désynchroniser sur
// un SFU avec pistes qui vont et viennent), l'état des participants est
// entièrement recalculé depuis room.localParticipant + room.remoteParticipants
// à chaque événement pertinent — coût négligible à l'échelle d'une réunion.
export function RoomProvider({ wsUrl, token, children }: { wsUrl: string; token: string; children: ReactNode }) {
  const roomRef = useRef<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connecte, setConnecte] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    // React StrictMode (dev) double-invoque cet effet : mount → cleanup →
    // remount. Sans ce garde, le cleanup du 1er montage déconnecte la room
    // pendant que connect() est encore en vol, et son .catch() tardif affiche
    // une erreur par-dessus la 2e connexion (celle du remount) qui, elle, a
    // réussi. `annule` empêche toute mise à jour d'état issue d'un effet déjà
    // nettoyé de "gagner" sur l'état du montage courant.
    let annule = false;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    const sync = () => {
      if (annule) return;
      setParticipants([room.localParticipant, ...Array.from(room.remoteParticipants.values())]);
    };

    room
      .on(RoomEvent.ParticipantConnected, sync)
      .on(RoomEvent.ParticipantDisconnected, sync)
      .on(RoomEvent.TrackSubscribed, sync)
      .on(RoomEvent.TrackUnsubscribed, sync)
      .on(RoomEvent.TrackMuted, sync)
      .on(RoomEvent.TrackUnmuted, sync)
      .on(RoomEvent.LocalTrackPublished, sync)
      .on(RoomEvent.LocalTrackUnpublished, sync)
      .on(RoomEvent.ConnectionQualityChanged, sync)
      .on(RoomEvent.ParticipantMetadataChanged, sync)
      .on(RoomEvent.Disconnected, () => {
        if (!annule) setConnecte(false);
      });

    room
      .connect(wsUrl, token)
      .then(() => {
        if (annule) return;
        setConnecte(true);
        sync();
      })
      .catch((err) => {
        if (annule) return;
        setErreur(err?.message || 'Connexion au serveur média impossible');
      });

    return () => {
      annule = true;
      room.disconnect();
      roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, token]);

  return (
    <RoomContext.Provider value={{ room: roomRef.current, participants, connecte, erreur }}>
      {children}
    </RoomContext.Provider>
  );
}
