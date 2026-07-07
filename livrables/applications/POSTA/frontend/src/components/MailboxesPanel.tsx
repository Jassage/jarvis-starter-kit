'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, apiErrorMessage } from '@/lib/api';
import { Mailbox } from '@/lib/types';

export function MailboxesPanel({ domainId, nomDomaine }: { domainId: string; nomDomaine: string }) {
  const [mailboxes, setMailboxes] = useState<Mailbox[] | null>(null);
  const [localPart, setLocalPart] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);

  async function charger() {
    const { data } = await api.get(`/domains/${domainId}/mailboxes`);
    setMailboxes(data.data.mailboxes);
  }

  useEffect(() => {
    charger();
  }, [domainId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setCreation(true);
    try {
      await api.post(`/domains/${domainId}/mailboxes`, { localPart, motDePasse });
      setLocalPart('');
      setMotDePasse('');
      await charger();
    } catch (err) {
      setErreur(apiErrorMessage(err, 'Impossible de créer la boîte mail'));
    } finally {
      setCreation(false);
    }
  }

  async function toggleActif(m: Mailbox) {
    await api.patch(`/domains/${domainId}/mailboxes/${m.id}`, { actif: !m.actif });
    await charger();
  }

  async function onDelete(m: Mailbox) {
    if (!confirm(`Supprimer la boîte mail ${m.email} ?`)) return;
    await api.delete(`/domains/${domainId}/mailboxes/${m.id}`);
    await charger();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onCreate} className="flex items-start gap-2">
        <div className="flex items-center overflow-hidden rounded border border-neutral-300">
          <input
            type="text"
            placeholder="contact"
            value={localPart}
            onChange={(e) => setLocalPart(e.target.value)}
            className="w-32 px-3 py-2 text-sm"
            required
          />
          <span className="border-l border-neutral-300 bg-neutral-50 px-2 py-2 text-sm text-neutral-500">
            @{nomDomaine}
          </span>
        </div>
        <input
          type="password"
          placeholder="Mot de passe (min. 8 caractères)"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm"
          required
          minLength={8}
        />
        <button
          type="submit"
          disabled={creation}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {creation ? 'Ajout...' : 'Créer'}
        </button>
      </form>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <div className="overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Adresse</th>
              <th className="px-4 py-2">Quota</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {mailboxes?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  Aucune boîte mail pour l&apos;instant.
                </td>
              </tr>
            )}
            {mailboxes?.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium">{m.email}</td>
                <td className="px-4 py-3">{m.quotaMb} Mo</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActif(m)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.actif ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {m.actif ? 'Active' : 'Désactivée'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(m)}
                    className="text-red-600 underline underline-offset-2 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
