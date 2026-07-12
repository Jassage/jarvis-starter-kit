'use client';
import { useEffect, useRef } from 'react';
import { Participant, Track, ConnectionQuality } from 'livekit-client';
import { MicOff, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

function libelleQualite(q: ConnectionQuality) {
  switch (q) {
    case ConnectionQuality.Excellent:
      return { cle: 'connexionExcellente' as const, couleur: 'var(--color-quality-excellente)' };
    case ConnectionQuality.Poor:
      return { cle: 'connexionFaible' as const, couleur: 'var(--color-quality-faible)' };
    default:
      return { cle: 'connexionBonne' as const, couleur: 'var(--color-quality-bonne)' };
  }
}

interface MetadataParticipant {
  audioSeul?: boolean;
}

export default function ParticipantTile({ participant, estLocal }: { participant: Participant; estLocal: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { t } = useI18n();

  const camPub = participant.getTrackPublication(Track.Source.Camera);
  const camActive = !!camPub && !camPub.isMuted;
  const camTrack = camPub?.track;

  useEffect(() => {
    const el = videoRef.current;
    if (camTrack && el) {
      camTrack.attach(el);
      return () => {
        camTrack.detach(el);
      };
    }
  }, [camTrack]);

  const micPub = participant.getTrackPublication(Track.Source.Microphone);
  const micTrack = micPub?.track;
  const micCoupe = !micPub || micPub.isMuted;

  // La piste micro est attachée à un <audio> dédié, jamais à l'élément vidéo :
  // le <video> n'est monté que si camActive (cf. rendu ci-dessous), donc un
  // participant en audio seul (caméra coupée — le scénario central de
  // dégradation auto du brief) n'aurait aucun élément média sur lequel jouer
  // son micro si on dépendait du <video>. Jamais pour soi-même (estLocal),
  // pour ne pas s'entendre en écho.
  useEffect(() => {
    const el = audioRef.current;
    if (micTrack && el && !estLocal) {
      micTrack.attach(el);
      return () => {
        micTrack.detach(el);
      };
    }
  }, [micTrack, estLocal]);

  let metadata: MetadataParticipant = {};
  try {
    metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
  } catch {
    metadata = {};
  }

  const qualite = libelleQualite(participant.connectionQuality);

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video" style={{ background: '#0b1a2b' }}>
      {!estLocal && <audio ref={audioRef} autoPlay />}
      {camActive ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <User className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
        <span className="px-2 py-1 rounded-lg text-xs font-semibold text-white truncate" style={{ background: 'rgba(0,0,0,0.5)' }}>
          {participant.name || participant.identity} {estLocal && '(vous)'}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {micCoupe && (
            <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <MicOff className="w-3.5 h-3.5 text-white" />
            </span>
          )}
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: qualite.couleur }} title={t(qualite.cle)} />
        </span>
      </div>

      {metadata.audioSeul && (
        <div
          className="absolute top-2 left-2 right-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-center"
          style={{ background: 'var(--color-audio-seul-soft)', color: '#c4b5fd' }}
        >
          {participant.name || participant.identity} {t('passeEnAudioSeul')}
        </div>
      )}
    </div>
  );
}
