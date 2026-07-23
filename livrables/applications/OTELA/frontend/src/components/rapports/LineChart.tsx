'use client';
import { useEffect, useRef, useState } from 'react';
import { Table2 } from 'lucide-react';

export interface PointLigne {
  label: string;
  value: number;
}

// Courbe à série unique (ex. taux d'occupation) — pas de légende (une seule couleur,
// le titre du graphique porte déjà l'identité, cf. skill dataviz). Crosshair + info-
// bulle au survol, axe Y à graduations rondes, table de données en repli pour
// l'accessibilité (équivalent WCAG de tout graphique).
export default function LineChart({
  data, titre, formatValue = (v) => String(v), color = 'var(--color-primary-3)', hauteur = 200,
}: {
  data: PointLigne[];
  titre: string;
  formatValue?: (v: number) => string;
  color?: string;
  hauteur?: number;
}) {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const [largeur, setLargeur] = useState(600);
  const [survol, setSurvol] = useState<number | null>(null);
  const [afficherTable, setAfficherTable] = useState(false);

  useEffect(() => {
    const majLargeur = () => { if (conteneurRef.current) setLargeur(conteneurRef.current.clientWidth); };
    majLargeur();
    window.addEventListener('resize', majLargeur);
    return () => window.removeEventListener('resize', majLargeur);
  }, []);

  const PAD_G = 40, PAD_D = 12, PAD_H = 12, PAD_B = 28;
  const largeurTrace = Math.max(0, largeur - PAD_G - PAD_D);
  const hauteurTrace = hauteur - PAD_H - PAD_B;

  const max = Math.max(1, ...data.map((d) => d.value));
  // Graduations rondes (0 / moitié / max arrondi) plutôt qu'une échelle arbitraire.
  const maxArrondi = Math.ceil(max / 10) * 10 || 1;
  const graduations = [0, maxArrondi / 2, maxArrondi];

  const x = (i: number) => PAD_G + (data.length <= 1 ? 0 : (i / (data.length - 1)) * largeurTrace);
  const y = (v: number) => PAD_H + hauteurTrace - (v / maxArrondi) * hauteurTrace;

  const chemin = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');

  const gererSurvol = (e: React.MouseEvent<SVGRectElement>) => {
    if (data.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const posX = e.clientX - rect.left - PAD_G;
    const idx = Math.round((posX / largeurTrace) * (data.length - 1));
    setSurvol(Math.max(0, Math.min(data.length - 1, idx)));
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{titre}</h3>
        <button onClick={() => setAfficherTable((v) => !v)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-ink-3)' }}>
          <Table2 className="w-3.5 h-3.5" /> {afficherTable ? 'Voir le graphique' : 'Voir les données'}
        </button>
      </div>

      {afficherTable ? (
        <div className="overflow-x-auto">
          <table className="table-shell w-full text-xs">
            <thead><tr><th>Date</th><th>Valeur</th></tr></thead>
            <tbody>
              {data.map((d) => <tr key={d.label}><td>{d.label}</td><td>{formatValue(d.value)}</td></tr>)}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={conteneurRef} className="relative" style={{ height: hauteur }}>
          {data.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucune donnée sur cette période.</p>
          ) : (
            <>
              <svg width={largeur} height={hauteur}>
                {graduations.map((g) => (
                  <g key={g}>
                    <line x1={PAD_G} x2={largeur - PAD_D} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeWidth={1} />
                    <text x={PAD_G - 8} y={y(g)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--color-ink-3)">{formatValue(g)}</text>
                  </g>
                ))}

                <path d={chemin} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

                {survol !== null && (
                  <>
                    <line x1={x(survol)} x2={x(survol)} y1={PAD_H} y2={hauteurTrace + PAD_H} stroke="var(--color-ink-3)" strokeWidth={1} strokeDasharray="2,2" />
                    <circle cx={x(survol)} cy={y(data[survol].value)} r={5} fill={color} stroke="var(--color-surface)" strokeWidth={2} />
                  </>
                )}

                <rect x={PAD_G} y={0} width={largeurTrace} height={hauteur} fill="transparent" onMouseMove={gererSurvol} onMouseLeave={() => setSurvol(null)} />
              </svg>

              {survol !== null && (
                <div
                  className="absolute px-2.5 py-1.5 rounded-lg text-xs pointer-events-none shadow-sm"
                  style={{
                    left: Math.min(largeur - 100, Math.max(0, x(survol) - 40)),
                    top: 4,
                    background: 'var(--color-ink)',
                    color: 'white',
                  }}
                >
                  <div className="font-semibold">{data[survol].label}</div>
                  <div>{formatValue(data[survol].value)}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
