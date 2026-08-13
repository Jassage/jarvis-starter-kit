'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { contactApi } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

const STATUTS = ['NOUVEAU', 'LU', 'TRAITE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { NOUVEAU: 'Nouveau', LU: 'Lu', TRAITE: 'Traité', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  NOUVEAU: 'danger', LU: 'warning', TRAITE: 'success', ARCHIVE: 'neutral',
};

interface MessageContact {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string | null;
  message: string;
  statut: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<string>('');
  const [ouvert, setOuvert] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contactApi.list(filtre || undefined);
      setMessages(data.data.messages);
    } finally {
      setLoading(false);
    }
  }, [filtre]);

  useEffect(() => { charger(); }, [charger]);

  async function changerStatut(m: MessageContact, statut: string) {
    await contactApi.changerStatut(m.id, statut);
    await charger();
  }

  async function supprimer(m: MessageContact) {
    if (!confirm(`Supprimer le message de "${m.nom}" ?`)) return;
    await contactApi.remove(m.id);
    await charger();
  }

  function ouvrir(m: MessageContact) {
    if (ouvert !== m.id && m.statut === 'NOUVEAU') changerStatut(m, 'LU');
    setOuvert(ouvert === m.id ? null : m.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Messages de contact</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Messages reçus via le formulaire public de la page Contact.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="flex gap-2 mb-5">
          <button onClick={() => setFiltre('')} className={filtre === '' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '0.4rem 0.9rem' }}>Tous</button>
          {STATUTS.map((s) => (
            <button key={s} onClick={() => setFiltre(s)} className={filtre === s ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '0.4rem 0.9rem' }}>
              {STATUT_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : messages.length === 0 ? (
          <EmptyState icon={Mail} title="Aucun message" hint="Les messages du formulaire de contact apparaîtront ici" />
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div key={m.id} className="rounded-xl border" style={{ borderColor: 'var(--color-line)' }}>
                <button onClick={() => ouvrir(m)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-ink)' }}>{m.nom}</span>
                      <Badge tone={STATUT_TONE[m.statut]}>{STATUT_LABELS[m.statut]}</Badge>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>{m.sujet || m.email}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'var(--color-ink-3)' }}>
                    {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  {ouvert === m.id ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {ouvert === m.id && (
                  <div className="px-4 pb-4 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-ink-2)' }}>
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {m.email}</span>
                      {m.telephone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {m.telephone}</span>}
                    </div>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-ink)' }}>{m.message}</p>
                    <div className="flex items-center gap-2">
                      <select className="input" style={{ maxWidth: 180 }} value={m.statut} onChange={(e) => changerStatut(m, e.target.value)}>
                        {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
                      </select>
                      <button onClick={() => supprimer(m)} className="btn" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
