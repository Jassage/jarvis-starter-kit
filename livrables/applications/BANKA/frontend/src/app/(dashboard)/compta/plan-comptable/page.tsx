'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { ConfirmVariant } from '@/components/ui/ConfirmModal';

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ACTIF:    { label: 'Actif',            color: '#047857', bg: '#d1fae5', border: '#6ee7b7' },
  PASSIF:   { label: 'Passif',           color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
  CHARGE:   { label: 'Charge',           color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
  PRODUIT:  { label: 'Produit',          color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
  CAPITAUX: { label: 'Capitaux propres', color: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd' },
};
const TYPES = ['ACTIF', 'PASSIF', 'CHARGE', 'PRODUIT', 'CAPITAUX'];

interface CompteComptable { id: string; numero: string; intitule: string; type: string; actif: boolean; }

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function PlanComptablePage() {
  const { utilisateur } = useAuthStore();
  const canEdit = ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE'].includes(utilisateur?.role || '');

  const [comptes, setComptes]       = useState<CompteComptable[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [formMode, setFormMode]     = useState<'create' | 'edit'>('create');
  const [editId, setEditId]         = useState('');
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [toggling, setToggling]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; title: string; message: string; variant: ConfirmVariant; loading: boolean; onConfirm: () => void }>({ open: false, title: '', message: '', variant: 'danger', loading: false, onConfirm: () => {} });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));
  const [fNumero, setFNumero]       = useState('');
  const [fIntitule, setFIntitule]   = useState('');
  const [fType, setFType]           = useState('ACTIF');

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/compta/plan-comptable'); setComptes(data.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (c: CompteComptable) => {
    setFormMode('edit'); setEditId(c.id); setFormError('');
    setFNumero(c.numero); setFIntitule(c.intitule); setFType(c.type);
    setShowForm(true);
  };

  const doToggle = async (c: CompteComptable) => {
    setModal((m) => ({ ...m, loading: true }));
    setToggling(c.id);
    try { await api.put(`/compta/plan-comptable/${c.id}`, { actif: !c.actif }); closeModal(); await load(); }
    catch (e: any) { closeModal(); alert(e.response?.data?.message || 'Erreur'); }
    finally { setToggling(null); }
  };

  const handleToggle = (c: CompteComptable) => {
    setModal({
      open: true,
      variant: c.actif ? 'warning' : 'primary',
      title: c.actif ? `Désactiver le compte ${c.numero} ?` : `Activer le compte ${c.numero} ?`,
      message: c.actif
        ? `Le compte « ${c.intitule} » ne sera plus disponible à la saisie d'écritures.`
        : `Le compte « ${c.intitule} » redeviendra disponible pour les écritures comptables.`,
      loading: false,
      onConfirm: () => doToggle(c),
    });
  };

  const doDelete = async (c: CompteComptable) => {
    setModal((m) => ({ ...m, loading: true }));
    setDeleting(c.id);
    try { await api.delete(`/compta/plan-comptable/${c.id}`); closeModal(); await load(); }
    catch (e: any) { closeModal(); alert(e.response?.data?.message || 'Erreur'); }
    finally { setDeleting(null); }
  };

  const handleDelete = (c: CompteComptable) => {
    setModal({
      open: true,
      variant: 'danger',
      title: `Supprimer ${c.numero} — ${c.intitule} ?`,
      message: 'Cette action est irréversible. Le compte sera supprimé uniquement s\'il ne possède aucune écriture.',
      loading: false,
      onConfirm: () => doDelete(c),
    });
  };

  const handleUpdate = async () => {
    if (!fIntitule.trim()) { setFormError('Intitulé requis'); return; }
    setSaving(true); setFormError('');
    try {
      await api.put(`/compta/plan-comptable/${editId}`, { intitule: fIntitule.trim() });
      setShowForm(false); await load();
    } catch (e: any) { setFormError(e.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!fNumero.trim()) { setFormError('Numéro requis'); return; }
    if (!fIntitule.trim()) { setFormError('Intitulé requis'); return; }
    setSaving(true); setFormError('');
    try {
      await api.post('/compta/plan-comptable', { numero: fNumero.trim(), intitule: fIntitule.trim(), type: fType });
      setShowForm(false); setFNumero(''); setFIntitule(''); setFType('ACTIF');
      await load();
    } catch (e: any) { setFormError(e.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const filtered = comptes.filter((c) => {
    if (filterType && c.type !== filterType) return false;
    if (search && !c.numero.includes(search) && !c.intitule.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const byType = TYPES.reduce((acc, t) => {
    acc[t] = filtered.filter((c) => c.type === t);
    return acc;
  }, {} as Record<string, CompteComptable[]>);

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Plan comptable</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>
            {comptes.length} comptes &middot; {comptes.filter(c => c.actif).length} actifs
          </p>
        </div>
        {canEdit && (
          <button onClick={() => { setFormMode('create'); setFNumero(''); setFIntitule(''); setFType('ACTIF'); setFormError(''); setShowForm(true); }}
            className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouveau compte
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: '200px' }}>
          <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#8b94b0' }}>
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro ou intitulé..." className="input w-full" style={{ paddingLeft: 36 }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterType('')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: !filterType ? '#0b1733' : '#f0f2f9', color: !filterType ? 'white' : '#4a5578' }}>
            Tous
          </button>
          {TYPES.map((t) => {
            const m = TYPE_META[t];
            const active = filterType === t;
            return (
              <button key={t} onClick={() => setFilterType(active ? '' : t)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: active ? m.bg : '#f0f2f9',
                  color: active ? m.color : '#4a5578',
                  border: active ? `1px solid ${m.border}` : '1px solid transparent',
                }}>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 gap-2" style={{ color: '#047857' }}>
          <Spin /><span className="text-sm ml-1" style={{ color: '#8b94b0' }}>Chargement...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f0f2f9' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#8b94b0' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Aucun compte trouvé</p>
          <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Modifiez vos critères ou créez un nouveau compte</p>
        </div>
      ) : (
        <div className="space-y-4">
          {TYPES.filter((t) => byType[t]?.length > 0).map((type) => {
            const m = TYPE_META[type];
            const list = byType[type];
            return (
              <div key={type} className="card overflow-hidden">
                {/* Section header */}
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: m.bg, borderBottom: `1px solid ${m.border}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: m.color }}>
                      <span className="font-bold text-sm text-white">{type[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: m.color }}>{m.label}</p>
                      <p className="text-xs" style={{ color: m.color, opacity: 0.75 }}>
                        {list.length} compte{list.length > 1 ? 's' : ''} &middot; {list.filter(c => c.actif).length} actif{list.filter(c => c.actif).length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: m.color, color: 'white' }}>
                    {type}
                  </span>
                </div>

                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: canEdit ? '90px 1fr 90px 116px' : '90px 1fr 90px', padding: '8px 20px', background: '#f7f8fc', borderBottom: '1px solid #eef0f7' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b94b0' }}>Numéro</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b94b0' }}>Intitulé</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b94b0', textAlign: 'right' }}>Statut</span>
                  {canEdit && <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b94b0', textAlign: 'right' }}>Actions</span>}
                </div>

                {/* Rows */}
                {list.map((c, idx) => (
                  <div key={c.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: canEdit ? '90px 1fr 90px 116px' : '90px 1fr 90px',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: idx < list.length - 1 ? '1px solid #f0f2f9' : 'none',
                      background: idx % 2 === 0 ? 'white' : '#fafbfc',
                    }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: m.bg, color: m.color, width: 'fit-content' }}>
                      {c.numero}
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#0b1733', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.intitule}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.actif ? '#10b981' : '#d1d5db', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: c.actif ? '#047857' : '#9ca3af' }}>
                        {c.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {canEdit && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        {/* Éditer */}
                        <button onClick={() => openEdit(c)} title="Modifier l'intitulé"
                          style={{ width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f9', color: '#4a5578' }}>
                          <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                        {/* Toggle actif */}
                        <button onClick={() => handleToggle(c)} disabled={toggling === c.id} title={c.actif ? 'Désactiver' : 'Activer'}
                          style={{ width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.actif ? '#fef3c7' : '#d1fae5', color: c.actif ? '#b45309' : '#047857', opacity: toggling === c.id ? 0.5 : 1 }}>
                          {toggling === c.id ? (
                            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" style={{ width: 12, height: 12 }}>
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                              <path d={c.actif ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                          )}
                        </button>
                        {/* Supprimer */}
                        <button onClick={() => handleDelete(c)} disabled={deleting === c.id} title="Supprimer"
                          style={{ width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#b91c1c', opacity: deleting === c.id ? 0.5 : 1 }}>
                          {deleting === c.id ? (
                            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" style={{ width: 12, height: 12 }}>
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold" style={{ color: '#0b1733' }}>
                  {formMode === 'create' ? 'Nouveau compte comptable' : 'Modifier le compte'}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
                  {formMode === 'create' ? 'Ajout au plan comptable' : 'Mise à jour de l\'intitulé'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              {formMode === 'create' && (
                <div>
                  <label className="label">Numéro <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input value={fNumero} onChange={(e) => setFNumero(e.target.value)} placeholder="ex: 5710" className="input w-full font-mono" />
                </div>
              )}
              {formMode === 'edit' && (
                <div className="px-3 py-2 rounded-xl text-xs font-mono font-bold" style={{ background: TYPE_META[fType]?.bg, color: TYPE_META[fType]?.color }}>
                  {fNumero}
                </div>
              )}
              <div>
                <label className="label">Intitulé <span style={{ color: '#b91c1c' }}>*</span></label>
                <input value={fIntitule} onChange={(e) => setFIntitule(e.target.value)} placeholder="ex: Caisse principale" className="input w-full" />
              </div>
              {formMode === 'create' && (
                <div>
                  <label className="label">Type <span style={{ color: '#b91c1c' }}>*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPES.map((t) => {
                      const m = TYPE_META[t];
                      const active = fType === t;
                      return (
                        <button key={t} onClick={() => setFType(t)}
                          className="py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background: active ? m.bg : '#f0f2f9',
                            color: active ? m.color : '#4a5578',
                            border: active ? `1.5px solid ${m.color}` : '1.5px solid transparent',
                          }}>
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {formError && <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f9', color: '#4a5578' }}>Annuler</button>
                <button onClick={formMode === 'create' ? handleCreate : handleUpdate} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Spin />} {formMode === 'create' ? 'Créer' : 'Enregistrer'}
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
