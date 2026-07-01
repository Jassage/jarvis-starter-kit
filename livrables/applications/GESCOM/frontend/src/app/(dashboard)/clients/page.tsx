'use client';
import { useEffect, useState } from 'react';
import { useClientStore, Client } from '@/stores/clientStore';
import { formatMontant } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import ClientForm from '@/components/clients/ClientForm';

export default function ClientsPage() {
  const { clients, isLoading, fetchClients, archiveClient } = useClientStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>(undefined);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleSearch = async (v: string) => {
    setSearch(v);
    await fetchClients(v || undefined);
  };

  const openEdit = (c: Client) => { setEditing(c); setModalOpen(true); };
  const openCreate = () => { setEditing(undefined); setModalOpen(true); };

  const handleArchive = async (c: Client) => {
    if (!confirm(`Archiver le client "${c.nom}" ?`)) return;
    try {
      await archiveClient(c.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0"
          style={{ background: 'var(--color-primary-2)' }}
        >
          + Nouveau client
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-line-2)' }}>
                {['Nom', 'Type', 'Téléphone', 'Solde dû', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink)' }}>{c.nom}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: c.type === 'GROSSISTE' ? 'var(--color-primary-soft)' : 'var(--color-line-2)',
                        color: c.type === 'GROSSISTE' ? 'var(--color-primary-2)' : 'var(--color-ink-2)',
                      }}
                    >
                      {c.type === 'GROSSISTE' ? 'Grossiste' : 'Particulier'}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-2)' }}>{c.telephone || '—'}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: Number(c.soldeDu) > 0 ? 'var(--color-danger)' : 'var(--color-ink-3)' }}>
                    {Number(c.soldeDu) > 0 ? `${formatMontant(c.soldeDu)} HTG` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>Modifier</button>
                    <button onClick={() => handleArchive(c)} className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>Archiver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && clients.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun client pour le moment.</div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le client' : 'Nouveau client'}>
        <ClientForm client={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
