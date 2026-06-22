'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Combobox } from '@/components/ui/Combobox'
import {
  X, Plus, Pill, ClipboardList, FileText, ChevronRight,
  Check, Clock, AlertTriangle, Ban, RotateCcw, Stethoscope,
  Thermometer, Heart, Wind, Droplets, Activity, AlertCircle,
  ChevronDown, User, Receipt, ExternalLink,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Infirmier { id: string; prenom: string; nom: string }

interface Administration {
  id: string; dateHeure: string; statut: string; note?: string
  infirmier: Infirmier
}

interface Prescription {
  id: string; medicament: string; dosage: string; voie: string
  frequence: string; intervalleH: number; dureeJours?: number
  instructions?: string; statut: string; dateDebut: string; dateFin?: string
  medecin: { prenom: string; nom: string }
  administrations: Administration[]
}

interface SoinInfirmier {
  id: string; date: string
  tension?: string; pouls?: number; temperature?: number
  spo2?: number; freqResp?: number; entrees?: number; sorties?: number
  douleur?: number; actes?: string[]; notes?: string
  infirmier: Infirmier
}

interface SejourInfo {
  id: string; dateAdmission: string; motif?: string; notes?: string
  patient: { id: string; prenom: string; nom: string; numero: string; allergies?: string; antecedents?: string }
  medecin: { prenom: string; nom: string }
  lit: { numero: string; chambre: { numero: string; etage?: number; type: string } }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const VOIE_LABELS: Record<string, string> = {
  ORAL: 'Oral', IV: 'IV', IM: 'IM', SC: 'SC',
  TOPIQUE: 'Topique', INHALATION: 'Inhalation',
  SUBLINGUALE: 'Sub.', RECTALE: 'Rectal',
}
const VOIE_OPTIONS = Object.entries(VOIE_LABELS).map(([v, l]) => ({ value: v, label: l }))

const FREQUENCES_COURANTES = [
  { value: 'Toutes les 4h', label: 'Toutes les 4h', sub: '6x/jour' },
  { value: 'Toutes les 6h', label: 'Toutes les 6h', sub: '4x/jour' },
  { value: 'Toutes les 8h', label: 'Toutes les 8h', sub: '3x/jour' },
  { value: 'Toutes les 12h', label: 'Toutes les 12h', sub: '2x/jour' },
  { value: '1 fois par jour', label: '1 fois par jour', sub: 'Le matin' },
  { value: 'Au besoin (SOS)', label: 'Au besoin (SOS)', sub: 'Si douleur/fièvre' },
]

const ACTES_COURANTS = [
  'Pansement', 'Pose de perfusion', 'Changement de perfusion',
  'Injection IV', 'Injection IM', 'Sondage vésical', 'Aspiration trachéale',
  'Soins de bouche', 'Soins d\'hygiène', 'Prélèvement sanguin',
  'Pose de sonde gastrique', 'Oxygénothérapie',
]

const ADMIN_STATUT_CFG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ADMINISTRE: { label: 'Administré', icon: Check,        color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  OMIS:       { label: 'Omis',       icon: AlertTriangle, color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  REFUSE:     { label: 'Refusé',     icon: Ban,           color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  REPORTE:    { label: 'Reporté',    icon: RotateCcw,     color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200' },
}

const PRESC_STATUT_CFG: Record<string, { label: string; dot: string; text: string }> = {
  ACTIVE:    { label: 'Active',    dot: 'bg-emerald-400', text: 'text-emerald-700' },
  SUSPENDUE: { label: 'Suspendue', dot: 'bg-amber-400',   text: 'text-amber-700' },
  TERMINEE:  { label: 'Terminée', dot: 'bg-slate-400',   text: 'text-slate-500' },
  ANNULEE:   { label: 'Annulée',  dot: 'bg-red-400',     text: 'text-red-600' },
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1'

// ── Picker médicament (catalogue pharmacie) ────────────────────────────────────

interface MedItem { id: string; nom: string; dci?: string | null; dosageForme?: string | null; forme?: string | null; stockActuel: number; seuilAlerte: number; unite: string }

function MedicamentPicker({ value, onChange, onSelect }: {
  value: string
  onChange: (v: string) => void
  onSelect: (m: MedItem) => void
}) {
  const [open, setOpen]     = useState(false)
  const [meds, setMeds]     = useState<MedItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [q, setQ]           = useState('')

  async function load() {
    if (loaded) return
    try {
      const r = await api.get('/pharmacie/medicaments?limit=300&actif=true')
      setMeds(r.data.data || [])
      setLoaded(true)
    } catch {}
  }

  const list = meds.filter(m =>
    !q || m.nom.toLowerCase().includes(q.toLowerCase()) || m.dci?.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 25)

  return (
    <div className="relative">
      <input
        className={inputCls}
        value={value}
        autoComplete="off"
        placeholder="Taper ou choisir dans le catalogue..."
        onChange={e => { onChange(e.target.value); setQ(e.target.value); setOpen(true); load() }}
        onFocus={() => { setOpen(true); load() }}
      />
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
              {list.length === 0 && (
                <p className="text-xs text-slate-400 px-3 py-3">
                  {q ? `Aucun résultat — "${value}" sera saisi tel quel` : 'Commencez à taper pour rechercher'}
                </p>
              )}
              {list.map(m => (
                <button key={m.id} type="button"
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  onClick={() => { onSelect(m); onChange(m.nom); setQ(''); setOpen(false) }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{m.nom}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {m.dci && <span>{m.dci}</span>}
                      {m.dosageForme && <span> · {m.dosageForme}</span>}
                      {m.forme && <span> · {m.forme}</span>}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ${m.stockActuel <= m.seuilAlerte ? 'text-red-600' : 'text-emerald-600'}`}>
                    {m.stockActuel} {m.unite}
                  </span>
                </button>
              ))}
            </div>
            {value && !meds.find(m => m.nom.toLowerCase() === value.toLowerCase()) && (
              <div className="border-t border-slate-100 px-3 py-1.5 bg-blue-50">
                <p className="text-xs text-blue-600">Appuyez sur Entrée pour utiliser <strong>"{value}"</strong> tel quel</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Formulaire de prescription ─────────────────────────────────────────────────

function PrescriptionForm({ sejourId, onDone }: { sejourId: string; onDone: () => void }) {
  const [med, setMed]         = useState('')
  const [dosage, setDosage]   = useState('')
  const [voie, setVoie]       = useState('ORAL')
  const [freq, setFreq]       = useState('')
  const [freqH, setFreqH]     = useState('8')
  const [duree, setDuree]     = useState('')
  const [instruct, setInstruct] = useState('')
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!med.trim() || !dosage.trim() || !freq.trim()) { setErr('Médicament, dosage et fréquence sont requis.'); return }
    setSaving(true); setErr('')
    try {
      await api.post(`/hospitalisations/sejours/${sejourId}/prescriptions`, {
        medicament: med.trim(), dosage: dosage.trim(), voie,
        frequence: freq, intervalleH: Number(freqH) || 8,
        dureeJours: duree ? Number(duree) : undefined,
        instructions: instruct.trim() || undefined,
      })
      onDone()
    } catch (e: any) { setErr(e?.response?.data?.message || 'Erreur.') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nouvelle prescription</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Médicament *</label>
          <MedicamentPicker value={med} onChange={setMed} onSelect={m => {
            if (m.dosageForme && !dosage) setDosage(m.dosageForme)
          }} />
        </div>
        <div>
          <label className={labelCls}>Dosage *</label>
          <input value={dosage} onChange={e => setDosage(e.target.value)} className={inputCls} placeholder="500mg, 1g..." />
        </div>
        <div>
          <label className={labelCls}>Voie</label>
          <Combobox value={voie} onChange={v => setVoie(v || 'ORAL')} clearable={false}
            options={VOIE_OPTIONS} placeholder="Sélectionner..." />
        </div>
      </div>

      <div>
        <label className={labelCls}>Fréquence *</label>
        <Combobox value={freq} onChange={v => {
          setFreq(v)
          const found = FREQUENCES_COURANTES.find(f => f.value === v)
          if (found) {
            const h = v.match(/(\d+)h/) ? Number(v.match(/(\d+)h/)![1]) : 24
            setFreqH(String(h))
          }
        }}
          options={FREQUENCES_COURANTES} placeholder="Rechercher ou choisir une fréquence..." clearable={false} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Durée (jours)</label>
          <input type="number" min={1} value={duree} onChange={e => setDuree(e.target.value)}
            className={inputCls} placeholder="Laisser vide = indéfini" />
        </div>
        <div>
          <label className={labelCls}>Intervalle (heures)</label>
          <input type="number" min={1} max={24} value={freqH} onChange={e => setFreqH(e.target.value)}
            className={inputCls} placeholder="8" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Instructions particulières</label>
        <input value={instruct} onChange={e => setInstruct(e.target.value)} className={inputCls}
          placeholder="À prendre pendant les repas, surveiller la tension..." />
      </div>

      {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onDone}
          className="flex-1 px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
          {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Prescrire
        </button>
      </div>
    </form>
  )
}

// ── Onglet Prescriptions & MAR ─────────────────────────────────────────────────

function PrescriptionsTab({ sejour, canPrescribe, canAdminister }: {
  sejour: SejourInfo; canPrescribe: boolean; canAdminister: boolean
}) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [expandedId, setExpandedId]       = useState<string | null>(null)
  const [adminNote, setAdminNote]         = useState('')
  const [adminStatut, setAdminStatut]     = useState('ADMINISTRE')
  const [adminSaving, setAdminSaving]     = useState<string | null>(null)
  const [statutSaving, setStatutSaving]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const r = await api.get(`/hospitalisations/sejours/${sejour.id}/prescriptions`)
      setPrescriptions(r.data.data || [])
    } catch {} finally { setLoading(false) }
  }, [sejour.id])

  useEffect(() => { fetch() }, [fetch])

  async function recordAdmin(prescriptionId: string) {
    setAdminSaving(prescriptionId)
    try {
      await api.post(`/hospitalisations/prescriptions/${prescriptionId}/administrations`, {
        statut: adminStatut, note: adminNote.trim() || undefined,
      })
      setAdminNote(''); setExpandedId(null)
      fetch()
    } catch {} finally { setAdminSaving(null) }
  }

  async function changeStatut(prescriptionId: string, statut: string) {
    setStatutSaving(prescriptionId)
    try { await api.patch(`/hospitalisations/prescriptions/${prescriptionId}/statut`, { statut }); fetch() }
    catch {} finally { setStatutSaving(null) }
  }

  const actives   = prescriptions.filter(p => p.statut === 'ACTIVE')
  const inactives = prescriptions.filter(p => p.statut !== 'ACTIVE')

  function nextDue(p: Prescription): Date {
    const last = p.administrations[0]
    const base = last ? new Date(last.dateHeure) : new Date(p.dateDebut)
    return new Date(base.getTime() + p.intervalleH * 3_600_000)
  }
  const maintenant = new Date()
  const dus = actives.filter(p => nextDue(p) <= maintenant)
  const retardLabel = (p: Prescription) => {
    const diff = Math.max(0, Math.round((maintenant.getTime() - nextDue(p).getTime()) / 60_000))
    return diff < 60 ? `${diff} min de retard` : `${Math.round(diff / 60)}h de retard`
  }

  if (loading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>

  return (
    <div className="space-y-4">

      {/* Médicaments dus maintenant */}
      {canAdminister && dus.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              {dus.length} médicament{dus.length > 1 ? 's' : ''} à administrer maintenant
            </p>
          </div>
          <div className="space-y-1.5">
            {dus.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-3 py-2 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.medicament}</p>
                  <p className="text-xs text-slate-500">{p.dosage} · {p.frequence}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {retardLabel(p)}
                  </span>
                  <button
                    onClick={() => { setExpandedId(p.id); setAdminStatut('ADMINISTRE') }}
                    className="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1 rounded-lg transition-colors">
                    Administrer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allergies warning */}
      {sejour.patient.allergies && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-800">Allergies connues</p>
            <p className="text-xs text-red-700 mt-0.5">{sejour.patient.allergies}</p>
          </div>
        </div>
      )}

      {canPrescribe && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />Nouvelle prescription
        </button>
      )}

      {showForm && <PrescriptionForm sejourId={sejour.id} onDone={() => { setShowForm(false); fetch() }} />}

      {prescriptions.length === 0 && !showForm && (
        <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl">
          <Pill className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aucune prescription pour ce séjour</p>
        </div>
      )}

      {actives.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Prescriptions actives ({actives.length})</p>
          {actives.map(p => <PrescriptionCard key={p.id} p={p} expanded={expandedId === p.id}
            onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
            canAdminister={canAdminister} canPrescribe={canPrescribe}
            adminNote={expandedId === p.id ? adminNote : ''}
            onAdminNoteChange={setAdminNote}
            adminStatut={adminStatut} onAdminStatutChange={setAdminStatut}
            onRecord={() => recordAdmin(p.id)}
            adminSaving={adminSaving === p.id}
            onChangeStatut={(s) => changeStatut(p.id, s)}
            statutSaving={statutSaving === p.id}
          />)}
        </div>
      )}

      {inactives.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Historique ({inactives.length})</p>
          {inactives.map(p => <PrescriptionCard key={p.id} p={p} expanded={false}
            onToggle={() => {}} canAdminister={false} canPrescribe={false}
            adminNote="" onAdminNoteChange={() => {}}
            adminStatut="ADMINISTRE" onAdminStatutChange={() => {}}
            onRecord={() => {}} adminSaving={false}
            onChangeStatut={() => {}} statutSaving={false}
          />)}
        </div>
      )}
    </div>
  )
}

function PrescriptionCard({ p, expanded, onToggle, canAdminister, canPrescribe, adminNote, onAdminNoteChange, adminStatut, onAdminStatutChange, onRecord, adminSaving, onChangeStatut, statutSaving }: {
  p: Prescription; expanded: boolean; onToggle: () => void
  canAdminister: boolean; canPrescribe: boolean
  adminNote: string; onAdminNoteChange: (v: string) => void
  adminStatut: string; onAdminStatutChange: (v: string) => void
  onRecord: () => void; adminSaving: boolean
  onChangeStatut: (s: string) => void; statutSaving: boolean
}) {
  const cfg = PRESC_STATUT_CFG[p.statut] || PRESC_STATUT_CFG.ACTIVE
  const lastAdmin = p.administrations[0]

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${p.statut !== 'ACTIVE' ? 'opacity-60' : 'border-slate-200'}`}>
      <div className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer hover:bg-slate-50 transition-colors" onClick={onToggle}>
        <div className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-bold text-slate-900 truncate">{p.medicament}</p>
            <span className="text-xs text-slate-500 shrink-0">{p.dosage}</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">{VOIE_LABELS[p.voie] || p.voie}</span>
          </div>
          <p className="text-xs text-slate-400">{p.frequence} · Dr. {p.medecin.prenom} {p.medecin.nom}</p>
        </div>
        {lastAdmin && (
          <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${ADMIN_STATUT_CFG[lastAdmin.statut]?.bg || ''} ${ADMIN_STATUT_CFG[lastAdmin.statut]?.color || ''}`}>
            {ADMIN_STATUT_CFG[lastAdmin.statut]?.label || lastAdmin.statut}
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
          {p.instructions && (
            <p className="text-xs text-slate-600 italic border-l-2 border-blue-300 pl-2">{p.instructions}</p>
          )}

          {/* Historique administrations */}
          {p.administrations.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Dernières administrations</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {p.administrations.slice(0, 6).map(a => {
                  const ac = ADMIN_STATUT_CFG[a.statut] || ADMIN_STATUT_CFG.ADMINISTRE
                  return (
                    <div key={a.id} className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-xs ${ac.bg}`}>
                      <ac.icon className={`w-3 h-3 ${ac.color} shrink-0`} />
                      <span className={`font-semibold ${ac.color}`}>{ac.label}</span>
                      <span className="text-slate-500 flex-1">{a.infirmier.prenom} {a.infirmier.nom}</span>
                      <span className="text-slate-400">
                        {new Date(a.dateHeure).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Enregistrer une administration */}
          {canAdminister && p.statut === 'ACTIVE' && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Enregistrer une administration</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ADMIN_STATUT_CFG).map(([key, c]) => (
                  <button key={key} type="button"
                    onClick={() => onAdminStatutChange(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${adminStatut === key ? `${c.bg} ${c.color} ring-1 ring-current` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <c.icon className="w-3 h-3 shrink-0" />{c.label}
                  </button>
                ))}
              </div>
              <input value={adminNote} onChange={e => onAdminNoteChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                placeholder="Note optionnelle (raison omission, réaction...)" />
              <button onClick={onRecord} disabled={adminSaving}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                {adminSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <Check className="w-3.5 h-3.5" />Enregistrer
              </button>
            </div>
          )}

          {/* Changer statut prescription (médecin) */}
          {canPrescribe && p.statut === 'ACTIVE' && (
            <div className="flex gap-2 pt-1 border-t border-slate-200">
              <button onClick={() => onChangeStatut('SUSPENDUE')} disabled={statutSaving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50">
                Suspendre
              </button>
              <button onClick={() => onChangeStatut('TERMINEE')} disabled={statutSaving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors disabled:opacity-50">
                Terminer
              </button>
              <button onClick={() => onChangeStatut('ANNULEE')} disabled={statutSaving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50">
                Annuler
              </button>
            </div>
          )}
          {canPrescribe && p.statut === 'SUSPENDUE' && (
            <div className="flex gap-2 pt-1 border-t border-slate-200">
              <button onClick={() => onChangeStatut('ACTIVE')} disabled={statutSaving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50">
                Réactiver
              </button>
              <button onClick={() => onChangeStatut('ANNULEE')} disabled={statutSaving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50">
                Annuler
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Onglet Soins infirmiers ────────────────────────────────────────────────────

function SoinsTab({ sejour, canAdd }: { sejour: SejourInfo; canAdd: boolean }) {
  const [soins, setSoins]       = useState<SoinInfirmier[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [tension, setTension]       = useState('')
  const [pouls, setPouls]           = useState('')
  const [temp, setTemp]             = useState('')
  const [spo2, setSpo2]             = useState('')
  const [freqResp, setFreqResp]     = useState('')
  const [entrees, setEntrees]       = useState('')
  const [sorties, setSorties]       = useState('')
  const [douleur, setDouleur]       = useState('')
  const [actesSelected, setActesSelected] = useState<string[]>([])
  const [notes, setNotes]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [err, setErr]               = useState('')

  const fetch = useCallback(async () => {
    try {
      const r = await api.get(`/hospitalisations/sejours/${sejour.id}/soins`)
      setSoins(r.data.data || [])
    } catch {} finally { setLoading(false) }
  }, [sejour.id])

  useEffect(() => { fetch() }, [fetch])

  async function submitSoin(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      await api.post(`/hospitalisations/sejours/${sejour.id}/soins`, {
        tension: tension.trim() || undefined,
        pouls:   pouls     ? Number(pouls)    : undefined,
        temperature: temp  ? Number(temp)     : undefined,
        spo2:    spo2      ? Number(spo2)     : undefined,
        freqResp: freqResp ? Number(freqResp) : undefined,
        entrees: entrees   ? Number(entrees)  : undefined,
        sorties: sorties   ? Number(sorties)  : undefined,
        douleur: douleur   ? Number(douleur)  : undefined,
        actes:   actesSelected.length > 0 ? actesSelected : undefined,
        notes:   notes.trim() || undefined,
      })
      setTension(''); setPouls(''); setTemp(''); setSpo2(''); setFreqResp('')
      setEntrees(''); setSorties(''); setDouleur(''); setActesSelected([]); setNotes('')
      setShowForm(false); fetch()
    } catch (e: any) { setErr(e?.response?.data?.message || 'Erreur.') }
    finally { setSaving(false) }
  }

  function toggleActe(a: string) {
    setActesSelected(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const douleurNum = Number(douleur)
  const douleurColor = !douleur ? 'text-slate-400' : douleurNum <= 3 ? 'text-emerald-600' : douleurNum <= 6 ? 'text-amber-600' : 'text-red-600'

  if (loading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>

  return (
    <div className="space-y-4">
      {canAdd && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />Nouvelle feuille de soins
        </button>
      )}

      {showForm && (
        <form onSubmit={submitSoin} className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Feuille de soins</p>

          {/* Signes vitaux */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />Signes vitaux
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Tension (mmHg)</label>
                <input value={tension} onChange={e => setTension(e.target.value)} className={inputCls} placeholder="120/80" />
              </div>
              <div>
                <label className={labelCls}>Pouls (bpm)</label>
                <input type="number" value={pouls} onChange={e => setPouls(e.target.value)} className={inputCls} placeholder="72" />
              </div>
              <div>
                <label className={labelCls}>Température (°C)</label>
                <input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} className={inputCls} placeholder="37.0" />
              </div>
              <div>
                <label className={labelCls}>SpO2 (%)</label>
                <input type="number" min={0} max={100} value={spo2} onChange={e => setSpo2(e.target.value)} className={inputCls} placeholder="98" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Fréquence respiratoire (c/min)</label>
                <input type="number" value={freqResp} onChange={e => setFreqResp(e.target.value)} className={inputCls} placeholder="16" />
              </div>
            </div>
          </div>

          {/* Bilan hydrique */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <Droplets className="w-3 h-3" />Bilan hydrique
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Entrées (mL)</label>
                <input type="number" min={0} value={entrees} onChange={e => setEntrees(e.target.value)} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Sorties (mL)</label>
                <input type="number" min={0} value={sorties} onChange={e => setSorties(e.target.value)} className={inputCls} placeholder="0" />
              </div>
            </div>
          </div>

          {/* Douleur */}
          <div>
            <label className={labelCls}>Score douleur (0-10)</label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={10} value={douleur || 0}
                onChange={e => setDouleur(e.target.value)} className="flex-1 accent-blue-600" />
              <span className={`text-lg font-bold w-8 text-center ${douleurColor}`}>
                {douleur || 0}
              </span>
            </div>
          </div>

          {/* Actes */}
          <div>
            <label className={labelCls}>Actes réalisés</label>
            <div className="flex flex-wrap gap-1.5">
              {ACTES_COURANTS.map(a => (
                <button key={a} type="button" onClick={() => toggleActe(a)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${actesSelected.includes(a) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes infirmières</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Observations, comportement, évolution du patient..." />
          </div>

          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
              {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {soins.length === 0 && !showForm && (
        <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl">
          <ClipboardList className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aucune feuille de soins enregistrée</p>
        </div>
      )}

      {soins.map(s => <SoinCard key={s.id} soin={s} />)}
    </div>
  )
}

function SoinCard({ soin }: { soin: SoinInfirmier }) {
  const douleurColor = !soin.douleur ? 'text-slate-400' : soin.douleur <= 3 ? 'text-emerald-600' : soin.douleur <= 6 ? 'text-amber-600' : 'text-red-600'
  const bilan = soin.entrees != null && soin.sorties != null ? soin.entrees - soin.sorties : null

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-700">{soin.infirmier.prenom} {soin.infirmier.nom}</p>
        </div>
        <p className="text-xs text-slate-400">
          {new Date(soin.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Vitaux */}
      {(soin.tension || soin.pouls || soin.temperature || soin.spo2 || soin.freqResp) && (
        <div className="grid grid-cols-3 gap-2">
          {soin.tension && <Vital icon={Activity}  label="Tension"  value={soin.tension} unit="mmHg" />}
          {soin.pouls   && <Vital icon={Heart}      label="Pouls"    value={String(soin.pouls)} unit="bpm" />}
          {soin.temperature && <Vital icon={Thermometer} label="Temp." value={String(soin.temperature)} unit="°C"
            alert={soin.temperature > 38.5 || soin.temperature < 36} />}
          {soin.spo2    && <Vital icon={Wind}        label="SpO2"    value={String(soin.spo2)} unit="%"
            alert={soin.spo2 < 95} />}
          {soin.freqResp && <Vital icon={Wind}       label="FR"      value={String(soin.freqResp)} unit="c/min" />}
          {soin.douleur != null && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center">
              <p className="text-[9px] text-slate-400 uppercase">Douleur</p>
              <p className={`text-base font-bold ${douleurColor}`}>{soin.douleur}/10</p>
            </div>
          )}
        </div>
      )}

      {/* Bilan hydrique */}
      {(soin.entrees != null || soin.sorties != null) && (
        <div className="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2">
          <Droplets className="w-3.5 h-3.5 text-sky-600" />
          <div className="flex gap-4 text-xs">
            {soin.entrees  != null && <span><span className="text-slate-500">E:</span> <span className="font-semibold text-sky-700">{soin.entrees} mL</span></span>}
            {soin.sorties  != null && <span><span className="text-slate-500">S:</span> <span className="font-semibold text-sky-700">{soin.sorties} mL</span></span>}
            {bilan != null && <span><span className="text-slate-500">Bilan:</span> <span className={`font-bold ${bilan >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{bilan > 0 ? '+' : ''}{bilan} mL</span></span>}
          </div>
        </div>
      )}

      {/* Actes */}
      {soin.actes && soin.actes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {soin.actes.map(a => (
            <span key={a} className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-medium">{a}</span>
          ))}
        </div>
      )}

      {/* Notes */}
      {soin.notes && <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2">{soin.notes}</p>}
    </div>
  )
}

function Vital({ icon: Icon, label, value, unit, alert = false }: {
  icon: any; label: string; value: string; unit: string; alert?: boolean
}) {
  return (
    <div className={`rounded-xl p-2 text-center border ${alert ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
      <p className="text-[9px] text-slate-400 uppercase">{label}</p>
      <p className={`text-sm font-bold ${alert ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
      <p className={`text-[9px] ${alert ? 'text-red-400' : 'text-slate-400'}`}>{unit}</p>
    </div>
  )
}

// ── Onglet Notes ───────────────────────────────────────────────────────────────

function NotesTab({ sejour }: { sejour: SejourInfo }) {
  return (
    <div className="space-y-4">
      {/* Infos du séjour */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Admission</span>
          <span className="font-medium">{new Date(sejour.dateAdmission).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Médecin</span>
          <span className="font-medium">Dr. {sejour.medecin.prenom} {sejour.medecin.nom}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Chambre</span>
          <span className="font-medium">
            Ch. {sejour.lit.chambre.numero} — Lit {sejour.lit.numero}
            {sejour.lit.chambre.etage != null && ` · Étage ${sejour.lit.chambre.etage}`}
          </span>
        </div>
        {sejour.motif && (
          <div className="pt-1 border-t border-slate-200">
            <span className="text-slate-400 block text-xs mb-1">Motif d'admission</span>
            <span className="text-slate-700">{sejour.motif}</span>
          </div>
        )}
      </div>

      {sejour.patient.antecedents && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />Antécédents médicaux
          </p>
          <p className="text-xs text-amber-700">{sejour.patient.antecedents}</p>
        </div>
      )}

      {sejour.notes ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Notes du séjour</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{sejour.notes}</p>
        </div>
      ) : (
        <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl">
          <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aucune note pour ce séjour</p>
          <p className="text-xs text-slate-300 mt-1">Les notes s'ajoutent lors de la sortie</p>
        </div>
      )}
    </div>
  )
}

// ── Panneau principal DossierSejour ───────────────────────────────────────────

const TABS = [
  { id: 'prescriptions', label: 'Traitements', icon: Pill },
  { id: 'soins',         label: 'Soins',        icon: ClipboardList },
  { id: 'notes',         label: 'Notes',        icon: FileText },
] as const
type DossierTab = typeof TABS[number]['id']

export function DossierSejour({ sejourId, onClose }: { sejourId: string; onClose: () => void }) {
  const { user }    = useAuthStore()
  const [tab, setTab]         = useState<DossierTab>('prescriptions')
  const [sejour, setSejour]   = useState<SejourInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [factureExist, setFactureExist]   = useState<{ id: string; numero: string } | null | undefined>(undefined)
  const [genLoading, setGenLoading]       = useState(false)
  const [genErr, setGenErr]               = useState('')

  const role = user?.role || ''
  const canPrescribe  = ['ADMIN', 'MEDECIN'].includes(role)
  const canAdminister = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(role)
  const canAddSoins   = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(role)
  const canBill       = ['ADMIN', 'CAISSIER', 'MEDECIN'].includes(role)

  useEffect(() => {
    api.get(`/hospitalisations/sejours/${sejourId}`)
      .then(r => setSejour(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    api.get(`/hospitalisations/sejours/${sejourId}/facture`)
      .then(r => setFactureExist(r.data.data || null))
      .catch(() => setFactureExist(null))
  }, [sejourId])

  async function genererFacture() {
    setGenLoading(true); setGenErr('')
    try {
      const r = await api.post(`/hospitalisations/sejours/${sejourId}/facture`)
      setFactureExist(r.data.data)
    } catch (e: unknown) {
      setGenErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur de génération')
    } finally { setGenLoading(false) }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panneau */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="shrink-0 border-b border-slate-100">
          {loading ? (
            <div className="h-20 px-6 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-40" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
              </div>
            </div>
          ) : sejour ? (
            <>
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                {sejour.patient.prenom[0]}{sejour.patient.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{sejour.patient.prenom} {sejour.patient.nom}</p>
                <p className="text-xs text-slate-400">
                  {sejour.patient.numero} · Ch. {sejour.lit.chambre.numero} — Lit {sejour.lit.numero}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canBill && (
                  factureExist ? (
                    <a href={`/factures?id=${factureExist.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl transition-colors">
                      <Receipt className="w-3.5 h-3.5" />
                      {factureExist.numero}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : factureExist === null ? (
                    <button onClick={genererFacture} disabled={genLoading}
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 px-2.5 py-1.5 rounded-xl transition-colors disabled:opacity-50">
                      {genLoading
                        ? <div className="w-3 h-3 border-2 border-violet-300 border-t-violet-700 rounded-full animate-spin" />
                        : <Receipt className="w-3.5 h-3.5" />}
                      {genLoading ? 'Génération...' : 'Générer la facture'}
                    </button>
                  ) : null
                )}
                <button onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
            {genErr && (
              <p className="mx-6 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{genErr}
              </p>
            )}
            </>
          ) : null}

          {/* Onglets */}
          <div className="flex border-t border-slate-100">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold border-b-2 transition-all ${
                  tab === t.id ? 'border-blue-600 text-blue-700 bg-blue-50/40' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>}
          {!loading && sejour && tab === 'prescriptions' && (
            <PrescriptionsTab sejour={sejour} canPrescribe={canPrescribe} canAdminister={canAdminister} />
          )}
          {!loading && sejour && tab === 'soins' && (
            <SoinsTab sejour={sejour} canAdd={canAddSoins} />
          )}
          {!loading && sejour && tab === 'notes' && (
            <NotesTab sejour={sejour} />
          )}
        </div>
      </div>
    </>
  )
}
