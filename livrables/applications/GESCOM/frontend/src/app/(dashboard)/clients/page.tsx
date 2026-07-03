'use client';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useClientStore, Client } from '@/stores/clientStore';
import { formatMontant } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
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
      <PageToolbar search={search} onSearch={handleSearch} searchPlaceholder="Rechercher un client..." actionLabel="Nouveau client" onAction={openCreate} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {['Nom', 'Type', 'Téléphone', 'Solde dû', ''].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.nom}</td>
                  <td><Badge tone={c.type === 'GROSSISTE' ? 'brand' : 'neutral'}>{c.type === 'GROSSISTE' ? 'Grossiste' : 'Particulier'}</Badge></td>
                  <td>{c.telephone || '—'}</td>
                  <td className="font-semibold" style={{ color: Number(c.soldeDu) > 0 ? 'var(--color-danger)' : 'var(--color-ink-3)' }}>
                    {Number(c.soldeDu) > 0 ? `${formatMontant(c.soldeDu)} HTG` : '—'}
                  </td>
                  <td className="text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>Modifier</button>
                    <button onClick={() => handleArchive(c)} className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>Archiver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && clients.length === 0 && (
          <EmptyState icon={Users} title="Aucun client pour le moment" />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le client' : 'Nouveau client'}>
        <ClientForm client={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
