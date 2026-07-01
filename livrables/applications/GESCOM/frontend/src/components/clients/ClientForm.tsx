'use client';
import { useState } from 'react';
import { Client, ClientInput, useClientStore } from '@/stores/clientStore';

export default function ClientForm({ client, onDone }: { client?: Client; onDone: () => void }) {
  const { createClient, updateClient } = useClientStore();
  const [form, setForm] = useState<ClientInput>({
    nom: client?.nom ?? '',
    telephone: client?.telephone ?? '',
    adresse: client?.adresse ?? '',
    type: client?.type ?? 'PARTICULIER',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: ClientInput = {
        nom: form.nom.trim(),
        telephone: form.telephone?.trim() || undefined,
        adresse: form.adresse?.trim() || undefined,
        type: form.type,
      };
      if (client) {
        await updateClient(client.id, payload);
      } else {
        await createClient(payload);
      }
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
        <input className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
      </div>

      <div className="flex gap-2">
        {(['PARTICULIER', 'GROSSISTE'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm({ ...form, type: t })}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: form.type === t ? 'var(--color-primary-soft)' : 'var(--color-line-2)',
              color: form.type === t ? 'var(--color-primary-2)' : 'var(--color-ink-2)',
            }}
          >
            {t === 'PARTICULIER' ? 'Particulier' : 'Grossiste'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label>
        <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Adresse</label>
        <input className="input" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
      </div>

      {error && (
        <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
        style={{ background: 'var(--color-primary-2)' }}
      >
        {submitting ? 'Enregistrement...' : client ? 'Mettre à jour' : 'Créer le client'}
      </button>
    </form>
  );
}
