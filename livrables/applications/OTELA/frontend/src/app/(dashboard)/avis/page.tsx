'use client';
import { useEffect, useState } from 'react';
import { Star, Eye, EyeOff } from 'lucide-react';
import { useAvisStore, Avis } from '@/stores/avisStore';
import { useAuthStore } from '@/stores/authStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

const ROLES_ECRITURE = ['ADMINISTRATEUR_ETABLISSEMENT', 'ADMINISTRATEUR_CHAINE'];

function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className="w-3.5 h-3.5" style={{ color: n <= note ? 'var(--color-accent)' : 'var(--color-line)' }} fill={n <= note ? 'var(--color-accent)' : 'none'} />
      ))}
    </div>
  );
}

function LigneAvis({ avis, peutEcrire }: { avis: Avis; peutEcrire: boolean }) {
  const { moderer } = useAvisStore();
  const [reponse, setReponse] = useState(avis.reponseDirection ?? '');
  const [submitting, setSubmitting] = useState(false);

  const toggleVisible = async () => {
    try {
      await moderer(avis.id, { visible: !avis.visible });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de mettre à jour cet avis');
    }
  };

  const envoyerReponse = async () => {
    if (!reponse.trim()) return;
    setSubmitting(true);
    try {
      await moderer(avis.id, { reponseDirection: reponse });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'enregistrer la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>{avis.etablissement.nom}</p>
          <Etoiles note={avis.note} />
        </div>
        <div className="flex items-center gap-2">
          {!avis.visible && <Badge tone="warning">Masqué</Badge>}
          <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{new Date(avis.createdAt).toLocaleDateString('fr-FR')}</span>
          {peutEcrire && (
            <button onClick={toggleVisible} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
              {avis.visible ? <><EyeOff className="w-3.5 h-3.5" /> Masquer</> : <><Eye className="w-3.5 h-3.5" /> Afficher</>}
            </button>
          )}
        </div>
      </div>
      {avis.commentaire && <p className="text-sm mb-3" style={{ color: 'var(--color-ink-2)' }}>{avis.commentaire}</p>}
      <p className="text-xs mb-3" style={{ color: 'var(--color-ink-3)' }}>Référence : {avis.reservation.reference ?? '—'}</p>

      {peutEcrire ? (
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Répondre à cet avis..."
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
          />
          <button onClick={envoyerReponse} disabled={submitting} className="btn btn-secondary shrink-0">
            {submitting ? '...' : 'Répondre'}
          </button>
        </div>
      ) : (
        avis.reponseDirection && (
          <div className="pl-3 border-l-2" style={{ borderColor: 'var(--color-line)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--color-ink-3)' }}>Réponse de l'établissement</p>
            <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{avis.reponseDirection}</p>
          </div>
        )
      )}
    </div>
  );
}

export default function AvisPage() {
  const { avis, isLoading, fetchAvis } = useAvisStore();
  const { employe } = useAuthStore();
  const peutEcrire = employe ? ROLES_ECRITURE.includes(employe.role) : false;

  useEffect(() => {
    fetchAvis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
      ) : avis.length === 0 ? (
        <EmptyState icon={Star} title="Aucun avis pour le moment" hint="Les avis apparaissent ici après soumission par un client depuis Ma réservation." />
      ) : (
        avis.map((a) => <LigneAvis key={a.id} avis={a} peutEcrire={peutEcrire} />)
      )}
    </div>
  );
}
