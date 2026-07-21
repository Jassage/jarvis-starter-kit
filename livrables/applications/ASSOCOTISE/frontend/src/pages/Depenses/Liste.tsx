import { useEffect, useMemo, useState } from 'react';
import { Receipt, FileText, Pencil, Ban, RotateCcw } from 'lucide-react';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Field';
import { DepenseModal } from '../../components/depenses/DepenseModal';
import { useAuth } from '../../contexts/AuthContext';
import { ecouterDepenses, annulerDepense } from '../../services/depenses.service';
import { formatDate, formatMontant } from '../../lib/format';
import type { CategorieDepense, Depense } from '../../types';

const labelCategorie: Record<CategorieDepense, string> = {
  materiel: 'Matériel',
  logistique: 'Logistique',
  administratif: 'Administratif',
  projet_business: 'Projet business',
  autre: 'Autre',
};

export function DepensesListe() {
  const { profil } = useAuth();
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [filtreCategorie, setFiltreCategorie] = useState<'toutes' | CategorieDepense>('toutes');
  const [modalOuverte, setModalOuverte] = useState(false);
  const [depenseEnEdition, setDepenseEnEdition] = useState<Depense | undefined>(undefined);

  useEffect(() => ecouterDepenses(setDepenses), []);

  const depensesFiltrees = useMemo(
    () => depenses.filter((d) => filtreCategorie === 'toutes' || d.categorie === filtreCategorie),
    [depenses, filtreCategorie]
  );

  const totalMois = useMemo(() => {
    const moisCourant = new Date().toISOString().slice(0, 7);
    return depenses
      .filter((d) => !d.annulee && d.date.startsWith(moisCourant))
      .reduce((sum, d) => sum + d.montant, 0);
  }, [depenses]);

  function ouvrirCreation() {
    setDepenseEnEdition(undefined);
    setModalOuverte(true);
  }

  function ouvrirEdition(d: Depense) {
    setDepenseEnEdition(d);
    setModalOuverte(true);
  }

  async function onAnnuler(d: Depense) {
    if (!profil) return;
    if (d.annulee) {
      await annulerDepense(d.id, false, profil.id);
      return;
    }
    if (!confirm('Annuler cette dépense ? Elle restera visible mais ne comptera plus dans les totaux.')) return;
    await annulerDepense(d.id, true, profil.id);
  }

  return (
    <div className="space-y-4">
      <PageToolbar
        actionLabel="Nouvelle dépense"
        onAction={ouvrirCreation}
        extra={
          <Select
            value={filtreCategorie}
            onChange={(e) => setFiltreCategorie(e.target.value as typeof filtreCategorie)}
            className="max-w-xs"
          >
            <option value="toutes">Toutes les catégories</option>
            {Object.entries(labelCategorie).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        }
      />

      <Card className="p-4">
        <p className="text-xs text-[var(--color-muted)]">Dépenses ce mois-ci</p>
        <p className="text-lg font-semibold text-[var(--color-danger)]">{formatMontant(totalMois)}</p>
      </Card>

      {depensesFiltrees.length === 0 ? (
        <EmptyState icon={<Receipt size={32} />} title="Aucune dépense enregistrée" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Description</Th>
              <Th className="hidden sm:table-cell">Catégorie</Th>
              <Th className="hidden sm:table-cell">Date</Th>
              <Th>Montant</Th>
              <Th className="hidden sm:table-cell">Justificatif</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {depensesFiltrees.map((d) => (
              <Tr key={d.id}>
                <Td className="font-medium text-[var(--color-ink)]">
                  <span className={d.annulee ? 'text-[var(--color-muted)] line-through' : ''}>{d.description}</span>
                  {d.annulee && (
                    <Badge tone="neutral" >
                      Annulée
                    </Badge>
                  )}
                </Td>
                <Td className="hidden sm:table-cell">{labelCategorie[d.categorie]}</Td>
                <Td className="hidden sm:table-cell">{formatDate(d.date)}</Td>
                <Td className={d.annulee ? 'text-[var(--color-muted)] line-through' : ''}>
                  {formatMontant(d.montant)}
                </Td>
                <Td className="hidden sm:table-cell">
                  {d.justificatifUrl ? (
                    <a
                      href={d.justificatifUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-[var(--color-brand)] hover:underline"
                    >
                      <FileText size={14} /> Voir
                    </a>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)]">—</span>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => ouvrirEdition(d)}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
                    >
                      <Pencil size={13} /> Modifier
                    </button>
                    <button
                      onClick={() => onAnnuler(d)}
                      className={`flex items-center gap-1 text-xs font-medium hover:underline ${
                        d.annulee ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                      }`}
                    >
                      {d.annulee ? (
                        <>
                          <RotateCcw size={13} /> Réactiver
                        </>
                      ) : (
                        <>
                          <Ban size={13} /> Annuler
                        </>
                      )}
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {modalOuverte && (
        <DepenseModal open={modalOuverte} onClose={() => setModalOuverte(false)} depense={depenseEnEdition} />
      )}
    </div>
  );
}
