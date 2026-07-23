'use client';
import { useEffect, useState } from 'react';
import { BedDouble, TrendingUp, DollarSign, Percent, Receipt, CheckCircle2, AlertCircle, Gauge, Download } from 'lucide-react';
import { useRapportsStore, FacturationParDevise } from '@/stores/rapportsStore';
import StatCard from '@/components/ui/StatCard';
import LineChart from '@/components/rapports/LineChart';
import BarChart from '@/components/rapports/BarChart';

function ilYa(jours: number) { return new Date(Date.now() - jours * 86400000).toISOString().slice(0, 10); }
const AUJOURDHUI = new Date().toISOString().slice(0, 10);

function fmtMontant(v: number, devise: string) { return `${Math.round(v).toLocaleString('fr-FR')} ${devise}`; }
function fmtDateCourte(iso: string) { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }); }

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
  const { rapportEtablissement, serieJournaliere, isLoading, fetchRapportEtablissement, fetchSerieJournaliere, exporter } = useRapportsStore();
  const [periode, setPeriode] = useState(30);
  const [exportEnCours, setExportEnCours] = useState(false);

  useEffect(() => {
    const from = ilYa(periode);
    fetchRapportEtablissement(from, AUJOURDHUI);
    fetchSerieJournaliere(from, AUJOURDHUI);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode]);

  const handleExport = async () => {
    setExportEnCours(true);
    try {
      await exporter('etablissement', ilYa(periode), AUJOURDHUI);
    } catch {
      alert("Impossible de générer l'export Excel");
    } finally {
      setExportEnCours(false);
    }
  };

  const serieOccupation = (serieJournaliere?.serie ?? []).map((p) => ({
    label: fmtDateCourte(p.date),
    value: serieJournaliere && serieJournaliere.nbChambres > 0 ? Math.round((p.nuitsOccupees / serieJournaliere.nbChambres) * 100) : 0,
  }));

  const revenuHTGParJour = (serieJournaliere?.serie ?? [])
    .filter((p) => p.revenuHTG > 0)
    .map((p) => ({ label: fmtDateCourte(p.date), value: Math.round(p.revenuHTG) }));
  const revenuUSDParJour = (serieJournaliere?.serie ?? [])
    .filter((p) => p.revenuUSD > 0)
    .map((p) => ({ label: fmtDateCourte(p.date), value: Math.round(p.revenuUSD) }));

  const repartitionNuits = (rapportEtablissement?.repartitionParType ?? [])
    .filter((t) => t.nuitsOccupees > 0)
    .map((t) => ({ label: t.nom, value: t.nuitsOccupees }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <select className="input sm:max-w-[200px]" value={periode} onChange={(e) => setPeriode(Number(e.target.value))}>
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
          <option value={90}>90 derniers jours</option>
        </select>
        <button onClick={handleExport} disabled={exportEnCours} className="btn btn-secondary">
          <Download className="w-4 h-4" /> {exportEnCours ? 'Génération...' : 'Exporter en Excel'}
        </button>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard icon={Gauge} theme="amber" label="ADR (HTG)" value={fmtMontant(rapportEtablissement.adrParDevise.HTG, 'HTG')} sub="Revenu par nuit occupée" compact />
            <StatCard icon={Gauge} theme="rose" label="REVPAR (HTG)" value={fmtMontant(rapportEtablissement.revparParDevise.HTG, 'HTG')} sub="Revenu par nuit disponible" compact />
          </div>

          <LineChart titre="Taux d'occupation" data={serieOccupation} formatValue={(v) => `${v}%`} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BarChart titre="Revenu quotidien (HTG)" data={revenuHTGParJour} formatValue={(v) => v.toLocaleString('fr-FR')} color="var(--color-accent)" />
            {revenuUSDParJour.length > 0 && (
              <BarChart titre="Revenu quotidien (USD)" data={revenuUSDParJour} formatValue={(v) => v.toLocaleString('fr-FR')} color="var(--color-primary-3)" />
            )}
          </div>

          {repartitionNuits.length > 0 && (
            <BarChart titre="Nuits occupées par type de chambre" data={repartitionNuits} horizontal color="var(--color-primary-3)" />
          )}

          <SectionFacturation facturation={rapportEtablissement.facturation} />
        </>
      )}
    </div>
  );
}
