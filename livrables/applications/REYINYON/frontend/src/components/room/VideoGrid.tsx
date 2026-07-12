import { Participant } from 'livekit-client';
import ParticipantTile from './ParticipantTile';

export default function VideoGrid({ participants, localIdentity }: { participants: Participant[]; localIdentity: string }) {
  const cols = participants.length <= 1 ? 1 : participants.length <= 4 ? 2 : 3;

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {participants.map((p) => (
        <ParticipantTile key={p.identity} participant={p} estLocal={p.identity === localIdentity} />
      ))}
    </div>
  );
}
