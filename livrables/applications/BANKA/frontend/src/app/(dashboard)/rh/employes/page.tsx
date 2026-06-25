'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatMontant } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const STATUT_COLORS: Record<string, { color: string; bg: string }> = {
  ACTIF:    { color: '#047857', bg: '#dcfce7' },
  INACTIF:  { color: '#8b94b0', bg: '#f0f2f9' },
  CONGE:    { color: '#b45309', bg: '#fef3c7' },
  SUSPENDU: { color: '#b91c1c', bg: '#fee2e2' },
};

const PALETTES: [string, string][] = [
  ['#dbeafe', '#1d4ed8'], ['#ede9fe', '#6d28d9'], ['#d1fae5', '#065f46'],
  ['#fef3c7', '#92400e'], ['#fee2e2', '#991b1b'], ['#e0f2fe', '#0369a1'],
  ['#fae8ff', '#7e22ce'], ['#ffedd5', '#c2410c'],
];

function av(name: string) {
  const idx = (name.charCodeAt(0) || 65) % PALETTES.length;
  return { bg: PALETTES[idx][0], color: PALETTES[idx][1] };
}

interface Employe {
  id: string; matricule: string; nom: string; prenom: string;
  poste: { id?: string; intitule: string }; departement: string; dateEmbauche: string;
  statut: string; salaireBrut: number; telephone?: string; email?: string;
  compteId?: string; modeReglement?: string;
  compte?: { numeroCompte: string; type: string; client: { nom: string; prenom?: string; raisonSociale?: string } };
}

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function EmployesPage() {
  const { utilisateur } = useAuthStore();
  const canManage = ['SUPER_ADMIN', 'DIRECTEUR'].includes(utilisateur?.role || '');

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [postes, setPostes] = useState<{ id: string; intitule: string }[]>([]);
  const [fNom, setFNom] = useState('');
  const [fPrenom, setFPrenom] = useState('');
  const [fPosteId, setFPosteId] = useState('');
  const [fDept, setFDept] = useState('');
  const [fDateEmb, setFDateEmb] = useState('');
  const [fSalaire, setFSalaire] = useState('');
  const [fTel, setFTel] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fStatut, setFStatut] = useState('ACTIF');
  const [fCompteId, setFCompteId] = useState('');
  const [fModeReglement, setFModeReglement] = useState('VIREMENT_BANKA');
  const [compteSearch, setCompteSearch] = useState('');
  const [compteResults, setCompteResults] = useState<any[]>([]);
  const [compteSearching, setCompteSearching] = useState(false);
  const [compteLabel, setCompteLabel] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: '50' });
      if (search) p.set('search', search);
      if (filterStatut) p.set('statut', filterStatut);
      const { data } = await api.get(`/rh/employes?${p}`);
      setEmployes(data.data.items); setTotal(data.data.total);
    } catch { setEmployes([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatut]);

  const loadPostes = async () => {
    if (!postes.length) {
      try { const { data } = await api.get('/rh/postes'); setPostes(data.data); } catch {}
    }
  };

  const searchComptes = async (q: string) => {
    setCompteSearch(q);
    if (q.length < 2) { setCompteResults([]); return; }
    setCompteSearching(true);
    try {
      const { data } = await api.get(`/comptes?search=${encodeURIComponent(q)}&limit=10`);
      setCompteResults(data.data?.items || data.data || []);
    } catch { setCompteResults([]); }
    finally { setCompteSearching(false); }
  };

  const selectCompte = (c: any) => {
    setFCompteId(c.id);
    const titulaire = c.client?.raisonSociale || `${c.client?.prenom || ''} ${c.client?.nom || ''}`.trim();
    setCompteLabel(`${c.numeroCompte} — ${titulaire}`);
    setCompteSearch('');
    setCompteResults([]);
  };

  const openForm = async () => {
    await loadPostes();
    setFormMode('create'); setEditId(''); setFormError('');
    setFNom(''); setFPrenom(''); setFPosteId(''); setFDept('');
    setFDateEmb(''); setFSalaire(''); setFTel(''); setFEmail(''); setFStatut('ACTIF');
    setFCompteId(''); setFModeReglement('VIREMENT_BANKA'); setCompteLabel(''); setCompteSearch(''); setCompteResults([]);
    setShowForm(true);
  };

  const openEdit = async (e: Employe) => {
    await loadPostes();
    setFormMode('edit'); setEditId(e.id); setFormError('');
    setFNom(e.nom); setFPrenom(e.prenom);
    setFPosteId((e.poste as any)?.id || '');
    setFDept(e.departement || '');
    setFDateEmb(e.dateEmbauche ? e.dateEmbauche.slice(0, 10) : '');
    setFSalaire(String(e.salaireBrut));
    setFTel(e.telephone || ''); setFEmail(e.email || '');
    setFStatut(e.statut);
    setFCompteId(e.compteId || '');
    setFModeReglement(e.modeReglement || 'VIREMENT_BANKA');
    if (e.compte) {
      const titulaire = e.compte.client?.raisonSociale || `${e.compte.client?.prenom || ''} ${e.compte.client?.nom || ''}`.trim();
      setCompteLabel(`${e.compte.numeroCompte} — ${titulaire}`);
    } else {
      setCompteLabel('');
    }
    setCompteSearch(''); setCompteResults([]);
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!fSalaire || Number(fSalaire) <= 0) { setFormError('Salaire invalide'); return; }
    setSaving(true); setFormError('');
    try {
      await api.put(`/rh/employes/${editId}`, {
        statut: fStatut,
        salaireBrut: Number(fSalaire),
        posteId: fPosteId || undefined,
        departement: fDept || undefined,
        telephone: fTel || undefined,
        email: fEmail || undefined,
        compteId: fCompteId || undefined,
        modeReglement: fModeReglement,
      });
      setShowForm(false); await load();
    } catch (e: any) { setFormError(e.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!fNom.trim() || !fPrenom.trim()) { setFormError('Nom et prénom requis'); return; }
    if (!fPosteId) { setFormError('Poste requis'); return; }
    if (!fDateEmb) { setFormError("Date d'embauche requise"); return; }
    if (!fSalaire || Number(fSalaire) <= 0) { setFormError('Salaire invalide'); return; }
    setSaving(true); setFormError('');
    try {
      await api.post('/rh/employes', {
        nom: fNom.trim(), prenom: fPrenom.trim(), posteId: fPosteId,
        departement: fDept, dateEmbauche: fDateEmb, salaireBrut: Number(fSalaire),
        telephone: fTel || undefined, email: fEmail || undefined,
      });
      setShowForm(false); await load();
    } catch (e: any) { setFormError(e.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Employés</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>{total} collaborateur{total > 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <button onClick={openForm} className="btn-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouvel employé
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
            placeholder="Rechercher (nom, matricule)..." className="input w-full" style={{ paddingLeft: 36 }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['', 'ACTIF', 'INACTIF', 'CONGE', 'SUSPENDU'] as const).map((s) => {
            const sc = s ? STATUT_COLORS[s] : null;
            const active = filterStatut === s;
            return (
              <button key={s} onClick={() => setFilterStatut(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: active ? (sc ? sc.bg : '#0b1733') : '#f0f2f9', color: active ? (sc ? sc.color : 'white') : '#4a5578' }}>
                {s || 'Tous'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 gap-2" style={{ color: '#7c3aed' }}>
          <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
        </div>
      ) : employes.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#ede9fe' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: '#6d28d9' }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-semibold text-sm" style={{ color: '#0b1733' }}>
            {search || filterStatut ? 'Aucun résultat' : 'Aucun employé enregistré'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>
            {search || filterStatut ? 'Modifiez vos critères' : "Ajoutez le premier collaborateur de l'institution"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {employes.map((e) => {
            const sc  = STATUT_COLORS[e.statut] || STATUT_COLORS.INACTIF;
            const avs = av(e.prenom || e.nom);
            const init = `${e.prenom?.[0] || ''}${e.nom?.[0] || ''}`.toUpperCase();
            return (
              <div key={e.id} className="card px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                  style={{ background: avs.bg, color: avs.color }}>
                  {init}
                </div>

                {/* Nom */}
                <div className="flex-1 min-w-0" style={{ minWidth: '150px' }}>
                  <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{e.prenom} {e.nom}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="font-mono text-xs" style={{ color: '#8b94b0' }}>{e.matricule}</span>
                    {e.email && <span className="text-xs hidden sm:inline truncate max-w-[160px]" style={{ color: '#8b94b0' }}>{e.email}</span>}
                  </div>
                </div>

                {/* Poste + Dept */}
                <div className="hidden md:flex flex-col gap-1" style={{ minWidth: '130px' }}>
                  <span className="text-xs font-semibold" style={{ color: '#4a5578' }}>{e.poste?.intitule || '—'}</span>
                  {e.departement && (
                    <span className="text-xs px-2 py-0.5 rounded-md w-fit" style={{ background: '#f0f2f9', color: '#8b94b0' }}>
                      {e.departement}
                    </span>
                  )}
                </div>

                {/* Embauche */}
                <div className="hidden lg:flex flex-col items-center" style={{ minWidth: '70px' }}>
                  <span className="text-xs" style={{ color: '#8b94b0' }}>Depuis</span>
                  <span className="text-xs font-medium mt-0.5" style={{ color: '#4a5578' }}>{formatDate(e.dateEmbauche)}</span>
                </div>

                {/* Salaire */}
                <div className="flex-shrink-0 text-right" style={{ minWidth: '120px' }}>
                  <p className="text-sm font-bold" style={{ color: '#0b1733' }}>{formatMontant(e.salaireBrut, 'HTG')}</p>
                  <p className="text-xs" style={{ color: '#8b94b0' }}>brut / mois</p>
                </div>

                {/* Statut */}
                <span className="chip flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
                  {e.statut}
                </span>

                {/* Actions */}
                {canManage && (
                  <button onClick={() => openEdit(e)} title="Modifier"
                    className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                    style={{ background: '#f0f2f9', color: '#4a5578' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base" style={{ color: '#0b1733' }}>
                  {formMode === 'create' ? 'Nouvel employé' : 'Modifier l\'employé'}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
                  {formMode === 'create' ? 'Renseignez les informations du collaborateur' : 'Mettez à jour le dossier'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              {formMode === 'create' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Prénom *</label><input value={fPrenom} onChange={(e) => setFPrenom(e.target.value)} className="input w-full" placeholder="ex: Marie"/></div>
                    <div><label className="label">Nom *</label><input value={fNom} onChange={(e) => setFNom(e.target.value)} className="input w-full" placeholder="ex: PIERRE"/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Date d'embauche *</label><input type="date" value={fDateEmb} onChange={(e) => setFDateEmb(e.target.value)} className="input w-full"/></div>
                    <div><label className="label">Salaire brut (HTG) *</label><input type="number" value={fSalaire} onChange={(e) => setFSalaire(e.target.value)} min="0" placeholder="0" className="input w-full"/></div>
                  </div>
                </>
              )}
              {formMode === 'edit' && (
                <div>
                  <label className="label">Statut</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['ACTIF', 'INACTIF', 'CONGE', 'SUSPENDU'].map((s) => {
                      const sc = STATUT_COLORS[s];
                      return (
                        <button key={s} onClick={() => setFStatut(s)}
                          className="py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background: fStatut === s ? sc.bg : '#f0f2f9',
                            color: fStatut === s ? sc.color : '#4a5578',
                            border: fStatut === s ? `1.5px solid ${sc.color}` : '1.5px solid transparent',
                          }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="label">Poste {formMode === 'create' ? '*' : ''}</label>
                <select value={fPosteId} onChange={(e) => setFPosteId(e.target.value)} className="input w-full">
                  <option value="">Sélectionner un poste...</option>
                  {postes.map((p) => <option key={p.id} value={p.id}>{p.intitule}</option>)}
                </select>
              </div>
              <div><label className="label">Département</label><input value={fDept} onChange={(e) => setFDept(e.target.value)} placeholder="ex: Opérations" className="input w-full"/></div>
              {formMode === 'edit' && (
                <div>
                  <label className="label">Salaire brut (HTG) *</label>
                  <input type="number" value={fSalaire} onChange={(e) => setFSalaire(e.target.value)} min="0" placeholder="0" className="input w-full"/>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Téléphone</label><input value={fTel} onChange={(e) => setFTel(e.target.value)} placeholder="+509 ..." className="input w-full"/></div>
                <div><label className="label">Email</label><input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} className="input w-full"/></div>
              </div>

              {/* Compte bancaire + mode de règlement — édition uniquement */}
              {formMode === 'edit' && (
                <div className="space-y-3 pt-2" style={{ borderTop: '1px solid #f0f2f9' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#4a5578' }}>Paie</p>

                  {/* Mode de règlement */}
                  <div>
                    <label className="label">Mode de règlement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'VIREMENT_BANKA', label: 'Virement BANKA', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: '#1d4ed8', bg: '#dbeafe' },
                        { key: 'ESPECES',        label: 'Espèces',        icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: '#92400e', bg: '#fef3c7' },
                      ].map(({ key, label, icon, color, bg }) => (
                        <button key={key} type="button" onClick={() => setFModeReglement(key)}
                          className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                          style={{ background: fModeReglement === key ? bg : '#f7f8fc', border: `2px solid ${fModeReglement === key ? color : '#e7eaf3'}` }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: fModeReglement === key ? bg : '#f0f2f9', color: fModeReglement === key ? color : '#8b94b0' }}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d={icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                          <p className="text-xs font-semibold" style={{ color: fModeReglement === key ? color : '#4a5578' }}>{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compte BANKA lié */}
                  {fModeReglement === 'VIREMENT_BANKA' && (
                    <div>
                      <label className="label">Compte BANKA de l'employé</label>
                      {fCompteId && compteLabel ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#0369a1' }}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          <p className="text-xs font-semibold flex-1" style={{ color: '#0c4a6e' }}>{compteLabel}</p>
                          <button type="button" onClick={() => { setFCompteId(''); setCompteLabel(''); }} style={{ color: '#8b94b0' }}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="relative">
                            <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#8b94b0' }}>
                              <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                            <input
                              value={compteSearch}
                              onChange={(e) => searchComptes(e.target.value)}
                              placeholder="Rechercher par n° de compte ou titulaire..."
                              className="input w-full"
                              style={{ paddingLeft: 36 }}
                            />
                            {compteSearching && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Spin />
                              </div>
                            )}
                          </div>
                          {compteResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 rounded-xl shadow-lg overflow-hidden" style={{ background: 'white', border: '1px solid #e4e7f0' }}>
                              {compteResults.map((c: any) => {
                                const titulaire = c.client?.raisonSociale || `${c.client?.prenom || ''} ${c.client?.nom || ''}`.trim();
                                return (
                                  <button key={c.id} type="button" onClick={() => selectCompte(c)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>{c.numeroCompte}</p>
                                      <p className="text-xs" style={{ color: '#8b94b0' }}>{titulaire} · {c.type}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs mt-1.5" style={{ color: '#8b94b0' }}>Le salaire net sera crédité sur ce compte lors du virement.</p>
                    </div>
                  )}
                </div>
              )}

              {formError && <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f9', color: '#4a5578' }}>Annuler</button>
                <button onClick={formMode === 'create' ? handleCreate : handleUpdate} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Spin />} {formMode === 'create' ? 'Enregistrer' : 'Mettre à jour'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
