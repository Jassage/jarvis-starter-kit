'use client';
import { useEffect, useState } from 'react';
import { useUtilisateurStore, Utilisateur } from '@/stores/utilisateurStore';
import { useAgenceStore } from '@/stores/agenceStore';
import { useAuthStore } from '@/stores/authStore';
import Tooltip from '@/components/ui/Tooltip';

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN:  { label: 'Super Admin',   color: '#6d28d9', bg: '#f5f3ff' },
  DIRECTEUR:    { label: 'Directeur',     color: '#1e40af', bg: '#eef2ff' },
  SUPERVISEUR:  { label: 'Superviseur',   color: '#0e7490', bg: '#ecfeff' },
  CAISSIER:     { label: 'Caissier',      color: '#047857', bg: '#ecfdf5' },
  AGENT_CREDIT: { label: 'Agent crédit',  color: '#b45309', bg: '#fffbeb' },
  COMPTABLE:    { label: 'Comptable',     color: '#374151', bg: '#f3f4f6' },
  AUDITEUR:     { label: 'Auditeur',      color: '#1e40af', bg: '#eef2ff' },
};

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] || { label: role, color: '#4a5578', bg: '#f7f8fc' };
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: m.bg, color: m.color }}>{m.label}</span>;
}

function DrawerForm({ initial, agences, onClose, onSuccess }: {
  initial?: Utilisateur | null;
  agences: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { createUtilisateur, updateUtilisateur } = useUtilisateurStore();
  const isEdit = !!initial;
  const [form, setForm] = useState({
    email: initial?.email || '',
    motDePasse: '',
    nom: initial?.nom || '',
    prenom: initial?.prenom || '',
    role: initial?.role || 'CAISSIER',
    agenceId: initial?.agenceId || '',
    telephone: initial?.telephone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.email) { setError('Nom, prénom et email sont obligatoires'); return; }
    if (!isEdit && !form.motDePasse) { setError('Le mot de passe est obligatoire'); return; }
    setError('');
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!payload.agenceId) delete payload.agenceId;
      if (isEdit && !payload.motDePasse) delete payload.motDePasse;
      if (isEdit) {
        await updateUtilisateur(initial!.id, payload);
      } else {
        await createUtilisateur(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const roleColor = ROLE_META[form.role]?.color || '#2563eb';
  const gradientFrom = form.role === 'SUPER_ADMIN' ? '#4c1d95' :
    form.role === 'DIRECTEUR' ? '#1e3a8a' :
    form.role === 'CAISSIER' ? '#064e3b' :
    form.role === 'AGENT_CREDIT' ? '#78350f' : '#1e3a8a';
  const gradientTo = form.role === 'SUPER_ADMIN' ? '#7c3aed' :
    form.role === 'DIRECTEUR' ? '#2563eb' :
    form.role === 'CAISSIER' ? '#059669' :
    form.role === 'AGENT_CREDIT' ? '#d97706' : '#2563eb';

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel" style={{ maxWidth: '560px' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'white' }}>{isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {isEdit ? `${initial!.prenom} ${initial!.nom}` : 'Créer un compte opérateur'}
            </p>
          </div>
          <Tooltip content="Fermer sans enregistrer" position="left">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Identité */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom *</label>
              <input value={form.prenom} onChange={(e) => set('prenom', e.target.value)} className="input" placeholder="Jean" />
            </div>
            <div>
              <label className="label">Nom *</label>
              <input value={form.nom} onChange={(e) => set('nom', e.target.value)} className="input" placeholder="PIERRE" />
            </div>
          </div>

          <div>
            <label className="label">Email *</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={isEdit} className="input disabled:opacity-60" placeholder="jean.pierre@banque.ht" />
          </div>

          <div>
            <label className="label">Téléphone</label>
            <input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} className="input" placeholder="+509 3700-0000" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Mot de passe {isEdit ? '(laisser vide = inchangé)' : '*'}</label>
              <Tooltip content="Minimum 8 caractères. L'opérateur pourra le changer depuis son profil." position="top">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <input type="password" value={form.motDePasse} onChange={(e) => set('motDePasse', e.target.value)} className="input" placeholder={isEdit ? '••••••••' : 'Minimum 8 caractères'} />
          </div>

          {/* Rôle */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="label mb-0">Rôle *</label>
              <Tooltip content="Détermine les permissions et les pages accessibles dans le système" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_META).map(([r, m]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('role', r)}
                  className="px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all"
                  style={{
                    background: form.role === r ? m.bg : '#f7f8fc',
                    border: `2px solid ${form.role === r ? m.color : '#e7eaf3'}`,
                    color: form.role === r ? m.color : '#4a5578',
                    transform: form.role === r ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agence */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Agence assignée</label>
              <Tooltip content="Laissez vide pour un utilisateur siège (non assigné à une agence spécifique)" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </Tooltip>
            </div>
            <select value={form.agenceId} onChange={(e) => set('agenceId', e.target.value)} className="input">
              <option value="">— Aucune agence (Siège) —</option>
              {agences.map((a) => (
                <option key={a.id} value={a.id}>{a.nom} ({a.code})</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="9" stroke="#b91c1c" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/></svg>
              <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Enregistrement...</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UtilisateursPage() {
  const { utilisateurs, isLoading, fetchUtilisateurs, toggleActif } = useUtilisateurStore();
  const { agences, fetchAgences } = useAgenceStore();
  const { utilisateur: moi } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);

  useEffect(() => {
    fetchUtilisateurs();
    fetchAgences();
  }, []);

  const filtered = utilisateurs.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleToggle = async (u: Utilisateur) => {
    if (u.id === moi?.id) return;
    if (!confirm(`${u.actif ? 'Désactiver' : 'Réactiver'} ce compte ?`)) return;
    await toggleActif(u.id, !u.actif);
  };

  const nbActifs = utilisateurs.filter((u) => u.actif).length;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Utilisateurs</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Gestion des comptes opérateurs et de leurs accès</p>
        </div>
        <Tooltip content="Créer un nouveau compte opérateur" position="left">
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            Nouvel opérateur
          </button>
        </Tooltip>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card card-blue p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total opérateurs</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>{utilisateurs.length}</p>
        </div>
        <div className="card card-green p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Comptes actifs</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#047857' }}>{nbActifs}</p>
        </div>
        <div className="card card-amber p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Comptes inactifs</p>
          <p className="text-2xl font-bold mt-1" style={{ color: utilisateurs.length - nbActifs > 0 ? '#b45309' : '#0b1733' }}>{utilisateurs.length - nbActifs}</p>
        </div>
        <div className="card card-purple p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Agences</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>{agences.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8b94b0' }}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input max-w-[200px]">
            <option value="">Tous les rôles</option>
            {Object.entries(ROLE_META).map(([r, m]) => <option key={r} value={r}>{m.label}</option>)}
          </select>
          <p className="text-sm ml-auto" style={{ color: '#8b94b0' }}>
            <span className="font-semibold" style={{ color: '#0b1733' }}>{filtered.length}</span> opérateur{filtered.length > 1 ? 's' : ''}
          </p>
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
            <p className="text-sm mt-3" style={{ color: '#8b94b0' }}>Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-semibold" style={{ color: '#0b1733' }}>Aucun opérateur trouvé</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f2f9' }}>
            {filtered.map((u) => {
              const isMe = u.id === moi?.id;
              return (
                <div key={u.id} className="px-5 py-4 flex items-center gap-4 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: u.actif ? `linear-gradient(135deg, ${ROLE_META[u.role]?.color || '#1e3a8a'}, ${ROLE_META[u.role]?.bg || '#eef2ff'})` : '#d1d5db', opacity: u.actif ? 1 : 0.7 }}>
                    {u.prenom[0]}{u.nom[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold" style={{ color: u.actif ? '#0b1733' : '#9ca3af' }}>{u.prenom} {u.nom}</p>
                      {isMe && <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: '#eef2ff', color: '#2563eb' }}>Vous</span>}
                      <RoleBadge role={u.role} />
                      {!u.actif && <span className="chip chip-neutral">Inactif</span>}
                    </div>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>
                      {u.email}
                      {u.telephone && ` · ${u.telephone}`}
                      {u.agence && ` · ${u.agence.nom}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Tooltip content="Modifier cet opérateur" position="top">
                      <button onClick={() => { setEditing(u); setShowForm(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: '#eef2ff', color: '#2563eb' }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </button>
                    </Tooltip>
                    {!isMe && (
                      <Tooltip content={u.actif ? 'Désactiver ce compte' : 'Réactiver ce compte'} position="top">
                        <button onClick={() => handleToggle(u)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: u.actif ? '#fef2f2' : '#ecfdf5', color: u.actif ? '#b91c1c' : '#047857' }}>
                          {u.actif ? (
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <DrawerForm
          initial={editing}
          agences={agences}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSuccess={() => { setShowForm(false); setEditing(null); fetchUtilisateurs(); }}
        />
      )}
    </div>
  );
}
