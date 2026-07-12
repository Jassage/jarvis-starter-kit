'use client';
import { useEffect, useState } from 'react';
import { UtensilsCrossed, Send, DoorOpen, Receipt, Plus } from 'lucide-react';
import { useRestaurantStore, TableItem, CategorieMenuItem } from '@/stores/restaurantStore';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

const STATUT_TABLE_TONE: Record<string, 'success' | 'danger' | 'warning'> = {
  LIBRE: 'success',
  OCCUPEE: 'danger',
  RESERVEE: 'warning',
};

const STATUT_TABLE_LABEL: Record<string, string> = {
  LIBRE: 'Libre',
  OCCUPEE: 'Occupée',
  RESERVEE: 'Réservée',
};

const CATEGORIE_LABEL: Record<CategorieMenuItem, string> = {
  ENTREE: 'Entrées',
  PLAT: 'Plats',
  DESSERT: 'Desserts',
  BOISSON: 'Boissons',
  CARTE_BAR: 'Carte bar',
};

export default function PosPage() {
  const { tables, menu, commandeActive, isLoading, fetchTables, fetchMenu, ouvrirOuReprendreCommande, ajouterLigne, envoyerEnCuisine, cloturerCommande, fermerCommandeActive } = useRestaurantStore();
  const [quantites, setQuantites] = useState<Record<string, number>>({});
  const [chambreNumero, setChambreNumero] = useState('');
  const [methode, setMethode] = useState('ESPECES');
  const [modeCloture, setModeCloture] = useState<'folio' | 'direct' | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetchTables();
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOuvrirTable = async (table: TableItem) => {
    try {
      await ouvrirOuReprendreCommande(table);
      setModeCloture(null);
      setErreur('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'ouvrir cette table');
    }
  };

  const handleAjouterLigne = async (menuItemId: string) => {
    const quantite = quantites[menuItemId] || 1;
    try {
      await ajouterLigne({ menuItemId, quantite });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'ajouter cet article');
    }
  };

  const handleEnvoyerCuisine = async () => {
    try {
      await envoyerEnCuisine();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'envoyer en cuisine');
    }
  };

  const handleCloturer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    try {
      if (modeCloture === 'folio') await cloturerCommande({ chambreNumero });
      else await cloturerCommande({ methodePaiement: methode });
      setChambreNumero('');
      setModeCloture(null);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Impossible de clôturer la commande');
    }
  };

  const total = commandeActive?.lignes.reduce((s, l) => s + Number(l.menuItem.prix) * l.quantite, 0) ?? 0;
  const parPointDeVente = tables.reduce<Record<string, TableItem[]>>((acc, t) => {
    (acc[t.pointDeVente.nom] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
      ) : tables.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Aucune table configurée" />
      ) : (
        Object.entries(parPointDeVente).map(([nom, tbls]) => (
          <section key={nom} className="space-y-3">
            <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>{nom.toUpperCase()}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {tbls.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleOuvrirTable(t)}
                  className="card card-hover p-4 text-left"
                  disabled={t.statut === 'RESERVEE' && t.commandes.length === 0}
                >
                  <p className="font-extrabold text-lg" style={{ color: 'var(--color-ink)' }}>{t.numero}</p>
                  <p className="text-xs mb-2" style={{ color: 'var(--color-ink-3)' }}>{t.capacite} pers.</p>
                  <Badge tone={STATUT_TABLE_TONE[t.statut]}>{STATUT_TABLE_LABEL[t.statut]}</Badge>
                </button>
              ))}
            </div>
          </section>
        ))
      )}

      <Modal open={commandeActive !== null} onClose={fermerCommandeActive} title={commandeActive ? `Table ${commandeActive.table.numero}` : ''} maxWidth={640}>
        {commandeActive && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>COMMANDE EN COURS</p>
              {commandeActive.lignes.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun article pour le moment.</p>
              ) : (
                <div className="space-y-1.5">
                  {commandeActive.lignes.map((l) => (
                    <div key={l.id} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--color-ink-2)' }}>{l.quantite}× {l.menuItem.nom}</span>
                      <span style={{ color: 'var(--color-ink)' }}>{(Number(l.menuItem.prix) * l.quantite).toLocaleString('fr-FR')} {l.menuItem.devise}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}>
                    <span>Total</span><span>{total.toLocaleString('fr-FR')} {commandeActive.lignes[0]?.menuItem.devise}</span>
                  </div>
                </div>
              )}
            </div>

            {commandeActive.statut === 'EN_COURS' && (
              <>
                <div>
                  <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>AJOUTER UN ARTICLE</p>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {Object.entries(
                      menu.filter((m) => m.pointDeVenteId === commandeActive.table.pointDeVente.id && m.disponible)
                        .reduce<Record<string, typeof menu>>((acc, m) => { (acc[m.categorie] ||= []).push(m); return acc; }, {})
                    ).map(([cat, items]) => (
                      <div key={cat}>
                        <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-ink-3)' }}>{CATEGORIE_LABEL[cat as CategorieMenuItem]}</p>
                        {items.map((m) => (
                          <div key={m.id} className="flex items-center justify-between py-1">
                            <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{m.nom} — {Number(m.prix).toLocaleString('fr-FR')} {m.devise}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number" min={1} defaultValue={1}
                                className="input" style={{ width: '3.5rem', padding: '0.3rem 0.5rem' }}
                                onChange={(e) => setQuantites((q) => ({ ...q, [m.id]: Number(e.target.value) }))}
                              />
                              <button onClick={() => handleAjouterLigne(m.id)} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleEnvoyerCuisine} disabled={commandeActive.lignes.length === 0} className="btn btn-primary w-full">
                  <Send className="w-4 h-4" />
                  Envoyer en cuisine
                </button>
              </>
            )}

            {commandeActive.statut !== 'PAYEE' && commandeActive.lignes.length > 0 && (
              <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--color-line)' }}>
                <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>CLÔTURE</p>
                <div className="flex gap-2">
                  <button onClick={() => setModeCloture('folio')} className={`btn ${modeCloture === 'folio' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                    <DoorOpen className="w-4 h-4" />
                    Ajouter au folio
                  </button>
                  <button onClick={() => setModeCloture('direct')} className={`btn ${modeCloture === 'direct' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                    <Receipt className="w-4 h-4" />
                    Paiement direct
                  </button>
                </div>

                {modeCloture && (
                  <form onSubmit={handleCloturer} className="flex gap-2">
                    {modeCloture === 'folio' ? (
                      <input required placeholder="Numéro de chambre" className="input" value={chambreNumero} onChange={(e) => setChambreNumero(e.target.value)} />
                    ) : (
                      <select className="input" value={methode} onChange={(e) => setMethode(e.target.value)}>
                        <option value="ESPECES">Espèces</option>
                        <option value="CARTE">Carte</option>
                        <option value="MONCASH">MonCash</option>
                        <option value="AUTRE">Autre</option>
                      </select>
                    )}
                    <button type="submit" className="btn btn-primary">Confirmer</button>
                  </form>
                )}
                {erreur && <div className="p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
