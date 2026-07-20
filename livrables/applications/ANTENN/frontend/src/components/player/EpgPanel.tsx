'use client';
import { Radio, Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface CreneauEpg {
  id: string | null;
  dateHeureDebut: string | null;
  dateHeureFin: string | null;
  typeCreneau: 'PROGRAMME' | 'MATCH_DIRECT' | 'PUB';
  estRepli?: boolean;
  contenu?: { titre: string } | null;
  match?: { nomEvenement: string; equipes: string } | null;
}

function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function titre(c: CreneauEpg) {
  return c.match ? `${c.match.nomEvenement} — ${c.match.equipes}` : c.contenu?.titre || 'Programme';
}

export default function EpgPanel({ enCours, aSuivre }: { enCours: CreneauEpg | null; aSuivre: CreneauEpg[] }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>EN CE MOMENT</p>
        {enCours ? (
          <div className="card p-4 flex items-center gap-3">
            {enCours.estRepli ? (
              <Badge tone="brand">Programmation continue</Badge>
            ) : enCours.typeCreneau === 'MATCH_DIRECT' ? (
              <Badge tone="live" pulse><Radio className="w-3 h-3" /> EN DIRECT</Badge>
            ) : (
              <Badge tone="brand">Programme</Badge>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{titre(enCours)}</p>
              {enCours.estRepli ? (
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>En continu, hors programmation dédiée</p>
              ) : enCours.dateHeureDebut && enCours.dateHeureFin ? (
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{formatHeure(enCours.dateHeureDebut)} – {formatHeure(enCours.dateHeureFin)}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="card p-4 text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun programme en cours.</div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>À SUIVRE</p>
        <div className="space-y-2">
          {aSuivre.length === 0 && <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Rien de prévu pour l'instant.</p>}
          {aSuivre.map((c) => (
            <div key={c.id ?? titre(c)} className="card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.typeCreneau === 'MATCH_DIRECT' ? 'var(--color-live-soft)' : 'var(--color-surface-2)', color: c.typeCreneau === 'MATCH_DIRECT' ? 'var(--color-live)' : 'var(--color-ink-3)' }}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{titre(c)}</p>
                {c.dateHeureDebut && <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{formatHeure(c.dateHeureDebut)}</p>}
              </div>
              {c.typeCreneau === 'MATCH_DIRECT' && <Badge tone="live">DIRECT</Badge>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
