'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Save, Check, X, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEtablissementsStore, Etablissement, FicheEtablissementInput } from '@/stores/etablissementsStore';

const DEVISES = ['HTG', 'USD'] as const;

// État du formulaire dérivé de l'établissement. Les nombres GPS sont manipulés en
// chaîne pour laisser l'utilisateur vider un champ sans forcer un 0.
interface FormState {
  telephone: string;
  email: string;
  siteWeb: string;
  description: string;
  heureCheckIn: string;
  heureCheckOut: string;
  politiqueAnnulation: string;
  fuseauHoraire: string;
  devisesAcceptees: ('HTG' | 'USD')[];
  devisePrincipale: 'HTG' | 'USD';
  latitude: string;
  longitude: string;
  equipements: string[];
}

function versForm(e: Etablissement): FormState {
  return {
    telephone: e.telephone ?? '',
    email: e.email ?? '',
    siteWeb: e.siteWeb ?? '',
    description: e.description ?? '',
    heureCheckIn: e.heureCheckIn ?? '14:00',
    heureCheckOut: e.heureCheckOut ?? '12:00',
    politiqueAnnulation: e.politiqueAnnulation ?? '',
    fuseauHoraire: e.fuseauHoraire ?? 'America/Port-au-Prince',
    devisesAcceptees: e.devisesAcceptees ?? ['HTG'],
    devisePrincipale: e.devisePrincipale ?? 'HTG',
    latitude: e.latitude != null ? String(e.latitude) : '',
    longitude: e.longitude != null ? String(e.longitude) : '',
    equipements: e.equipements ?? [],
  };
}

