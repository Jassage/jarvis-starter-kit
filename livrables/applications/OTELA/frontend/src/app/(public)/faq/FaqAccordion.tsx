'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Question { q: string; a: string }

// Seul îlot interactif de la page FAQ — le contenu textuel reste server-rendered
// (metadata + questions/réponses présentes dans le HTML initial pour le SEO), même
// principe que Lightbox.tsx sur la fiche établissement.
export default function FaqAccordion({ questions }: { questions: Question[] }) {
  const [ouverte, setOuverte] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {questions.map((item, i) => {
        const estOuverte = ouverte === i;
        return (
          <div key={item.q} className="card overflow-hidden">
            <button
              onClick={() => setOuverte(estOuverte ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-4 text-left"
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{item.q}</span>
              <ChevronDown className="w-4 h-4 shrink-0 transition-transform" style={{ color: 'var(--color-ink-3)', transform: estOuverte ? 'rotate(180deg)' : 'none' }} />
            </button>
            {estOuverte && (
              <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
