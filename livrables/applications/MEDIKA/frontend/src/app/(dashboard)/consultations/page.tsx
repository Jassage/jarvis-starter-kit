'use client'
import { useEffect, useState } from 'react'
import { Consultation, Examen, Patient, Appointment } from '@/types'
import api from '@/lib/api'
import {
  Stethoscope, Plus, X, ChevronRight, Check, Search,
  FileText, User as UserIcon, ClipboardList, AlertTriangle,
  Clock, Activity, AlertCircle, Info, CheckCircle2, Pencil, Trash2,
  FlaskConical, CalendarDays, Printer
} from 'lucide-react'
import { printOrdonnance } from '@/lib/print'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EXAM_TYPES } from '@/lib/exam-schemas'

// ─── Validation ───────────────────────────────────────────────────────────────

type Errors  = Record<string, string>
type Touched = Record<string, boolean>

type ConsultForm = {
  plainte: string
  diagnostic: string
  notes: string
  prescriptions: string
  tension: string
  temperature: string
  poids: string
  appointmentId: string
  prochainRdv: string
  examensTypes: string[]
}

const TENSION_RE = /^\d{2,3}\/\d{2,3}$/

function validateConsult(form: ConsultForm, touched: Touched): Errors {
  const e: Errors = {}

  if (touched.diagnostic && form.diagnostic.trim() && form.diagnostic.trim().length < 5)
    e.diagnostic = 'Diagnostic trop court (min 5 caractères)'

  if (touched.tension && form.tension) {
    if (!TENSION_RE.test(form.tension)) e.tension = 'Format attendu : 120/80 (systolique/diastolique)'
    else {
      const [sys, dia] = form.tension.split('/').map(Number)
      if (sys < 60 || sys > 260)    e.tension = `Systolique anormale (${sys} mmHg) — vérifiez la mesure`
      else if (dia < 30 || dia > 160) e.tension = `Diastolique anormale (${dia} mmHg) — vérifiez la mesure`
    }
  }

  if (touched.temperature && form.temperature) {
    const t = parseFloat(form.temperature)
    if (isNaN(t))            e.temperature = 'Valeur invalide'
    else if (t < 35 || t > 43) e.temperature = `Température hors plage (35 – 43 °C)`
  }

  if (touched.poids && form.poids) {
    const p = parseFloat(form.poids)
    if (isNaN(p))              e.poids = 'Valeur invalide'
    else if (p < 0.5 || p > 500) e.poids = 'Poids hors plage (0,5 – 500 kg)'
  }

  return e
}

