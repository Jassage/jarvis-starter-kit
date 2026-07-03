"use client";
import { useEffect, useState } from "react";
import { BookText } from "lucide-react";
import { useComptaStore } from "@/stores/comptaStore";
import { formatMontant } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import PageToolbar from "@/components/ui/PageToolbar";
import EmptyState from "@/components/ui/EmptyState";
import NouvelleEcritureModal from "./NouvelleEcritureModal";

export default function JournalTab() {
  const { journal, isLoading, fetchJournal, fetchComptes } = useComptaStore();
  const [modalCreer, setModalCreer] = useState(false);

  useEffect(() => {
    void fetchJournal().catch(() => undefined);
    void fetchComptes().catch(() => undefined);
  }, [fetchJournal, fetchComptes]);

  return (
    <div className="space-y-4">
      <PageToolbar
        actionLabel="Saisie manuelle"
        onAction={() => setModalCreer(true)}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {[
                  "Date",
                  "Débit",
                  "Crédit",
                  "Libellé",
                  "Montant",
                  "Origine",
                  "Par",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {journal.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td
                    className="whitespace-nowrap font-mono text-xs"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {e.compteDebit.numero} · {e.compteDebit.intitule}
                  </td>
                  <td
                    className="whitespace-nowrap font-mono text-xs"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {e.compteCredit.numero} · {e.compteCredit.intitule}
                  </td>
                  <td>{e.libelle}</td>
                  <td
                    className="whitespace-nowrap font-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {formatMontant(e.montant)} HTG
                  </td>
                  <td>
                    <Badge
                      tone={
                        e.referenceType === "MANUELLE" ? "neutral" : "brand"
                      }
                    >
                      {e.referenceType === "MANUELLE"
                        ? "Manuelle"
                        : e.referenceType || "—"}
                    </Badge>
                  </td>
                  <td
                    className="whitespace-nowrap"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    {e.utilisateur.prenom} {e.utilisateur.nom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && journal.length === 0 && (
          <EmptyState
            icon={BookText}
            title="Aucune écriture"
            hint="Les écritures automatiques et manuelles apparaîtront ici."
          />
        )}
      </div>

      <Modal
        open={modalCreer}
        onClose={() => setModalCreer(false)}
        title="Nouvelle écriture manuelle"
        maxWidth={600}
      >
        <NouvelleEcritureModal onDone={() => setModalCreer(false)} />
      </Modal>
    </div>
  );
}
