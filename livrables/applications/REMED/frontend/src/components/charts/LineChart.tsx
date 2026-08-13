'use client';
import { useId, useState } from 'react';

interface Point {
  label: string;
  value: number;
}

// Série unique (CA par jour) : pas de légende nécessaire (le titre du bloc parent nomme déjà la
// série), ligne fine 2px, aire de remplissage discrète, crosshair + tooltip au survol.
export default function LineChart({ data, color = 'var(--color-primary-2)', height = 160 }: { data: Point[]; color?: string; height?: number }) {
  const gradientId = useId();
  const [survol, setSurvol] = useState<number | null>(null);

  const width = 600;
  const padding = { top: 12, right: 8, bottom: 24, left: 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.value / max) * innerH,
    ...d,
  }));

  const pathLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const pathArea = `${pathLine} L ${points[points.length - 1]?.x.toFixed(1)} ${padding.top + innerH} L ${points[0]?.x.toFixed(1)} ${padding.top + innerH} Z`;

  // Une étiquette sur ~6 pour ne jamais empiler le texte sur des séries longues (365 jours).
  const everyN = Math.max(1, Math.ceil(data.length / 6));

  if (data.length === 0 || max === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: 'var(--color-ink-3)' }}>
        Aucune donnée sur cette période
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} role="img">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grille recessive : 3 lignes horizontales seulement */}
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + innerH * t}
          y2={padding.top + innerH * t}
          stroke="var(--color-line-2)"
          strokeWidth={1}
        />
      ))}

      <path d={pathArea} fill={`url(#${gradientId})`} stroke="none" />
      <path d={pathLine} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <rect
            x={p.x - stepX / 2}
            y={padding.top}
            width={Math.max(stepX, 4)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setSurvol(i)}
            onMouseLeave={() => setSurvol((s) => (s === i ? null : s))}
          />
          {survol === i && (
            <>
              <line x1={p.x} x2={p.x} y1={padding.top} y2={padding.top + innerH} stroke={color} strokeWidth={1} strokeDasharray="2,2" />
              <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="var(--color-surface)" strokeWidth={2} />
              <title>{`${p.label} : ${Math.round(p.value).toLocaleString('fr-FR')}`}</title>
            </>
          )}
          {i % everyN === 0 && (
            <text x={p.x} y={height - 6} fontSize={9} fill="var(--color-ink-3)" textAnchor="middle">
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
