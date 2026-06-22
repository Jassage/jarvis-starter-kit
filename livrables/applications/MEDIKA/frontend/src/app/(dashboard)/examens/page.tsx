'use client'
import { useEffect, useState } from 'react'
import { Examen, ExamenStatut, Patient } from '@/types'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Combobox } from '@/components/ui/Combobox'
import {
  EXAM_TYPES, EXAM_SCHEMAS, FREE_TEXT_TYPES,
  generateResultatText, ResultatValues, ExamFieldDef
} from '@/lib/exam-schemas'
import {
  FlaskConical, Plus, X, Check, Search, ChevronRight,
  Clock, User as UserIcon, AlertTriangle, Stethoscope,
  CheckCircle2, ClipboardList, Play, FileOutput, Ban,
  AlertCircle, TrendingDown, TrendingUp, Users, Printer
} from 'lucide-react'
import { printExamen } from '@/lib/print'

// ─── Types ────────────────────────────────────────────────────────────────────

type PatientGroup = {
  patient: Pick<Patient, 'id'> & { prenom: string; nom: string; numero: string }
  examens: Examen[]
}

// ─── Statut helpers ───────────────────────────────────────────────────────────

const STATUT_LABELS: Record<ExamenStatut, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  RESULTAT_DISPONIBLE: 'Résultat disponible',
  ANNULE: 'Annulé',
}

const STATUT_COLORS: Record<ExamenStatut, string> = {
  EN_ATTENTE: 'bg-amber-100 text-amber-700 border-amber-200',
  EN_COURS: 'bg-sky-100 text-sky-700 border-sky-200',
  RESULTAT_DISPONIBLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ANNULE: 'bg-slate-100 text-slate-500 border-slate-200',
}

const FILTER_TABS: { label: string; value: ExamenStatut | 'TOUTES' }[] = [
  { label: 'Toutes', value: 'TOUTES' },
  { label: 'En attente', value: 'EN_ATTENTE' },
  { label: 'En cours', value: 'EN_COURS' },
  { label: 'Résultats', value: 'RESULTAT_DISPONIBLE' },
  { label: 'Annulés', value: 'ANNULE' },
]

// ─── UI helpers ───────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3 shrink-0" />{msg}</p>
}

