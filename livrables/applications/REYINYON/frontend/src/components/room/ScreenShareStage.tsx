'use client';
import { useEffect, useRef } from 'react';
import { Participant, Track } from 'livekit-client';

export default function ScreenShareStage({ participant }: { participant: Participant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const publication = participant.getTrackPublication(Track.Source.ScreenShare);
  const track = publication?.track;

  useEffect(() => {
    const el = videoRef.current;
    if (track && el) {
      track.attach(el);
      return () => {
        track.detach(el);
      };
    }
  }, [track]);

  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ background: '#0b1a2b' }}>
      <video ref={videoRef} autoPlay playsInline className="w-full max-h-[55vh] object-contain" />
      <p className="text-xs text-white/60 px-3 py-2">{participant.name || participant.identity} partage son écran</p>
    </div>
  );
}
