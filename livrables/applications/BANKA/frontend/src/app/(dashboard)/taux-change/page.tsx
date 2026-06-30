'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatMontant, formatDatetime } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface TauxChange {
  id: string;
  devise: string;
  tauxAchat: number;
  tauxVente: number;
  actif: boolean;
  createdAt: string;
}

const ROLES_GESTION = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'];

export default function TauxChangePage() {
  const { utilisateur } = useAuthStore();
  const canEdit = ROLES_GESTION.includes(utilisateur?.role || '');

  const [taux, setTaux] = useState<TauxChange[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire mise à jour taux
  const [showForm, setShowForm] = useState(false);
  const [formTaux, setFormTaux] = useState({ devise: 'USD', tauxAchat: '', tauxVente: '' });
  const [savingTaux, setSavingTaux] = useState(false);
  const [tauxError, setTauxError] = useState('');

  // Formulaire virement cross-devise
  const [showVirement, setShowVirement] = useState(false);
  const [formVir, setFormVir] = useState({ compteSourceId: '', compteDestinationId: '', montant: '' });
  const [virResult, setVirResult] = useState<any>(null);
  const [savingVir, setSavingVir] = useState(false);
  const [virError, setVirError] = useState('');

  const loadTaux = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/taux-change');
      setTaux(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadTaux(); }, []);

  const tauxActifUSD = taux.find((t) => t.devise === 'USD' && t.actif);

  const handleSaveTaux = async () => {
    setTauxError('');
    if (!formTaux.tauxAchat || !formTaux.tauxVente) { setTauxError('Remplissez les deux taux'); return; }
    const achat = parseFloat(formTaux.tauxAchat);
    const vente = parseFloat(formTaux.tauxVente);
    if (vente < achat) { setTauxError('Le taux de vente doit être ≥ au taux d\'achat'); return; }
    setSavingTaux(true);
    try {
      await api.post('/taux-change', { devise: formTaux.devise, tauxAchat: achat, tauxVente: vente });
      setShowForm(false);
      setFormTaux({ devise: 'USD', tauxAchat: '', tauxVente: '' });
      await loadTaux();
    } catch (e: any) {
      setTauxError(e.response?.data?.message || 'Erreur');
    }
    setSavingTaux(false);
  };

  const handleVirement = async () => {
    setVirError('');
    setVirResult(null);
    if (!formVir.compteSourceId || !formVir.compteDestinationId || !formVir.montant) {
      setVirError('Tous les champs sont obligatoires');
      return;
    }
    setSavingVir(true);
    try {
      const { data } = await api.post('/taux-change/virement', {
        compteSourceId: formVir.compteSourceId,
        compteDestinationId: formVir.compteDestinationId,
        montant: parseFloat(formVir.montant),
      });
      setVirResult(data.data);
      setFormVir({ compteSourceId: '', compteDestinationId: '', montant: '' });
    } catch (e: any) {
      setVirError(e.response?.data?.message || 'Erreur lors du virement');
    }
    setSavingVir(false);
  };

  return (
    <div className="space-y-6">
      {/* Taux actif USD */}
      <div className="grid grid-cols-2 gap-4">
        {tauxActifUSD ? (
          <>
            <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8b94b0' }}>Taux d'achat USD (banque achète)</p>
              <p className="text-4xl font-bold" style={{ color: '#047857' }}>{Number(tauxActifUSD.tauxAchat).toFixed(2)}</p>
              <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>1 USD = {Number(tauxActifUSD.tauxAchat).toFixed(2)} HTG</p>
            </div>
            <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8b94b0' }}>Taux de vente USD (banque vend)</p>
              <p className="text-4xl font-bold" style={{ color: '#b91c1c' }}>{Number(tauxActifUSD.tauxVente).toFixed(2)}</p>
              <p className="text-sm mt-1" style={{ color: '#8b94b0' }}>1 USD = {Number(tauxActifUSD.tauxVente).toFixed(2)} HTG</p>
            </div>
          </>
        ) : (
          <div className="col-span-2 rounded-2xl p-6 text-center" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p className="font-semibold" style={{ color: '#92400e' }}>Aucun taux de change actif</p>
            <p className="text-sm mt-1" style={{ color: '#b45309' }}>Configurez le taux USD/HTG pour activer les virements cross-devise</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            Mettre à jour le taux
          </button>
        )}
        <button onClick={() => { setShowVirement(true); setVirResult(null); }} className="btn-ghost flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M8 3l-5 5 5 5M3 8h13a5 5 0 010 10h-1M16 21l5-5-5-5M21 16H8a5 5 0 010-10h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Virement cross-devise
        </button>
      </div>

      {/* Formulaire mise à jour taux */}
      {showForm && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', border: '2px solid #2563eb' }}>
          <h3 className="font-bold" style={{ color: '#0b1733' }}>Nouveau taux de change</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Devise</label>
              <select value={formTaux.devise} onChange={(e) => setFormTaux((f) => ({ ...f, devise: e.target.value }))} className="input">
                <option value="USD">USD — Dollar américain</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
            <div>
              <label className="label">Taux d'achat (banque achète)</label>
              <input type="number" step="0.01" min="0" value={formTaux.tauxAchat} onChange={(e) => setFormTaux((f) => ({ ...f, tauxAchat: e.target.value }))} className="input font-mono" placeholder="ex: 130.50" />
            </div>
            <div>
              <label className="label">Taux de vente (banque vend)</label>
              <input type="number" step="0.01" min="0" value={formTaux.tauxVente} onChange={(e) => setFormTaux((f) => ({ ...f, tauxVente: e.target.value }))} className="input font-mono" placeholder="ex: 133.00" />
            </div>
          </div>
          {formTaux.tauxAchat && formTaux.tauxVente && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#f0f2f9', color: '#4a5578' }}>
              Marge : {(parseFloat(formTaux.tauxVente || '0') - parseFloat(formTaux.tauxAchat || '0')).toFixed(2)} HTG/USD ({(((parseFloat(formTaux.tauxVente || '0') - parseFloat(formTaux.tauxAchat || '0')) / parseFloat(formTaux.tauxAchat || '1')) * 100).toFixed(2)}%)
            </p>
          )}
          {tauxError && <p className="text-sm" style={{ color: '#b91c1c' }}>{tauxError}</p>}
          <div className="flex gap-2">
            <button onClick={handleSaveTaux} disabled={savingTaux} className="btn-primary disabled:opacity-50">{savingTaux ? 'Enregistrement...' : 'Enregistrer'}</button>
            <button onClick={() => { setShowForm(false); setTauxError(''); }} className="btn-ghost">Annuler</button>
          </div>
        </div>
      )}

      {/* Formulaire virement cross-devise */}
      {showVirement && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', border: '2px solid #059669' }}>
          <h3 className="font-bold" style={{ color: '#0b1733' }}>Virement entre devises différentes</h3>
          <div className="p-3 rounded-xl text-xs" style={{ background: '#fffbeb', color: '#92400e' }}>
            Le montant est débité dans la devise du compte source. Le montant converti est crédité dans la devise du compte destination au taux actif.
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Compte source (ID)</label>
              <input value={formVir.compteSourceId} onChange={(e) => setFormVir((f) => ({ ...f, compteSourceId: e.target.value }))} className="input font-mono text-xs" placeholder="cuid du compte source" />
            </div>
            <div>
              <label className="label">Compte destination (ID)</label>
              <input value={formVir.compteDestinationId} onChange={(e) => setFormVir((f) => ({ ...f, compteDestinationId: e.target.value }))} className="input font-mono text-xs" placeholder="cuid du compte destination" />
            </div>
            <div>
              <label className="label">Montant à débiter</label>
              <input type="number" step="0.01" min="0" value={formVir.montant} onChange={(e) => setFormVir((f) => ({ ...f, montant: e.target.value }))} className="input font-mono" placeholder="0.00" />
            </div>
          </div>
          {virError && <p className="text-sm" style={{ color: '#b91c1c' }}>{virError}</p>}
          {virResult && (
            <div className="p-4 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #bbf7d0' }}>
              <p className="font-bold text-sm mb-2" style={{ color: '#047857' }}>Virement effectué avec succès</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs" style={{ color: '#8b94b0' }}>Montant débité</p>
                  <p className="font-mono font-bold">{virResult.transaction?.montant} {virResult.transaction?.devise}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8b94b0' }}>Montant crédité</p>
                  <p className="font-mono font-bold">{virResult.montantConverti} {virResult.devise === 'USD' ? 'HTG' : virResult.devise}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8b94b0' }}>Taux appliqué</p>
                  <p className="font-mono font-bold">{virResult.taux?.achat ?? virResult.taux?.vente}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleVirement} disabled={savingVir} className="btn-primary disabled:opacity-50">{savingVir ? 'En cours...' : 'Effectuer le virement'}</button>
            <button onClick={() => { setShowVirement(false); setVirError(''); setVirResult(null); }} className="btn-ghost">Annuler</button>
          </div>
        </div>
      )}

      {/* Historique taux */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f2f9' }}>
          <h3 className="font-bold" style={{ color: '#0b1733' }}>Historique des taux</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
              <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f7f8fc' }}>
                {['Date', 'Devise', 'Achat', 'Vente', 'Marge', 'Statut'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b94b0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {taux.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: '#8b94b0' }}>Aucun taux enregistré</td></tr>
              ) : taux.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f7f8fc' }}>
                  <td className="px-4 py-3 text-xs" style={{ color: '#4a5578' }}>{formatDatetime(t.createdAt)}</td>
                  <td className="px-4 py-3"><span className="font-mono font-bold px-2 py-0.5 rounded" style={{ background: '#eef2ff', color: '#1e40af' }}>{t.devise}</span></td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#047857' }}>{Number(t.tauxAchat).toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#b91c1c' }}>{Number(t.tauxVente).toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: '#4a5578' }}>
                    +{(Number(t.tauxVente) - Number(t.tauxAchat)).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {t.actif
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#ecfdf5', color: '#047857' }}>Actif</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#f7f8fc', color: '#8b94b0' }}>Archivé</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
