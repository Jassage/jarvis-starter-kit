'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PRESENT:     { label: 'Présent',      color: '#047857', bg: '#dcfce7', border: '#86efac' },
  ABSENT:      { label: 'Absent',       color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
  RETARD:      { label: 'Retard',       color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
  DEMI_JOURNEE:{ label: 'Demi-journée', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
};

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

function today()         { return new Date().toISOString().slice(0, 10); }
function currentPeriode(){ return new Date().toISOString().slice(0, 7); }

interface JournalierEntry {
  id: string; matricule: string; nom: string; prenom: string;
  departement?: string; poste?: { intitule: string };
  pointage: { id: string; statut: string; heureArrivee?: string; heureDepart?: string;
    retardMinutes?: number; notes?: string; source?: string } | null;
}

interface HistoriqueItem {
  id: string; statut: string; date: string; source?: string;
  heureArrivee?: string; heureDepart?: string; retardMinutes?: number; notes?: string;
  device?: { nom: string };
  employe: { id: string; nom: string; prenom: string; matricule: string; departement?: string; poste?: { intitule: string } };
}

interface Stats {
  periode: string; totalActifs: number; totalPointages: number;
  totalPresent: number; totalAbsent: number; totalRetard: number; totalDemiJournee: number;
  parEmploye: Array<{ employe: any; present: number; absent: number; retard: number; demiJournee: number; total: number }>;
}

interface Device {
  id: string; nom: string; serialNumber: string; commKey: string;
  actif: boolean; derniereSync?: string; _count?: { pointages: number };
}

type PendingEdit = { statut: string; heureArrivee: string; heureDepart: string; retardMinutes: string; notes: string };

export default function PointagePage() {
  const [tab, setTab] = useState<'saisie' | 'historique' | 'appareils'>('saisie');

  // ── Saisie ──────────────────────────────────────────────────────────────────
  const [date, setDate]               = useState(today());
  const [journalier, setJournalier]   = useState<JournalierEntry[]>([]);
  const [loadingJ, setLoadingJ]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saveResult, setSaveResult]   = useState<{ created: number; updated: number; errors: number } | null>(null);
  const [pending, setPending]         = useState<Record<string, PendingEdit>>({});
  const [filterDept, setFilterDept]   = useState('');
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  const loadJournalier = useCallback(async () => {
    setLoadingJ(true); setSaveResult(null);
    try {
      const { data } = await api.get(`/rh/pointage/journalier?date=${date}`);
      const rows: JournalierEntry[] = data.data;
      setJournalier(rows);
      const init: Record<string, PendingEdit> = {};
      for (const r of rows) {
        init[r.id] = {
          statut:        r.pointage?.statut       || 'PRESENT',
          heureArrivee:  r.pointage?.heureArrivee ? new Date(r.pointage.heureArrivee).toTimeString().slice(0, 5) : '',
          heureDepart:   r.pointage?.heureDepart  ? new Date(r.pointage.heureDepart).toTimeString().slice(0, 5)  : '',
          retardMinutes: r.pointage?.retardMinutes ? String(r.pointage.retardMinutes) : '',
          notes:         r.pointage?.notes || '',
        };
      }
      setPending(init);
    } catch { setJournalier([]); }
    finally { setLoadingJ(false); }
  }, [date]);

  useEffect(() => { loadJournalier(); }, [loadJournalier]);

  const setField = (id: string, field: keyof PendingEdit, value: string) =>
    setPending((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const entries = journalier.map((e) => {
        const p = pending[e.id];
        return {
          employeId:    e.id,
          statut:       p?.statut || 'PRESENT',
          heureArrivee: p?.heureArrivee || undefined,
          heureDepart:  p?.heureDepart  || undefined,
          retardMinutes:p?.retardMinutes ? parseInt(p.retardMinutes) : undefined,
          notes:        p?.notes        || undefined,
        };
      });
      const { data } = await api.post('/rh/pointage/bulk', { date, entries });
      setSaveResult(data.data);
      await loadJournalier();
    } catch {}
    finally { setSaving(false); }
  };

  const depts    = Array.from(new Set(journalier.map((e) => e.departement).filter(Boolean)));
  const filtered = filterDept ? journalier.filter((e) => e.departement === filterDept) : journalier;
  const statCounts = journalier.reduce((acc, e) => {
    const s = pending[e.id]?.statut || 'PRESENT';
    acc[s] = (acc[s] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  // ── Historique ───────────────────────────────────────────────────────────────
  const [periode, setPeriode]         = useState(currentPeriode());
  const [historique, setHistorique]   = useState<HistoriqueItem[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [loadingH, setLoadingH]       = useState(false);
  const [hPage, setHPage]             = useState(1);
  const [hTotal, setHTotal]           = useState(0);
  const [hPages, setHPages]           = useState(1);
  const [hFilterStatut, setHFilterStatut] = useState('');
  const [hView, setHView]             = useState<'liste' | 'stats'>('liste');

  const loadHistorique = useCallback(async () => {
    setLoadingH(true);
    try {
      const p = new URLSearchParams({ periode, page: String(hPage), limit: '30' });
      if (hFilterStatut) p.set('statut', hFilterStatut);
      const [hRes, sRes] = await Promise.all([
        api.get(`/rh/pointage?${p}`),
        api.get(`/rh/pointage/stats?periode=${periode}`),
      ]);
      setHistorique(hRes.data.data.items);
      setHTotal(hRes.data.data.total);
      setHPages(hRes.data.data.pages || 1);
      setStats(sRes.data.data);
    } catch { setHistorique([]); setStats(null); }
    finally { setLoadingH(false); }
  }, [periode, hPage, hFilterStatut]);

  useEffect(() => { if (tab === 'historique') loadHistorique(); }, [tab, loadHistorique]);

  const handleDeleteH = async (id: string) => {
    if (!confirm('Supprimer ce pointage ?')) return;
    try { await api.delete(`/rh/pointage/${id}`); await loadHistorique(); } catch {}
  };

  // ── Appareils ────────────────────────────────────────────────────────────────
  const [devices, setDevices]         = useState<Device[]>([]);
  const [loadingD, setLoadingD]       = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editDevice, setEditDevice]   = useState<Device | null>(null);
  const [savingD, setSavingD]         = useState(false);
  const [dNom, setDNom]               = useState('');
  const [dSN, setDSN]                 = useState('');
  const [dKey, setDKey]               = useState('');
  const [dError, setDError]           = useState('');

  const loadDevices = useCallback(async () => {
    setLoadingD(true);
    try { const { data } = await api.get('/rh/pointage/devices'); setDevices(data.data); }
    catch { setDevices([]); }
    finally { setLoadingD(false); }
  }, []);

  useEffect(() => { if (tab === 'appareils') loadDevices(); }, [tab, loadDevices]);

  const openNewDevice = () => {
    setEditDevice(null); setDNom(''); setDSN(''); setDKey(''); setDError('');
    setShowDeviceForm(true);
  };
  const openEditDevice = (d: Device) => {
    setEditDevice(d); setDNom(d.nom); setDSN(d.serialNumber); setDKey(d.commKey); setDError('');
    setShowDeviceForm(true);
  };
  const handleSaveDevice = async () => {
    if (!dNom.trim()) { setDError('Nom requis'); return; }
    if (!editDevice && !dSN.trim()) { setDError('Numéro de série requis'); return; }
    setSavingD(true); setDError('');
    try {
      if (editDevice) {
        await api.put(`/rh/pointage/devices/${editDevice.id}`, { nom: dNom.trim(), commKey: dKey.trim() });
      } else {
        await api.post('/rh/pointage/devices', { nom: dNom.trim(), serialNumber: dSN.trim(), commKey: dKey.trim() });
      }
      setShowDeviceForm(false); await loadDevices();
    } catch (e: any) { setDError(e.response?.data?.message || 'Erreur'); }
    finally { setSavingD(false); }
  };
  const handleToggleDevice = async (d: Device) => {
    try { await api.put(`/rh/pointage/devices/${d.id}`, { actif: !d.actif }); await loadDevices(); } catch {}
  };
  const handleDeleteDevice = async (d: Device) => {
    if (!confirm(`Supprimer l'appareil « ${d.nom} » ?`)) return;
    try { await api.delete(`/rh/pointage/devices/${d.id}`); await loadDevices(); } catch (e: any) {
      alert(e.response?.data?.message || 'Erreur');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Pointage</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Suivi des présences et absences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#f7f8fc' }}>
        {([
          ['saisie',     'Saisie journalière'],
          ['historique', 'Historique & Stats'],
          ['appareils',  'Appareils ZKTeco'],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === k ? { background: 'white', color: '#7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#8b94b0' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ────────────────────── TAB SAISIE ────────────────────────────────────── */}
      {tab === 'saisie' && (
        <div className="space-y-4">
          <div className="card p-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#7c3aed' }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 7v5l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" style={{ width: 160 }} />
            </div>
            {depts.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => setFilterDept('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: !filterDept ? '#7c3aed' : '#f0f2f9', color: !filterDept ? 'white' : '#4a5578' }}>
                  Tous
                </button>
                {depts.map((d) => (
                  <button key={d} onClick={() => setFilterDept(d === filterDept ? '' : d!)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: filterDept === d ? '#7c3aed' : '#f0f2f9', color: filterDept === d ? 'white' : '#4a5578' }}>
                    {d}
                  </button>
                ))}
              </div>
            )}
            <div className="ml-auto flex items-center gap-3">
              {saveResult && (
                <p className="text-xs" style={{ color: '#047857' }}>
                  {saveResult.created + saveResult.updated} enregistrement(s) sauvegardé(s)
                  {saveResult.errors > 0 && <span style={{ color: '#b91c1c' }}> · {saveResult.errors} erreur(s)</span>}
                </p>
              )}
              <button onClick={handleBulkSave} disabled={saving || journalier.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {saving && <Spin />}
                Enregistrer tout
              </button>
            </div>
          </div>

          {journalier.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {Object.entries(STATUT_CONFIG).map(([k, cfg]) => (
                <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                  {cfg.label} : {statCounts[k] || 0}
                </div>
              ))}
            </div>
          )}

          {loadingJ ? (
            <div className="card flex items-center justify-center py-16 gap-2" style={{ color: '#7c3aed' }}>
              <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card py-16 text-center">
              <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Aucun employé actif trouvé</p>
              <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Vérifiez que des employés sont enregistrés avec le statut ACTIF</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((emp) => {
                const p   = pending[emp.id] || { statut: 'PRESENT', heureArrivee: '', heureDepart: '', retardMinutes: '', notes: '' };
                const cfg = STATUT_CONFIG[p.statut] || STATUT_CONFIG.PRESENT;
                const isExpanded = expandedId === emp.id;
                const initials = `${emp.prenom?.[0] || ''}${emp.nom?.[0] || ''}`.toUpperCase();
                const saved = !!emp.pointage;
                const fromDevice = emp.pointage?.source === 'APPAREIL';

                return (
                  <div key={emp.id} className="card overflow-hidden transition-shadow hover:shadow-md"
                    style={{ borderLeft: `3px solid ${cfg.border}` }}>
                    <div className="px-5 py-3 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{emp.prenom} {emp.nom}</p>
                          {saved && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ background: fromDevice ? '#ede9fe' : '#dcfce7', color: fromDevice ? '#6d28d9' : '#047857' }}>
                              {fromDevice ? '⬡ Appareil' : 'Manuel'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: '#8b94b0' }}>
                          {emp.matricule}{emp.poste ? ` · ${emp.poste.intitule}` : ''}{emp.departement ? ` · ${emp.departement}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end" style={{ maxWidth: 340 }}>
                        {Object.entries(STATUT_CONFIG).map(([k, c]) => (
                          <button key={k} onClick={() => setField(emp.id, 'statut', k)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                            style={p.statut === k
                              ? { background: c.bg, color: c.color, border: `1.5px solid ${c.border}` }
                              : { background: '#f0f2f9', color: '#8b94b0', border: '1.5px solid transparent' }}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg"
                        style={{ background: '#f0f2f9', color: '#8b94b0' }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#fafbfd' }}>
                        <div>
                          <label className="label">Heure d'arrivée</label>
                          <input type="time" value={p.heureArrivee}
                            onChange={(e) => setField(emp.id, 'heureArrivee', e.target.value)} className="input w-full" />
                        </div>
                        <div>
                          <label className="label">Heure de départ</label>
                          <input type="time" value={p.heureDepart}
                            onChange={(e) => setField(emp.id, 'heureDepart', e.target.value)} className="input w-full" />
                        </div>
                        {p.statut === 'RETARD' && (
                          <div>
                            <label className="label">Retard (minutes)</label>
                            <input type="number" min="0" value={p.retardMinutes}
                              onChange={(e) => setField(emp.id, 'retardMinutes', e.target.value)}
                              placeholder="ex: 15" className="input w-full" />
                          </div>
                        )}
                        <div className={p.statut === 'RETARD' ? '' : 'col-span-2'}>
                          <label className="label">Notes</label>
                          <input value={p.notes} onChange={(e) => setField(emp.id, 'notes', e.target.value)}
                            placeholder="Commentaire optionnel" className="input w-full" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────── TAB HISTORIQUE ────────────────────────────────── */}
      {tab === 'historique' && (
        <div className="space-y-4">
          <div className="card p-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#7c3aed' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input type="month" value={periode} onChange={(e) => { setPeriode(e.target.value); setHPage(1); }} className="input" style={{ width: 160 }} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setHFilterStatut('')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: !hFilterStatut ? '#7c3aed' : '#f0f2f9', color: !hFilterStatut ? 'white' : '#4a5578' }}>
                Tous
              </button>
              {Object.entries(STATUT_CONFIG).map(([k, c]) => (
                <button key={k} onClick={() => { setHFilterStatut(hFilterStatut === k ? '' : k); setHPage(1); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: hFilterStatut === k ? c.bg : '#f0f2f9', color: hFilterStatut === k ? c.color : '#4a5578', border: hFilterStatut === k ? `1px solid ${c.border}` : '1px solid transparent' }}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-1.5 p-1 rounded-xl" style={{ background: '#f0f2f9' }}>
              {([['liste', 'Liste'], ['stats', 'Statistiques']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setHView(v)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={hView === v ? { background: 'white', color: '#7c3aed', boxShadow: '0 1px 2px rgba(0,0,0,0.07)' } : { color: '#8b94b0' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {loadingH ? (
            <div className="card flex items-center justify-center py-16 gap-2" style={{ color: '#7c3aed' }}>
              <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
            </div>
          ) : hView === 'stats' ? (
            <div className="space-y-4">
              {stats && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { title: 'Présences',     value: stats.totalPresent,     key: 'PRESENT' as const },
                      { title: 'Absences',      value: stats.totalAbsent,      key: 'ABSENT' as const },
                      { title: 'Retards',       value: stats.totalRetard,      key: 'RETARD' as const },
                      { title: 'Demi-journées', value: stats.totalDemiJournee, key: 'DEMI_JOURNEE' as const },
                    ]).map((s) => {
                      const cfg = STATUT_CONFIG[s.key];
                      return (
                        <div key={s.key} className="card p-4 text-center" style={{ borderTop: `3px solid ${cfg.border}` }}>
                          <p className="text-3xl font-bold" style={{ color: cfg.color }}>{s.value}</p>
                          <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>{s.title}</p>
                        </div>
                      );
                    })}
                  </div>
                  {stats.parEmploye.length > 0 && (
                    <div className="card overflow-hidden">
                      <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f2f9' }}>
                        <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Détail par employé</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: '#f7f8fc' }}>
                              <th className="text-left px-5 py-2.5 text-xs font-semibold" style={{ color: '#8b94b0' }}>Employé</th>
                              {(['PRESENT','ABSENT','RETARD','DEMI_JOURNEE'] as const).map((k) => (
                                <th key={k} className="text-center px-3 py-2.5 text-xs font-semibold" style={{ color: STATUT_CONFIG[k].color }}>
                                  {STATUT_CONFIG[k].label.split('-')[0]}
                                </th>
                              ))}
                              <th className="text-center px-3 py-2.5 text-xs font-semibold" style={{ color: '#8b94b0' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.parEmploye.sort((a, b) => b.total - a.total).map((row, i) => (
                              <tr key={row.employe.id} style={{ background: i % 2 === 0 ? 'white' : '#fafbfd', borderTop: '1px solid #f0f2f9' }}>
                                <td className="px-5 py-2.5">
                                  <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{row.employe.prenom} {row.employe.nom}</p>
                                  <p className="text-xs" style={{ color: '#8b94b0' }}>{row.employe.matricule}</p>
                                </td>
                                <td className="text-center px-3 py-2.5 font-bold" style={{ color: STATUT_CONFIG.PRESENT.color }}>{row.present}</td>
                                <td className="text-center px-3 py-2.5 font-bold" style={{ color: STATUT_CONFIG.ABSENT.color }}>{row.absent}</td>
                                <td className="text-center px-3 py-2.5 font-bold" style={{ color: STATUT_CONFIG.RETARD.color }}>{row.retard}</td>
                                <td className="text-center px-3 py-2.5 font-bold" style={{ color: STATUT_CONFIG.DEMI_JOURNEE.color }}>{row.demiJournee}</td>
                                <td className="text-center px-3 py-2.5 font-semibold" style={{ color: '#4a5578' }}>{row.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {hTotal > 0 && hPages > 1 && (
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm" style={{ color: '#8b94b0' }}>
                    Page <span className="font-semibold" style={{ color: '#0b1733' }}>{hPage}</span> sur {hPages}
                    <span className="ml-2" style={{ color: '#d1d5e4' }}>·</span>
                    <span className="ml-2">{hTotal} enregistrement(s)</span>
                  </p>
                  <div className="flex gap-2">
                    <button disabled={hPage === 1} onClick={() => setHPage(hPage - 1)} className="btn-ghost text-xs disabled:opacity-40">← Précédent</button>
                    <button disabled={hPage === hPages} onClick={() => setHPage(hPage + 1)} className="btn-ghost text-xs disabled:opacity-40">Suivant →</button>
                  </div>
                </div>
              )}
              {historique.length === 0 ? (
                <div className="card py-16 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Aucun pointage pour cette période</p>
                </div>
              ) : historique.map((h) => {
                const cfg    = STATUT_CONFIG[h.statut] || STATUT_CONFIG.PRESENT;
                const d      = new Date(h.date);
                const dateStr= d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
                const fmtH   = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;
                return (
                  <div key={h.id} className="card px-5 py-3 flex items-center gap-4" style={{ borderLeft: `3px solid ${cfg.border}` }}>
                    <div className="flex-shrink-0 w-20 text-center">
                      <p className="text-xs font-semibold capitalize" style={{ color: '#4a5578' }}>{dateStr}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{h.employe.prenom} {h.employe.nom}</p>
                        {h.source === 'APPAREIL' && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                            {h.device?.nom || 'Appareil'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: '#8b94b0' }}>
                        {h.employe.matricule}{h.employe.poste ? ` · ${h.employe.poste.intitule}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                    <div className="hidden sm:flex items-center gap-3 text-xs flex-shrink-0" style={{ color: '#8b94b0' }}>
                      {fmtH(h.heureArrivee) && <span>Arrivée {fmtH(h.heureArrivee)}</span>}
                      {fmtH(h.heureDepart)  && <span>Départ {fmtH(h.heureDepart)}</span>}
                      {h.retardMinutes && <span style={{ color: STATUT_CONFIG.RETARD.color }}>{h.retardMinutes}min</span>}
                    </div>
                    <button onClick={() => handleDeleteH(h.id)}
                      className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg"
                      style={{ background: '#fee2e2', color: '#b91c1c' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────── TAB APPAREILS ─────────────────────────────────── */}
      {tab === 'appareils' && (
        <div className="space-y-4">
          {/* Info config */}
          <div className="card p-4 flex items-start gap-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#0369a1' }}>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="text-sm" style={{ color: '#0c4a6e' }}>
              <p className="font-semibold mb-1">Configuration du terminal ZKTeco</p>
              <p className="text-xs leading-relaxed" style={{ color: '#075985' }}>
                Sur le terminal : Menu → Communication → ADMS → Activez le Push, entrez l'IP du serveur BANKA, Port <strong>4001</strong>, URL <strong>/iclock/cdata</strong>.
                Le numéro de série est affiché dans le menu "À propos" de l'appareil.
                Chaque employé doit être enregistré sur le terminal avec le même numéro que son <em>ID biométrique</em> dans sa fiche employé.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>{devices.length} appareil(s) enregistré(s)</p>
            <button onClick={openNewDevice} className="btn-primary flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Ajouter un appareil
            </button>
          </div>

          {loadingD ? (
            <div className="card flex items-center justify-center py-16 gap-2" style={{ color: '#7c3aed' }}>
              <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
            </div>
          ) : devices.length === 0 ? (
            <div className="card py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#ede9fe' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#6d28d9' }}>
                  <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="17" r="1" fill="currentColor"/>
                  <path d="M9 6h6M9 10h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Aucun appareil enregistré</p>
              <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Ajoutez votre terminal ZKTeco pour recevoir les pointages automatiquement</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {devices.map((d) => {
                const syncAgo = d.derniereSync
                  ? Math.round((Date.now() - new Date(d.derniereSync).getTime()) / 60000)
                  : null;
                return (
                  <div key={d.id} className="card p-5 flex flex-col gap-4" style={{ opacity: d.actif ? 1 : 0.6 }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: d.actif ? '#ede9fe' : '#f0f2f9' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: d.actif ? '#6d28d9' : '#8b94b0' }}>
                            <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                            <circle cx="12" cy="17" r="1" fill="currentColor"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{d.nom}</p>
                          <p className="font-mono text-xs" style={{ color: '#8b94b0' }}>{d.serialNumber}</p>
                        </div>
                      </div>
                      <span className="chip text-xs" style={{
                        background: d.actif ? '#d1fae5' : '#f0f2f9',
                        color: d.actif ? '#047857' : '#8b94b0',
                      }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.actif ? '#10b981' : '#8b94b0' }} />
                        {d.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs" style={{ color: '#8b94b0' }}>
                      <span>{d._count?.pointages ?? 0} pointage(s)</span>
                      <span>
                        {syncAgo !== null
                          ? syncAgo < 60 ? `Sync il y a ${syncAgo}min` : `Sync il y a ${Math.round(syncAgo / 60)}h`
                          : 'Jamais synchronisé'}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #f0f2f9' }}>
                      <button onClick={() => openEditDevice(d)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: '#f0f2f9', color: '#4a5578' }}>
                        Modifier
                      </button>
                      <button onClick={() => handleToggleDevice(d)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: d.actif ? '#fef3c7' : '#d1fae5', color: d.actif ? '#b45309' : '#047857' }}>
                        {d.actif ? 'Désactiver' : 'Activer'}
                      </button>
                      {(d._count?.pointages ?? 0) === 0 && (
                        <button onClick={() => handleDeleteDevice(d)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg"
                          style={{ background: '#fee2e2', color: '#b91c1c' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulaire appareil */}
          {showDeviceForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
              <div className="card w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold" style={{ color: '#0b1733' }}>
                    {editDevice ? 'Modifier l\'appareil' : 'Ajouter un appareil'}
                  </h3>
                  <button onClick={() => setShowDeviceForm(false)} style={{ color: '#8b94b0' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Nom de l'appareil <span style={{ color: '#b91c1c' }}>*</span></label>
                    <input value={dNom} onChange={(e) => setDNom(e.target.value)}
                      placeholder="ex: Entrée principale" className="input w-full" />
                  </div>
                  {!editDevice && (
                    <div>
                      <label className="label">Numéro de série (SN) <span style={{ color: '#b91c1c' }}>*</span></label>
                      <input value={dSN} onChange={(e) => setDSN(e.target.value)}
                        placeholder="ex: ABCD123456" className="input w-full font-mono" />
                      <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Visible dans Menu → À propos sur le terminal.</p>
                    </div>
                  )}
                  <div>
                    <label className="label">Mot de passe de communication</label>
                    <input value={dKey} onChange={(e) => setDKey(e.target.value)}
                      placeholder="Laisser vide si non configuré" className="input w-full font-mono" />
                    <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Doit correspondre au "CommKey" configuré sur l'appareil.</p>
                  </div>
                  {dError && <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{dError}</div>}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowDeviceForm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: '#f0f2f9', color: '#4a5578' }}>
                      Annuler
                    </button>
                    <button onClick={handleSaveDevice} disabled={savingD}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                      {savingD && <Spin />}
                      {editDevice ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
