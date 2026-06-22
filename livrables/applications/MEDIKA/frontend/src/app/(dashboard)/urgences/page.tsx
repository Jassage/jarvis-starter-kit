'use client'
import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Activity, Heart, Wind, Thermometer, Droplets, Zap, BedDouble, ClipboardList, X, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface TriageData {
  gcYeux: number
  gcVerbal: number
  gcMoteur: number
  saturationO2: number | ''
  freqRespiratoire: number | ''
  freqCardiaque: number | ''
  tensionSystolique: number | ''
  tensionDiastolique: number | ''
  temperature: number | ''
  douleur: number
  notesTriage: string
}

interface UrgenceEntry {
  id: string
  numero: number
  priorite: string
  statut: string
  motif: string | null
  dateFile: string
  patient: {
    id: string
    prenom: string
    nom: string
    numero: string
    telephone: string
    dateNaissance: string
    groupeSanguin: string | null
    allergies: string | null
  }
  medecin: { id: string; prenom: string; nom: string } | null
  triage: {
    gcYeux: number; gcVerbal: number; gcMoteur: number
    saturationO2: number | null; freqRespiratoire: number | null; freqCardiaque: number | null
    tensionSystolique: number | null; tensionDiastolique: number | null
    temperature: number | null; douleur: number; notesTriage: string | null
    triagedBy: { prenom: string; nom: string } | null; triagedAt: string
  } | null
}

interface Lit {
  id: string
  numero: string
  chambre: { numero: string; etage: number | null; service: { nom: string } | null }
}

