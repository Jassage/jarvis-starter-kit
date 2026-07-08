'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Contenu, ContenuInput, TypeContenu } from '@/stores/contenuStore';
import { useSponsorStore } from '@/stores/sponsorStore';

export default function ContenuModal({
  open, onClose, onSubmit, contenu,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContenuInput) => Promise<void>;
  contenu?: Contenu | null;
}) {
  const { sponsors, fetchSponsors } = useSponsorStore();
  const [form, setForm] = useState({ titre: '', typeContenu: 'VIDEO_BOUCLE' as TypeContenu, urlFichier: '', dureeSecondes: 0, sponsorId: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) fetchSponsors();
  }, [open, fetchSponsors]);

  useEffect(() => {
    if (contenu) {
      setForm({
        titre: contenu.titre,
        typeContenu: contenu.typeContenu,
        urlFichier: contenu.urlFichier,
        dureeSecondes: contenu.dureeSecondes,
        sponsorId: contenu.sponsorId || '',
      });
    } else {
      setForm({ titre: '', typeContenu: 'VIDEO_BOUCLE', urlFichier: '', dureeSecondes: 0, sponsorId: '' });
    }
    setError('');
  }, [contenu, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        titre: form.titre,
        typeContenu: form.typeContenu,
        urlFichier: form.urlFichier,
        dureeSecondes: Number(form.dureeSecondes),
        sponsorId: form.sponsorId || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={contenu ? 'Modifier le contenu' : 'Nouveau contenu'} maxWidth={520}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>TITRE</label>
          <input required className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>TYPE</label>
          <select className="input" value={form.typeContenu} onChange={(e) => setForm({ ...form, typeContenu: e.target.value as TypeContenu })}>
            <option value="VIDEO_BOUCLE">Vidéo boucle</option>
            <option value="SPOT_PUBLICITAIRE">Spot publicitaire</option>
            <option value="HABILLAGE_LOGO">Habillage logo</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>URL DU FICHIER (CDN)</label>
          <input required type="url" className="input font-mono text-xs" value={form.urlFichier} onChange={(e) => setForm({ ...form, urlFichier: e.target.value })} placeholder="https://cdn.example.com/..." />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>DURÉE (SECONDES)</label>
          <input required type="number" min={0} className="input" value={form.dureeSecondes} onChange={(e) => setForm({ ...form, dureeSecondes: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>SPONSOR (si spot ou habillage)</label>
          <select className="input" value={form.sponsorId} onChange={(e) => setForm({ ...form, sponsorId: e.target.value })}>
            <option value="">Aucun</option>
            {sponsors.map((s) => (
              <option key={s.id} value={s.id}>{s.nomSponsor}</option>
            ))}
          </select>
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={submitting} className="btn btn-primary">{contenu ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    </Modal>
  );
}
