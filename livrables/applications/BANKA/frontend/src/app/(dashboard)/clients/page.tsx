'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useClientStore } from '@/stores/clientStore';
import { nomClient, formatDate } from '@/lib/utils';
import ClientForm from '@/components/clients/ClientForm';

const STATUT_CHIP: Record<string, string> = {
  ACTIF: 'chip chip-success',
  INACTIF: 'chip chip-neutral',
  SUSPENDU: 'chip chip-warning',
  BLACKLISTE: 'chip chip-danger',
};

export default function ClientsPage() {
  const { clients, total, pages, isLoading, fetchClients } = useClientStore();
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [type, setType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => fetchClients({ search, statut, type, page }), search ? 280 : 0);
    return () => clearTimeout(t);
  }, [search, statut, type, page]);

  const getInitials = (c: any) => {
    if (c.type === 'ENTREPRISE') return c.raisonSociale?.[0]?.toUpperCase() || 'E';
    return `${c.prenom?.[0] || ''}${c.nom?.[0] || ''}`.toUpperCase();
  };

  const getColorFromName = (name: string) => {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const i = name.charCodeAt(0) % colors.length;
    return colors[i];
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-blue p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total clients</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#0b1733' }}>{total}</p>
        </div>
        <div className="card card-green p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Actifs</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#047857' }}>{clients.filter(c => c.statut === 'ACTIF').length}</p>
        </div>
        <div className="card card-indigo p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Individuels</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#0b1733' }}>{clients.filter(c => c.type === 'INDIVIDUEL').length}</p>
        </div>
        <div className="card card-teal p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Entreprises</p>
          <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: '#0b1733' }}>{clients.filter(c => c.type === 'ENTREPRISE').length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8b94b0' }}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, numéro client..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10"
            />
          </div>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input max-w-[180px]">
            <option value="">Tous types</option>
            <option value="INDIVIDUEL">Individuel</option>
            <option value="ENTREPRISE">Entreprise</option>
          </select>
          <select value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }} className="input max-w-[180px]">
            <option value="">Tous statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">Inactifs</option>
            <option value="SUSPENDU">Suspendus</option>
          </select>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            Nouveau client
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <svg className="animate-spin w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p className="text-sm mt-3" style={{ color: '#8b94b0' }}>Chargement des clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f0f2f9' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: '#8b94b0' }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucun client trouvé</p>
            <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>Commencez par enregistrer votre premier client.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-5">+ Nouveau client</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f7f8fc' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Client</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Type</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Comptes</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Prêts</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const name = nomClient(client as any);
                return (
                  <tr key={client.id} className="transition-colors" style={{ borderTop: '1px solid #f0f2f9' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: getColorFromName(name) }}>
                          {getInitials(client)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{name}</p>
                          <p className="text-xs font-mono" style={{ color: '#8b94b0' }}>{client.numeroClient}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm" style={{ color: '#0b1733' }}>{client.telephone}</p>
                      {client.email && <p className="text-xs" style={{ color: '#8b94b0' }}>{client.email}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`chip ${client.type === 'ENTREPRISE' ? 'chip-primary' : 'chip-neutral'}`}>
                        {client.type === 'INDIVIDUEL' ? 'Individuel' : 'Entreprise'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold" style={{ color: '#0b1733' }}>{client._count?.comptes ?? 0}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold" style={{ color: '#0b1733' }}>{client._count?.prets ?? 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={STATUT_CHIP[client.statut] || 'chip chip-neutral'}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: client.statut === 'ACTIF' ? '#10b981' : '#8b94b0' }}></span>
                        {client.statut.charAt(0) + client.statut.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/clients/${client.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={{ background: '#eef2ff', color: '#1e40af' }}>
                        Détail →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {pages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #f0f2f9' }}>
            <p className="text-sm" style={{ color: '#8b94b0' }}>Page <span className="font-semibold" style={{ color: '#0b1733' }}>{page}</span> sur {pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost text-xs disabled:opacity-40">← Précédent</button>
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="btn-ghost text-xs disabled:opacity-40">Suivant →</button>
            </div>
          </div>
        )}
      </div>

      {showForm && <ClientForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchClients({ search, page }); }} />}
    </div>
  );
}
