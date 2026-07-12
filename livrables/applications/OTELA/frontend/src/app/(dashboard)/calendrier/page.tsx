'use client';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReservationsStore } from '@/stores/reservationsStore';
import { useChambresStore } from '@/stores/chambresStore';

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function toISODate(d: Date) { return d.toISOString().slice(0, 10); }

export default function CalendrierPage() {
  const { reservations, fetchReservations } = useReservationsStore();
  const { chambres, fetchAll } = useChambresStore();
  const [mois, setMois] = useState(() => startOfMonth(new Date()));

  const debut = startOfMonth(mois);
  const fin = endOfMonth(mois);
  const jours = useMemo(() => {
    const arr: Date[] = [];
    for (let d = new Date(debut); d <= fin; d.setDate(d.getDate() + 1)) arr.push(new Date(d));
    return arr;
  }, [debut, fin]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReservations({ from: toISODate(debut), to: toISODate(new Date(fin.getTime() + 86400000)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mois]);

  const occupeParChambreEtJour = (chambreId: string, jour: Date) => {
    return reservations.some((r) => {
      if (r.chambre.id !== chambreId && r.chambreId !== chambreId) return false;
      if (r.statut === 'ANNULEE') return false;
      const arr = new Date(r.dateArrivee);
      const dep = new Date(r.dateDepart);
      return jour >= new Date(arr.getFullYear(), arr.getMonth(), arr.getDate()) && jour < new Date(dep.getFullYear(), dep.getMonth(), dep.getDate());
    });
  };

  return (
    <div className="space-y-5">
      <div className="card p-4 flex items-center justify-between">
        <button onClick={() => setMois(new Date(mois.getFullYear(), mois.getMonth() - 1, 1))} className="btn btn-secondary">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-bold" style={{ color: 'var(--color-ink)' }}>
          {mois.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
        <button onClick={() => setMois(new Date(mois.getFullYear(), mois.getMonth() + 1, 1))} className="btn btn-secondary">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-shell" style={{ minWidth: jours.length * 34 + 140 }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: 'var(--color-surface-2)' }}>Chambre</th>
              {jours.map((j) => (
                <th key={j.toISOString()} style={{ textAlign: 'center', width: 32 }}>{j.getDate()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chambres.map((c) => (
              <tr key={c.id}>
                <td style={{ position: 'sticky', left: 0, background: 'var(--color-surface)', fontWeight: 600, color: 'var(--color-ink)' }}>
                  {c.typeChambre.nom} — {c.numero}
                </td>
                {jours.map((j) => {
                  const occupee = occupeParChambreEtJour(c.id, j);
                  return (
                    <td key={j.toISOString()} style={{ textAlign: 'center', padding: '0.4rem' }}>
                      <div
                        className="mx-auto rounded"
                        style={{
                          width: 20, height: 20,
                          background: occupee ? 'var(--color-danger)' : 'var(--color-success-soft)',
                          border: occupee ? 'none' : '1px solid var(--color-line)',
                        }}
                        title={occupee ? 'Occupée' : 'Disponible'}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-ink-3)' }}>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: 'var(--color-success-soft)', border: '1px solid var(--color-line)' }} />Disponible</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: 'var(--color-danger)' }} />Occupée</span>
      </div>
    </div>
  );
}