export default function ParametresPage() {
  const { employe } = useAuthStore();
  const { etablissements, fetchAll, majFiche, uploadLogo } = useEtablissementsStore();
  const [selectedId, setSelectedId] = useState<string>('');
  const [form, setForm] = useState<FormState | null>(null);
  const [nouvelEquipement, setNouvelEquipement] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; texte: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Le directeur édite son établissement ; le super administrateur choisit lequel.
  useEffect(() => {
    if (!selectedId && etablissements.length > 0) {
      setSelectedId(employe?.etablissementId ?? etablissements[0].id);
    }
  }, [etablissements, employe, selectedId]);

  const etab = useMemo(() => etablissements.find((e) => e.id === selectedId), [etablissements, selectedId]);

  // Réinitialise le formulaire quand on change d'établissement. On ne resynchronise
  // pas à chaque changement de `etab` (ex. après upload de logo) pour ne pas écraser
  // les saisies non enregistrées — même écueil que le bug /parametres d'ANTENN.
  useEffect(() => {
    if (etab) setForm(versForm(etab));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!form || !etab) {
    return <div className="card p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>;
  }

  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch });

  const toggleDevise = (d: 'HTG' | 'USD') => {
    const has = form.devisesAcceptees.includes(d);
    const next = has ? form.devisesAcceptees.filter((x) => x !== d) : [...form.devisesAcceptees, d];
    if (next.length === 0) return; // au moins une devise
    const patch: Partial<FormState> = { devisesAcceptees: next };
    // Si la devise principale n'est plus acceptée, on la ramène sur une valide.
    if (!next.includes(form.devisePrincipale)) patch.devisePrincipale = next[0];
    set(patch);
  };

  const ajouterEquipement = () => {
    const v = nouvelEquipement.trim();
    if (v && !form.equipements.includes(v)) set({ equipements: [...form.equipements, v] });
    setNouvelEquipement('');
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: FicheEtablissementInput = {
        telephone: form.telephone || null,
        email: form.email || null,
        siteWeb: form.siteWeb || null,
        description: form.description || null,
        heureCheckIn: form.heureCheckIn,
        heureCheckOut: form.heureCheckOut,
        politiqueAnnulation: form.politiqueAnnulation || null,
        fuseauHoraire: form.fuseauHoraire,
        devisesAcceptees: form.devisesAcceptees,
        devisePrincipale: form.devisePrincipale,
        equipements: form.equipements,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      await majFiche(etab.id, payload);
      setMessage({ type: 'ok', texte: 'Fiche enregistrée' });
    } catch (e: any) {
      setMessage({ type: 'err', texte: e.response?.data?.message || 'Erreur lors de l\'enregistrement' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      await uploadLogo(etab.id, file);
      setMessage({ type: 'ok', texte: 'Logo mis à jour' });
    } catch (e: any) {
      setMessage({ type: 'err', texte: e.response?.data?.message || 'Erreur lors de l\'envoi du logo' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const estChaine = employe?.role === 'ADMINISTRATEUR_CHAINE';

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {estChaine && (
        <div className="card p-4">
          <label className="label">Établissement</label>
          <select className="input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {etablissements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
      )}

      {message && (
        <div className="card p-3 flex items-center gap-2 text-sm font-medium"
          style={{ color: message.type === 'ok' ? 'var(--color-primary-2)' : 'var(--color-rose, #e11d48)' }}>
          {message.type === 'ok' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {message.texte}
        </div>
      )}

      {/* Logo */}
      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>LOGO</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-line)' }}>
            {etab.logoUrl
              ? <img src={etab.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              : <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucun</span>}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleLogo} className="hidden" />
            <button type="button" className="btn-secondary inline-flex items-center gap-2" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> {uploading ? 'Envoi...' : 'Changer le logo'}
            </button>
            <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>PNG, JPEG, WebP ou GIF, 5 Mo max.</p>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>CONTACTS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Téléphone</label><input className="input" value={form.telephone} onChange={(e) => set({ telephone: e.target.value })} placeholder="+509 ..." /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="contact@hotel.ht" /></div>
          <div className="sm:col-span-2"><label className="label">Site web</label><input className="input" value={form.siteWeb} onChange={(e) => set({ siteWeb: e.target.value })} placeholder="https://..." /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Latitude GPS</label><input className="input" value={form.latitude} onChange={(e) => set({ latitude: e.target.value })} placeholder="18.5" /></div>
          <div><label className="label">Longitude GPS</label><input className="input" value={form.longitude} onChange={(e) => set({ longitude: e.target.value })} placeholder="-72.3" /></div>
        </div>
      </div>

      {/* Description & équipements */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>PRÉSENTATION</h2>
        <div><label className="label">Description</label><textarea className="input min-h-24" value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Décrivez l'établissement..." /></div>
        <div>
          <label className="label">Équipements & services</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.equipements.map((eq) => (
              <span key={eq} className="badge inline-flex items-center gap-1">
                {eq}
                <button type="button" onClick={() => set({ equipements: form.equipements.filter((x) => x !== eq) })}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {form.equipements.length === 0 && <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucun équipement ajouté.</span>}
          </div>
          <div className="flex gap-2">
            <input className="input" value={nouvelEquipement} onChange={(e) => setNouvelEquipement(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterEquipement(); } }} placeholder="Wi-Fi, Piscine, Générateur..." />
            <button type="button" className="btn-secondary shrink-0 inline-flex items-center gap-1" onClick={ajouterEquipement}><Plus className="w-4 h-4" /> Ajouter</button>
          </div>
        </div>
      </div>

      {/* Séjour & devises */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>SÉJOUR & DEVISES</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Heure de check-in</label><input className="input" type="time" value={form.heureCheckIn} onChange={(e) => set({ heureCheckIn: e.target.value })} /></div>
          <div><label className="label">Heure de check-out</label><input className="input" type="time" value={form.heureCheckOut} onChange={(e) => set({ heureCheckOut: e.target.value })} /></div>
        </div>
        <div>
          <label className="label">Devises acceptées</label>
          <div className="flex gap-2">
            {DEVISES.map((d) => (
              <button key={d} type="button" onClick={() => toggleDevise(d)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={form.devisesAcceptees.includes(d)
                  ? { background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)', borderColor: 'var(--color-primary-2)' }
                  : { color: 'var(--color-ink-3)', borderColor: 'var(--color-line)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Devise principale (affichée par défaut)</label>
          <select className="input sm:max-w-[200px]" value={form.devisePrincipale} onChange={(e) => set({ devisePrincipale: e.target.value as 'HTG' | 'USD' })}>
            {form.devisesAcceptees.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Politique d'annulation</label>
          <textarea className="input min-h-20" value={form.politiqueAnnulation} onChange={(e) => set({ politiqueAnnulation: e.target.value })} placeholder="Conditions d'annulation..." />
        </div>
        <div>
          <label className="label">Fuseau horaire</label>
          <input className="input sm:max-w-[320px]" value={form.fuseauHoraire} onChange={(e) => set({ fuseauHoraire: e.target.value })} />
          <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>Utilisé pour l'affichage et les emails. Les calculs de dates restent en UTC.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer la fiche'}
        </button>
      </div>
    </form>
  );
}
