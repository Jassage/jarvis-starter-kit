'use client'
import { useEffect, useState, useCallback } from 'react'
import { Appointment, AppointmentStatut, Patient, Service, User } from '@/types'
import api from '@/lib/api'
import {
  Calendar, Plus, X, ChevronRight, Check, Search,
  Clock, Stethoscope, AlertTriangle,
  CheckCircle2, XCircle, PlayCircle, ClockIcon, AlertCircle, Info, Edit2, Ban
} from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ─── Validation ───────────────────────────────────────────────────────────────

type Errors  = Record<string, string>
type Touched = Record<string, boolean>

type ApptForm = { patientId: string; medecinId: string; serviceId: string; dateHeure: string; motif: string }

function validateAppt(form: ApptForm, touched: Touched): Errors {
  const e: Errors = {}
  if (touched.patientId && !form.patientId)
    e.patientId = 'Sélectionnez un patient'
  if (touched.medecinId && !form.medecinId)
    e.medecinId = 'Sélectionnez un médecin'
  if (touched.serviceId && !form.serviceId)
    e.serviceId = 'Sélectionnez un service'
  if (touched.dateHeure) {
    if (!form.dateHeure) {
      e.dateHeure = 'Sélectionnez une date et heure'
    } else {
      const dt = new Date(form.dateHeure)
      const h = dt.getHours()
      if (dt <= new Date())        e.dateHeure = 'La date doit être dans le futur'
      else if (h < 7 || h >= 19)  e.dateHeure = 'Horaires de consultation : 07h00 – 19h00'
    }
  }
  if (touched.motif && form.motif.length > 500)
    e.motif = 'Motif trop long (max 500 caractères)'
  return e
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

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
  return `${base} border-slate-200 focus:ring-violet-500/30 focus:border-violet-400`
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

// ─── Patient search ───────────────────────────────────────────────────────────

function PatientSearch({ onSelect, error, touched: t }: { onSelect: (p: Patient | null) => void; error?: string; touched?: boolean }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [selected, setSelected] = useState<Patient | null>(null)
  const [open, setOpen] = useState(false)

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
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold">
        {selected.prenom[0]}{selected.nom[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{selected.prenom} {selected.nom}</p>
        <p className="text-xs text-slate-500">{selected.numero} · {selected.telephone}</p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      <button type="button" onClick={clear} className="text-slate-300 hover:text-red-500 ml-1 transition-colors"><X className="w-3.5 h-3.5" /></button>
    </div>
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
      <input className={`${inputCls(t ? error : undefined)} pl-9`}
        value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, prénom ou numéro de dossier..." />
      {open && results.length > 0 && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {results.slice(0, 6).map(p => (
            <button key={p.id} type="button" onClick={() => pick(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition-colors text-left border-b border-slate-50 last:border-0">
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
      {open && q.length >= 2 && results.length === 0 && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center">
          <p className="text-sm text-slate-400">Aucun patient trouvé pour "{q}"</p>
        </div>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const EMPTY: ApptForm = { patientId: '', medecinId: '', serviceId: '', dateHeure: '', motif: '' }

function AppointmentModal({ open, onClose, onSuccess, editing }: {
  open: boolean; onClose: () => void; onSuccess: () => void; editing?: Appointment | null
}) {
  const [form, setForm]         = useState(EMPTY)
  const [touched, setTouched]   = useState<Touched>({})
  const [medecins, setMedecins] = useState<User[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [apiErr, setApiErr]     = useState('')

  const errors = validateAppt(form, touched)
  const hasErrors = validateAppt(form, { patientId: true, medecinId: true, serviceId: true, dateHeure: true, motif: true })
  const isInvalid = Object.keys(hasErrors).length > 0
  const progress = [form.patientId, form.medecinId, form.serviceId, form.dateHeure].filter(Boolean).length * 25
  const isSunday = form.dateHeure ? new Date(form.dateHeure).getDay() === 0 : false

  useEffect(() => {
    if (!open) return
    Promise.all([api.get('/users'), api.get('/services')]).then(([u, s]) => {
      setMedecins((u.data.data || []).filter((x: User) => x.role === 'MEDECIN'))
      setServices(s.data.data || [])
    }).catch(() => {})
  }, [open])

  useEffect(() => {
    if (editing) {
      const localDt = new Date(editing.dateHeure)
      const pad = (n: number) => String(n).padStart(2, '0')
      const localStr = `${localDt.getFullYear()}-${pad(localDt.getMonth()+1)}-${pad(localDt.getDate())}T${pad(localDt.getHours())}:${pad(localDt.getMinutes())}`
      setForm({
        patientId: editing.patient.id,
        medecinId: editing.medecin.id,
        serviceId: (editing as unknown as { service: { id: string } }).service.id,
        dateHeure: localStr,
        motif: editing.motif || ''
      })
    } else {
      setForm(EMPTY)
    }
    setTouched({})
  }, [editing])

  function touch(field: string) { setTouched(t => ({ ...t, [field]: true })) }
  function set(field: string, val: string) { setForm(f => ({ ...f, [field]: val })); touch(field) }
  function onPatient(p: Patient | null) { setForm(f => ({ ...f, patientId: p?.id || '' })); touch('patientId') }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched: Touched = { patientId: true, medecinId: true, serviceId: true, dateHeure: true, motif: true }
    setTouched(allTouched)
    if (Object.keys(validateAppt(form, allTouched)).length) return
    setLoading(true); setApiErr('')
    try {
      const payload = { ...form, dateHeure: new Date(form.dateHeure).toISOString() }
      if (editing) await api.put(`/appointments/${editing.id}`, payload)
      else await api.post('/appointments', payload)
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1400)
    } catch (err: unknown) {
      setApiErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  function close() { setForm(EMPTY); setTouched({}); setApiErr(''); setDone(false); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-linear-to-br from-violet-600 to-purple-700 px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">{editing ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h2>
                <p className="text-violet-200 text-xs">{editing ? `RDV de ${editing.patient.prenom} ${editing.patient.nom}` : 'Planifier une consultation médicale'}</p>
              </div>
            </div>
            <button onClick={close} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          {!done && (
            <div>
              <div className="flex justify-between text-xs text-violet-200 mb-1.5">
                <span>Progression</span><span>{progress}%</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Rendez-vous planifié !</p>
              <p className="text-sm text-slate-500 mt-1">Le dossier a été mis à jour</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-5">

              {/* Patient */}
              <div>
                <SectionHeader icon={<Search className="w-3 h-3 text-violet-600" />} bg="bg-violet-100" label="Patient" />
                {editing ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                      {editing.patient.prenom[0]}{editing.patient.nom[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{editing.patient.prenom} {editing.patient.nom}</p>
                      <p className="text-xs text-slate-400">{editing.patient.numero}</p>
                    </div>
                    <span className="text-xs text-slate-300 italic">Non modifiable</span>
                  </div>
                ) : (
                  <>
                    <PatientSearch onSelect={onPatient} error={errors.patientId} touched={!!touched.patientId} />
                    {touched.patientId && <FieldError msg={errors.patientId} />}
                    {!touched.patientId && <Hint msg="Recherchez par nom, prénom ou numéro de dossier" />}
                  </>
                )}
              </div>

              {/* Médecin & Service */}
              <div>
                <SectionHeader icon={<Stethoscope className="w-3 h-3 text-blue-600" />} bg="bg-blue-100" label="Équipe médicale" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      Médecin <span className="text-violet-500">*</span>
                    </label>
                    <Select value={form.medecinId} onValueChange={v => set('medecinId', String(v))} onOpenChange={o => { if (!o) touch('medecinId') }}>
                      <SelectTrigger className={`h-10 rounded-xl text-sm border ${touched.medecinId && errors.medecinId ? 'border-red-300 bg-red-50' : touched.medecinId && form.medecinId ? 'border-emerald-300' : 'border-slate-200'}`}>
                        <SelectValue placeholder="Choisir">
                          {form.medecinId ? (() => { const m = medecins.find(x => x.id === form.medecinId); return m ? `Dr. ${m.prenom} ${m.nom}` : null })() : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {medecins.length === 0 ? <SelectItem value="_" disabled>Aucun médecin</SelectItem>
                          : medecins.map(m => <SelectItem key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FieldError msg={touched.medecinId ? errors.medecinId : undefined} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      Service <span className="text-violet-500">*</span>
                    </label>
                    <Select value={form.serviceId} onValueChange={v => set('serviceId', String(v))} onOpenChange={o => { if (!o) touch('serviceId') }}>
                      <SelectTrigger className={`h-10 rounded-xl text-sm border ${touched.serviceId && errors.serviceId ? 'border-red-300 bg-red-50' : touched.serviceId && form.serviceId ? 'border-emerald-300' : 'border-slate-200'}`}>
                        <SelectValue placeholder="Choisir">
                          {form.serviceId ? services.find(s => s.id === form.serviceId)?.nom ?? null : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {services.length === 0 ? <SelectItem value="_" disabled>Aucun service</SelectItem>
                          : services.map(s => <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FieldError msg={touched.serviceId ? errors.serviceId : undefined} />
                  </div>
                </div>
              </div>

              {/* Date & Motif */}
              <div>
                <SectionHeader icon={<Clock className="w-3 h-3 text-teal-600" />} bg="bg-teal-100" label="Planification" />
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      Date et heure <span className="text-violet-500">*</span>
                    </label>
                    <input type="datetime-local"
                      className={inputCls(touched.dateHeure ? errors.dateHeure : undefined, !!touched.dateHeure && !errors.dateHeure && !!form.dateHeure)}
                      value={form.dateHeure}
                      onChange={e => set('dateHeure', e.target.value)}
                      onBlur={() => touch('dateHeure')} />
                    <FieldError msg={touched.dateHeure ? errors.dateHeure : undefined} />
                    {!touched.dateHeure && <Hint msg="Horaires d'ouverture : 07h00 – 19h00" />}
                  </div>
                  {isSunday && !errors.dateHeure && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2.5 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Rendez-vous un dimanche — confirmez que l'hôpital est ouvert ce jour.
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Motif</label>
                    <div className="relative">
                      <textarea rows={2} maxLength={500}
                        className={`${inputCls(touched.motif ? errors.motif : undefined)} resize-none`}
                        placeholder="Fièvre persistante, douleur lombaire, contrôle de routine..."
                        value={form.motif}
                        onChange={e => set('motif', e.target.value)}
                        onBlur={() => touch('motif')} />
                      <span className={`absolute bottom-2 right-3 text-[10px] ${form.motif.length > 450 ? 'text-amber-500 font-medium' : 'text-slate-300'}`}>
                        {form.motif.length}/500
                      </span>
                    </div>
                    <FieldError msg={touched.motif ? errors.motif : undefined} />
                  </div>
                </div>
              </div>

              {apiErr && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{apiErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-400"><span className="text-violet-500">*</span> Champs obligatoires</p>
              <div className="flex gap-2">
                <button type="button" onClick={close}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className={`flex items-center gap-2 px-5 py-2 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-60
                    ${isInvalid && Object.keys(touched).length > 0
                      ? 'bg-slate-400 shadow-none cursor-not-allowed'
                      : 'bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/20'}`}>
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Planifier <ChevronRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Statut config ────────────────────────────────────────────────────────────

const statutConfig: Record<AppointmentStatut, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  PLANIFIE:        { label: 'Planifié',        icon: ClockIcon,    color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  EN_ATTENTE:      { label: 'En attente',      icon: ClockIcon,    color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  EN_CONSULTATION: { label: 'En consultation', icon: PlayCircle,   color: 'text-violet-600',  bg: 'bg-violet-50 border-violet-200' },
  TERMINE:         { label: 'Terminé',         icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ANNULE:          { label: 'Annulé',          icon: XCircle,      color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200' },
}

// ─── Appointment card ─────────────────────────────────────────────────────────

function AppointmentCard({ appt, onStatusChange, onEdit }: {
  appt: Appointment; onStatusChange: () => void; onEdit: () => void
}) {
  const cfg = statutConfig[appt.statut]
  const StatusIcon = cfg.icon
  const date = new Date(appt.dateHeure)
  const [cancelling, setCancelling] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function advance() {
    const flow: Record<AppointmentStatut, AppointmentStatut | null> = {
      PLANIFIE: 'EN_ATTENTE', EN_ATTENTE: 'EN_CONSULTATION',
      EN_CONSULTATION: 'TERMINE', TERMINE: null, ANNULE: null
    }
    const next = flow[appt.statut]
    if (!next) return
    try { await api.patch(`/appointments/${appt.id}/statut`, { statut: next }); onStatusChange() } catch {}
  }

  async function cancel() {
    setCancelling(true)
    try { await api.patch(`/appointments/${appt.id}/statut`, { statut: 'ANNULE' }); setConfirmOpen(false); onStatusChange() }
    catch {} finally { setCancelling(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-linear-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold">
              {appt.patient.prenom[0]}{appt.patient.nom[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{appt.patient.prenom} {appt.patient.nom}</p>
              <p className="text-xs text-slate-400">{appt.patient.numero}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {appt.statut === 'PLANIFIE' && (
              <button onClick={onEdit}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-violet-100 text-slate-400 hover:text-violet-600 flex items-center justify-center transition-colors">
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="w-3 h-3" />{cfg.label}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-300" />
            {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1.5"><Stethoscope className="w-3 h-3 text-slate-300" />
            Dr. {appt.medecin.prenom} {appt.medecin.nom}
          </span>
        </div>
        {appt.motif && <p className="mt-2 text-xs text-slate-400 italic truncate">"{appt.motif}"</p>}
      </div>
      {!['TERMINE', 'ANNULE'].includes(appt.statut) && (
        <div className="px-4 pb-3 flex gap-2">
          <button onClick={advance}
            className="flex-1 text-xs font-semibold py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-colors flex items-center justify-center gap-1.5">
            <PlayCircle className="w-3.5 h-3.5" />
            {appt.statut === 'PLANIFIE' ? 'Mettre en attente' : appt.statut === 'EN_ATTENTE' ? 'Démarrer' : 'Terminer'}
          </button>
          <button onClick={() => setConfirmOpen(true)} disabled={cancelling}
            className="text-xs px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors flex items-center gap-1 disabled:opacity-50">
            <Ban className="w-3 h-3" />
          </button>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Annuler le rendez-vous"
        message={`Annuler le RDV de ${appt.patient.prenom} ${appt.patient.nom} prévu le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ?`}
        confirmLabel="Annuler le RDV"
        variant="warning"
        loading={cancelling}
        onConfirm={cancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]           = useState(true)
  const [open, setOpen]                 = useState(false)
  const [editing, setEditing]           = useState<Appointment | null>(null)
  const [dateFilter, setDateFilter]     = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })

  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get(`/appointments?date=${dateFilter}`); setAppointments(r.data.data || []) }
    finally { setLoading(false) }
  }, [dateFilter])

  useEffect(() => { fetch() }, [fetch])

  const grouped = appointments.reduce((acc, a) => {
    if (!acc[a.statut]) acc[a.statut] = []
    acc[a.statut].push(a)
    return acc
  }, {} as Record<string, Appointment[]>)

  const order: AppointmentStatut[] = ['EN_CONSULTATION', 'EN_ATTENTE', 'PLANIFIE', 'TERMINE', 'ANNULE']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all" />
          <span className="text-sm text-slate-500">{appointments.length} rendez-vous</span>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-violet-500/20 transition-all">
          <Plus className="w-4 h-4" /> Nouveau RDV
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">Aucun rendez-vous ce jour</p>
          <button onClick={() => setOpen(true)} className="mt-4 text-sm text-violet-600 hover:underline">Planifier un rendez-vous</button>
        </div>
      ) : (
        <div className="space-y-6">
          {order.filter(s => grouped[s]?.length).map(statut => (
            <div key={statut}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statutConfig[statut].bg} ${statutConfig[statut].color}`}>
                  {statutConfig[statut].label} ({grouped[statut].length})
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {grouped[statut].map(a => <AppointmentCard key={a.id} appt={a} onStatusChange={fetch} onEdit={() => { setEditing(a); setOpen(true) }} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      <AppointmentModal open={open} editing={editing}
        onClose={() => { setOpen(false); setEditing(null) }}
        onSuccess={() => { setOpen(false); setEditing(null); fetch() }} />
    </div>
  )
}
