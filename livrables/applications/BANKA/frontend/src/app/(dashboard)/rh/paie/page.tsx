'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';

const STATUT_META: Record<string, { label: string; color: string; bg: string }> = {
  BROUILLON: { label: 'Brouillon', color: '#4a5578', bg: '#f0f2f9' },
  VALIDE:    { label: 'Validé',    color: '#b45309', bg: '#fef3c7' },
  PAYE:      { label: 'Payé',      color: '#047857', bg: '#d1fae5' },
};

const PALETTES: [string, string][] = [
  ['#dbeafe', '#1d4ed8'], ['#ede9fe', '#6d28d9'], ['#d1fae5', '#065f46'],
  ['#fef3c7', '#92400e'], ['#fee2e2', '#991b1b'], ['#e0f2fe', '#0369a1'],
];
function av(name: string) {
  const idx = (name.charCodeAt(0) || 65) % PALETTES.length;
  return { bg: PALETTES[idx][0], color: PALETTES[idx][1] };
}

const Spin = ({ color }: { color?: string }) => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: color || 'currentColor' }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

interface FichePaie {
  id: string; reference: string; periode: string;
  employe: { nom: string; prenom: string; matricule: string };
  salaireBrut: number; cotisations: number;
  avanceDeduite: number; creditDeduit: number;
  salaireNet: number; statut: string; modeReglement: string;
}

interface Employe { id: string; nom: string; prenom: string; matricule: string; salaireBrut: number; }
interface ElementVariable {
  id: string; periode: string; type: string; libelle: string; montant: number; notes?: string;
  employe: { nom: string; prenom: string; matricule: string };
}
interface Avance {
  id: string; reference: string; employe: { nom: string; prenom: string; matricule: string };
  montant: number; periodeDeduction: string; statut: string; notes?: string; createdAt: string;
}

