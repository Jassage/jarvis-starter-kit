'use client';
import { useEffect, useRef, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Lecteur VOD (replay) — même moteur que HlsPlayer (hls.js, fallback natif Safari
 * uniquement), mais la source vient d'une prop et non de la config d'environnement :
 * chaque replay a sa propre URL de fichier, contrairement au direct qui n'en a qu'une.
 *
 * Un fichier MP4 progressif n'a pas besoin de hls.js : on ne charge le démuxeur que
 * pour une playlist HLS (.m3u8), sinon on laisse le <video> lire la source nativement.
 */
export default function VodPlayer({ src, poster, onDemarrage }: { src: string; poster?: string | null; onDemarrage?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    setErreur(false);
    const video = videoRef.current;
    if (!src || !video) return;

    const estHls = src.split('?')[0].toLowerCase().endsWith('.m3u8');
    if (!estHls) {
      video.src = src;
      return;
    }

    let hls: import('hls.js').default | null = null;
    // Même compromis que pour le direct : hls.js d'abord (le canPlayType de Chrome
    // ment parfois sur le HLS natif), natif seulement en dernier recours (Safari/iOS).
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal) setErreur(true);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        setErreur(true);
      }
    });

    return () => {
      hls?.destroy();
    };
  }, [src]);

  if (erreur) {
    return (
      <div className="w-full aspect-video rounded-2xl flex flex-col items-center justify-center gap-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-line)' }}>
        <WifiOff className="w-10 h-10" style={{ color: 'var(--color-danger)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>Enregistrement indisponible</p>
        <p className="text-xs max-w-xs text-center" style={{ color: 'var(--color-ink-3)' }}>
          Le fichier VOD de ce replay n&apos;a pas pu être lu. Vérifiez son URL côté régie.
        </p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      poster={poster || undefined}
      onPlay={onDemarrage}
      className="w-full aspect-video rounded-2xl"
      style={{ background: 'black' }}
    />
  );
}
