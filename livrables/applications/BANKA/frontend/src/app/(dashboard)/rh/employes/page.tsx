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

const CONGE_TYPE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ANNUEL:     { label: 'Congé annuel', color: '#047857', bg: '#d1fae5', border: '#6ee7b7' },
  MALADIE:    { label: 'Maladie',      color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
  MATERNITE:  { label: 'Maternité',    color: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd' },
  PATERNITE:  { label: 'Paternité',    color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
  SANS_SOLDE: { label: 'Sans solde',   color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
  AUTRE:      { label: 'Absent',       color: '#4a5578', bg: '#f0f2f9', border: '#d1d5e4' },
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

interface CongeEnCours { id: string; type: string; dateDebut: string; dateFin: string; }
interface Agence { id: string; nom: string; code: string; }
interface CompteSysteme { id: string; email: string; role: string; actif: boolean; nom: string; prenom: string; }

interface Employe {
  id: string; matricule: string; nom: string; prenom: string;
  poste: { id?: string; intitule: string }; departement: string; dateEmbauche: string;
  statut: string; salaireBrut: number; telephone?: string; email?: string;
  biometricId?: number;
  compteId?: string; modeReglement?: string;
  agenceId?: string; agence?: Agence;
  utilisateurId?: string; utilisateur?: CompteSysteme;
  compte?: { numeroCompte: string; type: string; client: { nom: string; prenom?: string; raisonSociale?: string } };
  conges?: CongeEnCours[];
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
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterAgence, setFilterAgence] = useState('');
  const [agences, setAgences] = useState<Agence[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [postes, setPostes] = useState<{ id: string; intitule: string; departement?: string; salaireMin?: number; salaireMax?: number }[]>([]);
  const [fNom, setFNom] = useState('');
  const [fPrenom, setFPrenom] = useState('');
  const [fPosteId, setFPosteId] = useState('');
  const [fDept, setFDept] = useState('');
  const [fDateEmb, setFDateEmb] = useState('');
  const [fSalaire, setFSalaire] = useState('');
  const [fTel, setFTel] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fStatut, setFStatut] = useState('ACTIF');
  const [fAgenceId, setFAgenceId] = useState('');
  const [fCompteId, setFCompteId] = useState('');
  const [fModeReglement, setFModeReglement] = useState('VIREMENT_BANKA');
  const [fBiometricId, setFBiometricId] = useState('');
  const [compteSearch, setCompteSearch] = useState('');
  const [compteResults, setCompteResults] = useState<any[]>([]);
  const [compteSearching, setCompteSearching] = useState(false);
  const [compteLabel, setCompteLabel] = useState('');

  // Modal compte système
  const [compteSystemeTarget, setCompteSystemeTarget] = useState<Employe | null>(null);
  const [csEmail, setCsEmail] = useState('');
  const [csMdp, setCsMdp] = useState('');
  const [csRole, setCsRole] = useState('CAISSIER');
  const [csSaving, setCsSaving] = useState(false);
  const [csError, setCsError] = useState('');
  const [csDelierLoading, setCsDelierLoading] = useState(false);

  // Modal de transfert
  const [transfertTarget, setTransfertTarget] = useState<Employe | null>(null);
  const [transfertAgenceId, setTransfertAgenceId] = useState('');
  const [transfertSaving, setTransfertSaving] = useState(false);
  const [transfertError, setTransfertError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: '30', page: String(page) });
      if (search) p.set('search', search);
      if (filterStatut) p.set('statut', filterStatut);
      if (filterAgence) p.set('agenceId', filterAgence);
      const { data } = await api.get(`/rh/employes?${p}`);
      setEmployes(data.data.items); setTotal(data.data.total);
      setPages(data.data.pages || 1);
    } catch { setEmployes([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatut, filterAgence, page]);

  useEffect(() => {
    api.get('/agences').then(({ data }) => setAgences(data.data || [])).catch(() => {});
  }, []);

  const loadPostes = async () => {
    if (!postes.length) {
      try { const { data } = await api.get('/rh/postes'); setPostes(data.data); } catch {}
    }
  };

  useEffect(() => {
    if (!fPosteId) return;
    const poste = postes.find((p) => p.id === fPosteId);
    if (poste?.departement) setFDept(poste.departement);
  }, [fPosteId]);

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
    setFAgenceId('');
    setFCompteId(''); setFModeReglement('VIREMENT_BANKA'); setCompteLabel(''); setCompteSearch(''); setCompteResults([]);
    setFBiometricId('');
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
    setFAgenceId(e.agenceId || '');
    setFCompteId(e.compteId || '');
    setFModeReglement(e.modeReglement || 'VIREMENT_BANKA');
    setFBiometricId(e.biometricId ? String(e.biometricId) : '');
    if (e.compte) {
      const titulaire = e.compte.client?.raisonSociale || `${e.compte.client?.prenom || ''} ${e.compte.client?.nom || ''}`.trim();
      setCompteLabel(`${e.compte.numeroCompte} — ${titulaire}`);
    } else {
      setCompteLabel('');
    }
    setCompteSearch(''); setCompteResults([]);
    setShowForm(true);
  };

  const openCompteSysteme = (e: Employe) => {
    setCompteSystemeTarget(e);
    setCsEmail(e.email || '');
    setCsMdp('');
    setCsRole('CAISSIER');
    setCsError('');
  };

  const handleCreerCompte = async () => {
    if (!compteSystemeTarget) return;
    if (!csEmail.trim()) { setCsError('Email requis'); return; }
    if (!csMdp || csMdp.length < 8) { setCsError('Mot de passe : 8 caractères minimum'); return; }
    setCsSaving(true); setCsError('');
    try {
      await api.post(`/rh/employes/${compteSystemeTarget.id}/compte-systeme`, { email: csEmail.trim(), motDePasse: csMdp, role: csRole });
      setCompteSystemeTarget(null);
      await load();
    } catch (e: any) { setCsError(e.response?.data?.message || 'Erreur'); }
    finally { setCsSaving(false); }
  };

  const handleDelierCompte = async (e: Employe) => {
    if (!confirm(`Délier le compte système de ${e.prenom} ${e.nom} ? Le compte utilisateur ne sera pas supprimé.`)) return;
    setCsDelierLoading(true);
    try {
      await api.delete(`/rh/employes/${e.id}/compte-systeme`);
      await load();
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setCsDelierLoading(false); }
  };

  const openTransfert = (e: Employe) => {
    setTransfertTarget(e);
    setTransfertAgenceId(e.agenceId || '');
    setTransfertError('');
  };

  const handleUpdate = async () => {
    if (!fSalaire || Number(fSalaire) <= 0) { setFormError('Salaire invalide'); return; }
    if (fPosteId) {
      const poste = postes.find((p) => p.id === fPosteId);
      if (poste?.salaireMin && Number(fSalaire) < poste.salaireMin) {
        setFormError(`Le salaire est en dessous du minimum pour ce poste (${poste.salaireMin.toLocaleString('fr-FR')} HTG)`); return;
      }
      if (poste?.salaireMax && Number(fSalaire) > poste.salaireMax) {
        setFormError(`Le salaire dépasse le maximum pour ce poste (${poste.salaireMax.toLocaleString('fr-FR')} HTG)`); return;
      }
    }
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
        biometricId: fBiometricId ? parseInt(fBiometricId) : null,
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
    const poste = postes.find((p) => p.id === fPosteId);
    if (poste?.salaireMin && Number(fSalaire) < poste.salaireMin) {
      setFormError(`Le salaire est en dessous du minimum pour ce poste (${poste.salaireMin.toLocaleString('fr-FR')} HTG)`); return;
    }
    if (poste?.salaireMax && Number(fSalaire) > poste.salaireMax) {
      setFormError(`Le salaire dépasse le maximum pour ce poste (${poste.salaireMax.toLocaleString('fr-FR')} HTG)`); return;
    }
    setSaving(true); setFormError('');
    try {
      await api.post('/rh/employes', {
        nom: fNom.trim(), prenom: fPrenom.trim(), posteId: fPosteId,
        departement: fDept, dateEmbauche: fDateEmb, salaireBrut: Number(fSalaire),
        telephone: fTel || undefined, email: fEmail || undefined,
        agenceId: fAgenceId || undefined,
      });
      setShowForm(false); await load();
    } catch (e: any) { setFormError(e.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleTransfert = async () => {
    if (!transfertTarget) return;
    setTransfertSaving(true); setTransfertError('');
    try {
      await api.patch(`/rh/employes/${transfertTarget.id}/agence`, {
        agenceId: transfertAgenceId || null,
      });
      setTransfertTarget(null);
      await load();
    } catch (e: any) { setTransfertError(e.response?.data?.message || 'Erreur'); }
    finally { setTransfertSaving(false); }
  };

  const agenceNom = (id?: string) => agences.find((a) => a.id === id)?.nom;

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
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher (nom, matricule)..." className="input w-full" style={{ paddingLeft: 36 }} />
        </div>
        {agences.length > 0 && (
          <select value={filterAgence} onChange={(e) => { setFilterAgence(e.target.value); setPage(1); }} className="input" style={{ minWidth: '160px' }}>
            <option value="">Toutes les agences</option>
            <option value="null">Siège uniquement</option>
            {agences.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
          </select>
        )}
        <div className="flex gap-1.5 flex-wrap">
          {(['', 'ACTIF', 'INACTIF', 'CONGE', 'SUSPENDU'] as const).map((s) => {
            const sc = s ? STATUT_COLORS[s] : null;
            const active = filterStatut === s;
            return (
              <button key={s} onClick={() => { setFilterStatut(s); setPage(1); }}
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
            {search || filterStatut || filterAgence ? 'Aucun résultat' : 'Aucun employé enregistré'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>
            {search || filterStatut || filterAgence ? 'Modifiez vos critères' : "Ajoutez le premier collaborateur de l'institution"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages > 1 && (
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f2f9' }}>
              <p className="text-sm" style={{ color: '#8b94b0' }}>
                Page <span className="font-semibold" style={{ color: '#0b1733' }}>{page}</span> sur {pages}
                <span className="ml-2" style={{ color: '#d1d5e4' }}>·</span>
                <span className="ml-2">{total} employé{total > 1 ? 's' : ''}</span>
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost text-xs disabled:opacity-40">← Précédent</button>
                <button disabled={page === pages} onClick={() => setPage(page + 1)} className="btn-ghost text-xs disabled:opacity-40">Suivant →</button>
              </div>
            </div>
          )}
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

                {/* Agence */}
                <div className="hidden lg:block" style={{ minWidth: '100px' }}>
                  <span className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{ background: e.agence ? '#e0f2fe' : '#f0f2f9', color: e.agence ? '#0369a1' : '#8b94b0' }}>
                    {e.agence ? e.agence.nom : 'Siège'}
                  </span>
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

                {/* Badge congé/absence en cours */}
                {e.conges && e.conges.length > 0 && (() => {
                  const cg = e.conges![0];
                  const cfg = CONGE_TYPE_LABELS[cg.type] ?? CONGE_TYPE_LABELS.AUTRE;
                  return (
                    <span className="chip flex-shrink-0" title={`${cfg.label} · jusqu'au ${formatDate(cg.dateFin)}`}
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {cfg.label}
                    </span>
                  );
                })()}

                {/* Actions */}
                {canManage && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Compte système */}
                    <button
                      onClick={() => e.utilisateur ? handleDelierCompte(e) : openCompteSysteme(e)}
                      title={e.utilisateur ? `Compte système : ${e.utilisateur.email} (cliquer pour délier)` : 'Créer un compte système'}
                      disabled={csDelierLoading}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                      style={{ background: e.utilisateur ? '#d1fae5' : '#f0f2f9', color: e.utilisateur ? '#047857' : '#8b94b0' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button onClick={() => openTransfert(e)} title="Transférer vers une agence"
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                      style={{ background: '#e0f2fe', color: '#0369a1' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button onClick={() => openEdit(e)} title="Modifier"
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                      style={{ background: '#f0f2f9', color: '#4a5578' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal compte système */}
      {compteSystemeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#d1fae5', color: '#047857' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: '#0b1733' }}>Créer un compte système</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
                  {compteSystemeTarget.prenom} {compteSystemeTarget.nom} · {compteSystemeTarget.matricule}
                </p>
              </div>
              <button onClick={() => setCompteSystemeTarget(null)} className="ml-auto" style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Adresse email *</label>
                <input type="email" value={csEmail} onChange={(e) => setCsEmail(e.target.value)}
                  placeholder="email@institution.com" className="input w-full"/>
              </div>
              <div>
                <label className="label">Rôle *</label>
                <select value={csRole} onChange={(e) => setCsRole(e.target.value)} className="input w-full">
                  {[
                    { value: 'CAISSIER',     label: 'Caissier' },
                    { value: 'AGENT_CREDIT', label: 'Agent de crédit' },
                    { value: 'SUPERVISEUR',  label: 'Superviseur' },
                    { value: 'COMPTABLE',    label: 'Comptable' },
                    { value: 'AUDITEUR',     label: 'Auditeur' },
                    { value: 'DIRECTEUR',    label: 'Directeur' },
                  ].map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Mot de passe initial *</label>
                <input type="password" value={csMdp} onChange={(e) => setCsMdp(e.target.value)}
                  placeholder="Min. 8 caractères" className="input w-full"/>
                <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>L'employé pourra le changer après sa première connexion.</p>
              </div>
              {csError && (
                <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{csError}</div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setCompteSystemeTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f9', color: '#4a5578' }}>Annuler</button>
                <button onClick={handleCreerCompte} disabled={csSaving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#047857', color: 'white' }}>
                  {csSaving && <Spin />} Créer le compte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal transfert d'agence */}
      {transfertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: '#0b1733' }}>Transfert d'agence</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>
                  {transfertTarget.prenom} {transfertTarget.nom} · {transfertTarget.matricule}
                </p>
              </div>
              <button onClick={() => setTransfertTarget(null)} className="ml-auto" style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Agence actuelle */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f7f8fc' }}>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Agence actuelle</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#0b1733' }}>
                    {transfertTarget.agence?.nom ?? 'Siège'}
                  </p>
                </div>
              </div>

              {/* Flèche */}
              <div className="flex justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#8b94b0' }}>
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Agence de destination */}
              <div>
                <label className="label">Agence de destination</label>
                <select value={transfertAgenceId} onChange={(e) => setTransfertAgenceId(e.target.value)} className="input w-full">
                  <option value="">Siège (aucune agence)</option>
                  {agences.map((a) => (
                    <option key={a.id} value={a.id} disabled={a.id === transfertTarget.agenceId}>
                      {a.nom} ({a.code}){a.id === transfertTarget.agenceId ? ' — actuelle' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {transfertError && (
                <div className="p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{transfertError}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setTransfertTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f9', color: '#4a5578' }}>Annuler</button>
                <button
                  onClick={handleTransfert}
                  disabled={transfertSaving || transfertAgenceId === (transfertTarget.agenceId ?? '')}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#0369a1', color: 'white' }}>
                  {transfertSaving && <Spin />} Confirmer le transfert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal création / édition */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.5)' }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base" style={{ color: '#0b1733' }}>
                  {formMode === 'create' ? 'Nouvel employé' : "Modifier l'employé"}
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
                    <div>
                      <label className="label">Salaire brut (HTG) *</label>
                      <input type="number" value={fSalaire} onChange={(e) => setFSalaire(e.target.value)} min="0" placeholder="0" className="input w-full"/>
                      {(() => {
                        const p = postes.find((x) => x.id === fPosteId);
                        if (!p || (!p.salaireMin && !p.salaireMax)) return null;
                        return <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Fourchette : {p.salaireMin?.toLocaleString('fr-FR') ?? '—'} — {p.salaireMax?.toLocaleString('fr-FR') ?? '—'} HTG</p>;
                      })()}
                    </div>
                  </div>
                  {/* Agence — création */}
                  {agences.length > 0 && (
                    <div>
                      <label className="label">Agence d'affectation</label>
                      <select value={fAgenceId} onChange={(e) => setFAgenceId(e.target.value)} className="input w-full">
                        <option value="">Siège (aucune agence)</option>
                        {agences.map((a) => <option key={a.id} value={a.id}>{a.nom} ({a.code})</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}
              {formMode === 'edit' && (
                <>
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
                  {/* Agence en édition — info seulement (le transfert passe par le bouton dédié) */}
                  <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#0369a1' }}>
                      <path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: '#0369a1' }}>Agence actuelle</p>
                      <p className="text-sm font-bold" style={{ color: '#0c4a6e' }}>{agenceNom(fAgenceId) ?? 'Siège'}</p>
                    </div>
                    <p className="text-xs" style={{ color: '#0369a1' }}>Utilisez "Transférer" pour changer</p>
                  </div>
                </>
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
                  {(() => {
                    const p = postes.find((x) => x.id === fPosteId);
                    if (!p || (!p.salaireMin && !p.salaireMax)) return null;
                    return <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>Fourchette : {p.salaireMin?.toLocaleString('fr-FR') ?? '—'} — {p.salaireMax?.toLocaleString('fr-FR') ?? '—'} HTG</p>;
                  })()}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Téléphone</label><input value={fTel} onChange={(e) => setFTel(e.target.value)} placeholder="+509 ..." className="input w-full"/></div>
                <div><label className="label">Email</label><input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} className="input w-full"/></div>
              </div>

              {/* Pointage biométrique — édition uniquement */}
              {formMode === 'edit' && (
                <div className="pt-2" style={{ borderTop: '1px solid #f0f2f9' }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#4a5578' }}>Pointage biométrique</p>
                  <div>
                    <label className="label">ID dans l'appareil ZKTeco</label>
                    <input type="number" min="1" max="99999" value={fBiometricId}
                      onChange={(e) => setFBiometricId(e.target.value)} placeholder="ex: 1, 2, 3..." className="input w-full"/>
                    <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>
                      Numéro attribué à l'employé lors de l'enrôlement sur le terminal ZKTeco.
                    </p>
                  </div>
                </div>
              )}

              {/* Compte bancaire + mode de règlement — édition uniquement */}
              {formMode === 'edit' && (
                <div className="space-y-3 pt-2" style={{ borderTop: '1px solid #f0f2f9' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#4a5578' }}>Paie</p>
                  <div>
                    <label className="label">Mode de règlement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'VIREMENT_BANKA', label: 'Virement BANKA', color: '#1d4ed8', bg: '#dbeafe' },
                        { key: 'ESPECES', label: 'Espèces', color: '#92400e', bg: '#fef3c7' },
                      ].map(({ key, label, color, bg }) => (
                        <button key={key} type="button" onClick={() => setFModeReglement(key)}
                          className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                          style={{ background: fModeReglement === key ? bg : '#f7f8fc', border: `2px solid ${fModeReglement === key ? color : '#e7eaf3'}` }}>
                          <p className="text-xs font-semibold" style={{ color: fModeReglement === key ? color : '#4a5578' }}>{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
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
                          <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#8b94b0' }}>
                            <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                          <input value={compteSearch} onChange={(e) => searchComptes(e.target.value)}
                            placeholder="Rechercher par n° de compte ou titulaire..."
                            className="input w-full" style={{ paddingLeft: 36 }}/>
                          {compteSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spin /></div>
                          )}
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