function inputCls(error?: boolean) {
  const base = 'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 transition-all bg-white'
  if (error) return `${base} border-red-300 bg-red-50/40 focus:ring-red-500/20 focus:border-red-400`
  return `${base} border-slate-200 focus:ring-sky-500/30 focus:border-sky-400`
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
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50">
      <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold">{selected.prenom[0]}{selected.nom[0]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{selected.prenom} {selected.nom}</p>
        <p className="text-xs text-slate-500">{selected.numero}</p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
      <button type="button" onClick={clear} className="text-slate-300 hover:text-red-500 ml-1 transition-colors"><X className="w-3.5 h-3.5" /></button>
    </div>
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
      <input className={`${inputCls(hasError)} pl-9`} value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, prénom ou numéro de dossier..." />
      {open && results.length > 0 && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {results.slice(0, 6).map(p => (
            <button key={p.id} type="button" onClick={() => pick(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50 transition-colors text-left border-b border-slate-50 last:border-0">
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

// ─── Prescription modal ───────────────────────────────────────────────────────

function PrescriptionModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [patientId, setPatientId]           = useState('')
  const [patientMissing, setPatientMissing] = useState(false)
  const [type, setType]                     = useState('')
  const [typeMissing, setTypeMissing]       = useState(false)
  const [description, setDescription]      = useState('')
  const [loading, setLoading]               = useState(false)
  const [done, setDone]                     = useState(false)
  const [apiErr, setApiErr]                 = useState('')

  function reset() { setPatientId(''); setPatientMissing(false); setType(''); setTypeMissing(false); setDescription(''); setLoading(false); setDone(false); setApiErr('') }
  function close() { reset(); onClose() }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) { setPatientMissing(true); return }
    if (!type) { setTypeMissing(true); return }
    setLoading(true); setApiErr('')
    try {
      await api.post('/examens', { patientId, type, description: description || undefined })
      setDone(true)
      setTimeout(() => { reset(); onSuccess() }, 1400)
    } catch (err: unknown) {
      setApiErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-linear-to-br from-sky-600 to-blue-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div>
            <div><h2 className="text-white font-bold text-base">Prescrire un examen</h2><p className="text-sky-200 text-xs">Ordonnance d'analyse ou d'imagerie</p></div>
          </div>
          <button onClick={close} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"><X className="w-4 h-4 text-white" /></button>
        </div>
        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center"><Check className="w-8 h-8 text-sky-600" /></div>
            <p className="font-semibold text-slate-900">Examen prescrit</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <SectionHeader icon={<UserIcon className="w-3 h-3 text-sky-600" />} bg="bg-sky-100" label="Patient" />
                <PatientSearch onSelect={p => { setPatientId(p?.id || ''); setPatientMissing(false) }} hasError={patientMissing && !patientId} />
                {patientMissing && !patientId && <FieldError msg="Sélectionnez un patient" />}
              </div>
              <div>
                <SectionHeader icon={<FlaskConical className="w-3 h-3 text-blue-600" />} bg="bg-blue-100" label="Type d'examen" />
                <Combobox
                  value={type}
                  onChange={v => { setType(v); setTypeMissing(false) }}
                  placeholder="Rechercher un type d'examen..."
                  emptyLabel="Type d'examen non trouvé"
                  options={EXAM_TYPES.map(t => ({ value: t, label: t }))}
                />
                {typeMissing && !type && <FieldError msg="Sélectionnez un type d'examen" />}
              </div>
              <div>
                <SectionHeader icon={<ClipboardList className="w-3 h-3 text-violet-600" />} bg="bg-violet-100" label="Instructions" />
                <textarea rows={2} className={`${inputCls()} resize-none`} placeholder="Instructions spécifiques, contexte clinique..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              {apiErr && <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"><AlertTriangle className="w-4 h-4 shrink-0" />{apiErr}</div>}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button type="button" onClick={close} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl transition-all">Annuler</button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-sky-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-60 transition-all">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Prescrire <ChevronRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Structured result field ──────────────────────────────────────────────────

function ResultField({ field, value, onChange }: { field: ExamFieldDef; value: string; onChange: (v: string) => void }) {
  const numVal   = parseFloat(value)
  const isLow    = field.type === 'number' && !isNaN(numVal) && field.normalMin !== undefined && numVal < field.normalMin
  const isHigh   = field.type === 'number' && !isNaN(numVal) && field.normalMax !== undefined && numVal > field.normalMax
  const isAbnorm = isLow || isHigh

  const baseCls  = 'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 transition-all bg-white'
  const fieldCls = isAbnorm
    ? `${baseCls} border-red-300 bg-red-50/30 focus:ring-red-500/20 focus:border-red-400`
    : `${baseCls} border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400`

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{field.label}</label>
        {field.normalRange && (
          <span className="text-[10px] text-slate-400">Norme : {field.normalRange}{field.unit ? ' ' + field.unit : ''}</span>
        )}
      </div>
      {field.type === 'number' && (
        <div className="relative">
          <input type="number" step="any" className={`${fieldCls} ${field.unit ? 'pr-20' : ''}`}
            placeholder={field.placeholder || ''} value={value} onChange={e => onChange(e.target.value)} />
          {field.unit && !isAbnorm && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium whitespace-nowrap">{field.unit}</span>
          )}
          {isLow  && <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-bold text-blue-600"><TrendingDown className="w-3 h-3" />Bas</span>}
          {isHigh && <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-bold text-red-600"><TrendingUp className="w-3 h-3" />Élevé</span>}
        </div>
      )}
      {field.type === 'select' && (
        <select className={baseCls + ' border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400'} value={value} onChange={e => onChange(e.target.value)}>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt || '— Sélectionner —'}</option>)}
        </select>
      )}
      {field.type === 'textarea' && (
        <textarea rows={3} className={baseCls + ' border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none'}
          placeholder={field.placeholder || ''} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}

// ─── Résultat modal (structured) ──────────────────────────────────────────────

function ResultatModal({ examen, onClose, onSuccess }: { examen: Examen | null; onClose: () => void; onSuccess: () => void }) {
  const [values, setValues] = useState<ResultatValues>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [apiErr, setApiErr]   = useState('')

  useEffect(() => {
    if (!examen) return
    if (examen.resultatStructure) setValues(examen.resultatStructure as ResultatValues)
    else setValues({})
    setDone(false); setApiErr('')
  }, [examen])

  const schema     = examen ? EXAM_SCHEMAS[examen.type] : null
  const isFreeText = examen ? FREE_TEXT_TYPES.has(examen.type) : false

  function setValue(key: string, val: string) { setValues(v => ({ ...v, [key]: val })) }

  function hasRequiredFields(): boolean {
    if (isFreeText) return !!(values._texte?.trim())
    if (!schema) return Object.values(values).some(v => v?.trim())
    const required = schema.fields.filter(f => f.required)
    if (required.length === 0) return Object.values(values).some(v => v?.trim())
    return required.every(f => values[f.key]?.trim())
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!examen || !hasRequiredFields()) return
    const resultat = generateResultatText(examen.type, values)
    const resultatStructure = isFreeText ? undefined : values
    setLoading(true); setApiErr('')
    try {
      await api.patch(`/examens/${examen.id}/resultat`, { resultat, ...(resultatStructure && { resultatStructure }) })
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1400)
    } catch (err: unknown) {
      setApiErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  if (!examen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-linear-to-br from-emerald-600 to-teal-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center"><FileOutput className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-white font-bold text-base">Saisir le résultat</h2>
              <p className="text-emerald-200 text-xs truncate max-w-55">{examen.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"><X className="w-4 h-4 text-white" /></button>
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center"><Check className="w-8 h-8 text-emerald-600" /></div>
            <p className="font-semibold text-slate-900">Résultat enregistré</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                  {examen.patient.prenom[0]}{examen.patient.nom[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{examen.patient.prenom} {examen.patient.nom}</p>
                  <p className="text-xs text-slate-400">{examen.patient.numero}</p>
                </div>
              </div>

              {schema && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    schema.category === 'biologie'      ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    schema.category === 'serologie'     ? 'bg-violet-50 text-violet-600 border-violet-200' :
                    schema.category === 'microbiologie' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>{schema.category}</span>
                  {schema.fields.some(f => f.normalRange) && (
                    <span className="text-[10px] text-slate-400">Les valeurs hors norme seront signalées</span>
                  )}
                </div>
              )}

              {isFreeText ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Compte-rendu <span className="text-emerald-500">*</span></label>
                  <textarea rows={7}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none"
                    placeholder="Décrivez les résultats, observations, conclusions..."
                    value={values._texte || ''} onChange={e => setValue('_texte', e.target.value)} />
                </div>
              ) : schema ? (
                <div className="space-y-3.5">
                  {schema.fields.map(field => (
                    <ResultField key={field.key} field={field} value={values[field.key] || ''} onChange={v => setValue(field.key, v)} />
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Résultat <span className="text-emerald-500">*</span></label>
                  <textarea rows={5} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                    value={values._texte || ''} onChange={e => setValue('_texte', e.target.value)} />
                </div>
              )}

              {examen.description && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">Instructions du médecin</p>
                  <p className="text-xs text-amber-800">{examen.description}</p>
                </div>
              )}

              {apiErr && <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"><AlertTriangle className="w-4 h-4 shrink-0" />{apiErr}</div>}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl">Annuler</button>
              <button type="submit" disabled={loading || !hasRequiredFields()}
                className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-60 transition-all">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enregistrer <ChevronRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Exam row (inside patient group) ─────────────────────────────────────────

function ExamenRow({ examen, onRefresh, canAct }: { examen: Examen; onRefresh: () => void; canAct: boolean }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [showResultat, setShowResultat]   = useState(false)

  async function start() {
    setLoadingAction('start')
    try { await api.patch(`/examens/${examen.id}/statut`, { statut: 'EN_COURS' }); onRefresh() }
    catch {} finally { setLoadingAction(null) }
  }

  async function cancel() {
    if (!confirm('Annuler cet examen ?')) return
    setLoadingAction('cancel')
    try { await api.patch(`/examens/${examen.id}/annuler`); onRefresh() }
    catch {} finally { setLoadingAction(null) }
  }

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors border-b border-slate-50 last:border-0">
        {/* Statut + type */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUT_COLORS[examen.statut]}`}>
              {STATUT_LABELS[examen.statut]}
            </span>
            {examen.consultation && (
              <span className="text-[10px] text-slate-400 shrink-0">lié à consultation</span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-900 truncate">{examen.type}</p>
          {examen.description && (
            <p className="text-xs text-slate-400 truncate">{examen.description}</p>
          )}
        </div>

        {/* Résultat (if available) */}
        {examen.statut === 'RESULTAT_DISPONIBLE' && examen.resultat && (
          <div className="hidden sm:block max-w-xs flex-shrink">
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{examen.resultat}</p>
          </div>
        )}

        {/* Date + Doctor */}
        <div className="text-right shrink-0">
          <p className="text-xs font-medium text-slate-500 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-slate-300" />
            {new Date(examen.createdAt).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
            <Stethoscope className="w-2.5 h-2.5" />Dr. {examen.medecin.nom}
          </p>
        </div>

        {/* Actions */}
        {canAct && examen.statut !== 'ANNULE' && examen.statut !== 'RESULTAT_DISPONIBLE' && (
          <div className="flex items-center gap-1.5 shrink-0">
            {examen.statut === 'EN_ATTENTE' && (
              <button onClick={start} disabled={!!loadingAction}
                className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {loadingAction === 'start' ? <div className="w-3 h-3 border border-sky-400 border-t-sky-600 rounded-full animate-spin" /> : <Play className="w-3 h-3" />}
                Démarrer
              </button>
            )}
            {examen.statut === 'EN_COURS' && (
              <button onClick={() => setShowResultat(true)}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <FileOutput className="w-3 h-3" />Résultat
              </button>
            )}
            <button onClick={cancel} disabled={!!loadingAction}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              <Ban className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Edit result + print if already available */}
        {examen.statut === 'RESULTAT_DISPONIBLE' && (
          <div className="flex items-center gap-1.5 shrink-0">
            {canAct && (
              <button onClick={() => setShowResultat(true)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <FileOutput className="w-3 h-3" />Modifier
              </button>
            )}
            <button onClick={() => printExamen(examen)} title="Imprimer les résultats"
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-violet-600 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 px-2.5 py-1.5 rounded-lg transition-colors">
              <Printer className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <ResultatModal
        examen={showResultat ? examen : null}
        onClose={() => setShowResultat(false)}
        onSuccess={() => { setShowResultat(false); onRefresh() }}
      />
    </>
  )
}

// ─── Patient group card ───────────────────────────────────────────────────────

function PatientGroupCard({ group, onRefresh, canAct }: { group: PatientGroup; onRefresh: () => void; canAct: boolean }) {
  const pending  = group.examens.filter(e => e.statut === 'EN_ATTENTE').length
  const inProg   = group.examens.filter(e => e.statut === 'EN_COURS').length
  const done     = group.examens.filter(e => e.statut === 'RESULTAT_DISPONIBLE').length

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Patient header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
            {group.patient.prenom[0]}{group.patient.nom[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900">{group.patient.prenom} {group.patient.nom}</p>
            <p className="text-xs text-slate-400">{group.patient.numero}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{pending} en attente</span>
          )}
          {inProg > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">{inProg} en cours</span>
          )}
          {done > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{done} résultat{done > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Exam rows */}
      <div>
        {group.examens.map(e => (
          <ExamenRow key={e.id} examen={e} onRefresh={onRefresh} canAct={canAct} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamensPage() {
  const { user }              = useAuthStore()
  const [examens, setExamens] = useState<Examen[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<ExamenStatut | 'TOUTES'>('TOUTES')

  const canPrescribe = user?.role === 'MEDECIN' || user?.role === 'ADMIN'
  const canAct       = user?.role === 'MEDECIN' || user?.role === 'INFIRMIER' || user?.role === 'ADMIN'

  async function fetchExamens() {
    setLoading(true)
    try {
      const params = filter !== 'TOUTES' ? `?statut=${filter}` : ''
      const r = await api.get(`/examens${params}`)
      setExamens(r.data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchExamens() }, [filter])

  const filtered = examens.filter(e =>
    !search || `${e.patient.prenom} ${e.patient.nom} ${e.type} ${e.patient.numero}`.toLowerCase().includes(search.toLowerCase())
  )

  const counts: Record<string, number> = examens.reduce((acc, e) => {
    acc[e.statut] = (acc[e.statut] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group by patient, sorted alphabetically
  const grouped: PatientGroup[] = Object.values(
    filtered.reduce((acc, e) => {
      const key = e.patient.id
      if (!acc[key]) acc[key] = { patient: e.patient, examens: [] }
      acc[key].examens.push(e)
      return acc
    }, {} as Record<string, PatientGroup>)
  ).sort((a, b) =>
    `${a.patient.nom} ${a.patient.prenom}`.localeCompare(`${b.patient.nom} ${b.patient.prenom}`, 'fr')
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
          <input className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-300 transition-all w-64"
            placeholder="Rechercher par patient, type..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {canPrescribe && (
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all">
            <Plus className="w-4 h-4" /> Prescrire un examen
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {FILTER_TABS.map(tab => {
          const count  = tab.value === 'TOUTES' ? examens.length : (counts[tab.value] || 0)
          const active = filter === tab.value
          return (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                active ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-sky-200 hover:text-sky-600'
              }`}>
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">
            {search ? 'Aucun résultat' : filter !== 'TOUTES' ? `Aucun examen ${STATUT_LABELS[filter as ExamenStatut]?.toLowerCase()}` : 'Aucun examen prescrit'}
          </p>
          {canPrescribe && !search && filter === 'TOUTES' && (
            <button onClick={() => setOpen(true)} className="mt-4 text-sm text-sky-600 hover:underline">Prescrire un premier examen</button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {grouped.length} patient{grouped.length > 1 ? 's' : ''} · {filtered.length} examen{filtered.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-4">
            {grouped.map(g => (
              <PatientGroupCard key={g.patient.id} group={g} onRefresh={fetchExamens} canAct={canAct} />
            ))}
          </div>
        </>
      )}

      <PrescriptionModal open={open} onClose={() => setOpen(false)} onSuccess={() => { setOpen(false); fetchExamens() }} />
    </div>
  )
}

export { EXAM_TYPES }