export default function PaiePage() {
  const { utilisateur } = useAuthStore();
  const canManage = ['SUPER_ADMIN', 'DIRECTEUR'].includes(utilisateur?.role || '');

  const [tab, setTab] = useState<'bulletins' | 'elements' | 'avances'>('bulletins');
  const [fiches, setFiches] = useState<FichePaie[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mois, setMois] = useState(new Date().toISOString().slice(0, 7));
  const [generating, setGenerating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const [invalidating, setInvalidating] = useState<string | null>(null);
  const [payResult, setPayResult] = useState<any>(null);

  // Éléments variables
  const [elements, setElements] = useState<ElementVariable[]>([]);
  const [showElementForm, setShowElementForm] = useState(false);
  const [elementForm, setElementForm] = useState({ employeId: '', type: 'PRIME', libelle: '', montant: '', notes: '' });
  const [savingElement, setSavingElement] = useState(false);
  const [elementError, setElementError] = useState('');

  // Avances
  const [avances, setAvances] = useState<Avance[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [showAvanceForm, setShowAvanceForm] = useState(false);
  const [avanceForm, setAvanceForm] = useState({ employeId: '', montant: '', periodeDeduction: mois, notes: '' });
  const [savingAvance, setSavingAvance] = useState(false);
  const [avanceError, setAvanceError] = useState('');

  // Modales de confirmation
  const [confirmPayer, setConfirmPayer] = useState(false);
  const [confirmDeleteEl, setConfirmDeleteEl] = useState<string | null>(null);
  const [confirmAnnulerAv, setConfirmAnnulerAv] = useState<string | null>(null);

  const loadFiches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/rh/paie?periode=${mois}&limit=30&page=${page}`);
      setFiches(data.data.items); setTotal(data.data.total);
      setPages(data.data.pages || 1);
    } catch { setFiches([]); } finally { setLoading(false); }
  };

  const loadElements = async () => {
    try {
      const { data } = await api.get(`/rh/elements-variables?periode=${mois}`);
      setElements(data.data);
    } catch {}
  };

  const loadAvances = async () => {
    try {
      const { data } = await api.get('/rh/avances');
      setAvances(data.data);
    } catch {}
  };

  const loadEmployes = async () => {
    try {
      const { data } = await api.get('/rh/employes?statut=ACTIF&limit=200');
      setEmployes(data.data.items || []);
    } catch {}
  };

  useEffect(() => { loadFiches(); loadElements(); }, [mois, page]);
  useEffect(() => { loadAvances(); loadEmployes(); }, []);

  const handleGenerer = async () => {
    setGenerating(true);
    try { await api.post('/rh/paie/generer', { periode: mois }); await loadFiches(); }
    catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setGenerating(false); }
  };

  const handleValider = async (id: string) => {
    setValidating(id);
    try { await api.patch(`/rh/paie/${id}/valider`); await loadFiches(); }
    catch (e: any) { alert(e.response?.data?.message || 'Erreur de validation'); }
    finally { setValidating(null); }
  };

  const handleInvalider = async (id: string) => {
    setInvalidating(id);
    try { await api.patch(`/rh/paie/${id}/invalider`); await loadFiches(); }
    catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setInvalidating(null); }
  };

  const handlePayer = () => {
    const validees = fiches.filter((f) => f.statut === 'VALIDE').length;
    if (!validees) { alert('Aucune fiche validée. Validez d\'abord les bulletins avant de virer les salaires.'); return; }
    setConfirmPayer(true);
  };

  const doHandlePayer = async () => {
    setConfirmPayer(false);
    setPaying(true); setPayResult(null);
    try {
      const { data } = await api.post('/rh/paie/payer', { periode: mois });
      setPayResult(data.data); await loadFiches();
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setPaying(false); }
  };

  const handleAvanceSubmit = async () => {
    setAvanceError('');
    if (!avanceForm.employeId) { setAvanceError('Sélectionnez un employé'); return; }
    if (!avanceForm.montant || parseFloat(avanceForm.montant) <= 0) { setAvanceError('Montant invalide'); return; }
    setSavingAvance(true);
    try {
      await api.post('/rh/avances', {
        employeId: avanceForm.employeId,
        montant: parseFloat(avanceForm.montant),
        periodeDeduction: avanceForm.periodeDeduction,
        notes: avanceForm.notes || undefined,
      });
      setShowAvanceForm(false);
      setAvanceForm({ employeId: '', montant: '', periodeDeduction: mois, notes: '' });
      await loadAvances();
    } catch (e: any) { setAvanceError(e.response?.data?.error || 'Erreur'); }
    finally { setSavingAvance(false); }
  };

  const handleElementSubmit = async () => {
    setElementError('');
    if (!elementForm.employeId) { setElementError('Sélectionnez un employé'); return; }
    if (!elementForm.libelle.trim()) { setElementError('Le libellé est requis'); return; }
    if (!elementForm.montant || parseFloat(elementForm.montant) <= 0) { setElementError('Montant invalide'); return; }
    setSavingElement(true);
    try {
      await api.post('/rh/elements-variables', {
        employeId: elementForm.employeId,
        periode: mois,
        type: elementForm.type,
        libelle: elementForm.libelle.trim(),
        montant: parseFloat(elementForm.montant),
        notes: elementForm.notes || undefined,
      });
      setShowElementForm(false);
      setElementForm({ employeId: '', type: 'PRIME', libelle: '', montant: '', notes: '' });
      await loadElements();
    } catch (e: any) { setElementError(e.response?.data?.error || 'Erreur'); }
    finally { setSavingElement(false); }
  };

  const handleDeleteElement = (id: string) => {
    setConfirmDeleteEl(id);
  };

  const doHandleDeleteElement = async () => {
    if (!confirmDeleteEl) return;
    try { await api.delete(`/rh/elements-variables/${confirmDeleteEl}`); await loadElements(); }
    catch (e: any) { alert(e.response?.data?.error || 'Erreur'); }
    finally { setConfirmDeleteEl(null); }
  };

  const handleAnnulerAvance = (id: string) => {
    setConfirmAnnulerAv(id);
  };

  const doHandleAnnulerAvance = async () => {
    if (!confirmAnnulerAv) return;
    try { await api.patch(`/rh/avances/${confirmAnnulerAv}/annuler`); await loadAvances(); }
    catch (e: any) { alert(e.response?.data?.error || 'Erreur'); }
    finally { setConfirmAnnulerAv(null); }
  };

  const totalBrut = fiches.reduce((s, f) => s + Number(f.salaireBrut), 0);
  const totalCot  = fiches.reduce((s, f) => s + Number(f.cotisations), 0);
  const totalNet  = fiches.reduce((s, f) => s + Number(f.salaireNet), 0);
  const totalAvances = fiches.reduce((s, f) => s + Number(f.avanceDeduite || 0), 0);
  const totalCredits = fiches.reduce((s, f) => s + Number(f.creditDeduit || 0), 0);
  const nbBrouillon = fiches.filter((f) => f.statut === 'BROUILLON').length;
  const nbValide    = fiches.filter((f) => f.statut === 'VALIDE').length;
  const moisLabel = new Date(mois + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Gestion de la paie</h1>
          <p className="text-sm mt-0.5 capitalize" style={{ color: '#8b94b0' }}>
            {total} fiche{total > 1 ? 's' : ''} — {moisLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="month" value={mois} onChange={(e) => setMois(e.target.value)}
            className="input text-sm" style={{ padding: '7px 12px' }} />
          {canManage && (
            <>
              <button onClick={handleGenerer} disabled={generating}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {generating ? <Spin /> : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                Générer bulletins
              </button>
              {fiches.length > 0 && (
                <button onClick={handlePayer} disabled={paying || nbValide === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
                  style={{ background: nbValide > 0 ? '#6d28d9' : '#e4e7f0', color: nbValide > 0 ? 'white' : '#8b94b0' }}>
                  {paying ? <Spin /> : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  Virer salaires {nbValide > 0 ? `(${nbValide})` : ''}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Workflow info */}
      {fiches.length > 0 && nbBrouillon > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl text-sm" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0" style={{ color: '#b45309' }}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{ color: '#92400e' }}>
            {nbBrouillon} fiche{nbBrouillon > 1 ? 's' : ''} en brouillon — validez chaque bulletin avant de pouvoir virer les salaires.
            {nbValide > 0 && ` ${nbValide} déjà validée${nbValide > 1 ? 's' : ''}.`}
          </span>
        </div>
      )}

      {/* Résultat virement */}
      {payResult && (
        <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#047857' }}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#065f46' }}>{payResult.payes} salaire(s) traité(s)</p>
            <p className="text-xs mt-0.5" style={{ color: '#047857' }}>
              {payResult.virements} virement(s) BANKA · {payResult.especes} paiement(s) espèces
              {' · '}Net total : {formatMontant(payResult.totalNet, 'HTG')}
            </p>
          </div>
          <button onClick={() => setPayResult(null)} className="ml-auto" style={{ color: '#047857' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f0f2f9', width: 'fit-content' }}>
        {[
          { key: 'bulletins', label: 'Bulletins de paie' },
          { key: 'elements',  label: `Éléments variables${elements.length > 0 ? ` (${elements.length})` : ''}` },
          { key: 'avances',   label: `Avances${avances.filter(a => a.statut === 'EN_ATTENTE').length > 0 ? ` (${avances.filter(a => a.statut === 'EN_ATTENTE').length})` : ''}` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#0b1733' : '#8b94b0', boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'bulletins' && (
        <>
          {/* KPI */}
          {fiches.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: 'Brut',        value: totalBrut,    color: '#0b1733', bg: '#f0f2f9' },
                { label: 'Cotisations', value: totalCot,     color: '#b91c1c', bg: '#fee2e2' },
                { label: 'Avances',     value: totalAvances, color: '#b45309', bg: '#fef3c7' },
                { label: 'Crédits',     value: totalCredits, color: '#6d28d9', bg: '#ede9fe' },
                { label: 'Net à payer', value: totalNet,     color: '#047857', bg: '#d1fae5' },
              ].map((k) => (
                <div key={k.label} className="card p-4">
                  <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>{k.label}</p>
                  <p className="text-base font-bold mt-1" style={{ color: k.color }}>{formatMontant(k.value, 'HTG')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Table bulletins */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <Spin color="#6d28d9" /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
              </div>
            ) : fiches.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#ede9fe' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#6d28d9' }}>
                    <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Aucun bulletin pour cette période</p>
                <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Cliquez sur «&nbsp;Générer bulletins&nbsp;» pour créer les fiches du mois</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0b1733' }}>
                      {['Employé', 'Mode', 'Brut', 'Cotis.', 'Avance', 'Crédit', 'Net', 'Statut', ''].map((h, i) => (
                        <th key={i} style={{
                          color: '#94a3c4', textAlign: ['Brut','Cotis.','Avance','Crédit','Net'].includes(h) ? 'right' : h === 'Statut' ? 'center' : 'left',
                          padding: '12px 14px', fontSize: '11px', fontWeight: 600,
                          letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fiches.map((f, idx) => {
                      const sm  = STATUT_META[f.statut] || STATUT_META.BROUILLON;
                      const avs = av(f.employe.prenom || f.employe.nom);
                      const init = `${f.employe.prenom?.[0] || ''}${f.employe.nom?.[0] || ''}`.toUpperCase();
                      return (
                        <tr key={f.id} style={{ borderBottom: '1px solid #f0f2f9', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: avs.bg, color: avs.color }}>{init}</div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>{f.employe.prenom} {f.employe.nom}</p>
                                <p className="text-xs font-mono mt-0.5" style={{ color: '#8b94b0' }}>{f.employe.matricule}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
                              style={{ background: f.modeReglement === 'VIREMENT_BANKA' ? '#dbeafe' : '#fef3c7', color: f.modeReglement === 'VIREMENT_BANKA' ? '#1d4ed8' : '#92400e' }}>
                              {f.modeReglement === 'VIREMENT_BANKA' ? 'Virement' : 'Espèces'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span className="text-sm font-semibold" style={{ color: '#0b1733' }}>{formatMontant(f.salaireBrut, 'HTG')}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span className="text-sm" style={{ color: '#b91c1c' }}>− {formatMontant(f.cotisations, 'HTG')}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {Number(f.avanceDeduite) > 0
                              ? <span className="text-sm" style={{ color: '#b45309' }}>− {formatMontant(f.avanceDeduite, 'HTG')}</span>
                              : <span style={{ color: '#d1d5e4' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {Number(f.creditDeduit) > 0
                              ? <span className="text-sm" style={{ color: '#6d28d9' }}>− {formatMontant(f.creditDeduit, 'HTG')}</span>
                              : <span style={{ color: '#d1d5e4' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span className="text-sm font-bold px-2.5 py-1 rounded-lg" style={{ background: '#d1fae5', color: '#047857' }}>{formatMontant(f.salaireNet, 'HTG')}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: sm.bg, color: sm.color }}>
                              {f.statut === 'PAYE' && <svg viewBox="0 0 24 24" fill="none" style={{ width: 11, height: 11 }}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              {sm.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {canManage && f.statut === 'BROUILLON' && (
                              <button
                                onClick={() => handleValider(f.id)}
                                disabled={validating === f.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                style={{ background: '#fef3c7', color: '#b45309' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fde68a'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fef3c7'}
                              >
                                {validating === f.id ? <Spin color="#b45309" /> : (
                                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                                Valider
                              </button>
                            )}
                            {canManage && f.statut === 'VALIDE' && (
                              <button
                                onClick={() => handleInvalider(f.id)}
                                disabled={invalidating === f.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                style={{ background: '#f3f4f6', color: '#6b7280' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                              >
                                {invalidating === f.id ? <Spin color="#6b7280" /> : (
                                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                                Invalider
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f7f8fc', borderTop: '2px solid #e4e7f0' }}>
                      <td colSpan={2} style={{ padding: '11px 14px' }}>
                        <span className="text-xs font-bold uppercase" style={{ color: '#4a5578', letterSpacing: '0.05em' }}>Total — {total} employé{total > 1 ? 's' : ''}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="text-sm font-bold" style={{ color: '#0b1733' }}>{formatMontant(totalBrut, 'HTG')}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="text-sm font-bold" style={{ color: '#b91c1c' }}>− {formatMontant(totalCot, 'HTG')}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="text-sm font-bold" style={{ color: '#b45309' }}>− {formatMontant(totalAvances, 'HTG')}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="text-sm font-bold" style={{ color: '#6d28d9' }}>− {formatMontant(totalCredits, 'HTG')}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="text-sm font-bold px-2.5 py-1 rounded-lg" style={{ background: '#d1fae5', color: '#047857' }}>{formatMontant(totalNet, 'HTG')}</span>
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            {pages > 1 && (
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #f0f2f9' }}>
                <p className="text-sm" style={{ color: '#8b94b0' }}>
                  Page <span className="font-semibold" style={{ color: '#0b1733' }}>{page}</span> sur {pages}
                  <span className="ml-2" style={{ color: '#d1d5e4' }}>·</span>
                  <span className="ml-2">{total} bulletin{total > 1 ? 's' : ''}</span>
                </p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost text-xs disabled:opacity-40">← Précédent</button>
                  <button disabled={page === pages} onClick={() => setPage(page + 1)} className="btn-ghost text-xs disabled:opacity-40">Suivant →</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'elements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Primes, bonus et retenues — {new Date(mois + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Ces éléments seront intégrés automatiquement lors de la génération des bulletins</p>
            </div>
            {canManage && (
              <button onClick={() => setShowElementForm(true)} className="btn-primary flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Ajouter un élément
              </button>
            )}
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 rounded-2xl text-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1d4ed8' }}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <div style={{ color: '#1e3a8a' }}>
              <p className="font-semibold">Comment ça fonctionne</p>
              <p className="text-xs mt-1" style={{ color: '#1d4ed8' }}>
                Les <strong>primes, bonus, indemnités, heures sup</strong> s'ajoutent au salaire brut avant calcul des cotisations.
                Les <strong>retenues</strong> sont déduites du net après cotisations. Cliquez "Générer bulletins" pour les intégrer.
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            {elements.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#ede9fe' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#6d28d9' }}><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Aucun élément variable ce mois-ci</p>
                <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Ajoutez des primes, bonus ou retenues avant de générer les bulletins</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0b1733' }}>
                      {['Employé', 'Type', 'Libellé', 'Montant', ''].map((h, i) => (
                        <th key={i} style={{ color: '#94a3c4', textAlign: h === 'Montant' ? 'right' : 'left', padding: '12px 14px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {elements.map((el, idx) => {
                      const isRetenue = el.type === 'RETENUE';
                      const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
                        PRIME:      { label: 'Prime',      color: '#047857', bg: '#d1fae5' },
                        BONUS:      { label: 'Bonus',      color: '#1d4ed8', bg: '#dbeafe' },
                        INDEMNITE:  { label: 'Indemnité',  color: '#6d28d9', bg: '#ede9fe' },
                        HEURE_SUP:  { label: 'Heure sup',  color: '#b45309', bg: '#fef3c7' },
                        RETENUE:    { label: 'Retenue',    color: '#b91c1c', bg: '#fee2e2' },
                      };
                      const tm = TYPE_META[el.type] || TYPE_META.PRIME;
                      const avs = av(el.employe.nom);
                      const init = `${el.employe.prenom?.[0] || ''}${el.employe.nom?.[0] || ''}`.toUpperCase();
                      return (
                        <tr key={el.id} style={{ borderBottom: '1px solid #f0f2f9', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: avs.bg, color: avs.color }}>{init}</div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>{el.employe.prenom} {el.employe.nom}</p>
                                <p className="text-xs font-mono" style={{ color: '#8b94b0' }}>{el.employe.matricule}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: tm.bg, color: tm.color }}>{tm.label}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <p className="text-sm" style={{ color: '#0b1733' }}>{el.libelle}</p>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span className="text-sm font-bold" style={{ color: isRetenue ? '#b91c1c' : '#047857' }}>
                              {isRetenue ? '−' : '+'} {formatMontant(el.montant, 'HTG')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {canManage && (
                              <button onClick={() => handleDeleteElement(el.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: '#fee2e2', color: '#b91c1c' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
                                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'avances' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: '#8b94b0' }}>{avances.length} avance(s) enregistrée(s)</p>
            {canManage && (
              <button onClick={() => setShowAvanceForm(true)}
                className="btn-primary flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Nouvelle avance
              </button>
            )}
          </div>

          <div className="card overflow-hidden">
            {avances.length === 0 ? (
              <div className="py-14 text-center">
                <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Aucune avance enregistrée</p>
                <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Les avances accordées aux employés apparaîtront ici</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0b1733' }}>
                      {['Référence', 'Employé', 'Montant', 'Déduction prévue', 'Statut', ''].map((h, i) => (
                        <th key={i} style={{ color: '#94a3c4', textAlign: h === 'Montant' ? 'right' : 'left', padding: '12px 14px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {avances.map((a, idx) => {
                      const statutMeta: Record<string, { label: string; color: string; bg: string }> = {
                        EN_ATTENTE: { label: 'En attente', color: '#b45309', bg: '#fef3c7' },
                        DEDUITE:    { label: 'Déduite',    color: '#047857', bg: '#d1fae5' },
                        ANNULEE:    { label: 'Annulée',    color: '#6b7280', bg: '#f3f4f6' },
                      };
                      const sm = statutMeta[a.statut] || statutMeta.EN_ATTENTE;
                      const avs = av(a.employe.nom);
                      const init = `${a.employe.prenom?.[0] || ''}${a.employe.nom?.[0] || ''}`.toUpperCase();
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f0f2f9', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <span className="text-xs font-mono font-semibold" style={{ color: '#4a5578' }}>{a.reference}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: avs.bg, color: avs.color }}>{init}</div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>{a.employe.prenom} {a.employe.nom}</p>
                                <p className="text-xs font-mono" style={{ color: '#8b94b0' }}>{a.employe.matricule}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span className="text-sm font-bold" style={{ color: '#b45309' }}>{formatMontant(a.montant, 'HTG')}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className="text-sm" style={{ color: '#4a5578' }}>
                              {new Date(a.periodeDeduction + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {canManage && a.statut === 'EN_ATTENTE' && (
                              <button onClick={() => handleAnnulerAvance(a.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{ background: '#fee2e2', color: '#b91c1c' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
                                Annuler
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer — Nouvel élément variable */}
      {showElementForm && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowElementForm(false); }}>
          <div className="drawer-panel" style={{ maxWidth: 440 }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div className="flex-1">
                <h2 className="font-bold" style={{ color: 'white' }}>Élément variable</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Sera intégré au bulletin lors de la génération</p>
              </div>
              <button onClick={() => setShowElementForm(false)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="px-5 py-5 flex-1 space-y-4">
              <div>
                <label className="label">Employé</label>
                <select value={elementForm.employeId} onChange={(e) => setElementForm(f => ({ ...f, employeId: e.target.value }))} className="input">
                  <option value="">-- Sélectionner --</option>
                  {employes.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom} ({e.matricule})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'PRIME',     label: 'Prime',     color: '#047857', bg: '#d1fae5' },
                    { key: 'BONUS',     label: 'Bonus',     color: '#1d4ed8', bg: '#dbeafe' },
                    { key: 'INDEMNITE', label: 'Indemnité', color: '#6d28d9', bg: '#ede9fe' },
                    { key: 'HEURE_SUP', label: 'Heure sup', color: '#b45309', bg: '#fef3c7' },
                    { key: 'RETENUE',   label: 'Retenue',   color: '#b91c1c', bg: '#fee2e2' },
                  ].map(({ key, label, color, bg }) => (
                    <button key={key} type="button"
                      onClick={() => setElementForm(f => ({ ...f, type: key }))}
                      className="py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: elementForm.type === key ? bg : '#f0f2f9', color: elementForm.type === key ? color : '#4a5578', border: `1.5px solid ${elementForm.type === key ? color : 'transparent'}` }}>
                      {label}
                    </button>
                  ))}
                </div>
                {elementForm.type === 'RETENUE' && (
                  <p className="text-xs mt-2 px-1" style={{ color: '#b91c1c' }}>⚠ Une retenue est déduite du net à payer.</p>
                )}
              </div>
              <div>
                <label className="label">Libellé</label>
                <input type="text" value={elementForm.libelle} onChange={(e) => setElementForm(f => ({ ...f, libelle: e.target.value }))} className="input" placeholder="ex: Prime de performance Q2, Heures supplémentaires..." />
              </div>
              <div>
                <label className="label">Montant (HTG)</label>
                <input type="number" min="1" step="0.01" value={elementForm.montant} onChange={(e) => setElementForm(f => ({ ...f, montant: e.target.value }))} className="input" placeholder="ex: 3000" />
              </div>
              <div>
                <label className="label">Notes (optionnel)</label>
                <textarea value={elementForm.notes} onChange={(e) => setElementForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input resize-none" placeholder="Justification..." />
              </div>
              {elementError && <div className="p-3 rounded-xl text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>{elementError}</div>}
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setShowElementForm(false)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleElementSubmit} disabled={savingElement}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: 'white' }}>
                {savingElement ? <><Spin />Enregistrement...</> : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales de confirmation */}
      <ConfirmModal
        open={confirmPayer}
        variant="primary"
        title="Virer les salaires"
        message={`Virer les salaires de ${fiches.filter((f) => f.statut === 'VALIDE').length} employé(s) validé(s) pour ${new Date(mois + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} ?`}
        confirmLabel="Virer"
        loading={paying}
        onConfirm={doHandlePayer}
        onCancel={() => setConfirmPayer(false)}
      />
      <ConfirmModal
        open={confirmDeleteEl !== null}
        variant="danger"
        title="Supprimer l'élément variable"
        message="Cet élément sera définitivement supprimé et ne sera plus inclus dans les bulletins."
        confirmLabel="Supprimer"
        onConfirm={doHandleDeleteElement}
        onCancel={() => setConfirmDeleteEl(null)}
      />
      <ConfirmModal
        open={confirmAnnulerAv !== null}
        variant="warning"
        title="Annuler l'avance"
        message="L'avance sera annulée et le montant recrédité sur le compte de l'employé."
        confirmLabel="Confirmer l'annulation"
        onConfirm={doHandleAnnulerAvance}
        onCancel={() => setConfirmAnnulerAv(null)}
      />

      {/* Drawer — Nouvelle avance */}
      {showAvanceForm && (
        <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAvanceForm(false); }}>
          <div className="drawer-panel" style={{ maxWidth: 440 }}>
            <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'white' }}><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex-1">
                <h2 className="font-bold" style={{ color: 'white' }}>Avance sur salaire</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Sera déduite automatiquement à la prochaine paie</p>
              </div>
              <button onClick={() => setShowAvanceForm(false)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="px-5 py-5 flex-1 space-y-4">
              <div>
                <label className="label">Employé</label>
                <select value={avanceForm.employeId} onChange={(e) => setAvanceForm(f => ({ ...f, employeId: e.target.value }))} className="input">
                  <option value="">-- Sélectionner --</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>{e.prenom} {e.nom} ({e.matricule}) — Brut: {formatMontant(e.salaireBrut, 'HTG')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Montant (HTG) <span style={{ color: '#8b94b0', fontWeight: 400 }}>— max 50% du brut</span></label>
                <input type="number" min="1" step="0.01" value={avanceForm.montant} onChange={(e) => setAvanceForm(f => ({ ...f, montant: e.target.value }))} className="input" placeholder="ex: 5000" />
              </div>
              <div>
                <label className="label">Mois de déduction</label>
                <input type="month" value={avanceForm.periodeDeduction} onChange={(e) => setAvanceForm(f => ({ ...f, periodeDeduction: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Notes (optionnel)</label>
                <textarea value={avanceForm.notes} onChange={(e) => setAvanceForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input resize-none" placeholder="Motif de l'avance..." />
              </div>
              {avanceError && (
                <div className="p-3 rounded-xl text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>{avanceError}</div>
              )}
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}>
              <button onClick={() => setShowAvanceForm(false)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleAvanceSubmit} disabled={savingAvance}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #b45309, #d97706)', color: 'white' }}>
                {savingAvance ? <><Spin />Enregistrement...</> : 'Accorder l\'avance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
