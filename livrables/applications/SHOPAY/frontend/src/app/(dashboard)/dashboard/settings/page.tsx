'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const DEPARTMENTS = ['OUEST', 'NORD', 'NORD_EST', 'NORD_OUEST', 'ARTIBONITE', 'CENTRE', 'SUD', 'SUD_EST', 'NIPPES', 'GRANDE_ANSE'];

export default function SettingsPage() {
  const { boutique, setUser, user } = useAuthStore();
  const [form, setForm] = useState({
    name: '', description: '', contactEmail: '', contactPhone: '', themeColor: '#5b21b6', department: '', commune: '', landmark: '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/boutiques/mine').then((r) => {
      const b = r.data.data.boutique;
      setForm({
        name: b.name ?? '',
        description: b.description ?? '',
        contactEmail: b.contactEmail ?? '',
        contactPhone: b.contactPhone ?? '',
        themeColor: b.themeColor ?? '#5b21b6',
        department: b.department ?? '',
        commune: b.commune ?? '',
        landmark: b.landmark ?? '',
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const { data } = await api.patch('/boutiques/mine', {
        ...form,
        department: form.department || undefined,
      });
      if (user) setUser(user, data.data.boutique);
      setSaved(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Impossible de sauvegarder');
    }
  };

  const handleLogo = async (file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    const { data } = await api.post('/boutiques/mine/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (user) setUser(user, data.data.boutique);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Paramètres de la boutique</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>URL publique : /store/{boutique?.slug}</p>
      </div>

      <div className="card p-6 flex items-center gap-4">
        {boutique?.logoUrl ? (
          <img src={boutique.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl" style={{ background: 'var(--color-line-2)' }} />
        )}
        <label className="btn btn-secondary cursor-pointer">
          Changer le logo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Nom de la boutique</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Email de contact</label>
            <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Téléphone</label>
            <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Département</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input">
              <option value="">—</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Commune</label>
            <input value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">Point de repère</label>
            <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Couleur du thème</label>
            <input type="color" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className="input h-11" />
          </div>
        </div>

        {error && <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        {saved && <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>Enregistré avec succès</div>}

        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </form>
    </div>
  );
}
