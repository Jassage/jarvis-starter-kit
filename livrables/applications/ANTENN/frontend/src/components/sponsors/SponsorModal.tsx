'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Sponsor, SponsorInput, TypePackageSponsor } from '@/stores/sponsorStore';

function toDateInput(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export default function SponsorModal({
  open, onClose, onSubmit, sponsor,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SponsorInput) => Promise<void>;
  sponsor?: Sponsor | null;
}) {
  const [form, setForm] = useState({
    nomSponsor: '', typePackage: 'BANDEAU' as TypePackageSponsor, contactNom: '', contactTelephone: '', dateDebutContrat: '', dateFinContrat: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sponsor) {
      setForm({
        nomSponsor: sponsor.nomSponsor,
        typePackage: sponsor.typePackage,
        contactNom: sponsor.contactNom || '',
        contactTelephone: sponsor.contactTelephone || '',
        dateDebutContrat: toDateInput(sponsor.dateDebutContrat),
        dateFinContrat: toDateInput(sponsor.dateFinContrat),
      });
    } else {
      setForm({ nomSponsor: '', typePackage: 'BANDEAU', contactNom: '', contactTelephone: '', dateDebutContrat: '', dateFinContrat: '' });
    }
    setError('');
  }, [sponsor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        nomSponsor: form.nomSponsor,
        typePackage: form.typePackage,
        contactNom: form.contactNom || null,
        contactTelephone: form.contactTelephone || null,
        dateDebutContrat: new Date(form.dateDebutContrat).toISOString(),
        dateFinContrat: new Date(form.dateFinContrat).toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={sponsor ? 'Modifier le sponsor' : 'Nouveau sponsor'} maxWidth={520}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>NOM DU SPONSOR</label>
          <input required className="input" value={form.nomSponsor} onChange={(e) => setForm({ ...form, nomSponsor: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>TYPE DE PACKAGE</label>
          <select className="input" value={form.typePackage} onChange={(e) => setForm({ ...form, typePackage: e.target.value as TypePackageSponsor })}>
            <option value="TITRE_MATCH">Titre match</option>
            <option value="BANDEAU">Bandeau</option>
            <option value="HABILLAGE_PERMANENT">Habillage permanent</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>CONTACT</label>
            <input className="input" value={form.contactNom} onChange={(e) => setForm({ ...form, contactNom: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>TÉLÉPHONE</label>
            <input className="input" value={form.contactTelephone} onChange={(e) => setForm({ ...form, contactTelephone: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>DÉBUT CONTRAT</label>
            <input type="date" required className="input" value={form.dateDebutContrat} onChange={(e) => setForm({ ...form, dateDebutContrat: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>FIN CONTRAT</label>
            <input type="date" required className="input" value={form.dateFinContrat} onChange={(e) => setForm({ ...form, dateFinContrat: e.target.value })} />
          </div>
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={submitting} className="btn btn-primary">{sponsor ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    </Modal>
  );
}
