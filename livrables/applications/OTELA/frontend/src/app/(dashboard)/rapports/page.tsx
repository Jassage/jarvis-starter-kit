'use client';
import { useEffect, useState } from 'react';
import { BedDouble, TrendingUp, DollarSign, Percent, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRapportsStore, FacturationParDevise } from '@/stores/rapportsStore';
import StatCard from '@/components/ui/StatCard';

function ilYa(jours: number) { return new Date(Date.now() - jours * 86400000).toISOString().slice(0, 10); }
const AUJOURDHUI = new Date().toISOString().slice(0, 10);

function SectionFacturation({ facturation }: { facturation: { HTG: FacturationParDevise; USD: FacturationParDevise } }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>FACTURATION</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(['HTG', 'USD'] as const).map((devise) => (
          <div key={devise} className="contents">
            <StatCard icon={Receipt} theme="brand" label={`FACTURÉ ${devise}`} value={`${facturation[devise].facture.toLocaleString('fr-FR')} ${devise}`} compact />
            <StatCard icon={CheckCircle2} theme="blue" label={`PAYÉ ${devise}`} value={`${facturation[devise].paye.toLocaleString('fr-FR')} ${devise}`} compact />
            <StatCard icon={AlertCircle} theme="rose" label={`IMPAYÉ ${devise}`} value={`${facturation[devise].impaye.toLocaleString('fr-FR')} ${devise}`} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RapportsPage() {
  const { rapportEtablissement, isLoading, fetchRapportEtablissement } = useRapportsStore();
  const [periode, setPeriode] = useState(30);

  useEffect(() => {
    fetchRapportEtablissement(ilYa(periode), AUJOURDHUI);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode]);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <select className="input sm:max-w-[200px]" value={periode} onChange={(e) => setPeriode(Number(e.target.value))}>
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
          <option value={90}>90 derniers jours</option>
        </select>
      </div>

      {isLoading || !rapportEtablissement ? (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BedDouble} theme="brand" label="CHAMBRES" value={String(rapportEtablissement.nbChambres)} />
            <StatCard icon={Percent} theme="gold" label="TAUX D'OCCUPATION" value={`${Math.round(rapportEtablissement.tauxOccupation * 100)}%`} sub={`${rapportEtablissement.nuitsOccupees} / ${rapportEtablissement.nuitsDisponibles} nuits-chambre`} />
            <StatCard icon={DollarSign} theme="blue" label="REVENU HTG" value={`${rapportEtablissement.revenuParDevise.HTG.toLocaleString('fr-FR')} HTG`} />
            <StatCard icon={TrendingUp} theme="violet" label="REVENU USD" value={`${rapportEtablissement.revenuParDevise.USD.toLocaleString('fr-FR')} USD`} />
          </div>

          <SectionFacturation facturation={rapportEtablissement.facturation} />
        </>
      )}
    </div>
  );
}
