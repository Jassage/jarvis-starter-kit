'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { siteSettingsApi } from '@/lib/api';

interface SiteSettings {
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  horaires: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  siteWebUrl: string | null;
}

const CHAMPS_VIDES: SiteSettings = {
  adresse: '', telephone: '', email: '', horaires: '',
  facebookUrl: '', instagramUrl: '', whatsappUrl: '', siteWebUrl: '',
};

export default function ParametresPage() {
  const [valeurs, setValeurs] = useState<SiteSettings>(CHAMPS_VIDES);
  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await siteSettingsApi.get();
      const p = data.data.parametres;
      setValeurs({
        adresse: p.adresse ?? '', telephone: p.telephone ?? '', email: p.email ?? '', horaires: p.horaires ?? '',
        facebookUrl: p.facebookUrl ?? '', instagramUrl: p.instagramUrl ?? '', whatsappUrl: p.whatsappUrl ?? '', siteWebUrl: p.siteWebUrl ?? '',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function set<K extends keyof SiteSettings>(cle: K, valeur: string) {
    setValeurs((v) => ({ ...v, [cle]: valeur }));
    setEnregistre(false);
  }

  async function enregistrer() {
    setErreur(null);
    setEnregistrement(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(valeurs).map(([k, v]) => [k, v && v.trim() ? v.trim() : null])
      );
      await siteSettingsApi.update(payload);
      setEnregistre(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      setErreur(message);
    } finally {
      setEnregistrement(false);
    }
  }

  if (loading) {
    return <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Paramètres du site</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Coordonnées et réseaux sociaux affichés dans le pied de page et sur la page Contact. Un champ laissé vide affiche une valeur neutre par défaut côté public.
      </p>

      <div className="card p-5 sm:p-6 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-ink-3)' }}>Coordonnées</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Adresse</label>
            <input className="input" value={valeurs.adresse ?? ''} onChange={(e) => set('adresse', e.target.value)} placeholder="Rue Principale, Gros-Morne, Haïti" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label>
            <input className="input" value={valeurs.telephone ?? ''} onChange={(e) => set('telephone', e.target.value)} placeholder="+509 1234 5678" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Email</label>
            <input className="input" value={valeurs.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="info@grosmorne.ht" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Horaires</label>
            <input className="input" value={valeurs.horaires ?? ''} onChange={(e) => set('horaires', e.target.value)} placeholder="Lun - Ven : 8:00 AM - 4:00 PM" />
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-ink-3)' }}>Réseaux sociaux</p>
        <p className="text-xs mb-3" style={{ color: 'var(--color-ink-3)' }}>
          Une icône n&apos;apparaît dans le footer que si son lien est renseigné ici.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Facebook</label>
            <input className="input" value={valeurs.facebookUrl ?? ''} onChange={(e) => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>WhatsApp</label>
            <input className="input" value={valeurs.whatsappUrl ?? ''} onChange={(e) => set('whatsappUrl', e.target.value)} placeholder="https://wa.me/509..." />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Instagram</label>
            <input className="input" value={valeurs.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Autre site web</label>
            <input className="input" value={valeurs.siteWebUrl ?? ''} onChange={(e) => set('siteWebUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        {erreur && <p className="text-sm mb-3" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}

        <div className="flex items-center gap-3">
          <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {enregistre && (
            <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
              <Check className="w-4 h-4" /> Enregistré
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
