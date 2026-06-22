'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Building2, Phone, Mail, Globe, MapPin, Save, CheckCircle2,
  Plus, Pencil, X, Trash2, Tag, BookOpen, AlertCircle
} from 'lucide-react'
import { TarifMedical } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HopitalConfig { nom: string; adresse: string; telephone: string; email: string; siteWeb: string }
interface TarifForm { code: string; libelle: string; categorie: string; prixDefaut: string }

const HCONFIG_DEFAULT: HopitalConfig = { nom: '', adresse: '', telephone: '', email: '', siteWeb: '' }
const TARIF_DEFAULT: TarifForm = { code: '', libelle: '', categorie: '', prixDefaut: '' }

const DEFAULT_CATEGORIES = [
  'Consultation', 'Chirurgie', 'Biologie', 'Radiologie',
  'Pharmacie', 'Urgences', 'Hospitalisation', 'Soins infirmiers',
  'Maternité', 'Pédiatrie', 'Ophtalmologie', 'ORL', 'Cardiologie',
  'Dermatologie', 'Kinésithérapie',
]

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1.5'
const smallInputCls = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all'

// ─── Config hôpital ───────────────────────────────────────────────────────────

function ConfigTab() {
  const [form, setForm] = useState<HopitalConfig>(HCONFIG_DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.get('/settings/hopital').then(r => {
      const d = r.data.data
      setForm({ nom: d.nom || '', adresse: d.adresse || '', telephone: d.telephone || '', email: d.email || '', siteWeb: d.siteWeb || '' })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function set(k: keyof HopitalConfig, v: string) { setForm(f => ({ ...f, [k]: v })); setSaved(false) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) { setErr('Le nom est requis.'); return }
    setSaving(true); setErr('')
    try {
      await api.put('/settings/hopital', form)
      setSaved(true)
      if (typeof window !== 'undefined') {
        const { default: printModule } = await import('@/lib/print') as any
        if (printModule?._configCache !== undefined) printModule._configCache = null
      }
    } catch { setErr('Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-900 text-sm">Informations de l'établissement</h2>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className={labelCls}>Nom de l'établissement *</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input className={`${inputCls} pl-10`} value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="CLINIQUE MEDIKA" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input className={`${inputCls} pl-10`} value={form.adresse} onChange={e => set('adresse', e.target.value)} placeholder="Rue, quartier, ville, pays" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input className={`${inputCls} pl-10`} value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="509-XXXX-XXXX" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="email" className={`${inputCls} pl-10`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@clinique.ht" />
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Site web</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input className={`${inputCls} pl-10`} value={form.siteWeb} onChange={e => set('siteWeb', e.target.value)} placeholder="www.clinique.ht" />
            </div>
          </div>
          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {saved
            ? <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold"><CheckCircle2 className="w-4 h-4" />Enregistré</span>
            : <span />}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
            {saving
              ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Aperçu sur les documents imprimés</p>
        <div className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-blue-500">
          <p className="font-bold text-slate-900">{form.nom || "Nom de l'établissement"}</p>
          {form.adresse && <p className="text-xs text-slate-500 mt-0.5">{form.adresse}</p>}
          <p className="text-xs text-slate-400 mt-1">
            {[form.telephone, form.email, form.siteWeb].filter(Boolean).join(' · ') || 'Coordonnées'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Catégorie select avec ajout custom ──────────────────────────────────────

function CategorieSelect({ value, onChange, existingCategories }: {
  value: string
  onChange: (v: string) => void
  existingCategories: string[]
}) {
  const [open, setOpen]     = useState(false)
  const [input, setInput]   = useState(value)

  useEffect(() => { setInput(value) }, [value])

  const allCats = [...new Set([...DEFAULT_CATEGORIES, ...existingCategories])].sort()
  const filtered = allCats.filter(c => !input || c.toLowerCase().includes(input.toLowerCase()))
  const showCreate = input.trim() !== '' && !allCats.some(c => c.toLowerCase() === input.trim().toLowerCase())

  function select(cat: string) { onChange(cat); setInput(cat); setOpen(false) }
  function create() { const v = input.trim(); if (v) { onChange(v); setOpen(false) } }

  return (
    <div className="relative">
      <input
        value={input}
        placeholder="Choisir ou créer..."
        className={smallInputCls}
        onFocus={() => setOpen(true)}
        onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true) }}
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-52 overflow-y-auto">
              {showCreate && (
                <button type="button" onClick={create}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-blue-50 text-left border-b border-slate-100 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-sm text-blue-700 font-medium">Créer "{input.trim()}"</span>
                </button>
              )}
              {filtered.length === 0 && !showCreate
                ? <p className="text-xs text-slate-400 text-center py-4">Aucun résultat</p>
                : filtered.map(c => (
                  <button key={c} type="button" onClick={() => select(c)}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors',
                      value === c && 'bg-blue-50'
                    )}>
                    <span className="text-sm text-slate-900">{c}</span>
                    {value === c && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Catalogue de tarifs ──────────────────────────────────────────────────────

function TarifsTab() {
  const [tarifs, setTarifs]       = useState<TarifMedical[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState<TarifForm>(TARIF_DEFAULT)
  const [saving, setSaving]       = useState(false)
  const [formErr, setFormErr]     = useState('')
  const [editId, setEditId]       = useState<string | null>(null)
  const [editForm, setEditForm]   = useState<TarifForm>(TARIF_DEFAULT)
  const [editSaving, setEditSaving] = useState(false)
  const [editErr, setEditErr]     = useState('')

  async function fetchTarifs() {
    setLoading(true)
    try {
      const r = await api.get('/tarifs?inactif=1')
      setTarifs(r.data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTarifs() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code.trim() || !form.libelle.trim() || !form.prixDefaut) { setFormErr('Code, libellé et prix sont requis'); return }
    const prix = parseFloat(form.prixDefaut)
    if (isNaN(prix) || prix <= 0) { setFormErr('Prix invalide'); return }
    setSaving(true); setFormErr('')
    try {
      await api.post('/tarifs', { code: form.code.trim(), libelle: form.libelle.trim(), categorie: form.categorie.trim() || undefined, prixDefaut: prix })
      setForm(TARIF_DEFAULT); setShowForm(false); fetchTarifs()
    } catch (err: unknown) {
      setFormErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la création')
    } finally { setSaving(false) }
  }

  function startEdit(t: TarifMedical) {
    setEditId(t.id)
    setEditForm({ code: t.code, libelle: t.libelle, categorie: t.categorie || '', prixDefaut: String(t.prixDefaut) })
    setEditErr('')
  }

  async function saveEdit() {
    if (!editForm.code.trim() || !editForm.libelle.trim() || !editForm.prixDefaut) { setEditErr('Champs requis'); return }
    const prix = parseFloat(editForm.prixDefaut)
    if (isNaN(prix) || prix <= 0) { setEditErr('Prix invalide'); return }
    setEditSaving(true); setEditErr('')
    try {
      await api.patch(`/tarifs/${editId}`, { code: editForm.code.trim(), libelle: editForm.libelle.trim(), categorie: editForm.categorie.trim() || undefined, prixDefaut: prix })
      setEditId(null); fetchTarifs()
    } catch (err: unknown) {
      setEditErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur')
    } finally { setEditSaving(false) }
  }

  async function deactivate(id: string, libelle: string) {
    if (!confirm(`Désactiver le tarif "${libelle}" ? Il ne sera plus disponible dans le catalogue.`)) return
    await api.delete(`/tarifs/${id}`)
    fetchTarifs()
  }

  const categories = [...new Set(tarifs.filter(t => t.categorie).map(t => t.categorie!))]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {tarifs.filter(t => t.actif).length} tarif{tarifs.filter(t => t.actif).length !== 1 ? 's' : ''} actif{tarifs.filter(t => t.actif).length !== 1 ? 's' : ''}
          {tarifs.filter(t => !t.actif).length > 0 && <span className="text-slate-400"> · {tarifs.filter(t => !t.actif).length} inactif{tarifs.filter(t => !t.actif).length !== 1 ? 's' : ''}</span>}
        </p>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setFormErr('') }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
            <Plus className="w-3.5 h-3.5" /> Nouveau tarif
          </button>
        )}
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-blue-900">Nouveau tarif</p>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
                <input className={smallInputCls} placeholder="CONS_GEN" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Catégorie</label>
                <CategorieSelect value={form.categorie} onChange={v => setForm(f => ({ ...f, categorie: v }))} existingCategories={categories} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Libellé *</label>
              <input className={smallInputCls} placeholder="Consultation générale" value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prix (HTG) *</label>
              <input type="number" min="0" step="0.01" className={smallInputCls} placeholder="500" value={form.prixDefaut} onChange={e => setForm(f => ({ ...f, prixDefaut: e.target.value }))} />
            </div>
            {formErr && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{formErr}
              </p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {saving ? 'Création...' : 'Créer le tarif'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(TARIF_DEFAULT); setFormErr('') }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
        </div>
      ) : tarifs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Aucun tarif configuré.</p>
          <p className="text-xs text-slate-400 mt-1">Créez votre premier tarif pour l'utiliser dans la facturation.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_140px_110px_80px] gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span>Code</span><span>Libellé</span><span>Catégorie</span><span className="text-right">Prix HTG</span><span />
          </div>
          {tarifs.map(t => (
            <div key={t.id} className={cn('border-b border-slate-50 last:border-0', !t.actif && 'opacity-50')}>
              {editId === t.id ? (
                <div className="p-4 space-y-3 bg-slate-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Code</label>
                      <input className={smallInputCls} value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie</label>
                      <CategorieSelect value={editForm.categorie} onChange={v => setEditForm(f => ({ ...f, categorie: v }))} existingCategories={categories} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Libellé</label>
                      <input className={smallInputCls} value={editForm.libelle} onChange={e => setEditForm(f => ({ ...f, libelle: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Prix (HTG)</label>
                      <input type="number" min="0" step="0.01" className={smallInputCls} value={editForm.prixDefaut} onChange={e => setEditForm(f => ({ ...f, prixDefaut: e.target.value }))} />
                    </div>
                  </div>
                  {editErr && <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{editErr}</p>}
                  <div className="flex items-center gap-2">
                    <button onClick={saveEdit} disabled={editSaving}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                      {editSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      {editSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                    <button onClick={() => setEditId(null)} className="px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[80px_1fr_140px_110px_80px] gap-3 items-center px-5 py-3.5">
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg truncate">{t.code}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{t.libelle}</p>
                    {!t.actif && <span className="text-xs text-slate-400">Inactif</span>}
                  </div>
                  <div>
                    {t.categorie
                      ? <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{t.categorie}</span>
                      : <span className="text-xs text-slate-300">—</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 text-right">{t.prixDefaut.toLocaleString('fr-FR')}</p>
                  <div className="flex items-center justify-end gap-1">
                    {t.actif && (
                      <>
                        <button onClick={() => startEdit(t)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deactivate(t.id, t.libelle)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

type Tab = 'config' | 'tarifs'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('config')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'config', label: 'Configuration', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'tarifs', label: 'Catalogue de tarifs', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-sm text-slate-400 mt-1">Configuration de l'hôpital et catalogue de tarifs médicaux.</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center',
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'config' ? <ConfigTab /> : <TarifsTab />}
    </div>
  )
}
