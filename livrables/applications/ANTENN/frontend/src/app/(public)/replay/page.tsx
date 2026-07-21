'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tv, PlayCircle, Search, Film, Trophy, Eye, CalendarDays } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ReplayCarte {
  id: string;
  titre: string;
  description: string | null;
  vignetteUrl: string | null;
  dureeSecondes: number;
  nombreVues: number;
  publieAt: string | null;
  matchId: string | null;
  creneau: { dateHeureDebut: string } | null;
}

function formatDuree(secondes: number) {
  const h = Math.floor(secondes / 3600);
  const m = Math.round((secondes % 3600) / 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function ReplayCataloguePage() {
  const [replays, setReplays] = useState<ReplayCarte[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [type, setType] = useState<'' | 'MATCH' | 'PROGRAMME'>('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    // Recherche débouncée : le catalogue est public, inutile de marteler l'API à
    // chaque frappe.
    const timer = setTimeout(async () => {
      setChargement(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (type) params.set('type', type);
        const res = await fetch(`${API_URL}/replay?${params.toString()}`);
        const json = await res.json();
        if (!annule) {
          setReplays(json.data.replays);
          setTotal(json.data.total);
        }
      } catch {
        // Page publique : pas d'erreur bloquante, le catalogue restera simplement vide.
      } finally {
        if (!annule) setChargement(false);
      }
    }, 280);
    return () => { annule = true; clearTimeout(timer); };
  }, [q, type]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Tv className="w-4.5 h-4.5" style={{ color: '#001018' }} />
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-ink)' }}>Replay</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/guide" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            <CalendarDays className="w-4 h-4" /> Guide
          </Link>
          <Link href="/regarder" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            <PlayCircle className="w-4 h-4" /> Regarder le direct
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Replay</h1>
        <p className="text-sm mb-5" style={{ color: 'var(--color-ink-3)' }}>
          Revoyez à la demande les programmes déjà passés à l&apos;antenne.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative sm:max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-ink-3)' }} />
            <input
              className="input pl-10"
              placeholder="Rechercher un programme..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {([['', 'Tout'], ['PROGRAMME', 'Programmes'], ['MATCH', 'Matchs']] as const).map(([valeur, label]) => (
              <button
                key={label}
                onClick={() => setType(valeur)}
                className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors"
                style={type === valeur
                  ? { background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }
                  : { background: 'var(--color-surface-2)', color: 'var(--color-ink-2)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!chargement && replays.length === 0 && (
          <div className="card p-8 text-center">
            <Film className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-ink-3)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Aucun replay disponible</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>
              Les programmes publiés en rattrapage apparaîtront ici.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {replays.map((r) => (
            <Link key={r.id} href={`/replay/${r.id}`} className="card overflow-hidden group">
              <div className="relative aspect-video flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }}>
                {r.vignetteUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.vignetteUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Film className="w-8 h-8" style={{ color: 'var(--color-ink-3)' }} />
                )}
                <span
                  className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                >
                  {formatDuree(r.dureeSecondes)}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-ink)' }}>{r.titre}</p>
                  <Badge tone={r.matchId ? 'live' : 'brand'}>
                    {r.matchId ? <><Trophy className="w-3 h-3" /> Match</> : 'Programme'}
                  </Badge>
                </div>
                {r.description && (
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--color-ink-3)' }}>{r.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-ink-3)' }}>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {r.nombreVues}</span>
                  {r.creneau && <span>Diffusé le {formatDate(r.creneau.dateHeureDebut)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {total > replays.length && (
          <p className="text-xs text-center mt-6" style={{ color: 'var(--color-ink-3)' }}>
            {replays.length} replay(s) affiché(s) sur {total}.
          </p>
        )}
      </main>
    </div>
  );
}
