'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant, formatDatetime } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const SIEGE_LABEL = 'Siège';

const STATUT_LABELS: Record<string, string> = {
  ENVOYE: 'Envoyé',
  RECU: 'Reçu',
  ANNULE: 'Annulé',
};

interface AgenceRef { id: string; nom: string; code: string }

interface Transfert {
  id: string;
  reference: string;
  agenceSourceId: string | null;
  agenceSource: AgenceRef | null;
  agenceDestId: string | null;
  agenceDest: AgenceRef | null;
  devise: string;
  montant: number;
  statut: string;
  notes?: string;
  creePar: { nom: string; prenom: string };
  recuPar?: { nom: string; prenom: string } | null;
  envoyeAt: string;
  recuAt?: string | null;
}

export default function TresoreriePage() {
  const { utilisateur } = useAuthStore();
  const isAdmin = ['SUPER_ADMIN', 'DIRECTEUR'].includes(utilisateur?.role || '');
  const canManage = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'].includes(utilisateur?.role || '');

  const [items, setItems] = useState<Transfert[]>([]);
  const [agences, setAgences] = useState<AgenceRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const [agenceSourceId, setAgenceSourceId] = useState('');
  const [agenceDestId, setAgenceDestId] = useState('');
  const [devise, setDevise] = useState('HTG');
  const [montant, setMontant] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [tr, ag] = await Promise.all([
        api.get('/tresorerie?limit=50'),
        api.get('/agences'),
      ]);
      setItems(tr.data.data.items);
      setAgences(ag.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setAgenceSourceId(''); setAgenceDestId(''); setDevise('HTG');
    setMontant(''); setNotes(''); setFormError('');
  };

  const handleSubmit = async () => {
    if (!agenceSourceId && !agenceDestId) {
      setFormError('Source et destination ne peuvent pas être toutes les deux le siège');
      return;
    }
    if (agenceSourceId && agenceSourceId === agenceDestId) {
      setFormError('Source et destination doivent être différentes');
      return;
    }
    if (!montant || Number(montant) <= 0) { setFormError('Montant invalide'); return; }

    setSaving(true);
    setFormError('');
    try {
      await api.post('/tresorerie', {
        agenceSourceId: agenceSourceId || null,
        agenceDestId: agenceDestId || null,
        devise,
        montant: Number(montant),
        notes: notes || undefined,
      });
      setShowForm(false);
      resetForm();
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmer = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/tresorerie/${id}/confirmer`);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setActionId(null);
    }
  };

  const handleAnnuler = async (id: string) => {
    if (!confirm('Annuler ce transfert ? Le cash sera restitué à la source.')) return;
    setActionId(id);
    try {
      await api.patch(`/tresorerie/${id}/annuler`);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setActionId(null);
    }
  };

  const nomAgence = (a: AgenceRef | null) => a ? `${a.nom} (${a.code})` : SIEGE_LABEL;

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Trésorerie inter-agences</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Réapprovisionnement de caisse entre agences (ou avec le siège)</p>
        </div>
        {canManage && (
          <button onClick={() => { setShowForm(true); resetForm(); }} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouveau transfert
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f2f9' }}>
          <h3 className="font-bold text-sm" style={{ color: '#0b1733' }}>Transferts</h3>
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
            <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>Aucun transfert de trésorerie</p>
            <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Réapprovisionnez une agence en cash depuis une autre agence ou le siège</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Envoyé par / le</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs" style={{ color: '#8b94b0' }}>{t.reference}</td>
                    <td className="text-sm" style={{ color: '#0b1733' }}>{nomAgence(t.agenceSource)}</td>
                    <td className="text-sm" style={{ color: '#0b1733' }}>{nomAgence(t.agenceDest)}</td>
                    <td className="font-semibold" style={{ color: '#0b1733' }}>{formatMontant(t.montant, t.devise)}</td>
                    <td>
                      <span className={`chip ${t.statut === 'RECU' ? 'chip-success' : t.statut === 'ANNULE' ? 'chip-neutral' : 'chip-warning'}`}>
                        {STATUT_LABELS[t.statut]}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs" style={{ color: '#4a5578' }}>{t.creePar.prenom} {t.creePar.nom}</p>
                      <p className="text-[10px]" style={{ color: '#8b94b0' }}>{formatDatetime(t.envoyeAt)}</p>
                    </td>
                    <td>
                      {t.statut === 'ENVOYE' && canManage && (
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleConfirmer(t.id)}
                            disabled={actionId === t.id}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                            style={{ background: '#ecfdf5', color: '#047857' }}
                          >
                            Confirmer réception
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleAnnuler(t.id)}
                              disabled={actionId === t.id}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                              style={{ background: '#fef2f2', color: '#b91c1c' }}
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ color: '#0b1733' }}>Nouveau transfert de trésorerie</h3>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Agence source</label>
                  <select value={agenceSourceId} onChange={(e) => setAgenceSourceId(e.target.value)} className="input w-full">
                    <option value="">{SIEGE_LABEL}</option>
                    {agences.map((a) => <option key={a.id} value={a.id}>{a.nom} ({a.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Agence destination</label>
                  <select value={agenceDestId} onChange={(e) => setAgenceDestId(e.target.value)} className="input w-full">
                    <option value="">{SIEGE_LABEL}</option>
                    {agences.map((a) => <option key={a.id} value={a.id}>{a.nom} ({a.code})</option>)}
                  </select>
                </div>
              </div>
              {!isAdmin && (!agenceSourceId || !agenceDestId) && (
                <p className="text-xs" style={{ color: '#b45309' }}>Un transfert impliquant le siège est réservé aux administrateurs.</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Devise</label>
                  <select value={devise} onChange={(e) => setDevise(e.target.value)} className="input w-full">
                    <option value="HTG">HTG</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="label">Montant <span style={{ color: '#b91c1c' }}>*</span></label>
                  <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)} min="1" placeholder="0" className="input w-full" />
                </div>
              </div>

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
                  Envoyer le transfert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
