'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant, formatDate } from '@/lib/utils';

interface RatioBRH {
  valeur: number | null;
  seuilBRH: number;
  conforme: boolean | null;
  note?: string;
}

interface GrandeExposition {
  clientId: string;
  nomClient: string;
  montantExpose: number;
  pourcentageEncours: number;
}

interface RapportBRH {
  dateRapport: string;
  indicateurs: {
    liquidites: number;
    depots: number;
    encours: number;
    totalActifEstime: number;
  };
  ratios: {
    liquidite: RatioBRH;
    solvabilite: RatioBRH;
  };
  grandesExpositions: GrandeExposition[];
  comptesCapitaux: { numero: string; intitule: string }[];
}

function RatioCard({ label, ratio, devise }: { label: string; ratio: RatioBRH; devise?: string }) {
  const valeur = ratio.valeur;
  const conforme = ratio.conforme;
  const couleur = conforme === null ? '#4a5578' : conforme ? '#047857' : '#b91c1c';
  const bg = conforme === null ? '#f7f8fc' : conforme ? '#ecfdf5' : '#fef2f2';
  const icon = conforme === null ? null : conforme
    ? 'M5 13l4 4L19 7'
    : 'M18 6L6 18M6 6l12 12';

  return (
    <div className="rounded-2xl p-6" style={{ background: 'white', border: `2px solid ${conforme === false ? '#fca5a5' : '#e7eaf3'}` }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b94b0' }}>{label}</p>
      <div className="flex items-end gap-3 mb-3">
        <p className="text-4xl font-bold" style={{ color: couleur }}>
          {valeur !== null ? `${valeur.toFixed(1)}%` : '—'}
        </p>
        {icon && (
          <div className="mb-1.5 w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: bg }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: couleur }}>
              <path d={icon} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#8b94b0' }}>Seuil BRH minimum : <strong>{ratio.seuilBRH}%</strong></p>
        {conforme !== null && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: bg, color: couleur }}>
            {conforme ? 'Conforme' : 'Non conforme'}
          </span>
        )}
      </div>
      {ratio.note && <p className="text-xs mt-2 italic" style={{ color: '#8b94b0' }}>{ratio.note}</p>}
      {valeur !== null && (
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#f0f2f9' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (valeur / (ratio.seuilBRH * 2)) * 100)}%`,
              background: couleur,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function RapportBRHPage() {
  const [rapport, setRapport] = useState<RapportBRH | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/stats/rapport-brh');
      setRapport(data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors du chargement du rapport');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
        <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl p-6" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
      <p className="font-semibold" style={{ color: '#b91c1c' }}>{error}</p>
      <button onClick={load} className="btn-ghost mt-3">Réessayer</button>
    </div>
  );

  if (!rapport) return null;

  const ind = rapport.indicateurs;
  const nbNonConformes = Object.values(rapport.ratios).filter((r) => r.conforme === false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#1e40af' }}>
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Rapport prudentiel</p>
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#0b1733' }}>Rapport BRH</h2>
          <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Généré le {new Date(rapport.dateRapport).toLocaleDateString('fr-HT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="flex items-center gap-3">
          {nbNonConformes > 0 && (
            <span className="px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              {nbNonConformes} ratio(s) non conforme(s)
            </span>
          )}
          <button onClick={load} className="btn-ghost flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Actualiser
          </button>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Imprimer
          </button>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Liquidités disponibles', value: ind.liquidites, suffix: 'HTG', color: '#047857' },
          { label: 'Dépôts clients', value: ind.depots, suffix: 'HTG', color: '#1e40af' },
          { label: 'Encours crédit', value: ind.encours, suffix: 'HTG', color: '#b45309' },
          { label: 'Total actif estimé', value: ind.totalActifEstime, suffix: 'HTG', color: '#4a5578' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8b94b0' }}>{s.label}</p>
            <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{formatMontant(s.value, s.suffix)}</p>
          </div>
        ))}
      </div>

      {/* Ratios prudentiels */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: '#0b1733' }}>Ratios réglementaires</h3>
        <div className="grid grid-cols-2 gap-4">
          <RatioCard label="Ratio de liquidité (actifs liquides / dépôts)" ratio={rapport.ratios.liquidite} />
          <RatioCard label="Ratio de solvabilité (fonds propres / total actif)" ratio={rapport.ratios.solvabilite} />
        </div>
      </div>

      {/* Grandes expositions */}
      {rapport.grandesExpositions.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f2f9' }}>
            <div>
              <h3 className="font-bold" style={{ color: '#0b1733' }}>Grandes expositions crédit</h3>
              <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Top 5 emprunteurs — seuil BRH : max 10% de l'encours total par emprunteur</p>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f7f8fc' }}>
                {['Rang', 'Client', 'Encours exposé', '% de l\'encours total', 'Conformité'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rapport.grandesExpositions.map((g, i) => {
                const depasse = g.pourcentageEncours >= 10;
                return (
                  <tr key={g.clientId} style={{ borderBottom: '1px solid #f7f8fc' }}>
                    <td className="px-4 py-3">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i === 0 ? '#fef9c3' : '#f7f8fc', color: i === 0 ? '#92400e' : '#4a5578' }}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm" style={{ color: '#0b1733' }}>{g.nomClient || g.clientId}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#0b1733' }}>{formatMontant(g.montantExpose, 'HTG')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full" style={{ background: '#f0f2f9' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, g.pourcentageEncours)}%`, background: depasse ? '#ef4444' : '#2563eb' }} />
                        </div>
                        <span className="text-sm font-mono font-bold w-12 text-right" style={{ color: depasse ? '#b91c1c' : '#0b1733' }}>
                          {g.pourcentageEncours.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {depasse
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef2f2', color: '#b91c1c' }}>Dépasse 10%</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#ecfdf5', color: '#047857' }}>Conforme</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Comptes de capitaux */}
      {rapport.comptesCapitaux.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
          <h3 className="font-bold mb-3" style={{ color: '#0b1733' }}>Comptes de capitaux (Classe 1)</h3>
          <div className="grid grid-cols-2 gap-2">
            {rapport.comptesCapitaux.map((c) => (
              <div key={c.numero} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#f7f8fc' }}>
                <span className="font-mono text-xs font-bold" style={{ color: '#1e40af' }}>{c.numero}</span>
                <span className="text-sm" style={{ color: '#4a5578' }}>{c.intitule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
