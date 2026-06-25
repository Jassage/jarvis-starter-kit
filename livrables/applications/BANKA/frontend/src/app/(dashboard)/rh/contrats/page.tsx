'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatMontant } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { generateContratTravail, openContratTravail, type ContratPDFData } from '@/lib/contratPDF';

const TYPE_LABELS: Record<string, string> = { CDI: 'CDI', CDD: 'CDD', STAGE: 'Stage', CONSULTANT: 'Consultant' };
const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  CDI:        { color: '#047857', bg: '#d1fae5' },
  CDD:        { color: '#b45309', bg: '#fef3c7' },
  STAGE:      { color: '#1e40af', bg: '#dbeafe' },
  CONSULTANT: { color: '#6d28d9', bg: '#ede9fe' },
};
const STATUT_COLORS: Record<string, { color: string; bg: string }> = {
  ACTIF:   { color: '#047857', bg: '#d1fae5' },
  EXPIRE:  { color: '#b91c1c', bg: '#fee2e2' },
  RESILIE: { color: '#8b94b0', bg: '#f0f2f9' },
};

interface Contrat {
  id: string; reference: string; type: string; statut: string;
  dateDebut: string; dateFin?: string; salaireBrut: number; notes?: string;
  employe: { nom: string; prenom: string; matricule: string };
}
interface Employe { id: string; nom: string; prenom: string; matricule: string; }

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

