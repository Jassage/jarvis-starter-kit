'use client';
import { useEffect, useRef, useState } from 'react';
import { Handshake, Pencil, Trash2, Upload, AlertTriangle } from 'lucide-react';
import { useSponsorStore, Sponsor } from '@/stores/sponsorStore';
import { useAuthStore } from '@/stores/authStore';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import SponsorModal from '@/components/sponsors/SponsorModal';

const PACKAGE_LABEL: Record<string, string> = {
  TITRE_MATCH: 'Titre match',
  BANDEAU: 'Bandeau',
  HABILLAGE_PERMANENT: 'Habillage permanent',
};

export default function SponsorsPage() {
  const { sponsors, isLoading, fetchSponsors, createSponsor, updateSponsor, deleteSponsor, uploadLogo } = useSponsorStore();
  const { utilisateur } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [erreur, setErreur] = useState('');
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const canEdit = utilisateur?.role === 'ADMINISTRATEUR';

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const contratsExpirant = sponsors.filter((s) => s.contratExpireBientot);

  const handleDelete = async (s: Sponsor) => {
    if (!confirm(`Supprimer le sponsor "${s.nomSponsor}" ?`)) return;
    setErreur('');
    try {
      await deleteSponsor(s.id);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Suppression impossible');
    }
  };

  const handleLogoChange = async (s: Sponsor, file: File) => {
    setErreur('');
    try {
      await uploadLogo(s.id, file);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Échec de l\'upload du logo');
    }
  };

  return (
    <div className="space-y-5">
      {!canEdit && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--color-info-soft)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <p className="text-sm" style={{ color: 'var(--color-info)' }}>Lecture seule. Seul un administrateur peut modifier les contrats sponsors.</p>
        </div>
      )}

      {contratsExpirant.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--color-warning-soft)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>
            {contratsExpirant.map((s) => s.nomSponsor).join(', ')} — contrat expirant sous 30 jours.
          </p>
        </div>
      )}

      {canEdit && <PageToolbar actionLabel="Nouveau sponsor" onAction={() => { setEditing(null); setModalOpen(true); }} />}

      {erreur && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="py-14 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : sponsors.length === 0 ? (
          <EmptyState icon={Handshake} title="Aucun sponsor" hint="Ajoutez un sponsor pour gérer ses packages publicitaires." />
        ) : (
          <table className="table-shell w-full">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Sponsor</th>
                <th>Package</th>
                <th>Contact</th>
                <th>Contrat</th>
                {canEdit && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt={s.nomSponsor} className="w-9 h-9 rounded-lg object-cover" style={{ background: 'var(--color-surface-2)' }} />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink-3)' }}>
                        <Handshake className="w-4 h-4" />
                      </div>
                    )}
                    {canEdit && (
                      <>
                        <input
                          ref={(el) => { fileInputs.current[s.id] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleLogoChange(s, e.target.files[0])}
                        />
                        <button onClick={() => fileInputs.current[s.id]?.click()} className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                          <Upload className="w-3 h-3" /> Logo
                        </button>
                      </>
                    )}
                  </td>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{s.nomSponsor}</td>
                  <td>{PACKAGE_LABEL[s.typePackage]}</td>
                  <td>{s.contactNom || '—'}{s.contactTelephone ? ` · ${s.contactTelephone}` : ''}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{new Date(s.dateFinContrat).toLocaleDateString('fr-FR')}</span>
                      {s.contratExpire ? (
                        <Badge tone="danger">Expiré</Badge>
                      ) : s.contratExpireBientot ? (
                        <Badge tone="warning">{s.joursRestantsContrat}j restants</Badge>
                      ) : (
                        <Badge tone="success">Actif</Badge>
                      )}
                    </div>
                  </td>
                  {canEdit && (
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <button title="Éditer" onClick={() => { setEditing(s); setModalOpen(true); }} className="p-2 rounded-lg" style={{ color: 'var(--color-ink-2)' }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button title="Supprimer" onClick={() => handleDelete(s)} className="p-2 rounded-lg" style={{ color: 'var(--color-danger)' }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {canEdit && (
        <SponsorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sponsor={editing}
          onSubmit={async (data) => {
            if (editing) await updateSponsor(editing.id, data);
            else await createSponsor(data);
          }}
        />
      )}
    </div>
  );
}
