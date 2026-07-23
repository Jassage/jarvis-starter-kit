'use client';
import { useEffect, useRef, useState } from 'react';
import { Table2 } from 'lucide-react';

export interface BarreDonnee {
  label: string;
  value: number;
}

// Barres à teinte unique — comparaison de magnitude entre catégories, pas des séries
// à distinguer (cf. skill dataviz : une seule couleur pour une comparaison de
// grandeur). Étiquette directe seulement sur la barre la plus haute (sélectif),
// info-bulle par barre au survol, table de données en repli.
export default function BarChart({
  data, titre, formatValue = (v) => String(v), color = 'var(--color-accent)', hauteur = 200, horizontal = false,
}: {
  data: BarreDonnee[];
  titre: string;
  formatValue?: (v: number) => string;
  color?: string;
  hauteur?: number;
  horizontal?: boolean;
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

  const max = Math.max(1, ...data.map((d) => d.value));
  const indexMax = data.reduce((m, d, i) => (d.value > data[m].value ? i : m), 0);

  if (horizontal) {
    const PAD_G = 110, PAD_D = 60, LIGNE_H = 28;
    const hauteurTotale = Math.max(hauteur, data.length * LIGNE_H + 16);
    const largeurTrace = Math.max(0, largeur - PAD_G - PAD_D);

    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{titre}</h3>
          <button onClick={() => setAfficherTable((v) => !v)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-ink-3)' }}>
            <Table2 className="w-3.5 h-3.5" /> {afficherTable ? 'Voir le graphique' : 'Voir les données'}
          </button>
        </div>
        {afficherTable ? (
          <TableDonnees data={data} formatValue={formatValue} />
        ) : data.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucune donnée sur cette période.</p>
        ) : (
          <div ref={conteneurRef}>
            <svg width={largeur} height={hauteurTotale}>
              {data.map((d, i) => {
                const y = 8 + i * LIGNE_H;
                const w = (d.value / max) * largeurTrace;
                return (
                  <g key={d.label} onMouseEnter={() => setSurvol(i)} onMouseLeave={() => setSurvol(null)}>
                    <text x={PAD_G - 8} y={y + LIGNE_H / 2 - 4} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--color-ink-2)">{d.label}</text>
                    <rect x={PAD_G} y={y} width={largeurTrace} height={LIGNE_H - 8} fill="var(--color-surface-2)" rx={4} />
                    <rect x={PAD_G} y={y} width={w} height={LIGNE_H - 8} fill={color} opacity={survol === i ? 1 : 0.9} rx={4} />
                    <text x={PAD_G + w + 6} y={y + LIGNE_H / 2 - 4} dominantBaseline="middle" fontSize={11} fill="var(--color-ink-2)">{formatValue(d.value)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    );
  }

  const PAD_G = 44, PAD_D = 12, PAD_H = 20, PAD_B = 24;
  const largeurTrace = Math.max(0, largeur - PAD_G - PAD_D);
  const hauteurTrace = hauteur - PAD_H - PAD_B;
  const largeurBarre = Math.min(24, (largeurTrace / Math.max(1, data.length)) * 0.6);
  const pas = largeurTrace / Math.max(1, data.length);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{titre}</h3>
        <button onClick={() => setAfficherTable((v) => !v)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-ink-3)' }}>
          <Table2 className="w-3.5 h-3.5" /> {afficherTable ? 'Voir le graphique' : 'Voir les données'}
        </button>
      </div>

      {afficherTable ? (
        <TableDonnees data={data} formatValue={formatValue} />
      ) : (
        <div ref={conteneurRef} className="relative" style={{ height: hauteur }}>
          {data.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucune donnée sur cette période.</p>
          ) : (
            <>
              <svg width={largeur} height={hauteur}>
                <line x1={PAD_G} x2={largeur - PAD_D} y1={PAD_H + hauteurTrace} y2={PAD_H + hauteurTrace} stroke="var(--color-line)" strokeWidth={1} />
                {data.map((d, i) => {
                  const cx = PAD_G + i * pas + pas / 2;
                  const h = (d.value / max) * hauteurTrace;
                  const yTop = PAD_H + hauteurTrace - h;
                  return (
                    <g key={d.label} onMouseEnter={() => setSurvol(i)} onMouseLeave={() => setSurvol(null)}>
                      <rect x={cx - largeurBarre / 2} y={yTop} width={largeurBarre} height={Math.max(0, h)} fill={color} opacity={survol === i ? 1 : 0.9} rx={4} />
                      {i === indexMax && (
                        <text x={cx} y={yTop - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--color-ink)">{formatValue(d.value)}</text>
                      )}
                      <text x={cx} y={hauteur - 6} textAnchor="middle" fontSize={10} fill="var(--color-ink-3)">{d.label}</text>
                      <rect x={cx - pas / 2} y={0} width={pas} height={hauteur} fill="transparent" />
                    </g>
                  );
                })}
              </svg>

              {survol !== null && (
                <div
                  className="absolute px-2.5 py-1.5 rounded-lg text-xs pointer-events-none shadow-sm"
                  style={{
                    left: Math.min(largeur - 100, Math.max(0, PAD_G + survol * pas + pas / 2 - 40)),
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

function TableDonnees({ data, formatValue }: { data: BarreDonnee[]; formatValue: (v: number) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-shell w-full text-xs">
        <thead><tr><th>Catégorie</th><th>Valeur</th></tr></thead>
        <tbody>
          {data.map((d) => <tr key={d.label}><td>{d.label}</td><td>{formatValue(d.value)}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
