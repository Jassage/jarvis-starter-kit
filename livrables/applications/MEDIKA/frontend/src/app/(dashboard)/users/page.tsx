'use client'
import { useEffect, useState } from 'react'
import { Role, Service, User } from '@/types'
import api from '@/lib/api'
import {
  UserCog, Plus, X, ChevronRight, Check, Eye, EyeOff,
  AlertCircle, Info, CheckCircle2, AlertTriangle,
  Mail, Shield, Stethoscope, UserCheck, UserX, ToggleLeft, ToggleRight, Pencil
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FullUser extends User { actif: boolean; email: string }

type Touched = Record<string, boolean>
type Errors  = Record<string, string>
type UserForm = { prenom: string; nom: string; email: string; password: string; role: string; serviceId: string }

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLES: Role[] = ['ADMIN', 'MEDECIN', 'INFIRMIER', 'CAISSIER', 'ACCUEIL']

function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0
  if (pwd.length >= 8)                    score++
  if (pwd.length >= 12)                   score++
  if (/[A-Z]/.test(pwd))                  score++
  if (/[0-9]/.test(pwd))                  score++
  if (/[^A-Za-z0-9]/.test(pwd))           score++
  const map = [
    { label: '', color: '' },
    { label: 'Très faible', color: 'bg-red-500' },
    { label: 'Faible',      color: 'bg-orange-500' },
    { label: 'Moyen',       color: 'bg-amber-500' },
    { label: 'Fort',        color: 'bg-emerald-500' },
    { label: 'Très fort',   color: 'bg-emerald-600' },
  ]
  return { score, ...map[Math.min(score, 5)] }
}

function validateUser(form: UserForm, touched: Touched): Errors {
  const e: Errors = {}
  if (touched.prenom && !form.prenom.trim())           e.prenom = 'Prénom requis'
  if (touched.nom    && !form.nom.trim())              e.nom    = 'Nom requis'
  if (touched.email) {
    if (!form.email.trim())                            e.email  = 'Email requis'
    else if (!EMAIL_RE.test(form.email))               e.email  = 'Email invalide'
  }
  if (touched.password) {
    if (!form.password)                                e.password = 'Mot de passe requis'
    else if (form.password.length < 8)                 e.password = 'Minimum 8 caractères'
  }
  if (touched.role && !form.role)                      e.role   = 'Sélectionnez un rôle'
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
  return `${base} border-slate-200 focus:ring-rose-500/30 focus:border-rose-400`
}

