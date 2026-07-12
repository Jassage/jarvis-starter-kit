'use client';
import { Room, Participant } from 'livekit-client';
import { Mic, MicOff, Video as VideoIcon, VideoOff, ScreenShare, PhoneOff, MessageCircle, Users, Circle, Square } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// Le mic/cam actifs sont lus directement depuis le Participant local (source
// de vérité unique) plutôt qu'un état React séparé — sinon une désactivation
// déclenchée ailleurs (ex. dégradation auto vers audio seul) désynchroniserait
// silencieusement l'affichage de ces boutons.
export default function RoomControls({
  room,
  localParticipant,
  onQuitter,
  onToggleChat,
  onToggleParticipants,
  afficherParticipants,
  estHote,
  enregistrementEnCours,
  enregistrementChargement,
  onToggleEnregistrement,
}: {
  room: Room | null;
  localParticipant: Participant | undefined;
  onQuitter: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  afficherParticipants: boolean;
  estHote?: boolean;
  enregistrementEnCours?: boolean;
  enregistrementChargement?: boolean;
  onToggleEnregistrement?: () => void;
}) {
  const { t } = useI18n();
  const micActif = localParticipant?.isMicrophoneEnabled ?? true;
  const camActive = localParticipant?.isCameraEnabled ?? true;
  const partageActif = localParticipant?.isScreenShareEnabled ?? false;

  const toggleMic = () => room?.localParticipant.setMicrophoneEnabled(!micActif);
  const toggleCam = () => room?.localParticipant.setCameraEnabled(!camActive);
  const togglePartage = () => room?.localParticipant.setScreenShareEnabled(!partageActif);

  const boutonBase = 'w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95';
  const glassStyle = { background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="flex items-center justify-center py-3">
      <div
        className="flex items-center gap-2 p-2 rounded-full"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px) saturate(150%)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
      >
        <button onClick={toggleMic} className={boutonBase} style={micActif ? glassStyle : { ...glassStyle, background: 'var(--color-danger)', borderColor: 'transparent' }} title={t('micro')}>
          {micActif ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button onClick={toggleCam} className={boutonBase} style={camActive ? glassStyle : { ...glassStyle, background: 'var(--color-danger)', borderColor: 'transparent' }} title={t('camera')}>
          {camActive ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button onClick={togglePartage} className={boutonBase} style={partageActif ? { ...glassStyle, background: 'var(--color-accent)', color: '#04241c', borderColor: 'transparent' } : glassStyle} title={t('partagerEcran')}>
          <ScreenShare className="w-5 h-5" />
        </button>
        <button onClick={onToggleChat} className={boutonBase} style={glassStyle} title={t('chat')}>
          <MessageCircle className="w-5 h-5" />
        </button>
        <button onClick={onToggleParticipants} className={boutonBase} style={afficherParticipants ? { ...glassStyle, background: 'var(--color-accent)', color: '#04241c', borderColor: 'transparent' } : glassStyle} title={t('participants')}>
          <Users className="w-5 h-5" />
        </button>
        {estHote && onToggleEnregistrement && (
          <button
            onClick={onToggleEnregistrement}
            disabled={enregistrementChargement}
            className={`${boutonBase} disabled:opacity-50 disabled:hover:scale-100`}
            style={enregistrementEnCours ? { ...glassStyle, background: 'var(--color-danger)', borderColor: 'transparent' } : glassStyle}
            title={enregistrementEnCours ? t('arreterEnregistrement') : t('demarrerEnregistrement')}
          >
            {enregistrementEnCours ? <Square className="w-4 h-4" fill="currentColor" /> : <Circle className="w-5 h-5" />}
          </button>
        )}
        <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.14)' }} />
        <button onClick={onQuitter} className={boutonBase} style={{ background: 'var(--color-danger)', color: 'white' }} title={t('quitter')}>
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
