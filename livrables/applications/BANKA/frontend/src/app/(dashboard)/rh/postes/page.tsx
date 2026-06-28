'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { ConfirmVariant } from '@/components/ui/ConfirmModal';

interface Poste {
  id: string; code: string; intitule: string;
  departement?: string; salaireMin?: number; salaireMax?: number;
  actif: boolean; _count?: { employes: number };
}

const DEPT_COLORS: [string, string][] = [
  ['#dbeafe', '#1d4ed8'], ['#ede9fe', '#6d28d9'], ['#d1fae5', '#065f46'],
  ['#fef3c7', '#92400e'], ['#fee2e2', '#991b1b'], ['#e0f2fe', '#0369a1'],
];
function deptColor(str: string) {
  const idx = str.charCodeAt(0) % DEPT_COLORS.length;
  return { bg: DEPT_COLORS[idx][0], color: DEPT_COLORS[idx][1] };
}

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

type ModalMode = 'create' | 'edit';

export default function PostesPage() {
  const { utilisateur } = useAuthStore();
  const canManage = ['SUPER_ADMIN', 'DIRECTEUR'].includes(utilisateur?.role || '');

  const [postes, setPostes]     = useState<Poste[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode]         = useState<ModalMode>('create');
  const [editId, setEditId]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; title: string; message: string; variant: ConfirmVariant; loading: boolean; onConfirm: () => void }>({ open: false, title: '', message: '', variant: 'danger', loading: false, onConfirm: () => {} });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));
  const [fCode, setFCode]       = useState('');
  const [fIntitule, setFIntitule] = useState('');
  const [fDept, setFDept]       = useState('');
  const [fMin, setFMin]         = useState('');
  const [fMax, setFMax]         = useState('');

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/rh/postes'); setPostes(data.data); }
    catch { setPostes([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setMode('create'); setEditId(''); setFormError('');
    setFCode(''); setFIntitule(''); setFDept(''); setFMin(''); setFMax('');
    setShowForm(true);
  };

  const openEdit = (p: Poste) => {
    setMode('edit'); setEditId(p.id); setFormError('');
    setFCode(p.code);
    setFIntitule(p.intitule);
    setFDept(p.departement || '');
    setFMin(p.salaireMin ? String(p.salaireMin) : '');
    setFMax(p.salaireMax ? String(p.salaireMax) : '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!fIntitule.trim()) { setFormError('Intitulé requis'); return; }
    if (mode === 'create' && !fCode.trim()) { setFormError('Code requis'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = {
        intitule: fIntitule.trim(),
        departement: fDept || undefined,
        salaireMin: fMin ? Number(fMin) : undefined,
        salaireMax: fMax ? Number(fMax) : undefined,
      };
      if (mode === 'create') {
        await api.post('/rh/postes', { ...payload, code: fCode.trim() });
      } else {
        await api.put(`/rh/postes/${editId}`, payload);
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const doToggleActif = async (p: Poste) => {
    setModal((m) => ({ ...m, loading: true }));
    setToggling(p.id);
    try {
      await api.put(`/rh/postes/${p.id}`, { actif: !p.actif });
      closeModal();
      await load();
    } catch (err: any) {
      closeModal();
      alert(err.response?.data?.message || 'Erreur');
    } finally { setToggling(null); }
  };

  const handleToggleActif = (p: Poste) => {
    setModal({
      open: true,
      variant: p.actif ? 'warning' : 'primary',
      title: p.actif ? `Désactiver « ${p.intitule} » ?` : `Activer « ${p.intitule} » ?`,
      message: p.actif
        ? 'Ce poste ne sera plus disponible à l\'affectation. Les employés déjà affectés ne sont pas impactés.'
        : 'Ce poste redeviendra disponible pour l\'affectation de nouveaux employés.',
      loading: false,
      onConfirm: () => doToggleActif(p),
    });
  };

  const doDelete = async (p: Poste) => {
    setModal((m) => ({ ...m, loading: true }));
    setDeleting(p.id);
    try {
      await api.delete(`/rh/postes/${p.id}`);
      closeModal();
      await load();
    } catch (err: any) {
      closeModal();
      alert(err.response?.data?.message || 'Erreur');
    } finally { setDeleting(null); }
  };

  const handleDelete = (p: Poste) => {
    setModal({
      open: true,
      variant: 'danger',
      title: `Supprimer « ${p.intitule} » ?`,
      message: 'Cette action est irréversible. Le poste sera définitivement supprimé du système.',
      loading: false,
      onConfirm: () => doDelete(p),
    });
  };

  const actifCount = postes.filter(p => p.actif).length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Postes & Métiers</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>
            {postes.length} poste{postes.length > 1 ? 's' : ''} &middot; {actifCount} actif{actifCount > 1 ? 's' : ''}
          </p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouveau poste
          </button>
        )}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-20" style={{ color: '#7c3aed' }}>
          <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
        </div>
      ) : postes.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#ede9fe' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#6d28d9' }}>
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Aucun poste défini</p>
          <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Lancez le seed ou créez les postes manuellement</p>
          {canManage && (
            <button onClick={openCreate} className="mt-4 btn-primary inline-flex items-center gap-2 text-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Créer un poste
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {postes.map((p) => {
            const dc = deptColor(p.departement || p.intitule);
            const effectif = p._count?.employes ?? 0;
            const isDeleting = deleting === p.id;
            const isToggling = toggling === p.id;
            return (
              <div key={p.id} className="card p-5 flex flex-col gap-4 hover:shadow-md transition-all hover:-translate-y-0.5"
                style={{ opacity: p.actif ? 1 : 0.65 }}>
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: dc.bg }}>
                      <span className="text-xs font-bold" style={{ color: dc.color }}>{p.code.slice(0, 3).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold" style={{ color: '#8b94b0' }}>{p.code}</span>
                      {p.departement && <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{p.departement}</p>}
                    </div>
                  </div>
                  <span className="chip text-xs" style={{ background: p.actif ? '#d1fae5' : '#f0f2f9', color: p.actif ? '#047857' : '#8b94b0' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.actif ? '#10b981' : '#8b94b0' }} />
                    {p.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <h3 className="font-bold text-base leading-tight" style={{ color: '#0b1733' }}>{p.intitule}</h3>

                {/* Footer */}
                <div className="flex items-end justify-between pt-3" style={{ borderTop: '1px solid #f0f2f9', marginTop: 'auto' }}>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#8b94b0' }}>Fourchette salariale</p>
                    <p className="text-xs font-semibold" style={{ color: '#4a5578' }}>
                      {p.salaireMin && p.salaireMax
                        ? `${Number(p.salaireMin).toLocaleString('fr-FR')} — ${Number(p.salaireMax).toLocaleString('fr-FR')} HTG`
                        : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs mb-0.5" style={{ color: '#8b94b0' }}>Effectif</p>
                    <span className="text-2xl font-bold leading-none" style={{ color: dc.color }}>{effectif}</span>
                  </div>
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid #f0f2f9' }}>
                    {/* Éditer */}
                    <button onClick={() => openEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: '#f0f2f9', color: '#4a5578' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Éditer
                    </button>
                    {/* Toggle actif */}
                    <button onClick={() => handleToggleActif(p)} disabled={isToggling}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      style={{ background: p.actif ? '#fef3c7' : '#d1fae5', color: p.actif ? '#b45309' : '#047857' }}>
                      {isToggling ? <Spin /> : (
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                          <path d={p.actif ? 'M10 9v6m4-6v6M9 5l6 0M5 8l14 0M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      )}
                      {p.actif ? 'Désactiver' : 'Activer'}
                    </button>
                    {/* Supprimer */}
                    {effectif === 0 && (
                      <button onClick={() => handleDelete(p)} disabled={isDeleting}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: '#fee2e2', color: '#b91c1c' }}>
                        {isDeleting ? <Spin /> : (
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal créer / éditer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold" style={{ color: '#0b1733' }}>{mode === 'create' ? 'Nouveau poste' : 'Modifier le poste'}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
                  {mode === 'create' ? "Définissez le poste dans l'organigramme" : 'Mettez à jour les informations'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              {mode === 'create' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Code <span style={{ color: '#b91c1c' }}>*</span></label>
                    <input value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="ex: CAIS-01" className="input w-full font-mono" />
                  </div>
                  <div>
                    <label className="label">Intitulé <span style={{ color: '#b91c1c' }}>*</span></label>
                    <input value={fIntitule} onChange={(e) => setFIntitule(e.target.value)} placeholder="ex: Caissier" className="input w-full" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label">Intitulé <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input value={fIntitule} onChange={(e) => setFIntitule(e.target.value)} className="input w-full" />
                </div>
              )}
              <div>
                <label className="label">Département</label>
                <input
                  value={fDept}
                  onChange={(e) => setFDept(e.target.value)}
                  placeholder="ex: Opérations"
                  className="input w-full"
                  list="dept-suggestions"
                  autoComplete="off"
                />
                <datalist id="dept-suggestions">
                  {Array.from(new Set(postes.map((p) => p.departement).filter(Boolean))).map((d) => (
                    <option key={d} value={d!} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="label">Fourchette salariale (HTG)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={fMin} onChange={(e) => setFMin(e.target.value)} placeholder="Minimum" className="input w-full" min="0" />
                  <input type="number" value={fMax} onChange={(e) => setFMax(e.target.value)} placeholder="Maximum" className="input w-full" min="0" />
                </div>
              </div>
              {formError && <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f9', color: '#4a5578' }}>Annuler</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Spin />}
                  {mode === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        loading={modal.loading}
        confirmLabel={modal.variant === 'danger' ? 'Supprimer' : modal.variant === 'warning' ? 'Désactiver' : 'Activer'}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
}
