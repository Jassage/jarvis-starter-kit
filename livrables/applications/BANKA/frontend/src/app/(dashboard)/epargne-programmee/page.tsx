'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const FREQUENCE_LABELS: Record<string, string> = {
  HEBDOMADAIRE: 'Hebdomadaire',
  MENSUEL: 'Mensuel',
  BIMESTRIEL: 'Bimestriel',
  TRIMESTRIEL: 'Trimestriel',
};

const FREQUENCE_OPTS = Object.entries(FREQUENCE_LABELS);

interface EpargneProgrammee {
  id: string;
  compteSource: { id: string; numeroCompte: string; client: { nom?: string; prenom?: string; raisonSociale?: string; type: string } };
  compteDest: { id: string; numeroCompte: string; client: { nom?: string; prenom?: string; raisonSociale?: string; type: string } };
  montant: number;
  frequence: string;
  prochainVersement: string;
  actif: boolean;
  nombreExecutions: number;
  derniereExecution?: string;
  notes?: string;
}

interface CompteSuggest {
  id: string;
  numeroCompte: string;
  client: { nom?: string; prenom?: string; raisonSociale?: string; type: string };
  type: string;
}

function clientNom(c: { nom?: string; prenom?: string; raisonSociale?: string; type: string }) {
  return c.type === 'ENTREPRISE' ? (c.raisonSociale || '') : `${c.prenom || ''} ${c.nom || ''}`.trim();
}

