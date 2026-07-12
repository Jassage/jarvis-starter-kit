'use client';
import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { Send, Image as ImageIcon, Mic, Square } from 'lucide-react';
import { obtenirHistorique, envoyerMessage, envoyerMessageMedia, MessageChat } from '@/lib/messages';
import { useI18n } from '@/lib/i18n';

// Fichiers servis par le BACKEND (/uploads/chat/...), pas le frontend.
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');

// Persistance REST = source de vérité (historique consultable par un
// participant qui rejoint en cours de route) ; la diffusion en direct passe
// par le data channel LiveKit déjà en place, pas par un second transport temps
// réel (Socket.io) redondant avec le SFU.
export default function ChatPanel({
  room,
  codeReunion,
  participantId,
  reconnectToken,
}: {
  room: Room | null;
  codeReunion: string;
  participantId: string;
  reconnectToken: string;
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [texte, setTexte] = useState('');
  const [enregistrementVocal, setEnregistrementVocal] = useState(false);
  const [erreurMedia, setErreurMedia] = useState('');
  const finRef = useRef<HTMLDivElement>(null);
  const fichierInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    obtenirHistorique(codeReunion, participantId, reconnectToken)
      .then(setMessages)
      .catch(() => {});
  }, [codeReunion, participantId, reconnectToken]);

  useEffect(() => {
    if (!room) return;
    const decoder = new TextDecoder();
    const onData = (payload: Uint8Array) => {
      try {
        const message = JSON.parse(decoder.decode(payload)) as MessageChat;
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      } catch {
        // Paquet non JSON — pas un message de chat, ignoré.
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const diffuser = (message: MessageChat) => {
    setMessages((prev) => [...prev, message]);
    if (room) {
      const payload = new TextEncoder().encode(JSON.stringify(message));
      room.localParticipant.publishData(payload, { reliable: true });
    }
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const contenu = texte.trim();
    if (!contenu) return;
    setTexte('');
    const message = await envoyerMessage(codeReunion, participantId, reconnectToken, contenu);
    diffuser(message);
  };

  const envoyerPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = '';
    if (!fichier) return;
    setErreurMedia('');
    try {
      const message = await envoyerMessageMedia(codeReunion, participantId, reconnectToken, 'PHOTO', fichier, fichier.name);
      diffuser(message);
    } catch {
      setErreurMedia("Impossible d'envoyer la photo (10 Mo max).");
    }
  };

  // MediaRecorder : clic pour démarrer, clic pour arrêter — pas de limite de
  // durée imposée côté client (la limite de 10 Mo côté serveur suffit à éviter
  // les abus, cohérent avec le reste du portefeuille).
  const toggleEnregistrementVocal = async () => {
    if (enregistrementVocal) {
      mediaRecorderRef.current?.stop();
      setEnregistrementVocal(false);
      return;
    }

    setErreurMedia('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          const message = await envoyerMessageMedia(codeReunion, participantId, reconnectToken, 'AUDIO', blob, 'message-vocal.webm');
          diffuser(message);
        } catch {
          setErreurMedia("Impossible d'envoyer le message vocal.");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setEnregistrementVocal(true);
    } catch {
      setErreurMedia('Accès au micro refusé ou indisponible.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2.5 p-3">
        {messages.map((m) => (
          <div key={m.id}>
            <p className="text-[11px] font-bold" style={{ color: 'var(--color-accent)' }}>{m.participant.nomAffiche}</p>
            {m.type === 'PHOTO' && m.urlFichier && (
              <a href={`${BACKEND_ORIGIN}${m.urlFichier}`} target="_blank" rel="noopener noreferrer">
                <img src={`${BACKEND_ORIGIN}${m.urlFichier}`} alt="Photo partagée" className="mt-1 rounded-lg max-w-[70%] max-h-48 object-cover" />
              </a>
            )}
            {m.type === 'AUDIO' && m.urlFichier && (
              <audio controls src={`${BACKEND_ORIGIN}${m.urlFichier}`} className="mt-1 h-9 max-w-full" />
            )}
            {m.type === 'TEXTE' && <p className="text-sm" style={{ color: 'var(--color-ink)' }}>{m.contenu}</p>}
          </div>
        ))}
        <div ref={finRef} />
      </div>

      {erreurMedia && (
        <p className="px-3 pb-1 text-xs" style={{ color: 'var(--color-danger)' }}>{erreurMedia}</p>
      )}

      <form onSubmit={envoyer} className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--color-line-2)' }}>
        <input
          ref={fichierInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={envoyerPhoto}
        />
        <button
          type="button"
          onClick={() => fichierInputRef.current?.click()}
          className="btn btn-secondary shrink-0"
          aria-label="Envoyer une photo"
          title="Envoyer une photo"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleEnregistrementVocal}
          className={enregistrementVocal ? 'btn shrink-0' : 'btn btn-secondary shrink-0'}
          style={enregistrementVocal ? { background: 'var(--color-danger)', color: 'white' } : undefined}
          aria-label="Message vocal"
          title="Message vocal"
        >
          {enregistrementVocal ? <Square className="w-4 h-4" fill="currentColor" /> : <Mic className="w-4 h-4" />}
        </button>
        <input className="input" value={texte} onChange={(e) => setTexte(e.target.value)} placeholder={t('ecrireMessage')} />
        <button type="submit" className="btn btn-mint shrink-0" aria-label={t('envoyer')}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
