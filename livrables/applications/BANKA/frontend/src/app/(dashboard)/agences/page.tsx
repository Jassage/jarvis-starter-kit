'use client';
import { useEffect, useState } from 'react';
import { useAgenceStore, Agence } from '@/stores/agenceStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, formatMontant } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

function DrawerForm({ initial, onClose, onSuccess }: {
  initial?: Agence | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { createAgence, updateAgence } = useAgenceStore();
  const isEdit = !!initial;
  const [form, setForm] = useState({
    code: initial?.code || '',
    nom: initial?.nom || '',
    adresse: initial?.adresse || '',
    telephone: initial?.telephone || '',
    plafondCaisseHTG: initial?.caisses?.[0]?.plafondAlerte != null ? String(initial.caisses[0].plafondAlerte) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.code || !form.nom) { setError('Code et nom sont obligatoires'); return; }
    setError('');
    setLoading(true);
    const plafondCaisseHTG = form.plafondCaisseHTG.trim() === '' ? undefined : Number(form.plafondCaisseHTG);
    try {
      if (isEdit) {
        await updateAgence(initial!.id, { nom: form.nom, adresse: form.adresse, telephone: form.telephone, plafondCaisseHTG: plafondCaisseHTG ?? null });
      } else {
        await createAgence({ code: form.code, nom: form.nom, adresse: form.adresse, telephone: form.telephone, plafondCaisseHTG });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
              <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'white' }}>{isEdit ? 'Modifier l\'agence' : 'Nouvelle agence'}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{isEdit ? initial!.nom : 'Ajouter une succursale'}</p>
          </div>
          <Tooltip content="Fermer sans enregistrer" position="left">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="label mb-0">Code *</label>
                <Tooltip content="Code unique de l'agence (ex: AG001, SIEGE). Ne peut pas être modifié après création." position="right">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: isEdit ? '#f59e0b' : '#8b94b0' }}>
                    {isEdit ? (
                      <path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    ) : (
                      <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
                    )}
                  </svg>
                </Tooltip>
              </div>
              <input
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                disabled={isEdit}
                className="input font-mono font-semibold disabled:opacity-60"
                placeholder="AG001"
              />
            </div>
            <div className="col-span-2">
              <label className="label">Nom de l'agence *</label>
              <input value={form.nom} onChange={(e) => set('nom', e.target.value)} className="input" placeholder="Agence principale Pignon" />
            </div>
          </div>

          <div>
            <label className="label">Adresse</label>
            <input value={form.adresse} onChange={(e) => set('adresse', e.target.value)} className="input" placeholder="Rue des Palmistes, Pignon, Nord" />
          </div>

          <div>
            <label className="label">Téléphone</label>
            <input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} className="input" placeholder="+509 3700-0000" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Plafond d'alerte caisse (HTG)</label>
              <Tooltip content="Au-delà de ce montant de cash en caisse, une alerte est envoyée — le dépôt lui-même n'est jamais bloqué. Laisser vide pour ne pas surveiller." position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </Tooltip>
            </div>
            <input type="number" min="0" value={form.plafondCaisseHTG} onChange={(e) => set('plafondCaisseHTG', e.target.value)} className="input" placeholder="Ex: 2 000 000" />
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
              <><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{isEdit ? 'Enregistrer' : 'Créer l\'agence'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgencesPage() {
  const { agences, isLoading, fetchAgences, updateAgence } = useAgenceStore();
  const { utilisateur } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Agence | null>(null);
  const isSuperAdmin = utilisateur?.role === 'SUPER_ADMIN';

  useEffect(() => { fetchAgences(); }, []);

  const handleToggleActif = async (a: Agence) => {
    if (!confirm(`${a.actif ? 'Désactiver' : 'Réactiver'} l'agence "${a.nom}" ?`)) return;
    await updateAgence(a.id, { actif: !a.actif });
  };

  const nbActives = agences.filter((a) => a.actif).length;
  const totalPersonnel = agences.reduce((sum, a) => sum + (a._count?.utilisateurs || 0), 0);
  const totalEmployes = agences.reduce((sum, a) => sum + (a._count?.employes || 0), 0);
  const totalComptes = agences.reduce((sum, a) => sum + (a._count?.comptes || 0), 0);

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Agences</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Gestion du réseau de succursales</p>
        </div>
        {isSuperAdmin && (
          <Tooltip content="Ajouter une nouvelle agence" position="left">
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Nouvelle agence
            </button>
          </Tooltip>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card card-blue p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Total agences</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>{agences.length}</p>
        </div>
        <div className="card card-green p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Actives</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#047857' }}>{nbActives}</p>
        </div>
        <div className="card card-indigo p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Agents (utilisateurs)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>{totalPersonnel}</p>
        </div>
        <div className="card p-4" style={{ border: '1px solid #d1fae5' }}>
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Employés RH</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#047857' }}>{totalEmployes}</p>
        </div>
        <div className="card card-teal p-4">
          <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Comptes ouverts</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#0b1733' }}>{totalComptes}</p>
        </div>
      </div>

      {/* Grid des agences */}
      {isLoading ? (
        <div className="card p-16 text-center">
          <svg className="animate-spin w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
            <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p className="text-sm mt-3" style={{ color: '#8b94b0' }}>Chargement...</p>
        </div>
      ) : agences.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#eef2ff' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#2563eb' }}>
              <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-semibold" style={{ color: '#0b1733' }}>Aucune agence</p>
          {isSuperAdmin && <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Créer la première agence</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agences.map((agence) => (
            <div key={agence.id} className={`card card-blue p-5 ${!agence.actif ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}>
                      <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#0b1733' }}>{agence.nom}</p>
                    <p className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: '#eef2ff', color: '#2563eb' }}>{agence.code}</p>
                  </div>
                </div>
                <span className={`chip ${agence.actif ? 'chip-success' : 'chip-neutral'}`}>{agence.actif ? 'Active' : 'Inactive'}</span>
              </div>

              {/* Infos */}
              <div className="space-y-1.5 mb-4">
                {agence.adresse && (
                  <p className="text-xs flex items-center gap-2" style={{ color: '#8b94b0' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/></svg>
                    {agence.adresse}
                  </p>
                )}
                {agence.telephone && (
                  <p className="text-xs flex items-center gap-2" style={{ color: '#8b94b0' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8"/></svg>
                    {agence.telephone}
                  </p>
                )}
              </div>

              {/* Caisse HTG */}
              {agence.caisses && agence.caisses.length > 0 && (() => {
                const soldeCaisse = Number(agence.caisses[0].solde);
                const plafond = agence.caisses[0].plafondAlerte != null ? Number(agence.caisses[0].plafondAlerte) : null;
                const depasse = plafond != null && soldeCaisse > plafond;
                return (
                <div className="flex items-center justify-between p-2.5 rounded-xl mb-3" style={{ background: depasse ? '#fef2f2' : '#f7f8fc' }}>
                  <span className="text-xs" style={{ color: '#8b94b0' }}>Cash en caisse (HTG)</span>
                  <span className="text-sm font-bold" style={{ color: depasse ? '#b91c1c' : '#0b1733' }}>
                    {formatMontant(soldeCaisse, 'HTG')}
                    {depasse ? ' ⚠' : ''}
                  </span>
                </div>
                );
              })()}

              {/* Stats */}
              {agence._count && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 rounded-xl" style={{ background: '#f7f8fc' }}>
                    <p className="text-lg font-bold" style={{ color: '#0b1733' }}>{agence._count.utilisateurs}</p>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>Agents</p>
                  </div>
                  <div className="text-center p-2 rounded-xl" style={{ background: '#d1fae5' }}>
                    <p className="text-lg font-bold" style={{ color: '#047857' }}>{agence._count.employes}</p>
                    <p className="text-xs" style={{ color: '#047857' }}>Employés</p>
                  </div>
                  <div className="text-center p-2 rounded-xl" style={{ background: '#f7f8fc' }}>
                    <p className="text-lg font-bold" style={{ color: '#0b1733' }}>{agence._count.comptes}</p>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>Comptes</p>
                  </div>
                  <div className="text-center p-2 rounded-xl" style={{ background: '#f7f8fc' }}>
                    <p className="text-lg font-bold" style={{ color: '#0b1733' }}>{agence._count.prets}</p>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>Prêts</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {isSuperAdmin && (
                <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #f0f2f9' }}>
                  <Tooltip content="Modifier les informations de l'agence" position="top">
                    <button onClick={() => { setEditing(agence); setShowForm(true); }} className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors" style={{ background: '#eef2ff', color: '#2563eb' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      Modifier
                    </button>
                  </Tooltip>
                  <Tooltip content={agence.actif ? 'Suspendre cette agence' : 'Réactiver cette agence'} position="top">
                    <button onClick={() => handleToggleActif(agence)} className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors" style={{ background: agence.actif ? '#fef2f2' : '#ecfdf5', color: agence.actif ? '#b91c1c' : '#047857' }}>
                      {agence.actif ? (
                        <><svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>Suspendre</>
                      ) : (
                        <><svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Réactiver</>
                      )}
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <DrawerForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSuccess={() => { setShowForm(false); setEditing(null); fetchAgences(); }}
        />
      )}
    </div>
  );
}
