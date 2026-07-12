'use client';
import { useEffect } from 'react';
import { ChefHat, Check } from 'lucide-react';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useRoomServiceStore } from '@/stores/roomServiceStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

export default function CuisinePage() {
  const { commandesCuisine, fetchCommandesCuisine, marquerServie } = useRestaurantStore();
  const { commandesCuisine: commandesRoomService, fetchCommandesCuisine: fetchCommandesRoomService, marquerLivree } = useRoomServiceStore();

  const fetchTout = () => {
    fetchCommandesCuisine();
    fetchCommandesRoomService();
  };

  useEffect(() => {
    fetchTout();
    const interval = setInterval(fetchTout, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServir = async (commandeId: string) => {
    try {
      await marquerServie(commandeId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de marquer cette commande servie');
    }
  };

  const handleLivrer = async (commandeId: string) => {
    try {
      await marquerLivree(commandeId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de marquer cette commande livrée');
    }
  };

  const total = commandesCuisine.length + commandesRoomService.length;

  return (
    <div className="space-y-4">
      {total === 0 ? (
        <EmptyState icon={ChefHat} title="Aucune commande en attente" hint="Les commandes envoyées en cuisine depuis le POS ou le room service apparaîtront ici." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commandesCuisine.map((c) => (
            <div key={c.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-extrabold" style={{ color: 'var(--color-ink)' }}>{c.table.pointDeVente.nom} — Table {c.table.numero}</p>
                <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{new Date(c.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="space-y-1">
                {c.lignes.map((l) => (
                  <p key={l.id} className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                    {l.quantite}× {l.menuItem.nom}{l.notes ? ` (${l.notes})` : ''}
                  </p>
                ))}
              </div>
              <button onClick={() => handleServir(c.id)} className="btn btn-primary w-full">
                <Check className="w-4 h-4" />
                Marquer servie
              </button>
            </div>
          ))}

          {commandesRoomService.map((c) => (
            <div key={c.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold" style={{ color: 'var(--color-ink)' }}>Chambre {c.chambre.numero}</p>
                  <Badge tone="brand">Room service</Badge>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{new Date(c.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="space-y-1">
                {c.lignes.map((l) => (
                  <p key={l.id} className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                    {l.quantite}× {l.menuItem.nom}{l.notes ? ` (${l.notes})` : ''}
                  </p>
                ))}
              </div>
              <button onClick={() => handleLivrer(c.id)} className="btn btn-primary w-full">
                <Check className="w-4 h-4" />
                Marquer livrée
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