export default function EpargneProgrammeePage() {
  const { utilisateur } = useAuthStore();
  const canManage = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER'].includes(utilisateur?.role || '');
  const canExecute = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'].includes(utilisateur?.role || '');

  const [items, setItems] = useState<EpargneProgrammee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<{ executees: number; erreurs: number; details: string[] } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [srcQuery, setSrcQuery] = useState('');
  const [dstQuery, setDstQuery] = useState('');
  const [srcSuggests, setSrcSuggests] = useState<CompteSuggest[]>([]);
  const [dstSuggests, setDstSuggests] = useState<CompteSuggest[]>([]);
  const [selectedSrc, setSelectedSrc] = useState<CompteSuggest | null>(null);
  const [selectedDst, setSelectedDst] = useState<CompteSuggest | null>(null);
  const [montant, setMontant] = useState('');
  const [frequence, setFrequence] = useState('MENSUEL');
  const [prochainVersement, setProchainVersement] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/epargnes-programmees?limit=50');
      setItems(data.data.items);
      setTotal(data.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const searchComptes = async (q: string, setter: (v: CompteSuggest[]) => void) => {
    if (q.length < 2) { setter([]); return; }
    try {
      const { data } = await api.get(`/comptes?search=${encodeURIComponent(q)}&statut=ACTIF&limit=5`);
      setter(data.data.items);
    } catch { setter([]); }
  };

  useEffect(() => {
    const t = setTimeout(() => searchComptes(srcQuery, setSrcSuggests), 300);
    return () => clearTimeout(t);
  }, [srcQuery]);

  useEffect(() => {
    const t = setTimeout(() => searchComptes(dstQuery, setDstSuggests), 300);
    return () => clearTimeout(t);
  }, [dstQuery]);

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/epargnes-programmees/${id}/toggle`);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleExecuter = async () => {
    setExecuting(true);
    setExecResult(null);
    try {
      const { data } = await api.post('/epargnes-programmees/executer');
      setExecResult(data.data);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'exécution');
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSrc) { setFormError('Sélectionnez un compte source'); return; }
    if (!selectedDst) { setFormError('Sélectionnez un compte destination'); return; }
    if (!montant || Number(montant) <= 0) { setFormError('Montant invalide'); return; }
    if (!prochainVersement) { setFormError('Date du premier versement requise'); return; }

    setSaving(true);
    setFormError('');
    try {
      await api.post('/epargnes-programmees', {
        compteSourceId: selectedSrc.id,
        compteDestId: selectedDst.id,
        montant: Number(montant),
        frequence,
        prochainVersement: new Date(prochainVersement).toISOString(),
        notes: notes || undefined,
      });
      setShowForm(false);
      resetForm();
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSrcQuery(''); setDstQuery('');
    setSrcSuggests([]); setDstSuggests([]);
    setSelectedSrc(null); setSelectedDst(null);
    setMontant(''); setFrequence('MENSUEL');
    setProchainVersement(''); setNotes('');
    setFormError('');
  };

  const actifs = items.filter((e) => e.actif).length;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Épargne programmée</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Virements automatiques récurrents entre comptes</p>
        </div>
        <div className="flex items-center gap-2">
          {canExecute && (
            <button
              onClick={handleExecuter}
              disabled={executing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
            >
              {executing
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M5 3l14 9-14 9V3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
              }
              Exécuter maintenant
            </button>
          )}
          {canManage && (
            <button
              onClick={() => { setShowForm(true); resetForm(); }}
              className="btn-primary flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Nouveau programme
            </button>
          )}
        </div>
      </div>

      {/* Résultat exécution */}
      {execResult && (
        <div className="card p-4" style={{ borderLeft: '4px solid', borderColor: execResult.erreurs === 0 ? '#10b981' : '#f59e0b' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>
                {execResult.executees} versement{execResult.executees > 1 ? 's' : ''} exécuté{execResult.executees > 1 ? 's' : ''}
                {execResult.erreurs > 0 && ` · ${execResult.erreurs} erreur${execResult.erreurs > 1 ? 's' : ''}`}
              </p>
              {execResult.details.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {execResult.details.map((d, i) => (
                    <li key={i} className="text-xs" style={{ color: '#8b94b0' }}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={() => setExecResult(null)} style={{ color: '#8b94b0' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Programmes totaux', value: total, color: '#1e40af', bg: '#eef2ff' },
          { label: 'Actifs', value: actifs, color: '#047857', bg: '#ecfdf5' },
          { label: 'Inactifs', value: total - actifs, color: '#8b94b0', bg: '#f7f8fc' },
          { label: 'Dus aujourd\'hui', value: items.filter((e) => e.actif && new Date(e.prochainVersement) <= new Date()).length, color: '#b45309', bg: '#fffbeb' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <p className="text-xs font-medium mb-1" style={{ color: '#8b94b0' }}>{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f2f9' }}>
          <h3 className="font-bold text-sm" style={{ color: '#0b1733' }}>Programmes d'épargne</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#f7f8fc' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" style={{ color: '#8b94b0' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14v-4m0-4h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Aucun programme d'épargne</p>
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Créez votre premier virement automatique récurrent</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Compte source</th>
                  <th>Compte destination</th>
                  <th>Montant</th>
                  <th>Fréquence</th>
                  <th>Prochain versement</th>
                  <th>Exécutions</th>
                  <th>Statut</th>
                  {canManage && <th></th>}
                </tr>
              </thead>
              <tbody>
                {items.map((ep) => {
                  const due = ep.actif && new Date(ep.prochainVersement) <= new Date();
                  return (
                    <tr key={ep.id}>
                      <td>
                        <p className="font-mono text-xs font-semibold" style={{ color: '#0b1733' }}>{ep.compteSource.numeroCompte}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{clientNom(ep.compteSource.client)}</p>
                      </td>
                      <td>
                        <p className="font-mono text-xs font-semibold" style={{ color: '#0b1733' }}>{ep.compteDest.numeroCompte}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{clientNom(ep.compteDest.client)}</p>
                      </td>
                      <td className="font-semibold" style={{ color: '#0b1733' }}>{formatMontant(ep.montant, 'HTG')}</td>
                      <td>
                        <span className="chip chip-neutral">{FREQUENCE_LABELS[ep.frequence]}</span>
                      </td>
                      <td>
                        <span style={{ color: due ? '#b45309' : '#4a5578' }} className="text-sm font-medium">
                          {formatDate(ep.prochainVersement)}
                        </span>
                        {due && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: '#fffbeb', color: '#b45309' }}>DÛ</span>}
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: '#4a5578' }}>{ep.nombreExecutions}</span>
                        {ep.derniereExecution && (
                          <p className="text-[10px] mt-0.5" style={{ color: '#8b94b0' }}>Dernier : {formatDate(ep.derniereExecution)}</p>
                        )}
                      </td>
                      <td>
                        <span className={`chip ${ep.actif ? 'chip-success' : 'chip-neutral'}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ep.actif ? '#10b981' : '#8b94b0' }}></span>
                          {ep.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      {canManage && (
                        <td>
                          <button
                            onClick={() => handleToggle(ep.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: ep.actif ? '#fef2f2' : '#ecfdf5', color: ep.actif ? '#b91c1c' : '#047857' }}
                          >
                            {ep.actif ? 'Désactiver' : 'Activer'}
                          </button>
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

      {/* Modal création */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ color: '#0b1733' }}>Nouveau programme d'épargne</h3>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Compte source */}
              <div>
                <label className="label">Compte source <span style={{ color: '#b91c1c' }}>*</span></label>
                {selectedSrc ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#f7f8fc', border: '1px solid #e7eaf3' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-semibold" style={{ color: '#0b1733' }}>{selectedSrc.numeroCompte}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{clientNom(selectedSrc.client)}</p>
                    </div>
                    <button onClick={() => { setSelectedSrc(null); setSrcQuery(''); }} style={{ color: '#8b94b0' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      value={srcQuery}
                      onChange={(e) => setSrcQuery(e.target.value)}
                      placeholder="Rechercher un compte (numéro ou client)..."
                      className="input w-full"
                    />
                    {srcSuggests.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10 overflow-hidden" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
                        {srcSuggests.map((c) => (
                          <button key={c.id} onClick={() => { setSelectedSrc(c); setSrcQuery(''); setSrcSuggests([]); }} className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:bg-slate-50">
                            <div>
                              <p className="font-mono text-xs font-semibold" style={{ color: '#0b1733' }}>{c.numeroCompte}</p>
                              <p className="text-xs" style={{ color: '#8b94b0' }}>{clientNom(c.client)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Compte destination */}
              <div>
                <label className="label">Compte destination <span style={{ color: '#b91c1c' }}>*</span></label>
                {selectedDst ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#f7f8fc', border: '1px solid #e7eaf3' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-semibold" style={{ color: '#0b1733' }}>{selectedDst.numeroCompte}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{clientNom(selectedDst.client)}</p>
                    </div>
                    <button onClick={() => { setSelectedDst(null); setDstQuery(''); }} style={{ color: '#8b94b0' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      value={dstQuery}
                      onChange={(e) => setDstQuery(e.target.value)}
                      placeholder="Rechercher un compte (numéro ou client)..."
                      className="input w-full"
                    />
                    {dstSuggests.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10 overflow-hidden" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
                        {dstSuggests.map((c) => (
                          <button key={c.id} onClick={() => { setSelectedDst(c); setDstQuery(''); setDstSuggests([]); }} className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:bg-slate-50">
                            <div>
                              <p className="font-mono text-xs font-semibold" style={{ color: '#0b1733' }}>{c.numeroCompte}</p>
                              <p className="text-xs" style={{ color: '#8b94b0' }}>{clientNom(c.client)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Montant + Fréquence */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Montant (HTG) <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)} min="1" placeholder="0" className="input w-full" />
                </div>
                <div>
                  <label className="label">Fréquence <span style={{ color: '#b91c1c' }}>*</span></label>
                  <select value={frequence} onChange={(e) => setFrequence(e.target.value)} className="input w-full">
                    {FREQUENCE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Premier versement */}
              <div>
                <label className="label">Date du premier versement <span style={{ color: '#b91c1c' }}>*</span></label>
                <input type="date" value={prochainVersement} onChange={(e) => setProchainVersement(e.target.value)} className="input w-full" />
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optionnel..." className="input w-full resize-none" />
              </div>

              {formError && (
                <div className="p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#b91c1c' }}>{formError}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f7f8fc', color: '#4a5578' }}>
                  Annuler
                </button>
                <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}
                  Créer le programme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