function clinicalAlerts(form: ConsultForm): string[] {
  const alerts: string[] = []
  if (form.tension && TENSION_RE.test(form.tension)) {
    const [sys, dia] = form.tension.split('/').map(Number)
    if (sys >= 180 || dia >= 110)  alerts.push('Hypertension sévère (≥ 180/110) — urgence hypertendue possible')
    else if (sys >= 140 || dia >= 90) alerts.push('Hypertension détectée (≥ 140/90) — surveiller')
    else if (sys < 90 || dia < 60)   alerts.push('Hypotension détectée (< 90/60) — surveiller')
  }
  if (form.temperature) {
    const t = parseFloat(form.temperature)
    if (t >= 40)       alerts.push(`Hyperthermie sévère (${t}°C) — risque de fièvre dangereuse`)
    else if (t >= 38.5) alerts.push(`Fièvre élevée (${t}°C)`)
    else if (t < 36)   alerts.push(`Hypothermie (${t}°C) — surveiller`)
  }
  return alerts
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
  return `${base} border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400`
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

// ─── Prescription builder avec picker médicament ──────────────────────────────

interface RxLine { med: string; dosage: string; frequence: string; duree: string }
interface MedCatalogItem { id: string; nom: string; dci?: string | null; dosageForme?: string | null; forme?: string | null; stockActuel: number; seuilAlerte: number; unite: string }

const RX_FREQUENCES = ['1 fois/jour', '2 fois/jour', '3 fois/jour', 'Toutes les 4h', 'Toutes les 6h', 'Toutes les 8h', 'Au besoin (SOS)']

function MedSearchInput({ value, onChange, onSelect }: {
  value: string; onChange: (v: string) => void; onSelect: (m: MedCatalogItem) => void
}) {
  const [open, setOpen]     = useState(false)
  const [meds, setMeds]     = useState<MedCatalogItem[]>([])
  const [loaded, setLoaded] = useState(false)

  async function load() {
    if (loaded) return
    try { const r = await api.get('/pharmacie/medicaments?limit=300&actif=true'); setMeds(r.data.data || []); setLoaded(true) } catch {}
  }

  const list = meds.filter(m =>
    !value || m.nom.toLowerCase().includes(value.toLowerCase()) || m.dci?.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 20)

  return (
    <div className="relative">
      <input value={value} autoComplete="off" placeholder="Médicament..."
        className={inputCls()} style={{ fontSize: '0.8rem', padding: '6px 10px' }}
        onChange={e => { onChange(e.target.value); setOpen(true); load() }}
        onFocus={() => { setOpen(true); load() }} />
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 top-full left-0 w-72 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-44 overflow-y-auto divide-y divide-slate-50">
              {list.length === 0
                ? <p className="text-xs text-slate-400 px-3 py-2">{value ? 'Aucun résultat — saisie libre' : 'Tapez pour rechercher'}</p>
                : list.map(m => (
                  <button key={m.id} type="button"
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors"
                    onClick={() => { onSelect(m); onChange(m.nom); setOpen(false) }}>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{m.nom}</p>
                      {m.dci && <p className="text-[10px] text-slate-400">{m.dci}{m.dosageForme ? ` · ${m.dosageForme}` : ''}</p>}
                    </div>
                    <span className={`text-[10px] font-bold shrink-0 ${m.stockActuel <= m.seuilAlerte ? 'text-red-500' : 'text-emerald-600'}`}>
                      {m.stockActuel} {m.unite}
                    </span>
                  </button>
                ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PrescriptionBuilder({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [lines, setLines]     = useState<RxLine[]>([{ med: '', dosage: '', frequence: '', duree: '' }])
  const [showRaw, setShowRaw] = useState(false)

  function serialize(ls: RxLine[]): string {
    return ls.filter(l => l.med.trim()).map(l => {
      let s = l.med.trim()
      if (l.dosage.trim())    s += ` ${l.dosage.trim()}`
      if (l.frequence.trim()) s += ` — ${l.frequence.trim()}`
      if (l.duree.trim())     s += ` pendant ${l.duree.trim()} jour${l.duree !== '1' ? 's' : ''}`
      return s
    }).join('\n')
  }

  function update(i: number, key: keyof RxLine, val: string) {
    const updated = lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l)
    setLines(updated)
    onChange(serialize(updated))
  }

  function addLine() { setLines([...lines, { med: '', dosage: '', frequence: '', duree: '' }]) }

  function removeLine(i: number) {
    const updated = lines.length > 1 ? lines.filter((_, idx) => idx !== i) : [{ med: '', dosage: '', frequence: '', duree: '' }]
    setLines(updated)
    onChange(serialize(updated))
  }

  if (showRaw) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Mode texte libre</span>
          <button type="button" onClick={() => setShowRaw(false)}
            className="text-xs text-violet-600 hover:underline">Utiliser le builder</button>
        </div>
        <textarea rows={4} maxLength={3000}
          className={`${inputCls()} resize-none font-mono text-xs`}
          placeholder={"Paracétamol 500mg — 2 fois/jour pendant 5 jours\nAmoxicilline 500mg — 3 fois/jour pendant 7 jours"}
          value={value} onChange={e => onChange(e.target.value)} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
          {lines.filter(l => l.med).length} médicament{lines.filter(l => l.med).length !== 1 ? 's' : ''}
        </span>
        <button type="button" onClick={() => setShowRaw(true)}
          className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline">Saisie libre</button>
      </div>

      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i} className="grid grid-cols-12 gap-1.5 items-end p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="col-span-4">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">Médicament</p>
              <MedSearchInput value={line.med} onChange={v => update(i, 'med', v)}
                onSelect={m => {
                  const updated = lines.map((l, idx) => idx === i ? { ...l, med: m.nom, dosage: m.dosageForme || l.dosage } : l)
                  setLines(updated)
                  onChange(serialize(updated))
                }} />
            </div>
            <div className="col-span-3">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">Dosage</p>
              <input value={line.dosage} onChange={e => update(i, 'dosage', e.target.value)}
                placeholder="500mg..."
                className={inputCls()} style={{ fontSize: '0.8rem', padding: '6px 10px' }} />
            </div>
            <div className="col-span-3">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">Fréquence</p>
              <select value={line.frequence} onChange={e => update(i, 'frequence', e.target.value)}
                className={inputCls()} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                <option value="">—</option>
                {RX_FREQUENCES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">Jours</p>
              <input type="number" min={1} value={line.duree} onChange={e => update(i, 'duree', e.target.value)}
                placeholder="—" className={inputCls()} style={{ fontSize: '0.8rem', padding: '6px 8px' }} />
            </div>
            <div className="col-span-1 flex justify-end">
              <button type="button" onClick={() => removeLine(i)}
                className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addLine}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 border-dashed rounded-xl transition-colors">
        <Plus className="w-3.5 h-3.5" />Ajouter un médicament
      </button>

      {value && (
        <div className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 font-mono leading-relaxed whitespace-pre-wrap">
          {value}
        </div>
      )}
    </div>
  )
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
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold">{selected.prenom[0]}{selected.nom[0]}</div>
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
      <input className={`${inputCls(hasError ? 'err' : undefined)} pl-9`}
        value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, prénom ou numéro de dossier..." />
      {open && results.length > 0 && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {results.slice(0, 6).map(p => (
            <button key={p.id} type="button" onClick={() => pick(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition-colors text-left border-b border-slate-50 last:border-0">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-600 text-xs font-bold">{p.prenom[0]}{p.nom[0]}</div>
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

// ─── Vital input ──────────────────────────────────────────────────────────────

function VitalInput({ label, unit, placeholder, value, error, valid, onChange, onBlur }: {
  label: string; unit: string; placeholder: string; value: string
  error?: string; valid?: boolean
  onChange: (v: string) => void; onBlur: () => void
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <input className={`${inputCls(error, valid)} pr-12`}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} onBlur={onBlur} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{unit}</span>
      </div>
      <FieldError msg={error} />
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const EMPTY_FORM: ConsultForm = {
  plainte: '', diagnostic: '', notes: '', prescriptions: '',
  tension: '', temperature: '', poids: '', appointmentId: '',
  prochainRdv: '', examensTypes: []
}

const EXAMEN_STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-50 border-amber-200 text-amber-700',
  EN_COURS: 'bg-sky-50 border-sky-200 text-sky-700',
  RESULTAT_DISPONIBLE: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  ANNULE: 'bg-slate-100 border-slate-200 text-slate-400',
}

function ConsultationModal({ open, onClose, onSuccess, editing }: {
  open: boolean; onClose: () => void; onSuccess: () => void; editing?: Consultation | null
}) {
  const [patientId, setPatientId]       = useState('')
  const [patientMissing, setPatientMissing] = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [touched, setTouched]           = useState<Touched>({})
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]           = useState(false)
  const [done, setDone]                 = useState(false)
  const [apiErr, setApiErr]             = useState('')

  const errors = validateConsult(form, touched)
  const alerts = clinicalAlerts(form)

  useEffect(() => {
    if (editing) {
      const sv = editing.signesVitaux as { tension?: string; temperature?: number; poids?: number } | undefined
      const rdv = editing.prochainRdv
        ? new Date(editing.prochainRdv).toISOString().slice(0, 10)
        : ''
      setForm({
        plainte: editing.plainte || '',
        diagnostic: editing.diagnostic || '',
        notes: editing.notes || '',
        prescriptions: editing.prescriptions || '',
        tension: sv?.tension || '',
        temperature: sv?.temperature != null ? String(sv.temperature) : '',
        poids: sv?.poids != null ? String(sv.poids) : '',
        appointmentId: '',
        prochainRdv: rdv,
        examensTypes: [],
      })
      setPatientId(editing.patient.id)
    } else {
      setForm(EMPTY_FORM); setPatientId('')
    }
    setTouched({}); setApiErr(''); setDone(false)
  }, [editing, open])

  function touch(field: string) { setTouched(t => ({ ...t, [field]: true })) }
  function set(field: keyof ConsultForm, val: string) { setForm(f => ({ ...f, [field]: val })); touch(field) }
  function isValid(f: string) { return !!touched[f] && !errors[f] && !!(form as unknown as Record<string, string>)[f] }

  function addExamen(type: string) {
    if (!type || form.examensTypes.includes(type)) return
    setForm(f => ({ ...f, examensTypes: [...f.examensTypes, type] }))
  }
  function removeExamen(type: string) {
    setForm(f => ({ ...f, examensTypes: f.examensTypes.filter(t => t !== type) }))
  }

  async function onPatient(p: Patient | null) {
    setPatientId(p?.id || '')
    setPatientMissing(false)
    set('appointmentId', '')
    if (!p) { setAppointments([]); return }
    try {
      const r = await api.get(`/appointments?patientId=${p.id}`)
      setAppointments((r.data.data || []).filter((a: Appointment) => !['TERMINE', 'ANNULE'].includes(a.statut)))
    } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) { setPatientMissing(true); return }
    const allTouched: Touched = { tension: true, temperature: true, poids: true }
    setTouched(allTouched)
    const errs = validateConsult(form, allTouched)
    if (Object.keys(errs).length) return
    setLoading(true); setApiErr('')
    try {
      const signesVitaux = (form.tension || form.temperature || form.poids) ? {
        tension: form.tension || undefined,
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        poids: form.poids ? parseFloat(form.poids) : undefined,
      } : undefined

      // prochainRdv → ISO datetime string at local midnight
      let prochainRdv: string | null | undefined = undefined
      if (form.prochainRdv) {
        const [y, m, d] = form.prochainRdv.split('-').map(Number)
        prochainRdv = new Date(y, m - 1, d, 12, 0, 0).toISOString()
      } else if (editing?.prochainRdv) {
        // explicitly clear if was set before
        prochainRdv = null
      }

      const payload = {
        patientId,
        appointmentId: form.appointmentId || undefined,
        plainte: form.plainte || undefined,
        diagnostic: form.diagnostic || undefined,
        notes: form.notes || undefined,
        prescriptions: form.prescriptions || undefined,
        signesVitaux,
        prochainRdv,
        ...(form.examensTypes.length > 0 && { examensTypes: form.examensTypes }),
      }

      if (editing) await api.put(`/consultations/${editing.id}`, payload)
      else await api.post('/consultations', payload)

      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1400)
    } catch (err: unknown) {
      setApiErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  function close() {
    setPatientId(''); setPatientMissing(false); setForm(EMPTY_FORM)
    setTouched({}); setAppointments([]); setApiErr(''); setDone(false); onClose()
  }

  if (!open) return null

  const diagLen = form.diagnostic.trim().length

  // Existing exams linked to this consultation (shown in edit mode)
  const existingExamens: Examen[] = editing?.examens || []
  // Types already prescribed (existing + newly added in form) — used to exclude from the select
  const existingTypes = existingExamens.map(e => e.type)
  const allSelectedTypes = [...existingTypes, ...form.examensTypes]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        <div className="bg-linear-to-br from-emerald-600 to-teal-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{editing ? 'Modifier la consultation' : 'Nouvelle consultation'}</h2>
              <p className="text-emerald-200 text-xs">{editing ? `${editing.patient.prenom} ${editing.patient.nom}` : 'Saisir un acte médical'}</p>
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
              <p className="font-semibold text-slate-900">{editing ? 'Consultation mise à jour' : 'Consultation enregistrée'}</p>
              <p className="text-sm text-slate-500 mt-1">Le dossier patient a été mis à jour</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-5">

              {/* Patient */}
              <div>
                <SectionHeader icon={<UserIcon className="w-3 h-3 text-emerald-600" />} bg="bg-emerald-100" label="Patient" />
                <div className="space-y-2.5">
                  {editing ? (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
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
                      <PatientSearch onSelect={onPatient} hasError={patientMissing && !patientId} />
                      {patientMissing && !patientId && <FieldError msg="Sélectionnez un patient pour continuer" />}
                      {!patientMissing && !patientId && <Hint msg="Recherchez par nom, prénom ou numéro de dossier" />}
                    </>
                  )}

                  {patientId && !editing && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Lier à un RDV en cours</label>
                      <select className={inputCls()} value={form.appointmentId} onChange={e => set('appointmentId', e.target.value)}>
                        <option value="">Sans lien à un rendez-vous</option>
                        {appointments.map(a => (
                          <option key={a.id} value={a.id}>
                            RDV {new Date(a.dateHeure).toLocaleDateString('fr-FR')} · Dr. {a.medecin.prenom} {a.medecin.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Plainte principale */}
              <div>
                <SectionHeader icon={<ClipboardList className="w-3 h-3 text-orange-600" />} bg="bg-orange-100" label="Plainte principale" />
                <input className={inputCls()}
                  placeholder="Ex: Fièvre depuis 3 jours, douleurs abdominales, maux de tête..."
                  value={form.plainte} onChange={e => set('plainte', e.target.value)} />
                <Hint msg="Ce que le patient ressent — base pour prescrire les examens" />
              </div>

              {/* Signes vitaux */}
              <div>
                <SectionHeader icon={<Activity className="w-3 h-3 text-teal-600" />} bg="bg-teal-100" label="Signes vitaux" />
                <div className="grid grid-cols-3 gap-3">
                  <VitalInput label="Tension" unit="mmHg" placeholder="120/80"
                    value={form.tension} error={touched.tension ? errors.tension : undefined}
                    valid={isValid('tension') && !errors.tension}
                    onChange={v => set('tension', v)} onBlur={() => touch('tension')} />
                  <VitalInput label="Température" unit="°C" placeholder="37.5"
                    value={form.temperature} error={touched.temperature ? errors.temperature : undefined}
                    valid={isValid('temperature') && !errors.temperature}
                    onChange={v => set('temperature', v)} onBlur={() => touch('temperature')} />
                  <VitalInput label="Poids" unit="kg" placeholder="70"
                    value={form.poids} error={touched.poids ? errors.poids : undefined}
                    valid={isValid('poids') && !errors.poids}
                    onChange={v => set('poids', v)} onBlur={() => touch('poids')} />
                </div>
                {alerts.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {alerts.map(a => (
                      <div key={a} className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-xl">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />{a}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Examens (toujours visible — création ou modification) */}
              <div>
                <SectionHeader icon={<FlaskConical className="w-3 h-3 text-sky-600" />} bg="bg-sky-100" label="Examens à prescrire" />
                <div className="space-y-2.5">

                  {/* Existing exams in edit mode (read-only) */}
                  {editing && existingExamens.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Examens déjà prescrits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {existingExamens.map(e => (
                          <span key={e.id} className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border ${EXAMEN_STATUT_COLORS[e.statut] || EXAMEN_STATUT_COLORS.EN_ATTENTE}`}>
                            <FlaskConical className="w-2.5 h-2.5 shrink-0" />{e.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add new exams */}
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all bg-white"
                      defaultValue=""
                      onChange={e => { addExamen(e.target.value); e.target.value = '' }}
                    >
                      <option value="">Ajouter un examen...</option>
                      {EXAM_TYPES.filter(t => !allSelectedTypes.includes(t)).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {form.examensTypes.length > 0 ? (
                    <div>
                      {editing && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Nouveaux examens à ajouter</p>}
                      <div className="flex flex-wrap gap-1.5">
                        {form.examensTypes.map(t => (
                          <span key={t} className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl">
                            <FlaskConical className="w-3 h-3 shrink-0" />
                            {t}
                            <button type="button" onClick={() => removeExamen(t)} className="text-sky-400 hover:text-sky-700 transition-colors ml-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !editing || existingExamens.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Aucun examen sélectionné. Vous pouvez en ajouter plusieurs.</p>
                    ) : null
                  )}
                </div>
              </div>

              {/* Acte médical */}
              <div>
                <SectionHeader icon={<ClipboardList className="w-3 h-3 text-blue-600" />} bg="bg-blue-100" label="Acte médical" />
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      Diagnostic <span className="text-slate-300 font-normal normal-case tracking-normal">(après résultats)</span>
                    </label>
                    <div className="relative">
                      <textarea rows={3} maxLength={1000}
                        className={`${inputCls(touched.diagnostic ? errors.diagnostic : undefined, touched.diagnostic && diagLen >= 5)} resize-none`}
                        placeholder="Décrivez le diagnostic clinique..."
                        value={form.diagnostic}
                        onChange={e => set('diagnostic', e.target.value)}
                        onBlur={() => touch('diagnostic')} />
                      <div className="absolute bottom-2 right-3 flex items-center gap-2">
                        {touched.diagnostic && diagLen >= 5 && !errors.diagnostic && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        <span className={`text-[10px] ${diagLen > 900 ? 'text-amber-500' : 'text-slate-300'}`}>{diagLen}/1000</span>
                      </div>
                    </div>
                    <FieldError msg={touched.diagnostic ? errors.diagnostic : undefined} />
                    {!touched.diagnostic && <Hint msg="Peut être rempli après réception des résultats d'examens" />}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Notes cliniques</label>
                    <textarea rows={2} maxLength={2000}
                      className={`${inputCls()} resize-none`}
                      placeholder="Observations, antécédents pertinents..."
                      value={form.notes} onChange={e => set('notes', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Ordonnance */}
              <div>
                <SectionHeader icon={<FileText className="w-3 h-3 text-violet-600" />} bg="bg-violet-100" label="Ordonnance" />
                <PrescriptionBuilder value={form.prescriptions} onChange={v => set('prescriptions', v)} />
              </div>

              {/* Prochain rendez-vous */}
              <div>
                <SectionHeader icon={<CalendarDays className="w-3 h-3 text-rose-600" />} bg="bg-rose-100" label="Prochain rendez-vous" />
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                  <input
                    type="date"
                    className={`${inputCls()} pl-9`}
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.prochainRdv}
                    onChange={e => set('prochainRdv', e.target.value)} />
                </div>
                <Hint msg="Date du prochain rendez-vous à fixer avec le patient — facultatif" />
              </div>

              {apiErr && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{apiErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button type="button" onClick={close}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-60 transition-all">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enregistrer <ChevronRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Consultation card ────────────────────────────────────────────────────────

function ConsultationCard({ consultation, onEdit, onDelete }: {
  consultation: Consultation; onEdit: () => void; onDelete: () => void
}) {
  const [expanded, setExpanded]     = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const date = new Date(consultation.date)

  async function handleDelete() {
    setDeleting(true)
    try { await api.delete(`/consultations/${consultation.id}`); setConfirmOpen(false); onDelete() }
    catch {} finally { setDeleting(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold">
              {consultation.patient.prenom[0]}{consultation.patient.nom[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{consultation.patient.prenom} {consultation.patient.nom}</p>
              <p className="text-xs text-slate-400">{consultation.patient.numero}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />{date.toLocaleDateString('fr-FR')}
            </span>
            <button onClick={() => printOrdonnance(consultation)} title="Imprimer l'ordonnance"
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-violet-100 text-slate-300 hover:text-violet-600 flex items-center justify-center transition-colors">
              <Printer className="w-3 h-3" />
            </button>
            <button onClick={onEdit}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-300 hover:text-emerald-600 flex items-center justify-center transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={() => setConfirmOpen(true)} disabled={deleting}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {consultation.plainte && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-2 mb-2">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-0.5">Plainte</p>
            <p className="text-xs text-slate-700 leading-snug">{consultation.plainte}</p>
          </div>
        )}

        {consultation.diagnostic && (
          <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Diagnostic</p>
            <p className="text-sm text-slate-800 leading-snug">{consultation.diagnostic}</p>
          </div>
        )}

        {/* Prochain RDV */}
        {consultation.prochainRdv && (
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <p className="text-xs font-semibold text-rose-700">
              Prochain RDV : {new Date(consultation.prochainRdv).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        {consultation.medecin && (
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
            <Stethoscope className="w-3 h-3 text-slate-300" />
            Dr. {consultation.medecin.prenom} {consultation.medecin.nom}
          </p>
        )}

        {/* Examens liés */}
        {consultation.examens && consultation.examens.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Examens prescrits</p>
            <div className="flex flex-wrap gap-1.5">
              {consultation.examens.map(e => (
                <span key={e.id} className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border ${EXAMEN_STATUT_COLORS[e.statut] || EXAMEN_STATUT_COLORS.EN_ATTENTE}`}>
                  <FlaskConical className="w-2.5 h-2.5 shrink-0" />{e.type}
                </span>
              ))}
            </div>
          </div>
        )}

        {(consultation.prescriptions || consultation.notes) && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            {expanded ? '← Réduire' : 'Voir détails →'}
          </button>
        )}

        {expanded && (
          <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
            {consultation.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Notes cliniques</p>
                <p className="text-xs text-slate-600 leading-relaxed">{consultation.notes}</p>
              </div>
            )}
            {consultation.prescriptions && (
              <div>
                <p className="text-xs font-semibold text-violet-600 mb-1.5">Ordonnance</p>
                <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap bg-violet-50 border border-violet-100 rounded-xl px-3.5 py-2.5 leading-relaxed">
                  {consultation.prescriptions}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Supprimer la consultation"
        message={`Supprimer la consultation du ${date.toLocaleDateString('fr-FR')} pour ${consultation.patient.prenom} ${consultation.patient.nom} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Consultation | null>(null)
  const [search, setSearch]   = useState('')

  async function fetchConsultations() {
    setLoading(true)
    try {
      const r = await api.get('/consultations')
      setConsultations(r.data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchConsultations() }, [])

  const filtered = consultations.filter(c =>
    !search || `${c.patient.prenom} ${c.patient.nom} ${c.diagnostic || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
          <input className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all w-64"
            placeholder="Rechercher une consultation..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all">
          <Plus className="w-4 h-4" /> Nouvelle consultation
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">{search ? 'Aucun résultat' : 'Aucune consultation enregistrée'}</p>
          {!search && <button onClick={() => setOpen(true)} className="mt-4 text-sm text-emerald-600 hover:underline">Enregistrer une consultation</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <ConsultationCard key={c.id} consultation={c}
              onEdit={() => { setEditing(c); setOpen(true) }}
              onDelete={fetchConsultations} />
          ))}
        </div>
      )}

      <ConsultationModal open={open} editing={editing}
        onClose={() => { setOpen(false); setEditing(null) }}
        onSuccess={() => { setOpen(false); setEditing(null); fetchConsultations() }} />
    </div>
  )
}
