'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Tv, CalendarDays, History } from 'lucide-react';
import HlsPlayer from '@/components/player/HlsPlayer';
import Overlay from '@/components/player/Overlay';
import EpgPanel from '@/components/player/EpgPanel';
import NetworkIndicator from '@/components/player/NetworkIndicator';
import { pingAudience, INTERVALLE_PING_MS } from '@/lib/audience';

interface EpgResponse {
  enCours: any | null;
  aSuivre: any[];
  cdnBaseUrl: string | null;
  configChaine: { nomChaine: string; logoUrl: string; logoPosition: any; logoOpacite: number } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegarderPage() {
  const [epg, setEpg] = useState<EpgResponse | null>(null);

  const [cancelled, setCancelled] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/epg`);
      const json = await res.json();
      if (!cancelled) setEpg(json.data);
    } catch {
      // Player public : on n'affiche pas d'erreur bloquante si l'EPG est
      // momentanément indisponible, on réessaiera au prochain intervalle.
    }
  }, [cancelled]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => { setCancelled(true); clearInterval(interval); };
  }, [load]);

  // Bascule à la seconde près. Le rafraîchissement périodique seul afficherait le
  // programme suivant avec jusqu'à 30 s de retard sur ce que le téléspectateur voit
  // réellement à l'écran : on programme en plus un rechargement à l'heure de fin
  // annoncée du programme courant, qu'on connaît déjà.
  const finEnCours: string | undefined = epg?.enCours?.dateHeureFin;
  useEffect(() => {
    if (!finEnCours) return;
    const delai = new Date(finEnCours).getTime() - Date.now();
    if (delai <= 0 || delai > 6 * 60 * 60 * 1000) return;
    const t = setTimeout(load, delai + 500);
    return () => clearTimeout(t);
  }, [finEnCours, load]);

  // Heartbeat d'audience : seule source du rapport sponsor. Le contenu de repli n'a
  // pas de créneau (`id: null`) et n'est donc pas compté — il ne relève d'aucun
  // contrat, c'est un bouche-trou d'antenne.
  const creneauEnCoursId: string | null = epg?.enCours?.id ?? null;
  useEffect(() => {
    if (!creneauEnCoursId) return;
    pingAudience({ creneauId: creneauEnCoursId });
    const t = setInterval(() => pingAudience({ creneauId: creneauEnCoursId }), INTERVALLE_PING_MS);
    return () => clearInterval(t);
  }, [creneauEnCoursId]);

  const enDirect = epg?.enCours?.typeCreneau === 'MATCH_DIRECT';
  const estRepli = !!epg?.enCours?.estRepli;
  const incrustations = (epg?.enCours?.incrustations || []).filter((i: any) => i.actif);
  const bandeaux = (epg?.enCours?.bandeaux || []).filter((b: any) => b.actif);
  const logoChaine = epg?.configChaine || null;
  const nomChaine = epg?.configChaine?.nomChaine || 'ANTENN';

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Tv className="w-4.5 h-4.5" style={{ color: '#001018' }} />
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-ink)' }}>{nomChaine}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/replay" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            <History className="w-4 h-4" /> Replay
          </Link>
          <Link href="/guide" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            <CalendarDays className="w-4 h-4" /> Guide des programmes
          </Link>
          <NetworkIndicator />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="relative">
          <HlsPlayer enDirect={enDirect} estRepli={estRepli} />
          <Overlay incrustations={incrustations} bandeaux={bandeaux} logoChaine={logoChaine} />
        </div>

        <EpgPanel enCours={epg?.enCours || null} aSuivre={epg?.aSuivre || []} />
      </main>
    </div>
  );
}
