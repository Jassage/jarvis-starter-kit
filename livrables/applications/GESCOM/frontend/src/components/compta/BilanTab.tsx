"use client";
import { useEffect } from "react";
import { useComptaStore } from "@/stores/comptaStore";
import { formatMontant } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import { Landmark, Scale } from "lucide-react";

export default function BilanTab() {
  const { bilan, fetchBilan, isLoading, error } = useComptaStore();

  useEffect(() => {
    void fetchBilan().catch(() => undefined);
  }, [fetchBilan]);

  if (isLoading && !bilan) {
    return (
      <div className="card p-4 text-sm" style={{ color: "var(--color-ink-3)" }}>
        Chargement du bilan...
      </div>
    );
  }

  if (error && !bilan) {
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
            void fetchBilan().catch(() => undefined);
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!bilan) return null;

  return (
    <div className="space-y-4">
      <div
        className="card p-4 flex items-center justify-between"
        style={{
          background: bilan.equilibre
            ? "var(--color-success-soft)"
            : "var(--color-danger-soft)",
          border: `1px solid ${bilan.equilibre ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
        }}
      >
        <span
          className="text-sm font-bold"
          style={{
            color: bilan.equilibre
              ? "var(--color-success)"
              : "var(--color-danger)",
          }}
        >
          {bilan.equilibre ? "✓ Bilan équilibré" : "⚠ Bilan non équilibré"}
        </span>
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--color-ink-2)" }}
        >
          Actif {formatMontant(bilan.totalActif)} HTG · Passif{" "}
          {formatMontant(bilan.totalPassif)} HTG
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="card overflow-hidden">
          <div
            className="px-4 py-3 font-bold text-sm"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-ink)",
            }}
          >
            ACTIF
          </div>
          <table className="w-full table-shell">
            <tbody>
              {bilan.actifs.map((c) => (
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
                    {formatMontant(c.solde)} HTG
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
                  Total actif
                </td>
                <td
                  className="px-4 py-3 text-right font-extrabold whitespace-nowrap"
                  style={{ color: "var(--color-ink)" }}
                >
                  {formatMontant(bilan.totalActif)} HTG
                </td>
              </tr>
            </tfoot>
          </table>
          {bilan.actifs.length === 0 && (
            <EmptyState icon={Landmark} title="Aucun compte actif mouvementé" />
          )}
        </div>

        <div className="card overflow-hidden">
          <div
            className="px-4 py-3 font-bold text-sm"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-ink)",
            }}
          >
            PASSIF
          </div>
          <table className="w-full table-shell">
            <tbody>
              {bilan.passifs.map((c) => (
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
                    {formatMontant(c.solde)} HTG
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
                  Total passif
                </td>
                <td
                  className="px-4 py-3 text-right font-extrabold whitespace-nowrap"
                  style={{ color: "var(--color-ink)" }}
                >
                  {formatMontant(bilan.totalPassif)} HTG
                </td>
              </tr>
            </tfoot>
          </table>
          {bilan.passifs.length === 0 && (
            <EmptyState icon={Scale} title="Aucun compte passif mouvementé" />
          )}
        </div>
      </div>
    </div>
  );
}
