'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import { useGo } from '@/lib/navigation';

const CATEGORIES = ['Développement web', 'Design produit', 'Data & IA', 'Marketing', 'Langues', 'Sécurité', 'Autre'];
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

const EMPTY_FORM = { title: '', description: '', category: '', level: 'Tous niveaux', price: '', hours: '' };

export default function TeacherCoursesPage() {
  const go = useGo();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // course id en cours d'édition
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await fetch('/api/teacher/courses');
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setShowForm(true); };
  const openEdit = (c) => {
    setForm({ title: c.title, description: c.description || '', category: c.category, level: c.level, price: String(c.price), hours: String(c.hours) });
    setEditing(c.id);
    setError('');
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category) { setError('Titre et catégorie requis.'); return; }
    setSaving(true); setError('');
    try {
      const res = editing
        ? await fetch(`/api/teacher/courses/${editing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch('/api/teacher/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur.'); setSaving(false); return; }
      await load();
      closeForm();
    } catch { setError('Erreur réseau.'); }
    setSaving(false);
  };

  const togglePublish = async (c) => {
    const newStatus = c.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await fetch(`/api/teacher/courses/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    await load();
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Supprimer ce cours ? Cette action est irréversible.')) return;
    await fetch(`/api/teacher/courses/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <AppShell role="teacher" active="tcourses" go={go} title="Mes cours" subtitle="Crée et gère tes formations">
      <div className="edu-content-narrow">
        {/* Header */}
        <div className="row between" style={{ marginBottom: 24 }}>
          <div>
            <span className="small muted">{courses.length} cours au total</span>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={18} />Nouveau cours
          </button>
        </div>

        {/* Modal création/édition */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
            <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
              <div className="card-pad" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="row between">
                  <h2 className="h3">{editing ? 'Modifier le cours' : 'Nouveau cours'}</h2>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={closeForm}><Icon name="close" size={18} /></button>
                </div>
              </div>
              <form className="card-pad col gap-16" onSubmit={submit}>
                <div className="field">
                  <label className="label">Titre du cours *</label>
                  <input className="input" placeholder="ex: React & Next.js pour débutants"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} placeholder="Décris ce que les apprenants vont maîtriser…"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div className="edu-grid edu-grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label className="label">Catégorie *</label>
                    <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Choisir…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="label">Niveau</label>
                    <select className="input" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="edu-grid edu-grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label className="label">Prix (€) — 0 pour gratuit</label>
                    <input className="input" type="number" min="0" step="1" placeholder="0"
                      value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="label">Durée totale (heures)</label>
                    <input className="input" type="number" min="0" step="0.5" placeholder="0"
                      value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
                  </div>
                </div>
                {error && <p className="tiny" style={{ color: 'var(--rose)', fontWeight: 600 }}>{error}</p>}
                <div className="row gap-10" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={closeForm}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer le cours'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des cours */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 40 }}>Chargement…</div>
        ) : courses.length === 0 ? (
          <div className="card card-pad col" style={{ alignItems: 'center', textAlign: 'center', padding: '48px 24px', gap: 16 }}>
            <Icon name="book" size={40} style={{ color: 'var(--ink-4)' }} />
            <h3 className="h3">Aucun cours encore</h3>
            <p className="muted">Crée ton premier cours et commence à partager tes connaissances.</p>
            <button className="btn btn-primary" onClick={openCreate}><Icon name="plus" size={18} />Créer mon premier cours</button>
          </div>
        ) : (
          <div className="col gap-12">
            {courses.map((c, i) => (
              <div key={c.id} className="card card-pad row gap-16 anim-up" style={{ animationDelay: `${i * 0.04}s`, alignItems: 'flex-start' }}>
                {/* Color bar */}
                <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: `var(--${c.color || 'brand'})`, flexShrink: 0 }} />

                <div className="col grow" style={{ minWidth: 0 }}>
                  <div className="row between gap-12" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="h4" style={{ fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>{c.title}</h3>
                      <div className="row gap-10" style={{ marginTop: 4, flexWrap: 'wrap' }}>
                        <span className={'badge badge-' + (c.color || 'brand')}>{c.category}</span>
                        <span className="tiny muted">{c.level}</span>
                      </div>
                    </div>
                    <span className={'badge ' + (c.status === 'PUBLISHED' ? 'badge-green badge-dot' : '')}
                      style={c.status !== 'PUBLISHED' ? { background: 'var(--bg-2)', color: 'var(--ink-3)' } : undefined}>
                      {c.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>

                  <div className="row gap-20" style={{ marginTop: 12, flexWrap: 'wrap' }}>
                    <span className="small muted row gap-5">
                      <Icon name="users" size={14} />{c._count?.enrollments ?? 0} inscrits
                    </span>
                    <span className="small muted row gap-5">
                      <Icon name="book" size={14} />{c._count?.modules ?? 0} modules
                    </span>
                    <span className="small muted row gap-5">
                      <Icon name="clock" size={14} />{c.hours}h
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--brand)' }}>
                      {c.price === 0 ? 'Gratuit' : `${c.price} €`}
                    </span>
                  </div>
                </div>

                <div className="row gap-8" style={{ flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/teacher/courses/${c.id}`)}>
                    <Icon name="layers" size={15} />Contenu
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>
                    <Icon name="settings" size={15} />Modifier
                  </button>
                  <button
                    className={'btn btn-sm ' + (c.status === 'PUBLISHED' ? 'btn-soft' : 'btn-primary')}
                    onClick={() => togglePublish(c)}>
                    {c.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteCourse(c.id)}
                    style={{ color: 'var(--rose)' }} title="Supprimer">
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
