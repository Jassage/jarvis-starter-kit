'use client';
import { useEffect, useState } from 'react';
import { Printer, BarChart3 } from 'lucide-react';
import { useRapportStore } from '@/stores/rapportStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

const PACKAGE_LABEL: Record<string, string> = {
  TITRE_MATCH: 'Titre match',
  BANDEAU: 'Bandeau',
  HABILLAGE_PERMANENT: 'Habillage permanent',
};

function formatDuree(s: number) {
  if (s === 0) return '0 min';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export default function RapportsPage() {
  const { rapport, isLoading, fetchRapport } = useRapportStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    fetchRapport(from || undefined, to || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appliquer = () => fetchRapport(from ? new Date(from).toISOString() : undefined, to ? new Date(to + 'T23:59:59').toISOString() : undefined);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>DU</label>
          <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>AU</label>
          <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button onClick={appliquer} className="btn btn-secondary">Filtrer</button>
        <div className="flex-1" />
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer className="w-4 h-4" /> Imprimer / Exporter PDF
        </button>
      </div>

      <div id="rapport-imprimable" className="card overflow-x-auto">
        <div className="p-5 pb-0">
          <h2 className="text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>Rapport de diffusion par sponsor</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>
            {from || to ? `Période : ${from || '…'} → ${to || '…'}` : 'Toute la période'}
          </p>
        </div>
        {isLoading ? (
          <div className="py-14 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : rapport.length === 0 ? (
          <EmptyState icon={BarChart3} title="Aucune donnée de diffusion" />
        ) : (
          <table className="table-shell w-full mt-3">
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Package</th>
                <th>Diffusions</th>
                <th>Durée d'exposition</th>
                <th>Vues estimées</th>
                <th>Replays publiés</th>
                <th>Vues replay</th>
              </tr>
            </thead>
            <tbody>
              {rapport.map((r) => (
                <tr key={r.sponsorId}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{r.nomSponsor}</td>
                  <td><Badge tone="brand">{PACKAGE_LABEL[r.typePackage] || r.typePackage}</Badge></td>
                  <td className="font-mono">{r.nombreDiffusions}</td>
                  <td className="font-mono">{formatDuree(r.dureeExpositionSecondes)}</td>
                  <td className="font-mono">{r.nombreVuesEstimees.toLocaleString('fr-FR')}</td>
                  {/* Exposition replay comptée à part : une vue à la demande n'est pas
                      une diffusion linéaire, les deux ne se valorisent pas pareil. */}
                  <td className="font-mono">{(r.nombreReplaysPublies ?? 0).toLocaleString('fr-FR')}</td>
                  <td className="font-mono">{(r.vuesReplay ?? 0).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
