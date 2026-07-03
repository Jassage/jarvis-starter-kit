"use client";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, Percent } from "lucide-react";
import { useComptaStore } from "@/stores/comptaStore";
import { formatMontant } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";

export default function ResultatTab() {
  const { resultat, fetchResultat, isLoading, error } = useComptaStore();

  useEffect(() => {
    void fetchResultat().catch(() => undefined);
  }, [fetchResultat]);

  if (isLoading && !resultat) {
    return (
      <div className="card p-4 text-sm" style={{ color: "var(--color-ink-3)" }}>
        Chargement du résultat...
      </div>
    );
  }

  if (error && !resultat) {
    return (
      <div
        className="card p-4 space-y-3"
        style={{
          border: "1px solid rgba(220,38,38,0.2)",
          background: "var(--color-danger-soft)",
        }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--color-danger)" }}
        >
          {error}
        </p>
        <button
          className="text-sm font-semibold"
          style={{ color: "var(--color-primary-2)" }}
          onClick={() => {
            void fetchResultat().catch(() => undefined);
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!resultat) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <StatCard
          icon={resultat.resultatNet >= 0 ? TrendingUp : TrendingDown}
          theme={resultat.resultatNet >= 0 ? "brand" : "rose"}
          label="RÉSULTAT NET"
          value={`${resultat.resultatNet >= 0 ? "+" : ""}${formatMontant(resultat.resultatNet)} HTG`}
        />
        <StatCard
          icon={Percent}
          theme="blue"
          label="MARGE"
          value={`${resultat.marge.toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="card overflow-hidden">
          <div
            className="px-4 py-3 font-bold text-sm"
            style={{
              background: "var(--color-success-soft)",
              color: "var(--color-success)",
            }}
          >
            PRODUITS
          </div>
          <table className="w-full table-shell">
            <tbody>
              {resultat.produits.map((c) => (
                <tr key={c.numero}>
                  <td
                    className="font-mono text-xs"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    {c.numero}
                  </td>
                  <td>{c.intitule}</td>
                  <td
                    className="text-right font-semibold whitespace-nowrap"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {formatMontant(c.montant)} HTG
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--color-line)" }}>
                <td
                  colSpan={2}
                  className="px-4 py-3 font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  Total produits
                </td>
                <td
                  className="px-4 py-3 text-right font-extrabold whitespace-nowrap"
                  style={{ color: "var(--color-ink)" }}
                >
                  {formatMontant(resultat.totalProduits)} HTG
                </td>
              </tr>
            </tfoot>
          </table>
          {resultat.produits.length === 0 && (
            <EmptyState
              icon={TrendingUp}
              title="Aucun produit sur la période"
            />
          )}
        </div>

        <div className="card overflow-hidden">
          <div
            className="px-4 py-3 font-bold text-sm"
            style={{
              background: "var(--color-danger-soft)",
              color: "var(--color-danger)",
            }}
          >
            CHARGES
          </div>
          <table className="w-full table-shell">
            <tbody>
              {resultat.charges.map((c) => (
                <tr key={c.numero}>
                  <td
                    className="font-mono text-xs"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    {c.numero}
                  </td>
                  <td>{c.intitule}</td>
                  <td
                    className="text-right font-semibold whitespace-nowrap"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {formatMontant(c.montant)} HTG
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--color-line)" }}>
                <td
                  colSpan={2}
                  className="px-4 py-3 font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  Total charges
                </td>
                <td
                  className="px-4 py-3 text-right font-extrabold whitespace-nowrap"
                  style={{ color: "var(--color-ink)" }}
                >
                  {formatMontant(resultat.totalCharges)} HTG
                </td>
              </tr>
            </tfoot>
          </table>
          {resultat.charges.length === 0 && (
            <EmptyState
              icon={TrendingDown}
              title="Aucune charge sur la période"
            />
          )}
        </div>
      </div>
    </div>
  );
}
