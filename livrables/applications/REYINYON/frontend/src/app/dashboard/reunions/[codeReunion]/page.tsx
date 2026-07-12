'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, Lock, Unlock, Play, Square, ArrowLeft, Download, Video as VideoIcon } from 'lucide-react';
import Badge, { BadgeTone } from '@/components/ui/Badge';
import InvitationWhatsapp from '@/components/reunions/InvitationWhatsapp';
import { obtenirDetailHote, verrouillerReunion, terminerReunion } from '@/lib/reunions';
import { listerEnregistrements, Enregistrement } from '@/lib/enregistrements';

const STATUT_LABEL: Record<string, string> = { PLANIFIEE: 'Planifiée', EN_COURS: 'En cours', TERMINEE: 'Terminée' };
const STATUT_TONE: Record<string, BadgeTone> = { PLANIFIEE: 'brand', EN_COURS: 'success', TERMINEE: 'neutral' };

// Les fichiers d'enregistrement sont servis par le BACKEND (/recordings/...),
// pas par le frontend — NEXT_PUBLIC_API_URL pointe vers .../api, on retire ce
// suffixe pour retrouver l'origine du backend.
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');

type Detail = Awaited<ReturnType<typeof obtenirDetailHote>>;

export default function DetailReunionPage() {
  const params = useParams<{ codeReunion: string }>();
  const [reunion, setReunion] = useState<Detail | null>(null);
  const [copie, setCopie] = useState(false);
  const [lienReunion, setLienReunion] = useState('');
  const [enregistrements, setEnregistrements] = useState<Enregistrement[]>([]);

  const charger = () => {
    obtenirDetailHote(params.codeReunion).then(setReunion);
    listerEnregistrements(params.codeReunion).then(setEnregistrements).catch(() => {});
  };

  useEffect(() => {
    charger();
    setLienReunion(`${window.location.origin}/rejoindre/${params.codeReunion}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.codeReunion]);

  if (!reunion) {
    return <div className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>;
  }

  const copierLien = async () => {
    await navigator.clipboard.writeText(lienReunion);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const toggleVerrouillage = async () => {
    await verrouillerReunion(reunion.codeReunion, !reunion.verrouillee);
    charger();
  };

  const terminer = async () => {
    if (!confirm('Terminer la réunion pour tous les participants ?')) return;
    await terminerReunion(reunion.codeReunion);
    charger();
  };

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>{reunion.titre}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge tone={STATUT_TONE[reunion.statut]}>{STATUT_LABEL[reunion.statut]}</Badge>
            {reunion.salleAttenteActive && <Badge tone="violet">Salle d&apos;attente activée</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {reunion.statut !== 'TERMINEE' && (
            <Link href={`/rejoindre/${reunion.codeReunion}`} className="btn btn-mint">
              <Play className="w-4 h-4" /> Rejoindre
            </Link>
          )}
          {reunion.statut !== 'TERMINEE' && (
            <button onClick={terminer} className="btn btn-danger">
              <Square className="w-4 h-4" /> Terminer
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>Lien de la réunion</h3>
          <div className="flex gap-2">
            <input readOnly className="input" value={lienReunion} onFocus={(e) => e.target.select()} />
            <button onClick={copierLien} className="btn btn-secondary shrink-0">
              {copie ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {reunion.codeAcces && (
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
              Code d&apos;accès : <span className="font-mono font-semibold">{reunion.codeAcces}</span>
            </p>
          )}
          <button onClick={toggleVerrouillage} className="btn btn-secondary w-full">
            {reunion.verrouillee ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {reunion.verrouillee ? 'Déverrouiller la réunion' : 'Verrouiller la réunion'}
          </button>
        </div>

        <InvitationWhatsapp
          titre={reunion.titre}
          lienReunion={lienReunion}
          codeAcces={reunion.codeAcces}
          numeroDialIn={reunion.numeroDialIn}
          codeTelephone={reunion.codeTelephone}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--color-line-2)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>Participants ({reunion.participants.length})</h3>
        </div>
        {reunion.participants.length === 0 ? (
          <p className="p-5 text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun participant n&apos;a encore rejoint.</p>
        ) : (
          <ul>
            {reunion.participants.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 border-t first:border-t-0" style={{ borderColor: 'var(--color-line-2)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{p.nomAffiche}</span>
                <Badge tone={p.dateHeureSortie ? 'neutral' : 'success'}>{p.dateHeureSortie ? 'Parti' : 'Présent'}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {enregistrements.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--color-line-2)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>Enregistrements ({enregistrements.length})</h3>
          </div>
          <ul>
            {enregistrements.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-5 py-3 border-t first:border-t-0" style={{ borderColor: 'var(--color-line-2)' }}>
                <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  <VideoIcon className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                  {new Date(e.createdAt).toLocaleString('fr-FR')}
                </span>
                {e.urlFichier && (
                  <a href={`${BACKEND_ORIGIN}${e.urlFichier}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    <Download className="w-4 h-4" /> Télécharger
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
