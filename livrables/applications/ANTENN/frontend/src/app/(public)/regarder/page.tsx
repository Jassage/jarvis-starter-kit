'use client';
import { useEffect, useState } from 'react';
import { Tv } from 'lucide-react';
import HlsPlayer from '@/components/player/HlsPlayer';
import Overlay from '@/components/player/Overlay';
import EpgPanel from '@/components/player/EpgPanel';
import NetworkIndicator from '@/components/player/NetworkIndicator';

interface EpgResponse {
  enCours: any | null;
  aSuivre: any[];
  cdnBaseUrl: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegarderPage() {
  const [epg, setEpg] = useState<EpgResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/epg`);
        const json = await res.json();
        if (!cancelled) setEpg(json.data);
      } catch {
        // Player public : on n'affiche pas d'erreur bloquante si l'EPG est
        // momentanément indisponible, on réessaiera au prochain intervalle.
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const enDirect = epg?.enCours?.typeCreneau === 'MATCH_DIRECT';
  const incrustations = (epg?.enCours?.incrustations || []).filter((i: any) => i.actif);
  const bandeaux = (epg?.enCours?.bandeaux || []).filter((b: any) => b.actif);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Tv className="w-4.5 h-4.5" style={{ color: '#001018' }} />
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-ink)' }}>ANTENN</span>
        </div>
        <NetworkIndicator />
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="relative">
          <HlsPlayer enDirect={enDirect} />
          <Overlay incrustations={incrustations} bandeaux={bandeaux} />
        </div>

        <EpgPanel enCours={epg?.enCours || null} aSuivre={epg?.aSuivre || []} />
      </main>
    </div>
  );
}
