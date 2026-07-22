'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useEmployesStore } from '@/stores/employesStore';
import { useEtablissementsStore } from '@/stores/etablissementsStore';
import type { RoleEmploye } from '@/lib/api';

const ROLE_LABEL: Record<RoleEmploye, string> = {
  RECEPTION: 'Réception',
  MENAGE: 'Ménage',
  SERVEUR: 'Serveur',
  MAINTENANCE: 'Maintenance',
  COMPTABLE: 'Comptable',
  PROPRIETAIRE: 'Propriétaire',
  ADMINISTRATEUR_ETABLISSEMENT: 'Directeur',
  ADMINISTRATEUR_CHAINE: 'Super administrateur',
};

// Rôles rattachés à la chaîne (sans établissement). Miroir de ROLES_CHAINE côté
// backend : seul un admin chaîne peut les créer, et ils n'ont pas d'établissement.
const ROLES_CHAINE: RoleEmploye[] = ['ADMINISTRATEUR_CHAINE', 'PROPRIETAIRE'];

export default function EmployeModal({ open, onClose, estChaine }: { open: boolean; onClose: () => void; estChaine: boolean }) {
  const { creer } = useEmployesStore();
  const { etablissements } = useEtablissementsStore();
  const rolesDisponibles: RoleEmploye[] = estChaine
    ? ['RECEPTION', 'MENAGE', 'SERVEUR', 'MAINTENANCE', 'COMPTABLE', 'ADMINISTRATEUR_ETABLISSEMENT', 'PROPRIETAIRE', 'ADMINISTRATEUR_CHAINE']
    : ['RECEPTION', 'MENAGE', 'SERVEUR', 'MAINTENANCE', 'COMPTABLE', 'ADMINISTRATEUR_ETABLISSEMENT'];

  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'RECEPTION' as RoleEmploye, etablissementId: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const besoinEtablissement = estChaine && !ROLES_CHAINE.includes(form.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (besoinEtablissement && !form.etablissementId) {
      setError('Sélectionnez un établissement pour ce rôle');
      return;
    }
    setSubmitting(true);
    try {
      await creer({
        nom: form.nom,
        email: form.email,
        password: form.password,
        role: form.role,
        etablissementId: ROLES_CHAINE.includes(form.role) ? null : (form.etablissementId || undefined),
      });
      onClose();
      setForm({ nom: '', email: '', password: '', role: 'RECEPTION', etablissementId: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer cet employé');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvel employé" maxWidth={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Nom complet" className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="text" minLength={8} placeholder="Mot de passe temporaire (8 caractères min.)" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Rôle</label>
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as RoleEmploye })}>
            {rolesDisponibles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </div>

        {besoinEtablissement && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Établissement</label>
            <select required className="input" value={form.etablissementId} onChange={(e) => setForm({ ...form, etablissementId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {etablissements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
        )}

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Création...' : 'Créer l\'employé'}</button>
      </form>
    </Modal>
  );
}
