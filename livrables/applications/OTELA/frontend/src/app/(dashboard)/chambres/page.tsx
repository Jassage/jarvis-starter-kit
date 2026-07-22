'use client';
import { useEffect, useState } from 'react';
import { BedDouble, Plus, Wrench, Images, BedSingle } from 'lucide-react';
import { useChambresStore } from '@/stores/chambresStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import TypeChambreModal from '@/components/chambres/TypeChambreModal';
import ChambreModal from '@/components/chambres/ChambreModal';
import TarifModal from '@/components/chambres/TarifModal';
import GalerieModal from '@/components/chambres/GalerieModal';
import type { StatutChambre, TypeChambre } from '@/stores/chambresStore';
import type { BadgeTone } from '@/components/ui/Badge';

const STATUT_CHAMBRE_TONE: Record<StatutChambre, BadgeTone> = {
  DISPONIBLE: 'success',
  RESERVEE: 'info',
  OCCUPEE: 'info',
  MAINTENANCE: 'warning',
  NETTOYAGE_EN_COURS: 'gold',
};

const STATUT_CHAMBRE_LABEL: Record<StatutChambre, string> = {
  DISPONIBLE: 'Disponible',
  RESERVEE: 'Réservée',
  OCCUPEE: 'Occupée',
  MAINTENANCE: 'Maintenance',
  NETTOYAGE_EN_COURS: 'Nettoyage en cours',
};

export default function ChambresPage() {
  const { types, chambres, isLoading, fetchAll, toggleMaintenance } = useChambresStore();
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [chambreModalOpen, setChambreModalOpen] = useState(false);
  const [tarifModalTypeId, setTarifModalTypeId] = useState<string | null>(null);
  const [galerieType, setGalerieType] = useState<TypeChambre | null>(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>TYPES DE CHAMBRES & TARIFS</h2>
          <button onClick={() => setTypeModalOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Type de chambre
          </button>
        </div>

        {isLoading ? (
          <div className="card p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : types.length === 0 ? (
          <div className="card"><EmptyState icon={BedDouble} title="Aucun type de chambre" hint="Créez votre premier type pour commencer à recevoir des réservations." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((t) => {
              const principale = t.photos?.find((p) => p.estPrincipale) ?? t.photos?.[0];
              return (
              <div key={t.id} className="card p-5">
                {principale && (
                  <img src={principale.url} alt={t.nom} className="w-full h-32 object-cover rounded-xl mb-3" />
                )}
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold" style={{ color: 'var(--color-ink)' }}>{t.nom}</p>
                  <Badge tone="brand">max {t.capaciteMax} pers.</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--color-ink-3)' }}>
                  <span className="inline-flex items-center gap-1"><BedSingle className="w-3.5 h-3.5" /> {t.nombreLits} lit{t.nombreLits > 1 ? 's' : ''}</span>
                  {t.superficie != null && <span>{t.superficie} m²</span>}
                  <span className="inline-flex items-center gap-1"><Images className="w-3.5 h-3.5" /> {t.photos?.length ?? 0}</span>
                </div>
                {t.equipements?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {t.equipements.slice(0, 4).map((eq) => <span key={eq} className="badge">{eq}</span>)}
                    {t.equipements.length > 4 && <span className="badge">+{t.equipements.length - 4}</span>}
                  </div>
                )}
                {t.description && <p className="text-xs mb-3" style={{ color: 'var(--color-ink-3)' }}>{t.description}</p>}
                <div className="space-y-1">
                  {t.tarifs.length === 0 ? (
                    <p className="text-xs italic" style={{ color: 'var(--color-danger)' }}>Aucun tarif défini — non réservable</p>
                  ) : t.tarifs.map((tarif) => (
                    <div key={tarif.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}>
                        {tarif.devise}
                        {tarif.typeSejour === 'JOUR' && <Badge tone="gold">forfait jour</Badge>}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>
                        {Number(tarif.montant).toLocaleString('fr-FR')}{tarif.typeSejour === 'JOUR' ? ' / séjour' : ' / nuit'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setTarifModalTypeId(t.id)} className="btn btn-secondary flex-1 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Tarif
                  </button>
                  <button onClick={() => setGalerieType(t)} className="btn btn-secondary flex-1 text-xs">
                    <Images className="w-3.5 h-3.5" /> Photos
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>CHAMBRES</h2>
          <button onClick={() => setChambreModalOpen(true)} className="btn btn-secondary">
            <Plus className="w-4 h-4" />
            Chambre
          </button>
        </div>

        <div className="card overflow-x-auto">
          {chambres.length === 0 ? (
            <EmptyState icon={BedDouble} title="Aucune chambre" />
          ) : (
            <table className="table-shell w-full">
              <thead><tr><th>Numéro</th><th>Type</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {chambres.map((c) => (
                  <tr key={c.id}>
                    <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.numero}</td>
                    <td>{c.typeChambre.nom}</td>
                    <td><Badge tone={STATUT_CHAMBRE_TONE[c.statut]}>{STATUT_CHAMBRE_LABEL[c.statut]}</Badge></td>
                    <td>
                      {(c.statut === 'DISPONIBLE' || c.statut === 'MAINTENANCE') && (
                        <button
                          onClick={() => toggleMaintenance(c.id, c.statut === 'DISPONIBLE')}
                          className="text-xs font-semibold flex items-center gap-1"
                          style={{ color: 'var(--color-ink-2)' }}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          {c.statut === 'DISPONIBLE' ? 'Mettre en maintenance' : 'Remettre en service'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <TypeChambreModal open={typeModalOpen} onClose={() => setTypeModalOpen(false)} />
      <ChambreModal open={chambreModalOpen} onClose={() => setChambreModalOpen(false)} />
      {tarifModalTypeId && (
        <TarifModal open={!!tarifModalTypeId} onClose={() => setTarifModalTypeId(null)} typeChambreId={tarifModalTypeId} />
      )}
      {/* La galerie relit le type depuis le store à jour pour refléter les photos
          ajoutées/supprimées sans se figer sur l'instantané du clic. */}
      <GalerieModal
        open={!!galerieType}
        onClose={() => setGalerieType(null)}
        type={galerieType ? types.find((t) => t.id === galerieType.id) ?? null : null}
      />
    </div>
  );
}
