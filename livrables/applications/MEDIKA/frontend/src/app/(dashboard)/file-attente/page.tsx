'use client'
import { useEffect, useState, useCallback } from 'react'
import { FileAttenteEntry, FileAttenteStats, Patient, StatutAttente, User } from '@/types'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useSSE } from '@/hooks/useSSE'
import { Combobox } from '@/components/ui/Combobox'
import {
  Users, Plus, X, Check, Search, Clock, Phone,
  UserCheck, CheckCircle2, AlertCircle, Stethoscope,
  Ban, RefreshCw, ChevronRight, CalendarCheck, UserX,
  ClipboardList, ArrowRight
} from 'lucide-react'

// ─── Statut config ────────────────────────────────────────────────────────────

const STATUT_CFG: Record<StatutAttente, { label: string; color: string; bg: string; dot: string }> = {
  EN_ATTENTE:      { label: 'En attente',     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',    dot: 'bg-amber-400' },
  EN_CONSULTATION: { label: 'En consultation', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',      dot: 'bg-blue-500 animate-pulse' },
  TERMINE:         { label: 'Terminé',         color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',dot: 'bg-emerald-500' },
  ABSENT:          { label: 'Absent',          color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200',   dot: 'bg-slate-400' },
}

const FILTER_TABS: { label: string; value: StatutAttente | 'TOUS' }[] = [
  { label: 'Tous', value: 'TOUS' },
  { label: 'En attente', value: 'EN_ATTENTE' },
  { label: 'En consultation', value: 'EN_CONSULTATION' },
  { label: 'Terminés', value: 'TERMINE' },
  { label: 'Absents', value: 'ABSENT' },
]

// ─── UI helpers ───────────────────────────────────────────────────────────────

function inputCls(error?: boolean) {
  const base = 'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 transition-all bg-white'
  if (error) return `${base} border-red-300 bg-red-50/40 focus:ring-red-500/20 focus:border-red-400`
  return `${base} border-slate-200 focus:ring-indigo-500/30 focus:border-indigo-400`
}

function waitTime(dateFile: string, appelleA?: string): string {
  const from = new Date(dateFile)
  const to   = appelleA ? new Date(appelleA) : new Date()
  const mins = Math.floor((to.getTime() - from.getTime()) / 60000)
  if (mins < 1) return '< 1 min'
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`
}

// ─── Patient search ───────────────────────────────────────────────────────────

function PatientSearch({ onSelect, hasError }: { onSelect: (p: Patient | null) => void; hasError?: boolean }) {
  const [q, setQ]               = useState('')
  const [results, setResults]   = useState<Patient[]>([])
  const [selected, setSelected] = useState<Patient | null>(null)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return }
    const id = setTimeout(async () => {
      try { const r = await api.get(`/patients/search?q=${encodeURIComponent(q)}`); setResults(r.data.data || []); setOpen(true) } catch {}
    }, 300)
    return () => clearTimeout(id)
  }, [q])

  function pick(p: Patient) { setSelected(p); onSelect(p); setQ(''); setResults([]); setOpen(false) }
  function clear() { setSelected(null); onSelect(null); setQ('') }

  if (selected) return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50">
      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold">
        {selected.prenom[0]}{selected.nom[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{selected.prenom} {selected.nom}</p>
        <p className="text-xs text-slate-500">{selected.numero} · {selected.telephone}</p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
      <button type="button" onClick={clear} className="text-slate-300 hover:text-red-500 ml-1 transition-colors"><X className="w-3.5 h-3.5" /></button>
    </div>
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
      <input
        className={`${inputCls(hasError)} pl-9`}
        value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, prénom ou numéro de dossier..." />
      {open && results.length > 0 && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {results.slice(0, 6).map(p => (
            <button key={p.id} type="button" onClick={() => pick(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-600 text-xs font-bold">
                {p.prenom[0]}{p.nom[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{p.prenom} {p.nom}</p>
                <p className="text-xs text-slate-400">{p.numero} · {p.telephone}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CFG: Record<string, { label: string; badge: string; border: string; numBg: string }> = {
  NORMAL:   { label: 'Normal',   badge: '',                                                                          border: '',                     numBg: 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200' },
  URGENT:   { label: 'Urgent',   badge: 'bg-orange-100 text-orange-700 border border-orange-300',                   border: 'border-orange-200',    numBg: 'bg-orange-500 text-white' },
  CRITIQUE: { label: 'Critique', badge: 'bg-red-100 text-red-700 border border-red-300 animate-pulse',              border: 'border-red-300',       numBg: 'bg-red-600 text-white' },
}

// ─── Add to queue modal ───────────────────────────────────────────────────────

function AddPatientModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [patientId, setPatientId]   = useState('')
  const [patientMissing, setPatientMissing] = useState(false)
  const [motif, setMotif]           = useState('')
  const [medecinId, setMedecinId]   = useState('')
  const [priorite, setPriorite]     = useState('NORMAL')
  const [medecins, setMedecins]     = useState<Pick<User, 'id' | 'prenom' | 'nom'>[]>([])
  const [loading, setLoading]       = useState(false)
  const [done, setDone]             = useState(false)
  const [apiErr, setApiErr]         = useState('')

  useEffect(() => {
    if (!open) return
    api.get('/users?role=MEDECIN').then(r => setMedecins(r.data.data?.users || [])).catch(() => {})
  }, [open])

  function reset() {
    setPatientId(''); setPatientMissing(false); setMotif(''); setMedecinId(''); setPriorite('NORMAL')
    setLoading(false); setDone(false); setApiErr('')
  }

  function close() { reset(); onClose() }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) { setPatientMissing(true); return }
    setLoading(true); setApiErr('')
    try {
      await api.post('/file-attente', {
        patientId,
        motif: motif || undefined,
        medecinId: medecinId || undefined,
        priorite,
      })
      setDone(true)
      setTimeout(() => { reset(); onSuccess() }, 1200)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiErr(msg || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        <div className="bg-linear-to-br from-indigo-600 to-violet-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Enregistrer un patient</h2>
              <p className="text-indigo-200 text-xs">Ajouter à la file d'attente</p>
            </div>
          </div>
          <button onClick={close} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="font-semibold text-slate-900">Patient ajouté à la file</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Patient <span className="text-indigo-500">*</span>
                </label>
                <PatientSearch onSelect={p => { setPatientId(p?.id || ''); setPatientMissing(false) }} hasError={patientMissing && !patientId} />
                {patientMissing && !patientId && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3" />Sélectionnez un patient</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Motif de visite
                </label>
                <input className={inputCls()} placeholder="Ex: Fièvre, douleurs abdominales, contrôle..."
                  value={motif} onChange={e => setMotif(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Priorité
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NORMAL', 'URGENT', 'CRITIQUE'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setPriorite(p)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        priorite === p
                          ? p === 'CRITIQUE' ? 'bg-red-600 text-white border-red-600'
                          : p === 'URGENT'   ? 'bg-orange-500 text-white border-orange-500'
                          :                    'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}>
                      {p === 'CRITIQUE' ? 'Critique' : p === 'URGENT' ? 'Urgent' : 'Normal'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Médecin assigné
                </label>
                <Combobox
                  value={medecinId}
                  onChange={setMedecinId}
                  placeholder="Médecin non assigné (file générale)"
                  emptyLabel="Aucun médecin trouvé"
                  options={medecins.map(m => ({
                    value: m.id,
                    label: `Dr. ${m.prenom} ${m.nom}`,
                  }))}
                />
              </div>

              {apiErr && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{apiErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button type="button" onClick={close}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl transition-all hover:border-slate-300">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-60 transition-all">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Ajouter <ChevronRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Queue card ───────────────────────────────────────────────────────────────

function QueueCard({ entry, onRefresh, canAct, canRemove }: {
  entry: FileAttenteEntry
  onRefresh: () => void
  canAct: boolean
  canRemove: boolean
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const cfg = STATUT_CFG[entry.statut]
  const prio = PRIORITY_CFG[entry.priorite ?? 'NORMAL'] ?? PRIORITY_CFG.NORMAL
  const isUrgent = entry.priorite === 'URGENT' || entry.priorite === 'CRITIQUE'

  async function act(action: string) {
    setLoading(action)
    try {
      await api.patch(`/file-attente/${entry.id}/${action}`)
      onRefresh()
    } catch {} finally { setLoading(null) }
  }

  async function remove() {
    if (!confirm('Retirer ce patient de la file ?')) return
    setLoading('remove')
    try { await api.delete(`/file-attente/${entry.id}`); onRefresh() }
    catch {} finally { setLoading(null) }
  }

  const isWaiting = entry.statut === 'EN_ATTENTE'
  const isInProgress = entry.statut === 'EN_CONSULTATION'
  const isDone = entry.statut === 'TERMINE' || entry.statut === 'ABSENT'

  return (
    <div className={`relative flex gap-4 bg-white rounded-2xl border p-4 transition-all hover:shadow-md ${
      isInProgress ? 'border-blue-200 shadow-sm shadow-blue-100' :
      isWaiting && isUrgent ? `${prio.border} shadow-sm` :
      isWaiting ? 'border-slate-200' :
      'border-slate-100 opacity-75'
    }`}>

      {/* Numéro */}
      <div className="shrink-0 flex flex-col items-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
          isInProgress ? 'bg-blue-600 text-white' :
          isWaiting && isUrgent ? prio.numBg :
          isWaiting    ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200' :
          'bg-slate-100 text-slate-400'
        }`}>
          #{entry.numero}
        </div>
        {(isWaiting || isInProgress) && (
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-medium">{waitTime(entry.dateFile, isInProgress ? entry.appelleA : undefined)}</span>
          </div>
        )}
      </div>

      {/* Infos patient */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-semibold text-slate-900">{entry.patient.prenom} {entry.patient.nom}</p>
            <p className="text-xs text-slate-400">{entry.patient.numero} · <Phone className="w-2.5 h-2.5 inline" /> {entry.patient.telephone}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {isUrgent && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prio.badge}`}>
                {prio.label}
              </span>
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 mb-3">
          {entry.motif && (
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <ClipboardList className="w-3 h-3 text-slate-400" />
              {entry.motif}
            </span>
          )}
          {entry.appointment && (
            <span className="flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-600 px-2.5 py-1 rounded-lg">
              <CalendarCheck className="w-3 h-3" />
              RDV
            </span>
          )}
          {entry.medecin && (
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-slate-400" />
              Dr. {entry.medecin.prenom} {entry.medecin.nom}
            </span>
          )}
        </div>

        {/* Actions */}
        {!isDone && (
          <div className="flex items-center gap-2 flex-wrap">
            {canAct && isWaiting && (
              <button onClick={() => act('appeler')} disabled={!!loading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-blue-500/30">
                {loading === 'appeler'
                  ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <ArrowRight className="w-3 h-3" />}
                Appeler en consultation
              </button>
            )}
            {canAct && isInProgress && (
              <button onClick={() => act('terminer')} disabled={!!loading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/30">
                {loading === 'terminer'
                  ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check className="w-3 h-3" />}
                Consultation terminée
              </button>
            )}
            {canAct && (isWaiting || isInProgress) && (
              <button onClick={() => act('absent')} disabled={!!loading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl transition-colors disabled:opacity-50">
                <UserX className="w-3 h-3" />
                Absent
              </button>
            )}
            {canRemove && isWaiting && (
              <button onClick={remove} disabled={!!loading}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50 ml-auto">
                <Ban className="w-3 h-3" />
                Retirer
              </button>
            )}
          </div>
        )}

        {isDone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {entry.statut === 'TERMINE' && entry.termineA && (
              <><CheckCircle2 className="w-3 h-3 text-emerald-500" />Terminé à {new Date(entry.termineA).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</>
            )}
            {entry.statut === 'ABSENT' && (
              <><UserX className="w-3 h-3" />Marqué absent</>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: FileAttenteStats | null }) {
  if (!stats) return null
  const items = [
    { label: 'En attente', value: stats.enAttente, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'En consultation', value: stats.enConsultation, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Terminés', value: stats.termine, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Total aujourd\'hui', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {items.map(it => (
        <div key={it.label} className={`border rounded-2xl px-4 py-3 ${it.bg}`}>
          <p className={`text-2xl font-black ${it.color}`}>{it.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{it.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FileAttentePage() {
  const { user }                        = useAuthStore()
  const [entries, setEntries]           = useState<FileAttenteEntry[]>([])
  const [stats, setStats]               = useState<FileAttenteStats | null>(null)
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [open, setOpen]                 = useState(false)
  const [filter, setFilter]             = useState<StatutAttente | 'TOUS'>('TOUS')
  const [search, setSearch]             = useState('')

  const canAct    = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')
  const canAdd    = ['ADMIN', 'ACCUEIL', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')
  const canRemove = ['ADMIN', 'ACCUEIL'].includes(user?.role || '')

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [entryRes, statsRes] = await Promise.all([
        api.get('/file-attente'),
        api.get('/file-attente/stats'),
      ])
      setEntries(entryRes.data.data || [])
      setStats(statsRes.data.data)
    } finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useSSE(['fileattente'], () => fetchAll(true))

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const filtered = entries.filter(e => {
    const matchFilter = filter === 'TOUS' || e.statut === filter
    const matchSearch = !search || `${e.patient.prenom} ${e.patient.nom} ${e.patient.numero} ${e.motif || ''}`.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const waitingCount = entries.filter(e => e.statut === 'EN_ATTENTE').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-xs text-slate-400 capitalize">{dateStr}</p>
          {waitingCount > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-0.5">
              {waitingCount} patient{waitingCount > 1 ? 's' : ''} en attente
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchAll(true)} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          {canAdd && (
            <button onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all">
              <Plus className="w-4 h-4" /> Enregistrer un patient
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Filtres + recherche */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
          <input
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all w-52"
            placeholder="Rechercher..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TABS.map(tab => {
            const count = tab.value === 'TOUS' ? entries.length : entries.filter(e => e.statut === tab.value).length
            return (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  filter === tab.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                }`}>
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">
            {search ? 'Aucun résultat' : filter !== 'TOUS' ? `Aucun patient ${STATUT_CFG[filter as StatutAttente]?.label?.toLowerCase()}` : 'Aucun patient en file aujourd\'hui'}
          </p>
          {canAdd && !search && filter === 'TOUS' && (
            <button onClick={() => setOpen(true)} className="mt-4 text-sm text-indigo-600 hover:underline">
              Enregistrer le premier patient
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <QueueCard
              key={entry.id}
              entry={entry}
              onRefresh={() => fetchAll(true)}
              canAct={canAct}
              canRemove={canRemove}
            />
          ))}
        </div>
      )}

      <AddPatientModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => { setOpen(false); fetchAll(true) }}
      />
    </div>
  )
}
