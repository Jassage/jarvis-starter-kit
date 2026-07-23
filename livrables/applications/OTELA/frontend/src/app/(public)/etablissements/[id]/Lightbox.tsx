'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

interface Photo {
  url: string;
  legende: string | null;
}

// Seul îlot interactif de la fiche établissement — le reste de la page (texte,
// équipements, avis, JSON-LD) est intégralement rendu côté serveur pour le SEO.
export default function Lightbox({ photos }: { photos: Photo[] }) {
  const [ouverte, setOuverte] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((p, i) => (
          <button key={i} onClick={() => setOuverte(i)} className="block">
            <img src={p.url} alt={p.legende ?? ''} className="w-full h-32 sm:h-40 object-cover rounded-xl" />
          </button>
        ))}
      </div>

      {ouverte !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,23,51,0.85)' }}
          onClick={() => setOuverte(null)}
        >
          <button
            onClick={() => setOuverte(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={photos[ouverte].url} alt={photos[ouverte].legende ?? ''} className="max-w-full max-h-[85vh] rounded-xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
