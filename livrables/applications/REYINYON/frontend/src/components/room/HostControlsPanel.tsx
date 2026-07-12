'use client';
import { useEffect, useState } from 'react';
import { Participant, Track } from 'livekit-client';
import { Mic, MicOff, Video as VideoIcon, VideoOff, UserX, Check, X as XIcon } from 'lucide-react';
import { obtenirDetailHote } from '@/lib/reunions';
import { couperMicroParticipant, couperCameraParticipant, retirerParticipant } from '@/lib/participants';
import { useI18n } from '@/lib/i18n';

export default function HostControlsPanel({
  codeReunion,
  participants,
  enAttente,
  onAdmettre,
  onRejeter,
}: {
  codeReunion: string;
  participants: Participant[];
  enAttente: Array<{ id: string; nomAffiche: string }>;
  onAdmettre: (participantId: string) => void;
  onRejeter: (participantId: string) => void;
}) {
  const { t } = useI18n();
  const [identiteVersId, setIdentiteVersId] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fait le pont entre l'identité LiveKit (celle que voit le SFU) et l'id
    // participant en base (celui qu'attendent les endpoints de contrôle hôte) —
    // ce panneau ne s'affiche de toute façon que côté hôte, cf. page parente.
    const rafraichir = async () => {
      try {
        const detail = await obtenirDetailHote(codeReunion);
        const map: Record<string, string> = {};
        for (const p of detail.participants as unknown as Array<{ id: string; livekitIdentity?: string }>) {
          if (p.livekitIdentity) map[p.livekitIdentity] = p.id;
        }
        setIdentiteVersId(map);
      } catch {
        // Ignoré — retente au prochain intervalle.
      }
    };
    rafraichir();
    const interval = setInterval(rafraichir, 3000);
    return () => clearInterval(interval);
  }, [codeReunion]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {enAttente.length > 0 && (
        <div>
          <h4 className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>EN ATTENTE ({enAttente.length})</h4>
          <div className="space-y-2">
            {enAttente.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                <span className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>{p.nomAffiche}</span>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => onAdmettre(p.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}
                    title={t('admettre')}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRejeter(p.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}
                    title={t('rejeterParticipant')}
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>{t('participants').toUpperCase()} ({participants.length})</h4>
        <div className="space-y-2">
          {participants.map((p) => {
            const dbId = identiteVersId[p.identity];
            const micPub = p.getTrackPublication(Track.Source.Microphone);
            const micActif = !!micPub && !micPub.isMuted;
            const camPub = p.getTrackPublication(Track.Source.Camera);
            const camActif = !!camPub && !camPub.isMuted;

            return (
              <div key={p.identity} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                <span className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>{p.name || p.identity}</span>
                {dbId && (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => couperMicroParticipant(dbId)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={
                        micActif
                          ? { background: 'var(--color-success-soft)', color: 'var(--color-success)' }
                          : { background: 'var(--color-surface)', color: 'var(--color-ink-3)' }
                      }
                      title={micActif ? 'Micro activé — cliquer pour couper' : 'Micro déjà coupé'}
                    >
                      {micActif ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => couperCameraParticipant(dbId)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={
                        camActif
                          ? { background: 'var(--color-success-soft)', color: 'var(--color-success)' }
                          : { background: 'var(--color-surface)', color: 'var(--color-ink-3)' }
                      }
                      title={camActif ? 'Caméra activée — cliquer pour couper' : 'Caméra déjà coupée'}
                    >
                      {camActif ? <VideoIcon className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => retirerParticipant(dbId)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}
                      title={t('retirerParticipant')}
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
