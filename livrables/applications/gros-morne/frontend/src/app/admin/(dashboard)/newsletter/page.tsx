'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, Send, Download, Mail, Info } from 'lucide-react';
import { newsletterApi } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Abonne {
  id: string;
  email: string;
  actif: boolean;
  createdAt: string;
}

export default function NewsletterPage() {
  const [abonnes, setAbonnes] = useState<Abonne[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await newsletterApi.list();
      setAbonnes(data.data.abonnes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function supprimer(a: Abonne) {
    if (!confirm(`Supprimer l'abonné "${a.email}" ?`)) return;
    await newsletterApi.remove(a.id);
    await charger();
  }

  const actifs = abonnes.filter((a) => a.actif).length;

  function ouvrirEnvoi() {
    setSujet('');
    setMessage('');
    setErreur(null);
    setResultat(null);
    setModalOpen(true);
  }

  async function envoyer() {
    setErreur(null);
    if (!sujet.trim() || !message.trim()) {
      setErreur('Sujet et message requis.');
      return;
    }
    if (!confirm(`Envoyer ce message à ${actifs} abonné(s) actif(s) ? Cette action est irréversible.`)) return;
    setEnvoiEnCours(true);
    try {
      const { data } = await newsletterApi.envoyer(sujet, message);
      setResultat(data.message);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      setErreur(msg);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Newsletter</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Abonnés collectés via le bandeau newsletter du site.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            {actifs} abonné{actifs > 1 ? 's' : ''} actif{actifs > 1 ? 's' : ''} sur {abonnes.length}
          </p>
          <div className="flex items-center gap-2">
            <a href={newsletterApi.exportUrl()} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </a>
            <button onClick={ouvrirEnvoi} disabled={actifs === 0} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              <Mail className="w-3.5 h-3.5" /> Envoyer un message
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : abonnes.length === 0 ? (
          <EmptyState icon={Send} title="Aucun abonné" hint="Les inscriptions depuis le bandeau newsletter apparaîtront ici" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {abonnes.map((a) => (
                  <tr key={a.id}>
                    <td className="font-semibold">{a.email}</td>
                    <td><Badge tone={a.actif ? 'success' : 'neutral'}>{a.actif ? 'Actif' : 'Désabonné'}</Badge></td>
                    <td>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="flex justify-end">
                        <button onClick={() => supprimer(a)} className="btn" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Envoyer un message aux abonnés" maxWidth={560}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 text-xs rounded-lg p-3" style={{ background: 'var(--color-info-soft)', color: 'var(--color-info)' }}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Envoi ponctuel à {actifs} abonné(s) actif(s), un par un (pas de champ &quot;À&quot; groupé). Si le
              serveur SMTP n&apos;est pas configuré, le message est journalisé côté serveur plutôt qu&apos;envoyé.
            </span>
          </div>

          {resultat ? (
            <div className="rounded-lg p-4 text-sm font-semibold" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
              {resultat}
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Sujet</label>
                <input className="input" value={sujet} onChange={(e) => setSujet(e.target.value)} placeholder="ex: Actualités de Gros-Morne — Août 2026" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Message</label>
                <textarea className="input" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre message aux abonnés..." />
              </div>
              {erreur && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}
            </>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>{resultat ? 'Fermer' : 'Annuler'}</button>
            {!resultat && (
              <button className="btn btn-primary" onClick={envoyer} disabled={envoiEnCours}>
                {envoiEnCours ? 'Envoi...' : 'Envoyer'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