const PRIORITY = {
  CRITIQUE: { label: 'Critique', border: 'border-red-400', rowBg: 'bg-red-50', badge: 'bg-red-100 text-red-700 border border-red-300' },
  URGENT:   { label: 'Urgent',   border: 'border-orange-300', rowBg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700 border border-orange-300' },
}

function glasgowScore(g: TriageData) {
  return (Number(g.gcYeux) || 0) + (Number(g.gcVerbal) || 0) + (Number(g.gcMoteur) || 0)
}

function glasgowLabel(score: number) {
  if (score >= 13) return { label: 'Légère', color: 'text-green-600' }
  if (score >= 9)  return { label: 'Modérée', color: 'text-yellow-600' }
  return { label: 'Sévère', color: 'text-red-600' }
}

const GC_YEUX   = [{ v: 4, l: 'Spontanée' }, { v: 3, l: 'Au bruit' }, { v: 2, l: 'À la douleur' }, { v: 1, l: 'Aucune' }]
const GC_VERBAL = [{ v: 5, l: 'Orientée' }, { v: 4, l: 'Confuse' }, { v: 3, l: 'Mots' }, { v: 2, l: 'Sons' }, { v: 1, l: 'Aucune' }]
const GC_MOTEUR = [{ v: 6, l: 'Sur ordre' }, { v: 5, l: 'Localisée' }, { v: 4, l: 'Retrait' }, { v: 3, l: 'Décortication' }, { v: 2, l: 'Décérébration' }, { v: 1, l: 'Aucune' }]

const emptyTriage = (): TriageData => ({
  gcYeux: 4, gcVerbal: 5, gcMoteur: 6,
  saturationO2: '', freqRespiratoire: '', freqCardiaque: '',
  tensionSystolique: '', tensionDiastolique: '',
  temperature: '', douleur: 0, notesTriage: '',
})

export default function UrgencesPage() {
  const { user } = useAuthStore()
  const [entries, setEntries]           = useState<UrgenceEntry[]>([])
  const [loading, setLoading]           = useState(true)

  const [triageTarget, setTriageTarget] = useState<UrgenceEntry | null>(null)
  const [triageForm, setTriageForm]     = useState<TriageData>(emptyTriage())
  const [triageSaving, setTriageSaving] = useState(false)

  const [hospTarget, setHospTarget]     = useState<UrgenceEntry | null>(null)
  const [litsDisponibles, setLitsDisponibles] = useState<Lit[]>([])
  const [hospLitId, setHospLitId]       = useState('')
  const [hospMotif, setHospMotif]       = useState('')
  const [hospSaving, setHospSaving]     = useState(false)

  const canTriage = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')
  const canHosp   = ['ADMIN', 'MEDECIN'].includes(user?.role || '')

  const load = useCallback(async () => {
    try {
      const r = await api.get('/urgences')
      setEntries(r.data.data ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const token = typeof window !== 'undefined' ? localStorage.getItem('medika_token') : null
    if (!token) return
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    const sse = new EventSource(`${apiBase}/events?token=${token}`)
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.resource === 'fileattente' || data.resource === 'urgence-critique') load()
      } catch {}
    }
    return () => sse.close()
  }, [load])

  function openTriageModal(entry: UrgenceEntry) {
    setTriageTarget(entry)
    if (entry.triage) {
      setTriageForm({
        gcYeux: entry.triage.gcYeux, gcVerbal: entry.triage.gcVerbal, gcMoteur: entry.triage.gcMoteur,
        saturationO2: entry.triage.saturationO2 ?? '', freqRespiratoire: entry.triage.freqRespiratoire ?? '',
        freqCardiaque: entry.triage.freqCardiaque ?? '', tensionSystolique: entry.triage.tensionSystolique ?? '',
        tensionDiastolique: entry.triage.tensionDiastolique ?? '', temperature: entry.triage.temperature ?? '',
        douleur: entry.triage.douleur, notesTriage: entry.triage.notesTriage ?? '',
      })
    } else {
      setTriageForm(emptyTriage())
    }
  }

  async function saveTriage() {
    if (!triageTarget) return
    setTriageSaving(true)
    try {
      const body: Record<string, any> = {
        gcYeux: triageForm.gcYeux, gcVerbal: triageForm.gcVerbal, gcMoteur: triageForm.gcMoteur,
        douleur: triageForm.douleur,
        notesTriage: triageForm.notesTriage || undefined,
      }
      if (triageForm.saturationO2 !== '')      body.saturationO2       = Number(triageForm.saturationO2)
      if (triageForm.freqRespiratoire !== '')   body.freqRespiratoire   = Number(triageForm.freqRespiratoire)
      if (triageForm.freqCardiaque !== '')      body.freqCardiaque      = Number(triageForm.freqCardiaque)
      if (triageForm.tensionSystolique !== '')  body.tensionSystolique  = Number(triageForm.tensionSystolique)
      if (triageForm.tensionDiastolique !== '') body.tensionDiastolique = Number(triageForm.tensionDiastolique)
      if (triageForm.temperature !== '')        body.temperature        = Number(triageForm.temperature)
      await api.post(`/urgences/triage/${triageTarget.id}`, body)
      setTriageTarget(null)
      load()
    } catch {}
    setTriageSaving(false)
  }

  async function openHospModal(entry: UrgenceEntry) {
    setHospTarget(entry)
    setHospLitId('')
    setHospMotif(entry.motif ?? '')
    try {
      const r = await api.get('/hospitalisations/chambres')
      const chambres: any[] = r.data.data ?? []
      const lits: Lit[] = []
      for (const ch of chambres) {
        for (const lit of ch.lits ?? []) {
          if (lit.statut === 'DISPONIBLE') {
            lits.push({ id: lit.id, numero: lit.numero, chambre: { numero: ch.numero, etage: ch.etage, service: ch.service } })
          }
        }
      }
      setLitsDisponibles(lits)
    } catch {}
  }

  async function saveHosp() {
    if (!hospTarget || !hospLitId) return
    setHospSaving(true)
    try {
      await api.post(`/urgences/hospitaliser/${hospTarget.id}`, { litId: hospLitId, motif: hospMotif || undefined })
      setHospTarget(null)
      load()
    } catch {}
    setHospSaving(false)
  }

  const score = glasgowScore(triageForm)
  const scoreLabel = glasgowLabel(score)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Urgences</h1>
          <p className="text-slate-500 text-sm">Salle de triage — patients URGENT et CRITIQUE en attente</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Temps réel
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement…</div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
          <Activity className="w-8 h-8 opacity-40" />
          <p>Aucun patient urgent ou critique en attente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => {
            const p = PRIORITY[entry.priorite as keyof typeof PRIORITY] ?? PRIORITY.URGENT
            const age = Math.floor((Date.now() - new Date(entry.patient.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000))
            const hasTriage = !!entry.triage
            const gcTotal = hasTriage ? (entry.triage!.gcYeux + entry.triage!.gcVerbal + entry.triage!.gcMoteur) : null

            return (
              <div key={entry.id} className={cn('bg-white rounded-2xl border-2 shadow-sm', p.border)}>
                <div className={cn('flex items-center gap-3 px-5 py-3 rounded-t-xl flex-wrap', p.rowBg)}>
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', p.badge)}>
                    {entry.priorite === 'CRITIQUE' && '🚨 '}{p.label}
                  </span>
                  <span className="text-slate-500 text-sm">#{entry.numero}</span>
                  <span className="font-semibold text-slate-800">{entry.patient.prenom} {entry.patient.nom}</span>
                  <span className="text-slate-400 text-sm">· {age} ans · {entry.patient.groupeSanguin ?? 'GS ?'}</span>
                  {entry.patient.allergies && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full px-2 py-0.5">⚠ {entry.patient.allergies}</span>
                  )}
                  <span className="ml-auto text-slate-400 text-xs">{new Date(entry.dateFile).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="px-5 py-4 flex flex-wrap gap-6 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-500 mb-1">Motif</p>
                    <p className="text-slate-800 font-medium">{entry.motif || 'Non précisé'}</p>
                    {entry.medecin && <p className="text-xs text-slate-400 mt-1">Dr. {entry.medecin.prenom} {entry.medecin.nom}</p>}
                  </div>

                  {hasTriage ? (
                    <div className="flex flex-wrap gap-3">
                      <VitalBadge icon={<Activity className="w-3.5 h-3.5" />} label="Glasgow" value={`${gcTotal}/15`} warn={gcTotal! < 9} />
                      {entry.triage!.saturationO2 != null && <VitalBadge icon={<Droplets className="w-3.5 h-3.5" />} label="SpO₂" value={`${entry.triage!.saturationO2}%`} warn={entry.triage!.saturationO2 < 94} />}
                      {entry.triage!.freqCardiaque != null && <VitalBadge icon={<Heart className="w-3.5 h-3.5" />} label="FC" value={`${entry.triage!.freqCardiaque} bpm`} warn={entry.triage!.freqCardiaque > 100 || entry.triage!.freqCardiaque < 50} />}
                      {entry.triage!.freqRespiratoire != null && <VitalBadge icon={<Wind className="w-3.5 h-3.5" />} label="FR" value={`${entry.triage!.freqRespiratoire}/min`} warn={entry.triage!.freqRespiratoire > 20 || entry.triage!.freqRespiratoire < 12} />}
                      {entry.triage!.tensionSystolique != null && <VitalBadge icon={<Zap className="w-3.5 h-3.5" />} label="TA" value={`${entry.triage!.tensionSystolique}/${entry.triage!.tensionDiastolique ?? '?'}`} warn={(entry.triage!.tensionSystolique ?? 0) > 140 || (entry.triage!.tensionSystolique ?? 0) < 90} />}
                      {entry.triage!.temperature != null && <VitalBadge icon={<Thermometer className="w-3.5 h-3.5" />} label="Temp" value={`${entry.triage!.temperature}°C`} warn={entry.triage!.temperature > 38.5 || entry.triage!.temperature < 36} />}
                      <VitalBadge icon={null} label="Douleur" value={`${entry.triage!.douleur}/10`} warn={entry.triage!.douleur >= 7} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                      <ClipboardList className="w-4 h-4" />
                      Pas encore trié
                    </div>
                  )}

                  <div className="flex gap-2 ml-auto">
                    {canTriage && (
                      <button onClick={() => openTriageModal(entry)} className="flex items-center gap-1.5 text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors">
                        <ClipboardList className="w-4 h-4" />
                        {hasTriage ? 'Modifier triage' : 'Triager'}
                      </button>
                    )}
                    {canHosp && (
                      <button onClick={() => openHospModal(entry)} className="flex items-center gap-1.5 text-sm px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                        <BedDouble className="w-4 h-4" />
                        Hospitaliser
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal triage */}
      {triageTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setTriageTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Triage — {triageTarget.patient.prenom} {triageTarget.patient.nom}</h2>
                <p className="text-sm text-slate-500">Score de Glasgow + Signes vitaux</p>
              </div>
              <button onClick={() => setTriageTarget(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Score de Glasgow</h3>
                  <div className={cn('text-sm font-bold px-3 py-1 rounded-full bg-slate-100', scoreLabel.color)}>
                    {score}/15 — {scoreLabel.label}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <GCSField label="Ouverture des yeux" options={GC_YEUX}   value={triageForm.gcYeux}   onChange={v => setTriageForm(f => ({ ...f, gcYeux: v }))} />
                  <GCSField label="Réponse verbale"    options={GC_VERBAL} value={triageForm.gcVerbal} onChange={v => setTriageForm(f => ({ ...f, gcVerbal: v }))} />
                  <GCSField label="Réponse motrice"    options={GC_MOTEUR} value={triageForm.gcMoteur} onChange={v => setTriageForm(f => ({ ...f, gcMoteur: v }))} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Signes vitaux</h3>
                <div className="grid grid-cols-2 gap-4">
                  <VitalInput label="SpO₂ (%)"                  value={triageForm.saturationO2}       onChange={v => setTriageForm(f => ({ ...f, saturationO2: v }))}       min={0}  max={100} step={1} />
                  <VitalInput label="Fréq. cardiaque (bpm)"      value={triageForm.freqCardiaque}      onChange={v => setTriageForm(f => ({ ...f, freqCardiaque: v }))}      min={0}  max={300} step={1} />
                  <VitalInput label="Fréq. respiratoire (/min)"  value={triageForm.freqRespiratoire}   onChange={v => setTriageForm(f => ({ ...f, freqRespiratoire: v }))}   min={0}  max={60}  step={1} />
                  <VitalInput label="Température (°C)"           value={triageForm.temperature}        onChange={v => setTriageForm(f => ({ ...f, temperature: v }))}        min={30} max={45}  step={0.1} />
                  <VitalInput label="Tension systolique (mmHg)"  value={triageForm.tensionSystolique}  onChange={v => setTriageForm(f => ({ ...f, tensionSystolique: v }))}  min={0}  max={300} step={1} />
                  <VitalInput label="Tension diastolique (mmHg)" value={triageForm.tensionDiastolique} onChange={v => setTriageForm(f => ({ ...f, tensionDiastolique: v }))} min={0}  max={200} step={1} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Échelle de douleur EVA</h3>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-4">0</span>
                  <input type="range" min={0} max={10} step={1} value={triageForm.douleur}
                    onChange={e => setTriageForm(f => ({ ...f, douleur: Number(e.target.value) }))}
                    className="flex-1 accent-red-500" />
                  <span className="text-slate-500 text-sm w-4">10</span>
                  <span className={cn('font-bold text-lg w-10 text-center', triageForm.douleur >= 7 ? 'text-red-600' : triageForm.douleur >= 4 ? 'text-orange-500' : 'text-green-600')}>
                    {triageForm.douleur}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes de triage</label>
                <textarea rows={3} value={triageForm.notesTriage} onChange={e => setTriageForm(f => ({ ...f, notesTriage: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Observations, contexte, traitement immédiat…" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setTriageTarget(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={saveTriage} disabled={triageSaving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                <Check className="w-4 h-4" />
                {triageSaving ? 'Enregistrement…' : 'Enregistrer le triage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hospitalisation */}
      {hospTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setHospTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hospitalisation d'urgence</h2>
                <p className="text-sm text-slate-500">{hospTarget.patient.prenom} {hospTarget.patient.nom}</p>
              </div>
              <button onClick={() => setHospTarget(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lit disponible</label>
                {litsDisponibles.length === 0 ? (
                  <p className="text-sm text-red-500 py-2">Aucun lit disponible pour le moment.</p>
                ) : (
                  <select value={hospLitId} onChange={e => setHospLitId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner un lit…</option>
                    {litsDisponibles.map(l => (
                      <option key={l.id} value={l.id}>
                        Lit {l.numero} — Chambre {l.chambre.numero}{l.chambre.etage != null ? `, étage ${l.chambre.etage}` : ''}{l.chambre.service ? ` (${l.chambre.service.nom})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motif</label>
                <input type="text" value={hospMotif} onChange={e => setHospMotif(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hospitalisation d'urgence" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setHospTarget(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={saveHosp} disabled={hospSaving || !hospLitId} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                <BedDouble className="w-4 h-4" />
                {hospSaving ? 'Hospitalisation…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VitalBadge({ icon, label, value, warn }: { icon: React.ReactNode | null; label: string; value: string; warn: boolean }) {
  return (
    <div className={cn('flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border text-xs font-medium',
      warn ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600')}>
      {icon && <span className={warn ? 'text-red-500' : 'text-slate-400'}>{icon}</span>}
      <span className="font-bold text-sm">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  )
}

function GCSField({ label, options, value, onChange }: { label: string; options: { v: number; l: string }[]; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="space-y-1">
        {options.map(o => (
          <button key={o.v} onClick={() => onChange(o.v)}
            className={cn('w-full text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors',
              value === o.v ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-slate-50 text-slate-700')}>
            {o.v} — {o.l}
          </button>
        ))}
      </div>
    </div>
  )
}

function VitalInput({ label, value, onChange, min, max, step }: { label: string; value: number | ''; onChange: (v: number | '') => void; min: number; max: number; step: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type="number" min={min} max={max} step={step} value={value}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}
