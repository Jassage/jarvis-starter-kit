'use client';
import { useEffect, useState } from 'react';
import { BedDouble, Send, Receipt } from 'lucide-react';
import { useRoomServiceStore } from '@/stores/roomServiceStore';
import { useRestaurantStore, CategorieMenuItem } from '@/stores/restaurantStore';
import { useChambresStore } from '@/stores/chambresStore';
import Modal from '@/components/ui/Modal';

const CATEGORIE_LABEL: Record<CategorieMenuItem, string> = {
  ENTREE: 'Entrées',
  PLAT: 'Plats',
  DESSERT: 'Desserts',
  BOISSON: 'Boissons',
  CARTE_BAR: 'Carte bar',
};

export default function RoomServicePage() {
  const { commandeActive, ouvrirCommande, ajouterLigne, envoyerEnCuisine, cloturerCommande, fermerCommandeActive } = useRoomServiceStore();
  const { menu, fetchMenu } = useRestaurantStore();
  const { chambres, fetchAll } = useChambresStore();
  const [chambreId, setChambreId] = useState('');
  const [quantites, setQuantites] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenu();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chambresOccupees = chambres.filter((c) => c.statut === 'OCCUPEE');

  const handleOuvrir = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await ouvrirCommande(chambreId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible d\'ouvrir une commande pour cette chambre');
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

  const handleFacturer = async () => {
    try {
      await cloturerCommande();
      setChambreId('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de facturer cette commande au folio');
    }
  };

  const total = commandeActive?.lignes.reduce((s, l) => s + Number(l.menuItem.prix) * l.quantite, 0) ?? 0;

  return (
    <div className="space-y-6">
      <form onSubmit={handleOuvrir} className="card p-5 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Chambre</label>
          <select required className="input" value={chambreId} onChange={(e) => setChambreId(e.target.value)}>
            <option value="">Chambre occupée...</option>
            {chambresOccupees.map((c) => <option key={c.id} value={c.id}>{c.typeChambre.nom} — {c.numero}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary"><BedDouble className="w-4 h-4" />Nouvelle commande</button>
        {error && <div className="w-full p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
      </form>

      <Modal open={commandeActive !== null} onClose={fermerCommandeActive} title={commandeActive ? `Chambre ${commandeActive.chambre.numero}` : ''} maxWidth={640}>
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
                      menu.filter((m) => m.disponible).reduce<Record<string, typeof menu>>((acc, m) => { (acc[m.categorie] ||= []).push(m); return acc; }, {})
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
                              <button onClick={() => handleAjouterLigne(m.id)} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>+</button>
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

            {commandeActive.statut !== 'EN_COURS' && commandeActive.statut !== 'PAYEE' && commandeActive.lignes.length > 0 && (
              <button onClick={handleFacturer} className="btn btn-primary w-full">
                <Receipt className="w-4 h-4" />
                Facturer au folio de la chambre
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
