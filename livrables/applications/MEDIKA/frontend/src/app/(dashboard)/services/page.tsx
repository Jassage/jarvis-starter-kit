'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  Building2, Plus, X, ChevronRight, Check, Pencil,
  AlertTriangle, AlertCircle, Info, ToggleLeft, ToggleRight, Users
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service { id: string; nom: string; description?: string; actif: boolean }

type Touched = Record<string, boolean>
type Errors  = Record<string, string>
type ServiceForm = { nom: string; description: string }

// ─── Validation ───────────────────────────────────────────────────────────────

function validateService(form: ServiceForm, touched: Touched): Errors {
  const e: Errors = {}
  if (touched.nom) {
    if (!form.nom.trim())              e.nom = 'Le nom du service est obligatoire'
    else if (form.nom.trim().length < 3) e.nom = 'Minimum 3 caractères'
  }
  if (touched.description && form.description.length > 300)
    e.description = 'Description trop longue (max 300 caractères)'
  return e
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3 shrink-0" />{msg}</p>
}

function Hint({ msg }: { msg: string }) {
  return <p className="flex items-center gap-1 text-xs text-slate-400 mt-1"><Info className="w-3 h-3 shrink-0" />{msg}</p>
}

function inputCls(error?: string, valid?: boolean) {
  const base = 'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 transition-all bg-white'
  if (error) return `${base} border-red-300 bg-red-50/40 focus:ring-red-500/20 focus:border-red-400`
  if (valid) return `${base} border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-400`
  return `${base} border-slate-200 focus:ring-cyan-500/30 focus:border-cyan-400`
}

// ─── Predefined service suggestions ──────────────────────────────────────────

const SUGGESTIONS = [
  'Médecine générale', 'Urgences', 'Pédiatrie', 'Gynécologie-Obstétrique',
  'Chirurgie', 'Cardiologie', 'Radiologie', 'Laboratoire',
  'Pharmacie', 'Kinésithérapie', 'Ophtalmologie', 'Dermatologie',
  'Neurologie', 'Orthopédie', 'Pneumologie', 'Gastroentérologie',
]

// ─── Service modal ────────────────────────────────────────────────────────────

const EMPTY: ServiceForm = { nom: '', description: '' }

