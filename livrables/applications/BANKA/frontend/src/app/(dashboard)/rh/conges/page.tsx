'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ANNUEL:     { label: 'Congé annuel', color: '#047857', bg: '#d1fae5', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  MALADIE:    { label: 'Maladie',      color: '#b91c1c', bg: '#fee2e2', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  MATERNITE:  { label: 'Maternité',   color: '#6d28d9', bg: '#ede9fe', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z' },
  PATERNITE:  { label: 'Paternité',   color: '#1d4ed8', bg: '#dbeafe', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  SANS_SOLDE: { label: 'Sans solde',  color: '#b45309', bg: '#fef3c7', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  AUTRE:      { label: 'Autre',       color: '#4a5578', bg: '#f0f2f9', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

const STATUT_META: Record<string, { label: string; color: string; bg: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#b45309', bg: '#fef3c7' },
  APPROUVE:   { label: 'Approuvé',   color: '#047857', bg: '#d1fae5' },
  REFUSE:     { label: 'Refusé',     color: '#b91c1c', bg: '#fee2e2' },
  ANNULE:     { label: 'Annulé',     color: '#8b94b0', bg: '#f0f2f9' },
};

interface Conge {
  id: string; type: string; statut: string;
  dateDebut: string; dateFin: string; nbJours: number; motif?: string;
  employe: { nom: string; prenom: string; matricule: string };
}

const AVATAR_PALETTES: [string, string][] = [
  ['#dbeafe', '#1d4ed8'], ['#ede9fe', '#6d28d9'], ['#d1fae5', '#065f46'],
  ['#fef3c7', '#92400e'], ['#fee2e2', '#991b1b'], ['#e0f2fe', '#0369a1'],
];
function av(name: string) {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_PALETTES.length;
  return { bg: AVATAR_PALETTES[idx][0], color: AVATAR_PALETTES[idx][1] };
}

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function CongesPage() {
  const { utilisateur } = useAuthStore();
  const canApprove = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'].includes(utilisateur?.role || '');

  const [conges, setConges]         = useState<Conge[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [filterStatut, setFilterStatut] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [employes, setEmployes]     = useState<{ id: string; prenom: string; nom: string; matricule: string }[]>([]);
  const [fEmployeId, setFEmployeId] = useState('');
  const [fType, setFType]           = useState('ANNUEL');
  const [fDateDebut, setFDateDebut] = useState('');
  const [fDateFin, setFDateFin]     = useState('');
  const [fMotif, setFMotif]         = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filterStatut) params.set('statut', filterStatut);
      const { data } = await api.get(`/rh/conges?${params}`);
      setConges(data.data.items);
      setTotal(data.data.total);
    } catch { setConges([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatut]);

  const handleAction = async (id: string, statut: 'APPROUVE' | 'REFUSE') => {
    setProcessing(id);
    try {
      await api.patch(`/rh/conges/${id}/statut`, { statut });
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    } finally { setProcessing(null); }
  };

  const openForm = async () => {
    if (employes.length === 0) {
      try { const { data } = await api.get('/rh/employes?statut=ACTIF&limit=100'); setEmployes(data.data.items); } catch {}
    }
    setShowForm(true); setFormError('');
    setFEmployeId(''); setFType('ANNUEL'); setFDateDebut(''); setFDateFin(''); setFMotif('');
  };

  const handleCreate = async () => {
    if (!fEmployeId) { setFormError('Employé requis'); return; }
    if (!fDateDebut || !fDateFin) { setFormError('Dates requises'); return; }
    if (fDateFin < fDateDebut) { setFormError('La date de fin doit être après la date de début'); return; }
    setSaving(true); setFormError('');
    try {
      await api.post('/rh/conges', { employeId: fEmployeId, type: fType, dateDebut: fDateDebut, dateFin: fDateFin, motif: fMotif || undefined });
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const attente    = conges.filter(c => c.statut === 'EN_ATTENTE').length;
  const approuves  = conges.filter(c => c.statut === 'APPROUVE').length;

  const TH: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#94a3c4',
    whiteSpace: 'nowrap' as const,
    background: '#0b1733',
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Congés & Absences</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>
            {total} demande{total > 1 ? 's' : ''}
            {attente > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-semibold"
                style={{ background: '#fef3c7', color: '#b45309' }}>
                {attente} en attente
              </span>
            )}
          </p>
        </div>
        <button onClick={openForm} className="btn-primary flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nouvelle demande
        </button>
      </div>

      {/* KPI */}
      {total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'En attente', value: attente,                         color: '#b45309', bg: '#fef3c7' },
            { label: 'Approuvés',  value: approuves,                       color: '#047857', bg: '#d1fae5' },
            { label: 'Refusés',    value: conges.filter(c => c.statut === 'REFUSE').length,  color: '#b91c1c', bg: '#fee2e2' },
            { label: 'Total',      value: total,                           color: '#4a5578', bg: '#f0f2f9' },
          ].map((k) => (
            <div key={k.label} className="card px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: k.bg }}>
                <span className="text-sm font-bold" style={{ color: k.color }}>{k.value}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: '#4a5578' }}>{k.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="card p-4 flex items-center gap-2 flex-wrap">
        {(['', 'EN_ATTENTE', 'APPROUVE', 'REFUSE', 'ANNULE'] as const).map((s) => {
          const active = filterStatut === s;
          const sm = s ? STATUT_META[s] : null;
          return (
            <button key={s} onClick={() => setFilterStatut(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: active ? (sm ? sm.bg : '#0b1733') : '#f0f2f9',
                color: active ? (sm ? sm.color : 'white') : '#4a5578',
                border: active && sm ? `1px solid ${sm.color}` : '1px solid transparent',
              }}>
              {s ? STATUT_META[s]?.label || s : 'Tous'}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16" style={{ color: '#7c3aed' }}>
            <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
          </div>
        ) : conges.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#fef3c7' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#b45309' }}>
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>
              Aucune demande{filterStatut ? ` — ${STATUT_META[filterStatut]?.label || filterStatut}` : ''}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>
              {filterStatut ? 'Aucune demande avec ce statut' : 'Les demandes de congé apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...TH }}>Employé</th>
                  <th style={{ ...TH, width: '140px' }}>Type</th>
                  <th style={{ ...TH, width: '200px' }}>Période</th>
                  <th style={{ ...TH, width: '80px', textAlign: 'center' }}>Durée</th>
                  <th style={{ ...TH }}>Motif</th>
                  <th style={{ ...TH, width: '120px' }}>Statut</th>
                  {canApprove && <th style={{ ...TH, width: '180px', textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {conges.map((c, idx) => {
                  const sm = STATUT_META[c.statut] || STATUT_META.EN_ATTENTE;
                  const tm = TYPE_META[c.type] || TYPE_META.AUTRE;
                  const avs = av(c.employe.prenom || c.employe.nom);
                  const init = `${c.employe.prenom?.[0] || ''}${c.employe.nom?.[0] || ''}`.toUpperCase();
                  const isProcessing = processing === c.id;
                  const rowBg = c.statut === 'EN_ATTENTE'
                    ? (idx % 2 === 0 ? '#fffdf7' : '#fffbeb')
                    : (idx % 2 === 0 ? 'white' : '#fafbfc');
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f0f2f9', background: rowBg }}>
                      {/* Employé */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, background: avs.bg, color: avs.color }}>
                            {init}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0b1733', lineHeight: 1.2 }}>
                              {c.employe.prenom} {c.employe.nom}
                            </p>
                            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#8b94b0', marginTop: 2 }}>{c.employe.matricule}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tm.bg }}>
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13, color: tm.color }}>
                              <path d={tm.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: tm.color }}>{tm.label}</span>
                        </div>
                      </td>

                      {/* Période */}
                      <td style={{ padding: '13px 16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#4a5578', whiteSpace: 'nowrap' }}>{formatDate(c.dateDebut)}</p>
                        <p style={{ fontSize: '11px', color: '#8b94b0', marginTop: 2 }}>au {formatDate(c.dateFin)}</p>
                      </td>

                      {/* Durée */}
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: 7, background: '#dbeafe', color: '#1d4ed8' }}>
                          {c.nbJours}j
                        </span>
                      </td>

                      {/* Motif */}
                      <td style={{ padding: '13px 16px', maxWidth: 200 }}>
                        <p style={{ fontSize: '12px', color: '#8b94b0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.motif || '—'}
                        </p>
                      </td>

                      {/* Statut */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: sm.bg, color: sm.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sm.color, flexShrink: 0 }} />
                          {sm.label}
                        </span>
                      </td>

                      {/* Actions */}
                      {canApprove && (
                        <td style={{ padding: '13px 16px' }}>
                          {c.statut === 'EN_ATTENTE' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              <button
                                onClick={() => handleAction(c.id, 'APPROUVE')}
                                disabled={isProcessing}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: '#d1fae5', color: '#047857', opacity: isProcessing ? 0.5 : 1, transition: 'opacity .15s' }}>
                                {isProcessing ? <Spin /> : (
                                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                                Approuver
                              </button>
                              <button
                                onClick={() => handleAction(c.id, 'REFUSE')}
                                disabled={isProcessing}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: '#fee2e2', color: '#b91c1c', opacity: isProcessing ? 0.5 : 1, transition: 'opacity .15s' }}>
                                {isProcessing ? <Spin /> : (
                                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                  </svg>
                                )}
                                Refuser
                              </button>
                            </div>
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center', fontSize: '12px', color: '#d1d5db' }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold" style={{ color: '#0b1733' }}>Demande de congé</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Renseignez les informations de la demande</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Employé <span style={{ color: '#b91c1c' }}>*</span></label>
                <select value={fEmployeId} onChange={(e) => setFEmployeId(e.target.value)} className="input w-full">
                  <option value="">Sélectionner un employé...</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {e.matricule}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Type de congé <span style={{ color: '#b91c1c' }}>*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TYPE_META).map(([key, tm]) => (
                    <button key={key} onClick={() => setFType(key)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left"
                      style={{
                        background: fType === key ? tm.bg : '#f0f2f9',
                        color: fType === key ? tm.color : '#4a5578',
                        border: fType === key ? `1.5px solid ${tm.color}` : '1.5px solid transparent',
                      }}>
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14, flexShrink: 0 }}>
                        <path d={tm.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {tm.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Début <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="date" value={fDateDebut} onChange={(e) => setFDateDebut(e.target.value)} className="input w-full" />
                </div>
                <div>
                  <label className="label">Fin <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="date" value={fDateFin} onChange={(e) => setFDateFin(e.target.value)} className="input w-full" min={fDateDebut} />
                </div>
              </div>
              <div>
                <label className="label">Motif</label>
                <textarea value={fMotif} onChange={(e) => setFMotif(e.target.value)} rows={2}
                  placeholder="Motif ou précisions..." className="input w-full resize-none" />
              </div>
              {formError && (
                <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{formError}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#f0f2f9', color: '#4a5578' }}>
                  Annuler
                </button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Spin />}
                  Soumettre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
