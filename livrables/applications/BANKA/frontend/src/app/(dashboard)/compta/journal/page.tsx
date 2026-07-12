'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant, formatDatetime } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Ecriture {
  id: string;
  libelle: string;
  montant: number;
  date: string;
  compteDebit: { numero: string; intitule: string };
  compteCredit: { numero: string; intitule: string };
  creePar: { nom: string; prenom: string };
  transaction?: { reference: string; type: string };
}

interface CompteComptable { id: string; numero: string; intitule: string; type: string; actif: boolean; }

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function JournalPage() {
  const { utilisateur } = useAuthStore();
  const canSaisir = ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE'].includes(utilisateur?.role || '');

  const [ecritures, setEcritures] = useState<Ecriture[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState(new Date().toISOString().slice(0, 10));

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setModalOpen(true);
  };

  const doDelete = async () => {
    if (!pendingDeleteId) return;
    setModalLoading(true);
    setDeletingId(pendingDeleteId);
    try { await api.delete(`/compta/journal/${pendingDeleteId}`); setModalOpen(false); await load(); }
    catch (e: any) { setModalOpen(false); alert(e.response?.data?.message || 'Erreur'); }
    finally { setDeletingId(null); setPendingDeleteId(null); setModalLoading(false); }
  };

  const [showForm, setShowForm]   = useState(false);
  const [comptes, setComptes]     = useState<CompteComptable[]>([]);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [fDebit, setFDebit]       = useState('');
  const [fCredit, setFCredit]     = useState('');
  const [fMontant, setFMontant]   = useState('');
  const [fLibelle, setFLibelle]   = useState('');
  const [fDate, setFDate]         = useState(new Date().toISOString().slice(0, 10));
  const [periodesCloturees, setPeriodesCloturees] = useState<string[]>([]);

  const periodeChoisieCloturee = periodesCloturees.includes(fDate.slice(0, 7));

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const { data } = await api.get(`/compta/journal?${params}`);
      setEcritures(data.data.items);
      setTotal(data.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, from, to]);

  const openForm = async () => {
    if (comptes.length === 0) {
      const { data } = await api.get('/compta/plan-comptable');
      setComptes(data.data.filter((c: CompteComptable) => c.actif !== false));
    }
    if (periodesCloturees.length === 0) {
      const { data } = await api.get('/compta/cloture/periodes');
      setPeriodesCloturees(data.data.filter((p: { statut: string }) => p.statut === 'CLOTUREE').map((p: { periode: string }) => p.periode));
    }
    setShowForm(true); setFormError('');
  };

  const handleCreate = async () => {
    if (!fDebit) { setFormError('Compte débit requis'); return; }
    if (!fCredit) { setFormError('Compte crédit requis'); return; }
    if (fDebit === fCredit) { setFormError('Débit et crédit doivent être différents'); return; }
    if (!fMontant || Number(fMontant) <= 0) { setFormError('Montant invalide'); return; }
    if (!fLibelle.trim()) { setFormError('Libellé requis'); return; }
    if (periodeChoisieCloturee) { setFormError(`La période ${fDate.slice(0, 7)} est clôturée — saisie impossible`); return; }
    setSaving(true); setFormError('');
    try {
      await api.post('/compta/journal', { compteDebitId: fDebit, compteCreditId: fCredit, montant: Number(fMontant), libelle: fLibelle.trim(), date: fDate });
      setShowForm(false);
      setFDebit(''); setFCredit(''); setFMontant(''); setFLibelle('');
      setFDate(new Date().toISOString().slice(0, 10));
      await load();
    } catch (err: any) { setFormError(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const pages = Math.ceil(total / 30);

  const TH_STYLE: React.CSSProperties = {
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
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Journal des écritures</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>{total} écriture{total > 1 ? 's' : ''}</p>
        </div>
        {canSaisir && (
          <button onClick={openForm} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouvelle écriture
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold" style={{ color: '#4a5578' }}>Du</label>
          <input type="date" value={from} max={to}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="input text-sm" style={{ width: '145px', padding: '7px 10px' }} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold" style={{ color: '#4a5578' }}>Au</label>
          <input type="date" value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="input text-sm" style={{ width: '145px', padding: '7px 10px' }} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16" style={{ color: '#047857' }}>
            <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
          </div>
        ) : ecritures.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#f0f2f9' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" style={{ color: '#8b94b0' }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Aucune écriture sur cette période</p>
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Les transactions bancaires génèrent des écritures automatiquement</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...TH_STYLE, width: '130px' }}>Date</th>
                  <th style={{ ...TH_STYLE }}>Opération</th>
                  <th style={{ ...TH_STYLE, width: '180px' }}>Débit</th>
                  <th style={{ ...TH_STYLE, width: '180px' }}>Crédit</th>
                  <th style={{ ...TH_STYLE, textAlign: 'right', width: '150px' }}>Montant</th>
                  {canSaisir && <th style={{ ...TH_STYLE, textAlign: 'center', width: '60px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {ecritures.map((e, idx) => (
                  <tr key={e.id} style={{ background: idx % 2 === 0 ? 'white' : '#fafbfc', borderBottom: '1px solid #f0f2f9' }}>
                    {/* Date */}
                    <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                      <p className="text-xs font-medium" style={{ color: '#4a5578', whiteSpace: 'nowrap' }}>{formatDatetime(e.date)}</p>
                      {e.creePar && (
                        <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{e.creePar.prenom} {e.creePar.nom}</p>
                      )}
                    </td>

                    {/* Libellé */}
                    <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                      <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>{e.libelle}</p>
                      {e.transaction && (
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: '#f0f2f9', color: '#4a5578' }}>
                          {e.transaction.reference}
                        </span>
                      )}
                    </td>

                    {/* Débit */}
                    <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                        {e.compteDebit.numero}
                      </span>
                      <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>{e.compteDebit.intitule}</p>
                    </td>

                    {/* Crédit */}
                    <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#d1fae5', color: '#047857' }}>
                        {e.compteCredit.numero}
                      </span>
                      <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>{e.compteCredit.intitule}</p>
                    </td>

                    {/* Montant */}
                    <td style={{ padding: '13px 16px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <p className="text-sm font-bold" style={{ color: '#0b1733' }}>{formatMontant(e.montant, 'HTG')}</p>
                    </td>
                    {/* Supprimer (seulement si manuel = pas de transaction liée) */}
                    {canSaisir && (
                      <td style={{ padding: '13px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        {!e.transaction && (
                          <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id} title="Supprimer l'écriture"
                            style={{ width: 30, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#b91c1c', opacity: deletingId === e.id ? 0.5 : 1 }}>
                            {deletingId === e.id ? (
                              <svg className="animate-spin" viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                                <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #f0f2f9' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors"
              style={{ background: '#f0f2f9', color: '#4a5578' }}>
              ← Précédent
            </button>
            <span className="text-xs font-medium" style={{ color: '#8b94b0' }}>
              Page {page} / {pages} &middot; {total} écriture{total > 1 ? 's' : ''}
            </span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors"
              style={{ background: '#f0f2f9', color: '#4a5578' }}>
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* Modal écriture */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold" style={{ color: '#0b1733' }}>Nouvelle écriture manuelle</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Saisie comptable</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Compte débité <span style={{ color: '#b91c1c' }}>*</span></label>
                  <select value={fDebit} onChange={(e) => setFDebit(e.target.value)} className="input w-full">
                    <option value="">Sélectionner...</option>
                    {comptes.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.intitule}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Compte crédité <span style={{ color: '#b91c1c' }}>*</span></label>
                  <select value={fCredit} onChange={(e) => setFCredit(e.target.value)} className="input w-full">
                    <option value="">Sélectionner...</option>
                    {comptes.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.intitule}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Montant (HTG) <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="number" value={fMontant} onChange={(e) => setFMontant(e.target.value)} min="1" placeholder="0" className="input w-full" />
                </div>
                <div>
                  <label className="label">Date <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="input w-full" />
                </div>
              </div>
              <div>
                <label className="label">Libellé <span style={{ color: '#b91c1c' }}>*</span></label>
                <input value={fLibelle} onChange={(e) => setFLibelle(e.target.value)} placeholder="Description de l'opération..." className="input w-full" />
              </div>
              {periodeChoisieCloturee ? (
                <div className="p-3 rounded-xl text-xs flex items-start gap-2" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#b91c1c' }}>
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  La période {fDate.slice(0, 7)} est clôturée — aucune saisie manuelle n'y est plus possible.
                </div>
              ) : (
                <div className="p-3 rounded-xl text-xs flex items-start gap-2" style={{ background: '#fffbeb', color: '#92400e' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }}>
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Cette écriture sera enregistrée manuellement et ne sera pas liée à une transaction bancaire.
                </div>
              )}
              {formError && <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f9', color: '#4a5578' }}>Annuler</button>
                <button onClick={handleCreate} disabled={saving || periodeChoisieCloturee} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Spin />} Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modalOpen}
        title="Supprimer cette écriture ?"
        message="Cette écriture manuelle sera définitivement supprimée. Les écritures générées automatiquement par des transactions ne peuvent pas être supprimées."
        variant="danger"
        confirmLabel="Supprimer"
        loading={modalLoading}
        onConfirm={doDelete}
        onCancel={() => { setModalOpen(false); setPendingDeleteId(null); }}
      />
    </div>
  );
}
