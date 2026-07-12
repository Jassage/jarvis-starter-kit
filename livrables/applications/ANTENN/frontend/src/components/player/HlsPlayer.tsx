'use client';
import { useEffect, useRef, useState } from 'react';
import { Tv, WifiOff } from 'lucide-react';

// Lecteur HLS via hls.js, avec fallback natif pour Safari/iOS (support HLS natif
// du tag <video>). NEXT_PUBLIC_CDN_STREAM_URL vient toujours de la config, jamais
// codé en dur — cf. discussion CDN_BASE_URL côté backend (Bunny Stream / Cloudflare
// Stream). Aucun flux réel n'est disponible dans cet environnement de dev : la
// variable est vide et le player affiche un état "hors antenne" propre.
export default function HlsPlayer({ enDirect }: { enDirect: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [erreur, setErreur] = useState(false);
  const streamUrl = process.env.NEXT_PUBLIC_CDN_STREAM_URL;

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;
    const video = videoRef.current;

    let hls: import('hls.js').default | null = null;

    // Toujours préférer hls.js (démuxeur MSE testé et fiable) quand il est
    // supporté. Le support HLS natif de Chrome via canPlayType() ment parfois
    // (retourne "maybe" puis échoue au demux réel, DEMUXER_ERROR_COULD_NOT_PARSE) —
    // le natif n'est donc utilisé qu'en dernier recours, pour le vrai Safari/iOS.
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal) setErreur(true);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        setErreur(true);
      }
    });

    return () => {
      hls?.destroy();
    };
  }, [streamUrl]);

  if (!streamUrl) {
    return (
      <div className="w-full aspect-video rounded-2xl flex flex-col items-center justify-center gap-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-line)' }}>
        <Tv className="w-10 h-10" style={{ color: 'var(--color-ink-3)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
          {enDirect ? 'Direct en préparation...' : 'Hors antenne'}
        </p>
        <p className="text-xs max-w-xs text-center" style={{ color: 'var(--color-ink-3)' }}>
          Aucun flux CDN configuré (NEXT_PUBLIC_CDN_STREAM_URL). Le player s'activera dès que le CDN de diffusion sera provisionné.
        </p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="w-full aspect-video rounded-2xl flex flex-col items-center justify-center gap-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-line)' }}>
        <WifiOff className="w-10 h-10" style={{ color: 'var(--color-danger)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>Flux indisponible</p>
      </div>
    );
  }

  return (
    <video ref={videoRef} controls autoPlay muted playsInline className="w-full aspect-video rounded-2xl" style={{ background: 'black' }} />
  );
}
