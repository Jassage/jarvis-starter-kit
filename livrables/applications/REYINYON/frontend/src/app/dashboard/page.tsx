'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Users, Lock, ArrowRight } from 'lucide-react';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge, { BadgeTone } from '@/components/ui/Badge';
import CreerReunionModal from '@/components/reunions/CreerReunionModal';
import { listerMesReunions, Reunion } from '@/lib/reunions';

const STATUT_LABEL: Record<string, string> = { PLANIFIEE: 'Planifiée', EN_COURS: 'En cours', TERMINEE: 'Terminée' };
const STATUT_TONE: Record<string, BadgeTone> = { PLANIFIEE: 'brand', EN_COURS: 'success', TERMINEE: 'neutral' };

export default function DashboardPage() {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const charger = () => {
    setLoading(true);
    listerMesReunions().then(setReunions).finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>Mes réunions</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-2)' }}>Créez une réunion et partagez le lien avec vos participants.</p>
      </div>

      <PageToolbar actionLabel="Nouvelle réunion" onAction={() => setModalOpen(true)} />

      {loading ? (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
      ) : reunions.length === 0 ? (
        <div className="card">
          <EmptyState icon={Video} title="Aucune réunion pour le moment" hint="Créez votre première réunion pour obtenir un lien à partager." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3.5">
          {reunions.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/reunions/${r.codeReunion}`}
              className="card card-hover group p-4.5 flex items-center gap-3.5"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--gradient-mint)', boxShadow: '0 8px 20px rgba(34,211,172,0.25)' }}
              >
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{r.titre}</p>
                <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--color-ink-3)' }}>
                  <Users className="w-3 h-3" /> {r._count?.participants ?? 0} participant(s)
                  {r.verrouillee && (
                    <>
                      <Lock className="w-3 h-3 ml-1.5" /> Verrouillée
                    </>
                  )}
                </p>
              </div>
              <Badge tone={STATUT_TONE[r.statut]}>{STATUT_LABEL[r.statut]}</Badge>
              <ArrowRight
                className="w-4 h-4 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-60 group-hover:translate-x-0"
                style={{ color: 'var(--color-ink-3)' }}
              />
            </Link>
          ))}
        </div>
      )}

      <CreerReunionModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); charger(); }} />
    </div>
  );
}