function SectionHeader({ icon, bg, label }: { icon: React.ReactNode; bg: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-5 h-5 ${bg} rounded flex items-center justify-center shrink-0`}>{icon}</div>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

// ─── Role config ──────────────────────────────────────────────────────────────

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  ADMIN:     { label: 'Administrateur', color: 'text-rose-700',    bg: 'bg-rose-100 border-rose-200',    icon: Shield },
  MEDECIN:   { label: 'Médecin',        color: 'text-blue-700',    bg: 'bg-blue-100 border-blue-200',    icon: Stethoscope },
  INFIRMIER: { label: 'Infirmier(ère)', color: 'text-teal-700',    bg: 'bg-teal-100 border-teal-200',    icon: UserCheck },
  CAISSIER:  { label: 'Caissier(ère)',  color: 'text-amber-700',   bg: 'bg-amber-100 border-amber-200',  icon: UserCheck },
  ACCUEIL:   { label: 'Accueil',        color: 'text-violet-700',  bg: 'bg-violet-100 border-violet-200',icon: UserCheck },
}

// ─── User modal ───────────────────────────────────────────────────────────────

const EMPTY: UserForm = { prenom: '', nom: '', email: '', password: '', role: '', serviceId: '' }

function UserModal({ open, onClose, onSuccess, services, editing }: {
  open: boolean; onClose: () => void; onSuccess: () => void; services: Service[]; editing?: FullUser | null
}) {
  const [form, setForm]       = useState(EMPTY)
  const [touched, setTouched] = useState<Touched>({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [apiErr, setApiErr]   = useState('')

  const errors  = validateUser(form, touched)
  const strength = passwordStrength(form.password)
  const needsService = ['MEDECIN', 'INFIRMIER'].includes(form.role)

  useEffect(() => {
    if (editing) {
      setForm({ prenom: editing.prenom, nom: editing.nom, email: editing.email, password: '', role: editing.role, serviceId: editing.serviceId || '' })
    } else {
      setForm(EMPTY)
    }
    setTouched({}); setApiErr(''); setDone(false)
  }, [editing, open])

  function touch(f: string) { setTouched(t => ({ ...t, [f]: true })) }
  function set(f: string, v: string) { setForm(x => ({ ...x, [f]: v })); touch(f) }
  function isValid(f: string) { return !!touched[f] && !errors[f] && !!(form as Record<string, string>)[f] }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const fieldsToValidate: Touched = editing
      ? { prenom: true, nom: true, email: true, role: true }
      : { prenom: true, nom: true, email: true, password: true, role: true }
    setTouched(fieldsToValidate)
    if (Object.keys(validateUser(form, fieldsToValidate)).length) return
    setLoading(true); setApiErr('')
    try {
      const payload: Record<string, unknown> = {
        prenom: form.prenom.trim(), nom: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role, serviceId: form.serviceId || undefined,
      }
      if (editing) {
        await api.put(`/users/${editing.id}`, payload)
      } else {
        await api.post('/users', { ...payload, password: form.password })
      }
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1400)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiErr(msg || 'Erreur lors de l\'enregistrement')
    } finally { setLoading(false) }
  }

  function close() { setForm(EMPTY); setTouched({}); setApiErr(''); setDone(false); setShowPwd(false); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        <div className="bg-linear-to-br from-rose-600 to-pink-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{editing ? 'Modifier le compte' : 'Nouvel utilisateur'}</h2>
              <p className="text-rose-200 text-xs">{editing ? `${editing.prenom} ${editing.nom}` : 'Créer un compte pour un membre du personnel'}</p>
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
              <p className="font-semibold text-slate-900">Compte créé avec succès</p>
              <p className="text-sm text-slate-500 mt-1">L'utilisateur peut maintenant se connecter</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-5">

              {/* Identité */}
              <div>
                <SectionHeader icon={<UserCheck className="w-3 h-3 text-rose-600" />} bg="bg-rose-100" label="Identité" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Prénom <span className="text-rose-500">*</span></label>
                    <input className={inputCls(touched.prenom ? errors.prenom : undefined, isValid('prenom'))}
                      placeholder="Marie" value={form.prenom}
                      onChange={e => set('prenom', e.target.value)} onBlur={() => touch('prenom')} />
                    <FieldError msg={touched.prenom ? errors.prenom : undefined} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Nom <span className="text-rose-500">*</span></label>
                    <input className={inputCls(touched.nom ? errors.nom : undefined, isValid('nom'))}
                      placeholder="Joseph" value={form.nom}
                      onChange={e => set('nom', e.target.value)} onBlur={() => touch('nom')} />
                    <FieldError msg={touched.nom ? errors.nom : undefined} />
                  </div>
                </div>
              </div>

              {/* Accès */}
              <div>
                <SectionHeader icon={<Mail className="w-3 h-3 text-blue-600" />} bg="bg-blue-100" label="Accès au système" />
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Email <span className="text-rose-500">*</span></label>
                    <input type="email" className={inputCls(touched.email ? errors.email : undefined, isValid('email'))}
                      placeholder="marie.joseph@medika.ht" value={form.email}
                      onChange={e => set('email', e.target.value)} onBlur={() => touch('email')} />
                    <FieldError msg={touched.email ? errors.email : undefined} />
                  </div>

                  {!editing && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Mot de passe <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input type={showPwd ? 'text' : 'password'}
                          className={`${inputCls(touched.password ? errors.password : undefined, touched.password && !errors.password && !!form.password)} pr-10`}
                          placeholder="Min. 8 caractères" value={form.password}
                          onChange={e => set('password', e.target.value)} onBlur={() => touch('password')} />
                        <button type="button" onClick={() => setShowPwd(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FieldError msg={touched.password ? errors.password : undefined} />
                      {form.password && !errors.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.score ? strength.color : 'bg-slate-200'}`} />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${strength.score <= 2 ? 'text-red-500' : strength.score <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {strength.label}
                          </p>
                        </div>
                      )}
                      {!touched.password && <Hint msg="Recommandé : majuscules, chiffres, caractères spéciaux" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Rôle & Service */}
              <div>
                <SectionHeader icon={<Shield className="w-3 h-3 text-violet-600" />} bg="bg-violet-100" label="Rôle & affectation" />
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Rôle <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map(r => {
                        const cfg = roleConfig[r]
                        const RoleIcon = cfg.icon
                        const selected = form.role === r
                        return (
                          <button key={r} type="button"
                            onClick={() => { set('role', r); if (!['MEDECIN', 'INFIRMIER'].includes(r)) set('serviceId', '') }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${selected ? `${cfg.bg} ${cfg.color} shadow-sm` : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                            <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs">{cfg.label}</span>
                            {selected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                    <FieldError msg={touched.role ? errors.role : undefined} />
                  </div>

                  {needsService && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Service d'affectation</label>
                      <Select value={form.serviceId} onValueChange={v => set('serviceId', String(v))}>
                        <SelectTrigger className={`h-10 rounded-xl text-sm border ${form.serviceId ? 'border-emerald-300' : 'border-slate-200'}`}>
                          <SelectValue placeholder="Choisir un service (optionnel)">
                            {form.serviceId ? services.find(s => s.id === form.serviceId)?.nom ?? null : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {services.filter(s => s.actif).map(s => <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>)}
                          {services.filter(s => s.actif).length === 0 && (
                            <SelectItem value="_" disabled>Aucun service actif</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Hint msg="Laissez vide si le médecin intervient dans plusieurs services" />
                    </div>
                  )}
                </div>
              </div>

              {apiErr && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{apiErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-400"><span className="text-rose-500">*</span> Champs obligatoires</p>
              <div className="flex gap-2">
                <button type="button" onClick={close}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-rose-500/20 disabled:opacity-60 transition-all">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{editing ? 'Sauvegarder' : 'Créer le compte'} <ChevronRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard({ user, onToggle, onEdit }: { user: FullUser; onToggle: () => void; onEdit: () => void }) {
  const [toggling, setToggling] = useState(false)
  const cfg = roleConfig[user.role] || roleConfig.ACCUEIL
  const RoleIcon = cfg.icon
  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()

  const avatarColors: Record<string, string> = {
    ADMIN: 'from-rose-400 to-pink-600', MEDECIN: 'from-blue-400 to-indigo-600',
    INFIRMIER: 'from-teal-400 to-emerald-600', CAISSIER: 'from-amber-400 to-orange-500',
    ACCUEIL: 'from-violet-400 to-purple-600',
  }

  async function toggle() {
    setToggling(true)
    try { await api.patch(`/users/${user.id}/actif`, {}); onToggle() }
    finally { setToggling(false) }
  }

  return (
    <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${user.actif ? 'border-slate-200 hover:border-slate-300 hover:shadow-md' : 'border-slate-100 opacity-60'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-11 h-11 bg-linear-to-br ${avatarColors[user.role] || 'from-slate-400 to-slate-600'} rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{user.prenom} {user.nom}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          {!user.actif && (
            <span className="text-xs bg-slate-100 text-slate-400 font-medium px-2 py-0.5 rounded-full shrink-0">Inactif</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
            <RoleIcon className="w-3 h-3" />{cfg.label}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={onEdit}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-300 hover:text-rose-600 flex items-center justify-center transition-colors">
              <Pencil className="w-3 h-3" />
            </button>

          <button onClick={toggle} disabled={toggling}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50
              ${user.actif ? 'text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200'
                           : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'}`}>
            {toggling
              ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              : user.actif
                ? <><ToggleRight className="w-3.5 h-3.5" />Désactiver</>
                : <><ToggleLeft className="w-3.5 h-3.5" />Activer</>
            }
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]       = useState<FullUser[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<FullUser | null>(null)
  const [roleFilter, setRoleFilter] = useState<Role | 'TOUS'>('TOUS')

  async function fetchData() {
    setLoading(true)
    try {
      const [u, s] = await Promise.all([api.get('/users'), api.get('/services')])
      setUsers(u.data.data || [])
      setServices(s.data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = users.filter(u => roleFilter === 'TOUS' || u.role === roleFilter)

  const counts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<string, number>)
  const activeCount = users.filter(u => u.actif).length

  const filterTabs: { value: Role | 'TOUS'; label: string }[] = [
    { value: 'TOUS', label: `Tous (${users.length})` },
    ...ROLES.map(r => ({ value: r, label: `${roleConfig[r].label} (${counts[r] || 0})` })),
  ]

  return (
    <div>
      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total personnel', value: users.length, color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Comptes actifs',  value: activeCount,  color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Médecins',        value: counts.MEDECIN || 0, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Infirmiers',      value: counts.INFIRMIER || 0, color: 'text-teal-700', bg: 'bg-teal-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-slate-200`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres + bouton */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterTabs.map(t => (
            <button key={t.value} onClick={() => setRoleFilter(t.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${roleFilter === t.value ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-rose-500/20 transition-all">
          <Plus className="w-4 h-4" /> Nouvel utilisateur
        </button>
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">Aucun utilisateur dans cette catégorie</p>
          <button onClick={() => setOpen(true)} className="mt-4 text-sm text-rose-600 hover:underline">Créer un utilisateur</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(u => <UserCard key={u.id} user={u} onToggle={fetchData} onEdit={() => { setEditing(u); setOpen(true) }} />)}
        </div>
      )}

      <UserModal open={open} editing={editing} services={services}
        onClose={() => { setOpen(false); setEditing(null) }}
        onSuccess={() => { setOpen(false); setEditing(null); fetchData() }} />
    </div>
  )
}
