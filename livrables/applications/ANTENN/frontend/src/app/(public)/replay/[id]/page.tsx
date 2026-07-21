'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Tv, ChevronLeft, Eye, Trophy, PlayCircle } from 'lucide-react';
import VodPlayer from '@/components/player/VodPlayer';
import Overlay from '@/components/player/Overlay';
import Badge from '@/components/ui/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DetailReplay {
  replay: {
    id: string;
    titre: string;
    description: string | null;
    urlVod: string;
    vignetteUrl: string | null;
    dureeSecondes: number;
    nombreVues: number;
    matchId: string | null;
    creneau: { dateHeureDebut: string; dateHeureFin: string } | null;
    match: { nomEvenement: string; equipes: string } | null;
  };
  incrustations: Array<{ id: string; logoUrl: string; position: any; opacite: number; sponsor?: { nomSponsor: string } }>;
  bandeaux: Array<{ id: string; items: Array<{ texte: string }>; vitesseDefilement: number }>;
  configChaine: { nomChaine: string; logoUrl: string; logoPosition: any; logoOpacite: number } | null;
}

export default function ReplayLecturePage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<DetailReplay | null>(null);
  const [introuvable, setIntrouvable] = useState(false);
  // Une seule vue comptée par visionnage, même si le spectateur met en pause et
  // relance la lecture plusieurs fois.
  const vueComptee = useRef(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/replay/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => setDetail(j.data))
      .catch(() => setIntrouvable(true));
  }, [id]);

  function compterVue() {
    if (vueComptee.current || !id) return;
    vueComptee.current = true;
    fetch(`${API_URL}/replay/${id}/vue`, { method: 'POST' }).catch(() => {});
  }

  const nomChaine = detail?.configChaine?.nomChaine || 'ANTENN';
  const r = detail?.replay;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <Link href="/replay" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Tv className="w-4.5 h-4.5" style={{ color: '#001018' }} />
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-ink)' }}>{nomChaine}</span>
        </Link>
        <Link href="/regarder" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          <PlayCircle className="w-4 h-4" /> Regarder le direct
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8">
        <Link href="/replay" className="inline-flex items-center gap-1 text-sm font-semibold mb-4" style={{ color: 'var(--color-ink-2)' }}>
          <ChevronLeft className="w-4 h-4" /> Retour au catalogue
        </Link>

        {introuvable && (
          <div className="card p-8 text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Replay indisponible</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>
              Ce programme n&apos;est plus disponible en rattrapage.
            </p>
          </div>
        )}

        {r && (
          <>
            <div className="relative">
              <VodPlayer src={r.urlVod} poster={r.vignetteUrl} onDemarrage={compterVue} />
              {/* Habillage rejoué : logo de chaîne + incrustations/bandeaux du créneau
                  d'origine, relus au moment du visionnage (un contrat sponsor arrêté
                  disparaît donc aussi des replays). */}
              <Overlay
                incrustations={detail.incrustations}
                bandeaux={detail.bandeaux}
                logoChaine={detail.configChaine}
              />
            </div>

            <div className="mt-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>{r.titre}</h1>
                {r.match && (
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-2)' }}>{r.match.equipes}</p>
                )}
                <div className="flex items-center gap-3 text-xs mt-2" style={{ color: 'var(--color-ink-3)' }}>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {r.nombreVues} vue(s)</span>
                  {r.creneau && (
                    <span>
                      Diffusé le {new Date(r.creneau.dateHeureDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      {' à '}
                      {new Date(r.creneau.dateHeureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              <Badge tone={r.matchId ? 'live' : 'brand'}>
                {r.matchId ? <><Trophy className="w-3 h-3" /> Match</> : 'Programme'}
              </Badge>
            </div>

            {r.description && (
              <p className="text-sm mt-4" style={{ color: 'var(--color-ink-2)' }}>{r.description}</p>
            )}

            {detail.incrustations.length > 0 && (
              <p className="text-xs mt-5" style={{ color: 'var(--color-ink-3)' }}>
                Avec le soutien de {detail.incrustations.map((i) => i.sponsor?.nomSponsor).filter(Boolean).join(', ')}.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
