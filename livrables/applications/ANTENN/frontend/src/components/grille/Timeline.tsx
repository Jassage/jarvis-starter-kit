'use client';
import { Creneau } from '@/stores/grilleStore';

const TYPE_COLOR: Record<string, string> = {
  PROGRAMME: 'var(--color-primary)',
  MATCH_DIRECT: 'var(--color-live)',
  PUB: 'var(--color-accent)',
};

function pctOfDay(iso: string, dayStart: Date): number {
  const d = new Date(iso);
  const ms = d.getTime() - dayStart.getTime();
  return Math.max(0, Math.min(100, (ms / (24 * 60 * 60 * 1000)) * 100));
}

// Timeline visuelle 24h de la journée sélectionnée — les blocs sont positionnés
// en pourcentage de la journée, pas en pixels, pour rester responsive.
export default function Timeline({ creneaux, jour, onSelect }: { creneaux: Creneau[]; jour: Date; onSelect: (c: Creneau) => void }) {
  const dayStart = new Date(jour);
  dayStart.setHours(0, 0, 0, 0);
  const now = new Date();
  const isToday = now.toDateString() === dayStart.toDateString();
  const nowPct = isToday ? pctOfDay(now.toISOString(), dayStart) : null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>TIMELINE — 00H À 24H</p>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-ink-3)' }}>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLOR.PROGRAMME }} />Programme</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLOR.MATCH_DIRECT }} />Match direct</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLOR.PUB }} />Pub</span>
        </div>
      </div>

      <div className="relative w-full h-16 rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
        {/* Graduations horaires */}
        {Array.from({ length: 25 }).map((_, h) => (
          <div key={h} className="absolute top-0 bottom-0 border-l" style={{ left: `${(h / 24) * 100}%`, borderColor: 'var(--color-line)' }} />
        ))}

        {creneaux.map((c) => {
          const left = pctOfDay(c.dateHeureDebut, dayStart);
          const right = pctOfDay(c.dateHeureFin, dayStart);
          const width = Math.max(0.4, right - left);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="absolute top-2 bottom-2 rounded-md transition-opacity hover:opacity-80"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: TYPE_COLOR[c.typeCreneau],
                opacity: c.syncStatus === 'BROUILLON' ? 0.55 : 1,
                border: c.syncStatus === 'BROUILLON' ? '1px dashed rgba(255,255,255,0.6)' : 'none',
              }}
              title={`${c.contenu?.titre || c.match?.nomEvenement || c.typeCreneau} (${c.syncStatus})`}
            />
          );
        })}

        {nowPct !== null && (
          <div className="absolute top-0 bottom-0 w-0.5" style={{ left: `${nowPct}%`, background: 'white', boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />
        )}
      </div>

      <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: 'var(--color-ink-3)' }}>
        <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span>
      </div>
    </div>
  );
}