export default function ContratsPage() {
  const { utilisateur } = useAuthStore();
  const canManage = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'].includes(utilisateur?.role || '');
  const institutionNom = (utilisateur as any)?.agence?.nom || 'BANKA';

  const [contrats, setContrats]     = useState<Contrat[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [filterStatut, setFilterStatut] = useState('');

  const [resiliating, setResiliating] = useState<string | null>(null);
  const [resilierModal, setResilierModal] = useState<{ open: boolean; contrat: Contrat | null; loading: boolean }>({ open: false, contrat: null, loading: false });

  const handleResilier = (c: Contrat) => {
    setResilierModal({ open: true, contrat: c, loading: false });
  };

  const doResilier = async () => {
    const c = resilierModal.contrat;
    if (!c) return;
    setResilierModal((m) => ({ ...m, loading: true }));
    setResiliating(c.id);
    try {
      await api.patch(`/rh/contrats/${c.id}/resilier`, {});
      setResilierModal({ open: false, contrat: null, loading: false });
      await load();
    } catch (err: any) {
      setResilierModal((m) => ({ ...m, loading: false, open: false }));
      alert(err.response?.data?.message || 'Erreur lors de la résiliation');
    } finally { setResiliating(null); }
  };

  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [employes, setEmployes]     = useState<Employe[]>([]);
  const [empSearch, setEmpSearch]   = useState('');
  const [fEmployeId, setFEmployeId] = useState('');
  const [fEmployeLabel, setFEmployeLabel] = useState('');
  const [fType, setFType]           = useState('CDI');
  const [fDebut, setFDebut]         = useState('');
  const [fFin, setFFin]             = useState('');
  const [fSalaire, setFSalaire]     = useState('');
  const [fNotes, setFNotes]         = useState('');
  const [showEmpList, setShowEmpList] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filterStatut) params.set('statut', filterStatut);
      const { data } = await api.get(`/rh/contrats?${params}`);
      setContrats(data.data.items);
      setTotal(data.data.total);
    } catch { setContrats([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatut]);

  const searchEmployes = async (q: string) => {
    setEmpSearch(q);
    if (q.length < 2) { setEmployes([]); setShowEmpList(false); return; }
    try {
      const { data } = await api.get(`/rh/employes?search=${encodeURIComponent(q)}&limit=8`);
      setEmployes(data.data.items);
      setShowEmpList(true);
    } catch {}
  };

  const selectEmploye = (e: Employe) => {
    setFEmployeId(e.id);
    setFEmployeLabel(`${e.prenom} ${e.nom} (${e.matricule})`);
    setEmpSearch(`${e.prenom} ${e.nom}`);
    setShowEmpList(false);
  };

  const openForm = () => {
    setShowForm(true); setFormError('');
    setFEmployeId(''); setFEmployeLabel(''); setEmpSearch('');
    setFType('CDI'); setFDebut(''); setFFin(''); setFSalaire(''); setFNotes('');
  };

  const handleCreate = async () => {
    if (!fEmployeId) { setFormError('Sélectionnez un employé'); return; }
    if (!fDebut) { setFormError('Date de début requise'); return; }
    if (!fSalaire || Number(fSalaire) <= 0) { setFormError('Salaire brut invalide'); return; }
    setSaving(true); setFormError('');
    try {
      await api.post('/rh/contrats', {
        employeId: fEmployeId, type: fType,
        dateDebut: fDebut, dateFin: fFin || undefined,
        salaireBrut: Number(fSalaire),
        notes: fNotes.trim() || undefined,
      });
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const pdfData = (c: Contrat): ContratPDFData => ({
    reference: c.reference, type: c.type,
    dateDebut: c.dateDebut, dateFin: c.dateFin,
    salaireBrut: Number(c.salaireBrut), notes: c.notes, employe: c.employe,
  });

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

  const actifCount   = contrats.filter(c => c.statut === 'ACTIF').length;
  const expireCount  = contrats.filter(c => c.statut === 'EXPIRE').length;
  const expiringSoon = contrats.filter(c => c.dateFin && c.statut === 'ACTIF' && new Date(c.dateFin) < new Date(Date.now() + 30 * 86400000)).length;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Contrats</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>
            {total} contrat{total > 1 ? 's' : ''} &middot; {actifCount} actif{actifCount > 1 ? 's' : ''}
            {expiringSoon > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-semibold"
                style={{ background: '#fef3c7', color: '#b45309' }}>
                ⚠ {expiringSoon} expirent bientôt
              </span>
            )}
          </p>
        </div>
        {canManage && (
          <button onClick={openForm} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nouveau contrat
          </button>
        )}
      </div>

      {/* KPI bar */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Actifs',   value: actifCount,               color: '#047857', bg: '#d1fae5' },
            { label: 'Expirés',  value: expireCount,              color: '#b91c1c', bg: '#fee2e2' },
            { label: 'Résiliés', value: total - actifCount - expireCount, color: '#8b94b0', bg: '#f0f2f9' },
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
        {(['', 'ACTIF', 'EXPIRE', 'RESILIE'] as const).map((s) => {
          const active = filterStatut === s;
          const sc = s ? STATUT_COLORS[s] : null;
          return (
            <button key={s} onClick={() => setFilterStatut(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: active ? (sc ? sc.bg : '#0b1733') : '#f0f2f9',
                color: active ? (sc ? sc.color : 'white') : '#4a5578',
                border: active && sc ? `1px solid ${sc.color}` : '1px solid transparent',
              }}>
              {s || 'Tous'}
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
        ) : contrats.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#ede9fe' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#6d28d9' }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>
              Aucun contrat{filterStatut ? ` — ${filterStatut}` : ''}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Créez le premier contrat de l'institution</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...TH }}>Employé</th>
                  <th style={{ ...TH, width: '110px' }}>Référence</th>
                  <th style={{ ...TH, width: '100px' }}>Type</th>
                  <th style={{ ...TH, width: '120px' }}>Début</th>
                  <th style={{ ...TH, width: '140px' }}>Fin</th>
                  <th style={{ ...TH, textAlign: 'right', width: '160px' }}>Salaire brut</th>
                  <th style={{ ...TH, width: '100px' }}>Statut</th>
                  <th style={{ ...TH, textAlign: 'center', width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contrats.map((c, idx) => {
                  const tc = TYPE_COLORS[c.type] || TYPE_COLORS.CONSULTANT;
                  const sc = STATUT_COLORS[c.statut] || STATUT_COLORS.RESILIE;
                  const avs = av(c.employe.prenom || c.employe.nom);
                  const init = `${c.employe.prenom?.[0] || ''}${c.employe.nom?.[0] || ''}`.toUpperCase();
                  const expiring = c.dateFin && c.statut === 'ACTIF' && new Date(c.dateFin) < new Date(Date.now() + 30 * 86400000);
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f0f2f9', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                      {/* Employé */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

                      {/* Référence */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#4a5578', background: '#f0f2f9', padding: '3px 7px', borderRadius: 5 }}>
                          {c.reference}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: tc.bg, color: tc.color }}>
                          {TYPE_LABELS[c.type] || c.type}
                        </span>
                      </td>

                      {/* Début */}
                      <td style={{ padding: '13px 16px', fontSize: '13px', color: '#4a5578', whiteSpace: 'nowrap' }}>
                        {formatDate(c.dateDebut)}
                      </td>

                      {/* Fin */}
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        {c.dateFin ? (
                          <div>
                            <span style={{ fontSize: '13px', color: expiring ? '#b91c1c' : '#4a5578' }}>
                              {formatDate(c.dateFin)}
                            </span>
                            {expiring && (
                              <span style={{ marginLeft: 6, fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 5, background: '#fef3c7', color: '#b45309' }}>
                                Bientôt
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#8b94b0' }}>Indéterminée</span>
                        )}
                      </td>

                      {/* Salaire */}
                      <td style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0b1733' }}>
                          {formatMontant(c.salaireBrut, 'HTG')}
                        </span>
                      </td>

                      {/* Statut */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                          {c.statut}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          {/* Voir PDF */}
                          <button
                            onClick={() => openContratTravail(pdfData(c), institutionNom)}
                            title="Ouvrir le contrat"
                            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dbeafe', color: '#1d4ed8', transition: 'opacity .15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 15, height: 15 }}>
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          {/* Télécharger PDF */}
                          <button
                            onClick={() => generateContratTravail(pdfData(c), institutionNom)}
                            title="Télécharger le contrat"
                            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f9', color: '#4a5578', transition: 'opacity .15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 15, height: 15 }}>
                              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {/* Résilier */}
                          {canManage && c.statut === 'ACTIF' && (
                            <button
                              onClick={() => handleResilier(c)}
                              disabled={resiliating === c.id}
                              title="Résilier le contrat"
                              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#b91c1c', transition: 'opacity .15s', opacity: resiliating === c.id ? 0.5 : 1 }}>
                              {resiliating === c.id ? (
                                <svg className="animate-spin" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                                  <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
                                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal création */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base" style={{ color: '#0b1733' }}>Nouveau contrat</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Saisissez les informations du contrat</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {/* Employé */}
              <div className="relative">
                <label className="label">Employé <span style={{ color: '#b91c1c' }}>*</span></label>
                <input
                  value={empSearch}
                  onChange={(e) => searchEmployes(e.target.value)}
                  onFocus={() => empSearch.length >= 2 && setShowEmpList(true)}
                  onBlur={() => setTimeout(() => setShowEmpList(false), 150)}
                  placeholder="Rechercher un employé..."
                  className="input w-full"
                />
                {fEmployeLabel && (
                  <p className="text-xs mt-1 font-medium flex items-center gap-1" style={{ color: '#047857' }}>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 12, height: 12 }}>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {fEmployeLabel}
                  </p>
                )}
                {showEmpList && employes.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 rounded-xl shadow-lg overflow-hidden"
                    style={{ background: 'white', border: '1px solid #e4e7f0' }}>
                    {employes.map((e) => (
                      <button key={e.id} onMouseDown={() => selectEmploye(e)}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                        style={{ background: 'white', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(el) => (el.currentTarget.style.background = '#f7f8fc')}
                        onMouseLeave={(el) => (el.currentTarget.style.background = 'white')}>
                        <span className="font-medium" style={{ color: '#0b1733' }}>{e.prenom} {e.nom}</span>
                        <span className="text-xs font-mono ml-2" style={{ color: '#8b94b0' }}>{e.matricule}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="label">Type de contrat <span style={{ color: '#b91c1c' }}>*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TYPE_LABELS).map(([key, label]) => {
                    const tc = TYPE_COLORS[key];
                    return (
                      <button key={key} onClick={() => setFType(key)}
                        className="py-2.5 rounded-xl text-xs font-semibold transition-colors"
                        style={{
                          background: fType === key ? tc.bg : '#f0f2f9',
                          color: fType === key ? tc.color : '#4a5578',
                          border: fType === key ? `1.5px solid ${tc.color}` : '1.5px solid transparent',
                        }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date de début <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="date" value={fDebut} onChange={(e) => setFDebut(e.target.value)} className="input w-full" />
                </div>
                <div>
                  <label className="label">Date de fin <span style={{ color: '#8b94b0' }}>(optionnel)</span></label>
                  <input type="date" value={fFin} onChange={(e) => setFFin(e.target.value)} className="input w-full" min={fDebut} />
                </div>
              </div>

              {/* Salaire */}
              <div>
                <label className="label">Salaire brut (HTG) <span style={{ color: '#b91c1c' }}>*</span></label>
                <input type="number" value={fSalaire} onChange={(e) => setFSalaire(e.target.value)} min="0" placeholder="0" className="input w-full" />
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes / Conditions particulières</label>
                <textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)}
                  placeholder="Remarques, conditions spécifiques..." className="input w-full" rows={3} />
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
                  Créer le contrat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={resilierModal.open}
        title={`Résilier le contrat ${resilierModal.contrat?.reference || ''} ?`}
        message={`Le contrat de ${resilierModal.contrat?.employe.prenom || ''} ${resilierModal.contrat?.employe.nom || ''} sera marqué comme résilié. Cette action est irréversible.`}
        variant="danger"
        confirmLabel="Résilier"
        loading={resilierModal.loading}
        onConfirm={doResilier}
        onCancel={() => setResilierModal({ open: false, contrat: null, loading: false })}
      />
    </div>
  );
}