function ServiceModal({ open, onClose, onSuccess, editing }: {
  open: boolean; onClose: () => void; onSuccess: () => void; editing: Service | null
}) {
  const [form, setForm]       = useState(EMPTY)
  const [touched, setTouched] = useState<Touched>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [apiErr, setApiErr]   = useState('')

  useEffect(() => {
    if (editing) setForm({ nom: editing.nom, description: editing.description || '' })
    else setForm(EMPTY)
    setTouched({}); setApiErr('')
  }, [editing, open])

  const errors = validateService(form, touched)
  function touch(f: string) { setTouched(t => ({ ...t, [f]: true })) }
  function set(f: string, v: string) { setForm(x => ({ ...x, [f]: v })); touch(f) }
  function isValid(f: string) { return !!touched[f] && !errors[f] && !!(form as Record<string, string>)[f] }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const all: Touched = { nom: true, description: true }
    setTouched(all)
    if (Object.keys(validateService(form, all)).length) return
    setLoading(true); setApiErr('')
    try {
      if (editing) {
        await api.put(`/services/${editing.id}`, { nom: form.nom.trim(), description: form.description.trim() || undefined })
      } else {
        await api.post('/services', { nom: form.nom.trim(), description: form.description.trim() || undefined })
      }
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1200)
    } catch (err: unknown) {
      setApiErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  function close() { setForm(EMPTY); setTouched({}); setApiErr(''); setDone(false); onClose() }

  if (!open) return null

  const isEdit = !!editing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        <div className={`px-6 py-5 flex items-center justify-between shrink-0 ${isEdit ? 'bg-linear-to-br from-cyan-600 to-teal-700' : 'bg-linear-to-br from-blue-600 to-cyan-700'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{isEdit ? 'Modifier le service' : 'Nouveau service'}</h2>
              <p className="text-blue-100 text-xs">{isEdit ? editing!.nom : 'Ajouter un service ou département'}</p>
            </div>
          </div>
          <button onClick={close} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Service {isEdit ? 'mis à jour' : 'créé'}</p>
              <p className="text-sm text-slate-500 mt-1">Il est maintenant disponible dans les rendez-vous</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Nom du service <span className="text-blue-500">*</span>
                </label>
                <input className={inputCls(touched.nom ? errors.nom : undefined, isValid('nom'))}
                  placeholder="Ex : Cardiologie, Urgences, Pédiatrie..."
                  value={form.nom}
                  onChange={e => set('nom', e.target.value)}
                  onBlur={() => touch('nom')} />
                <FieldError msg={touched.nom ? errors.nom : undefined} />
                {!touched.nom && <Hint msg="Utilisez le nom officiel du département ou service" />}
              </div>

              {!isEdit && !form.nom && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Suggestions rapides</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map(s => (
                      <button key={s} type="button"
                        onClick={() => set('nom', s)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                <div className="relative">
                  <textarea rows={3} maxLength={300}
                    className={`${inputCls(touched.description ? errors.description : undefined)} resize-none`}
                    placeholder="Décrivez les activités et spécialités de ce service..."
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    onBlur={() => touch('description')} />
                  <span className={`absolute bottom-2 right-3 text-[10px] ${form.description.length > 260 ? 'text-amber-500' : 'text-slate-300'}`}>
                    {form.description.length}/300
                  </span>
                </div>
                <FieldError msg={touched.description ? errors.description : undefined} />
              </div>

              {apiErr && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{apiErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-400"><span className="text-blue-500">*</span> Champs obligatoires</p>
              <div className="flex gap-2">
                <button type="button" onClick={close}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className={`flex items-center gap-2 px-5 py-2 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-60 transition-all
                    ${isEdit ? 'bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/20'
                             : 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/20'}`}>
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isEdit ? 'Enregistrer' : 'Créer'} <ChevronRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Service card ─────────────────────────────────────────────────────────────

const serviceColors = [
  'from-blue-400 to-cyan-500', 'from-violet-400 to-purple-500', 'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500', 'from-rose-400 to-pink-500', 'from-indigo-400 to-blue-500',
  'from-teal-400 to-cyan-500', 'from-pink-400 to-rose-500',
]

function ServiceCard({ service, index, onEdit, onToggle }: {
  service: Service; index: number; onEdit: () => void; onToggle: () => void
}) {
  const [toggling, setToggling] = useState(false)
  const color = serviceColors[index % serviceColors.length]

  async function toggle() {
    setToggling(true)
    try { await api.patch(`/services/${service.id}/actif`, {}); onToggle() }
    finally { setToggling(false) }
  }

  return (
    <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${service.actif ? 'border-slate-200 hover:border-slate-300 hover:shadow-md' : 'border-slate-100 opacity-60'}`}>
      <div className={`h-1.5 bg-linear-to-r ${color}`} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 bg-linear-to-br ${color} rounded-xl flex items-center justify-center shrink-0`}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-sm truncate">{service.nom}</p>
              {!service.actif && <span className="text-[10px] bg-slate-100 text-slate-400 font-medium px-1.5 py-0.5 rounded-full shrink-0">Inactif</span>}
            </div>
            {service.description
              ? <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{service.description}</p>
              : <p className="text-xs text-slate-300 mt-0.5 italic">Pas de description</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all">
            <Pencil className="w-3 h-3" />Modifier
          </button>
          <button onClick={toggle} disabled={toggling}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ml-auto
              ${service.actif ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200 hover:border-red-200'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}`}>
            {toggling
              ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              : service.actif
                ? <><ToggleRight className="w-3.5 h-3.5" />Désactiver</>
                : <><ToggleLeft className="w-3.5 h-3.5" />Activer</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Service | null>(null)
  const [showInactif, setShowInactif] = useState(false)

  async function fetchServices() {
    setLoading(true)
    try { const r = await api.get('/services'); setServices(r.data.data || []) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchServices() }, [])

  const visible   = services.filter(s => showInactif || s.actif)
  const actifCount = services.filter(s => s.actif).length

  function openCreate() { setEditing(null); setOpen(true) }
  function openEdit(s: Service) { setEditing(s); setOpen(true) }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-2xl font-bold text-blue-900">{services.length}</p>
          <p className="text-xs text-blue-500 mt-0.5">Services total</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-900">{actifCount}</p>
          <p className="text-xs text-emerald-500 mt-0.5">Services actifs</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-700">{services.length - actifCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Désactivés</p>
        </div>
      </div>

      {/* Barre d'action */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{visible.length} service{visible.length > 1 ? 's' : ''}</span>
          {services.some(s => !s.actif) && (
            <button onClick={() => setShowInactif(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${showInactif ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
              <Users className="w-3 h-3" />
              {showInactif ? 'Masquer inactifs' : 'Voir tous'}
            </button>
          )}
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" /> Nouveau service
        </button>
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">Aucun service configuré</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Les services sont nécessaires pour assigner des rendez-vous</p>
          <button onClick={openCreate}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all">
            Créer le premier service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i}
              onEdit={() => openEdit(s)}
              onToggle={fetchServices} />
          ))}
        </div>
      )}

      <ServiceModal open={open} onClose={() => setOpen(false)} onSuccess={() => { setOpen(false); fetchServices() }} editing={editing} />
    </div>
  )
}
