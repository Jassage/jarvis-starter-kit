'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tv, Radio, PlayCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreneauGuide {
  id: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  typeCreneau: 'PROGRAMME' | 'MATCH_DIRECT' | 'PUB';
  contenu?: { titre: string } | null;
  match?: { nomEvenement: string; equipes: string } | null;
}
interface JourGuide { date: string; creneaux: CreneauGuide[]; }
interface GuideResponse { jours: JourGuide[]; configChaine: { nomChaine: string } | null; }

const TYPE_LABEL: Record<string, string> = { PROGRAMME: 'Programme', MATCH_DIRECT: 'Match direct', PUB: 'Pub' };

function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function labelJour(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const auj = new Date(); auj.setHours(0, 0, 0, 0);
  const demain = new Date(auj); demain.setDate(demain.getDate() + 1);
  if (d.getTime() === auj.getTime()) return "Aujourd'hui";
  if (d.getTime() === demain.getTime()) return 'Demain';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function titre(c: CreneauGuide) {
  return c.match ? `${c.match.nomEvenement} — ${c.match.equipes}` : c.contenu?.titre || 'Programme';
}

export default function GuidePage() {
  const [guide, setGuide] = useState<GuideResponse | null>(null);
  const [jourActif, setJourActif] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/epg/guide?jours=5`).then((r) => r.json()).then((j) => setGuide(j.data)).catch(() => {});
  }, []);

  const nomChaine = guide?.configChaine?.nomChaine || 'ANTENN';
  const jour = guide?.jours[jourActif];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Tv className="w-4.5 h-4.5" style={{ color: '#001018' }} />
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-ink)' }}>{nomChaine}</span>
        </div>
        <Link href="/regarder" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          <PlayCircle className="w-4 h-4" /> Regarder le direct
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Guide des programmes</h1>
        <p className="text-sm mb-5" style={{ color: 'var(--color-ink-3)' }}>La grille synchronisée à l'antenne, jour par jour.</p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {guide?.jours.map((j, i) => (
            <button
              key={j.date}
              onClick={() => setJourActif(i)}
              className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap capitalize transition-colors"
              style={jourActif === i
                ? { background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }
                : { background: 'var(--color-surface-2)', color: 'var(--color-ink-2)' }}
            >
              {labelJour(j.date)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {jour && jour.creneaux.length === 0 && (
            <div className="card p-6 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun programme synchronisé ce jour-là.</div>
          )}
          {jour?.creneaux.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-4">
              <div className="font-mono text-sm shrink-0 w-28" style={{ color: 'var(--color-ink-2)' }}>
                {formatHeure(c.dateHeureDebut)} – {formatHeure(c.dateHeureFin)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{titre(c)}</p>
              </div>
              {c.typeCreneau === 'MATCH_DIRECT' ? (
                <Badge tone="live" pulse><Radio className="w-3 h-3" /> DIRECT</Badge>
              ) : (
                <Badge tone={c.typeCreneau === 'PUB' ? 'gold' : 'brand'}>{TYPE_LABEL[c.typeCreneau]}</Badge>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
