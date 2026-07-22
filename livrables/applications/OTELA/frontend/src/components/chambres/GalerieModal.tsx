'use client';
import { useRef, useState } from 'react';
import { Star, Trash2, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useChambresStore, TypeChambre } from '@/stores/chambresStore';

// Galerie photo d'un type de chambre : upload multiple, choix de la photo principale,
// réordonnancement et suppression. Les photos étant portées par le type, elles sont
// partagées par toutes les chambres de ce type et servent le site public.
export default function GalerieModal({ open, onClose, type }: { open: boolean; onClose: () => void; type: TypeChambre | null }) {
  const { ajouterPhotos, modifierPhoto, supprimerPhoto } = useChambresStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!type) return null;
  const photos = [...type.photos].sort((a, b) => a.ordre - b.ordre);

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try { await fn(); }
    catch (e: any) { setError(e.response?.data?.message || 'Opération impossible'); }
    finally { setBusy(false); }
  };

  const handleUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(ev.target.files ?? []);
    if (files.length === 0) return;
    wrap(() => ajouterPhotos(type.id, files)).finally(() => { if (fileRef.current) fileRef.current.value = ''; });
  };

  // Échange l'ordre avec la photo voisine.
  const deplacer = (index: number, sens: -1 | 1) => {
    const voisine = photos[index + sens];
    const courante = photos[index];
    if (!voisine) return;
    wrap(async () => {
      await modifierPhoto(courante.id, { ordre: voisine.ordre });
      await modifierPhoto(voisine.id, { ordre: courante.ordre });
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Photos — ${type.nom}`} maxWidth={560}>
      <div className="space-y-4">
        <div>
          <input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleUpload} />
          <button type="button" className="btn btn-primary w-full" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4" /> {busy ? 'Traitement...' : 'Ajouter des photos'}
          </button>
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        {photos.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--color-ink-3)' }}>Aucune photo. La première ajoutée deviendra la photo principale.</p>
        ) : (
          <div className="space-y-2">
            {photos.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                <img src={p.url} alt={p.legende ?? ''} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  {p.estPrincipale && <span className="badge inline-flex items-center gap-1"><Star className="w-3 h-3" /> Principale</span>}
                  <p className="text-xs truncate mt-1" style={{ color: 'var(--color-ink-3)' }}>{p.legende || 'Sans légende'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" title="Monter" disabled={busy || i === 0} onClick={() => deplacer(i, -1)} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: 'var(--color-ink-2)' }}><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" title="Descendre" disabled={busy || i === photos.length - 1} onClick={() => deplacer(i, 1)} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: 'var(--color-ink-2)' }}><ArrowDown className="w-4 h-4" /></button>
                  {!p.estPrincipale && (
                    <button type="button" title="Définir principale" disabled={busy} onClick={() => wrap(() => modifierPhoto(p.id, { estPrincipale: true }))} className="p-1.5 rounded-lg" style={{ color: 'var(--color-accent)' }}><Star className="w-4 h-4" /></button>
                  )}
                  <button type="button" title="Supprimer" disabled={busy} onClick={() => wrap(() => supprimerPhoto(p.id))} className="p-1.5 rounded-lg" style={{ color: 'var(--color-danger)' }}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
