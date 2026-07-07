'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, apiErrorMessage } from '@/lib/api';
import { Alias } from '@/lib/types';

export function AliasesPanel({ domainId, nomDomaine }: { domainId: string; nomDomaine: string }) {
  const [aliases, setAliases] = useState<Alias[] | null>(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);

  async function charger() {
    const { data } = await api.get(`/domains/${domainId}/aliases`);
    setAliases(data.data.aliases);
  }

  useEffect(() => {
    charger();
  }, [domainId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setCreation(true);
    try {
      const fullSource = source.includes('@') ? source : `${source}@${nomDomaine}`;
      await api.post(`/domains/${domainId}/aliases`, { source: fullSource, destination });
      setSource('');
      setDestination('');
      await charger();
    } catch (err) {
      setErreur(apiErrorMessage(err, "Impossible de créer l'alias"));
    } finally {
      setCreation(false);
    }
  }

  async function onDelete(a: Alias) {
    if (!confirm(`Supprimer l'alias ${a.source} ?`)) return;
    await api.delete(`/domains/${domainId}/aliases/${a.id}`);
    await charger();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onCreate} className="flex items-start gap-2">
        <div className="flex items-center overflow-hidden rounded border border-neutral-300">
          <input
            type="text"
            placeholder="info"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-28 px-3 py-2 text-sm"
            required
          />
          <span className="border-l border-neutral-300 bg-neutral-50 px-2 py-2 text-sm text-neutral-500">
            @{nomDomaine}
          </span>
        </div>
        <span className="pt-2 text-sm text-neutral-400">→</span>
        <input
          type="email"
          placeholder="destination@exemple.com"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-56 rounded border border-neutral-300 px-3 py-2 text-sm"
          required
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
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Destination</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {aliases?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                  Aucun alias pour l&apos;instant.
                </td>
              </tr>
            )}
            {aliases?.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium">{a.source}</td>
                <td className="px-4 py-3">{a.destination}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(a)}
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
