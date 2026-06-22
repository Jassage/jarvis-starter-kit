'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Examen, ExamenStatut, Facture, FactureStatut } from '@/types'
import { DossierSejour } from '../../hospitalisations/DossierSejour'
import { printDossierPatient } from '@/lib/print'
import {
  ArrowLeft, Phone, MapPin, Droplets, Calendar, Stethoscope,
  FileText, AlertTriangle, Clock, Plus,
  CheckCircle2, Activity, User, ClipboardList, CreditCard,
  HeartPulse, Pill, StickyNote, Archive, FlaskConical, Pencil, X,
  BedDouble, Building2, ChevronRight, FolderOpen, History, Download
} from 'lucide-react'

// ─── Types enrichis ───────────────────────────────────────────────────────────

interface ConsultationDetail {
  id: string; date: string; diagnostic?: string; notes?: string
  prescriptions?: string; signesVitaux?: Record<string, unknown>
  medecin: { id: string; prenom: string; nom: string }
}

interface AppointmentDetail {
  id: string; dateHeure: string; statut: string; motif?: string
  medecin: { prenom: string; nom: string }
  service: { nom: string }
}

interface ExamenDetail extends Omit<Examen, 'patient' | 'consultation'> {
  medecin: { id: string; prenom: string; nom: string }
}

interface SejourEnCours {
  id: string
  dateAdmission: string
  motif?: string
  medecin: { prenom: string; nom: string }
  lit: {
    numero: string
    chambre: {
      numero: string
      etage?: number
      type: string
      service?: { nom: string }
    }
  }
}

interface PatientDetail {
  id: string; numero: string; prenom: string; nom: string
  dateNaissance: string; sexe: 'M' | 'F'; telephone: string
  adresse?: string; groupeSanguin?: string; antecedents?: string
  allergies?: string; actif: boolean; createdAt: string
  consultations: ConsultationDetail[]
  appointments: AppointmentDetail[]
  factures: Facture[]
  examens: ExamenDetail[]
  sejourEnCours?: SejourEnCours | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function age(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(d: string) {
  const dt = new Date(d)
  return `${dt.toLocaleDateString('fr-FR')} à ${dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

const statutColors: Record<string, { color: string; bg: string; label: string }> = {
  PLANIFIE:        { color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    label: 'Planifié' },
  EN_ATTENTE:      { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',  label: 'En attente' },
  EN_CONSULTATION: { color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200',label: 'En cours' },
  TERMINE:         { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',label: 'Terminé' },
  ANNULE:          { color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200', label: 'Annulé' },
}

const examenStatutColors: Record<ExamenStatut, { color: string; bg: string; label: string }> = {
  EN_ATTENTE:          { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',    label: 'En attente' },
  EN_COURS:            { color: 'text-sky-700',     bg: 'bg-sky-50 border-sky-200',        label: 'En cours' },
  RESULTAT_DISPONIBLE: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',label: 'Résultat dispo.' },
  ANNULE:              { color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200',   label: 'Annulé' },
}

const factureStatutColors: Record<FactureStatut, { color: string; bg: string; label: string }> = {
  EN_ATTENTE:         { color: 'text-red-700',     bg: 'bg-red-50 border-red-200',      label: 'Impayée' },
  PARTIELLEMENT_PAYE: { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',  label: 'Partielle' },
  PAYE:               { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',label: 'Payée' },
  ANNULE:             { color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200', label: 'Annulée' },
}

const avatarColors = [
  'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600',
  'from-teal-400 to-teal-600', 'from-rose-400 to-rose-600', 'from-amber-400 to-amber-600',
]

// ─── Sections ─────────────────────────────────────────────────────────────────

function Section({ icon, label, color, children, action }: {
  icon: React.ReactNode; label: string; color: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center`}>{icon}</div>
          <h3 className="font-semibold text-slate-900 text-sm">{label}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return <p className="text-sm text-slate-400 italic text-center py-4">{msg}</p>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const EDIT_ROLES = ['ADMIN', 'ACCUEIL', 'MEDECIN']

interface EditForm {
  telephone: string; adresse: string; groupeSanguin: string
  antecedents: string; allergies: string
}

function EditModal({ patient, onClose, onSaved }: {
  patient: PatientDetail
  onClose: () => void
  onSaved: (updated: Partial<PatientDetail>) => void
}) {
  const [form, setForm] = useState<EditForm>({
    telephone:    patient.telephone,
    adresse:      patient.adresse || '',
    groupeSanguin: patient.groupeSanguin || '',
    antecedents:  patient.antecedents || '',
    allergies:    patient.allergies || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function set(k: keyof EditForm, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.telephone.trim()) { setErr('Le téléphone est requis.'); return }
    setSaving(true); setErr('')
    try {
      const payload = {
        telephone:    form.telephone.trim(),
        adresse:      form.adresse.trim() || null,
        groupeSanguin: form.groupeSanguin || null,
        antecedents:  form.antecedents.trim() || null,
        allergies:    form.allergies.trim() || null,
      }
      await api.put(`/patients/${patient.id}`, payload)
      onSaved(payload as Partial<PatientDetail>)
      onClose()
    } catch {
      setErr('Erreur lors de la sauvegarde.')
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all'
  const labelCls = 'block text-xs font-semibold text-slate-500 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Modifier le dossier</h2>
            <p className="text-xs text-slate-400 mt-0.5">{patient.prenom} {patient.nom} · {patient.numero}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div>
            <label className={labelCls}>Téléphone *</label>
            <input className={inputCls} value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="509-XXXX-XXXX" />
          </div>

          <div>
            <label className={labelCls}>Adresse</label>
            <input className={inputCls} value={form.adresse} onChange={e => set('adresse', e.target.value)} placeholder="Rue, quartier, ville..." />
          </div>

          <div>
            <label className={labelCls}>Groupe sanguin</label>
            <select className={inputCls} value={form.groupeSanguin} onChange={e => set('groupeSanguin', e.target.value)}>
              <option value="">Non renseigné</option>
              {GROUPES_SANGUINS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Antécédents médicaux</label>
            <textarea rows={3} className={`${inputCls} resize-none`} value={form.antecedents} onChange={e => set('antecedents', e.target.value)}
              placeholder="Hypertension, diabète, chirurgies passées..." />
          </div>

          <div>
            <label className={`${labelCls} text-amber-600`}>Allergies connues</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.allergies} onChange={e => set('allergies', e.target.value)}
              placeholder="Pénicilline, aspirine, latex..." />
          </div>

          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface SejourHistorique {
  id: string; dateAdmission: string; dateSortie?: string; motif?: string; statut: string
  medecin: { prenom: string; nom: string }
  lit: { numero: string; chambre: { numero: string; type: string; service?: { nom: string } } }
}

interface PrescriptionActive {
  id: string; medicament: string; dosage: string; voie: string; frequence: string; statut: string
  medecin: { prenom: string; nom: string }
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState(false)
  const [editing, setEditing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dossierSejourId, setDossierSejourId] = useState<string | null>(null)
  const [sejours, setSejours] = useState<SejourHistorique[]>([])
  const [prescriptionsActives, setPrescriptionsActives] = useState<PrescriptionActive[]>([])

  const canEdit          = user?.role && EDIT_ROLES.includes(user.role)
  const canAccessDossier = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')
  const canConsulter     = ['ADMIN', 'MEDECIN'].includes(user?.role || '')
  const canPrescrire     = ['ADMIN', 'MEDECIN'].includes(user?.role || '')
  const canFacturer      = ['ADMIN', 'CAISSIER', 'MEDECIN'].includes(user?.role || '')

  async function handleToggleActif() {
    setToggling(true)
    try {
      const r = await api.patch(`/patients/${id}/actif`, {})
      setPatient(p => p ? { ...p, actif: r.data.data.actif } : p)
    } catch {} finally { setToggling(false) }
  }

  async function handleExportPdf() {
    if (!patient) return
    setExporting(true)
    try {
      await printDossierPatient(patient, sejours, prescriptionsActives)
    } finally { setExporting(false) }
  }

  useEffect(() => {
    async function fetch() {
      try {
        const [patRes, sejoursRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/hospitalisations/sejours?patientId=${id}`).catch(() => ({ data: { data: [] } })),
        ])
        const pat = patRes.data.data
        setPatient(pat)
        setSejours(sejoursRes.data.data || [])

        // Prescriptions actives si séjour en cours
        if (pat.sejourEnCours?.id) {
          api.get(`/hospitalisations/sejours/${pat.sejourEnCours.id}/prescriptions`)
            .then(r => setPrescriptionsActives((r.data.data || []).filter((p: any) => p.statut === 'ACTIVE')))
            .catch(() => {})
        }
      } catch {
        setError('Patient introuvable')
      } finally { setLoading(false) }
    }
    if (id) fetch()
  }, [id])

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-slate-100 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  )

  if (error || !patient) return (
    <div className="text-center py-20">
      <p className="font-semibold text-slate-500">{error || 'Erreur de chargement'}</p>
      <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">Retour</button>
    </div>
  )

  const patientAge    = age(patient.dateNaissance)
  const color         = avatarColors[(patient.prenom.charCodeAt(0) + patient.nom.charCodeAt(0)) % avatarColors.length]
  const initials      = `${patient.prenom[0]}${patient.nom[0]}`.toUpperCase()
  const totalImpayes  = patient.factures.filter(f => ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'].includes(f.statut)).reduce((s, f) => s + (f.montantTotal - f.montantPaye), 0)
  const upcoming      = patient.appointments.filter(a => new Date(a.dateHeure) > new Date() && a.statut !== 'ANNULE')
  const lastVitals    = patient.consultations.find(c => c.signesVitaux)

  function handleSaved(updated: Partial<PatientDetail>) {
    setPatient(p => p ? { ...p, ...updated } : p)
  }

  return (
    <div className="space-y-5">

      {editing && patient && (
        <EditModal patient={patient} onClose={() => setEditing(false)} onSaved={handleSaved} />
      )}
      {dossierSejourId && (
        <DossierSejour sejourId={dossierSejourId} onClose={() => setDossierSejourId(null)} />
      )}

      {/* Bouton retour */}
      <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />Retour aux patients
      </Link>

      {/* ── Header patient ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className={`h-2 bg-linear-to-r ${color}`} />
        <div className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className={`w-16 h-16 bg-linear-to-br ${color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white text-xl font-bold`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{patient.prenom} {patient.nom}</h1>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{patient.numero}</span>
                    <span className="text-sm text-slate-500">{patientAge} ans · {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                    {patient.groupeSanguin && (
                      <span className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full">
                        <Droplets className="w-3 h-3" />{patient.groupeSanguin}
                      </span>
                    )}
                    {!patient.actif && <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Inactif</span>}
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex gap-2 flex-wrap">
                  {canEdit && (
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-all">
                      <Pencil className="w-3.5 h-3.5" />Modifier
                    </button>
                  )}
                  {canAccessDossier && (
                    <button onClick={handleExportPdf} disabled={exporting}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all disabled:opacity-50">
                      {exporting
                        ? <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin" />
                        : <Download className="w-3.5 h-3.5" />}
                      Dossier PDF
                    </button>
                  )}
                  <Link href={`/appointments?patientId=${patient.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl transition-all">
                    <Calendar className="w-3.5 h-3.5" />Rendez-vous
                  </Link>
                  {canConsulter && (
                    <Link href={`/consultations`}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all">
                      <Stethoscope className="w-3.5 h-3.5" />Consultation
                    </Link>
                  )}
                  {canFacturer && (
                    <Link href={`/factures`}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl transition-all">
                      <FileText className="w-3.5 h-3.5" />Facture
                    </Link>
                  )}
                  {canConsulter && (
                    <button onClick={handleToggleActif} disabled={toggling}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border rounded-xl transition-all disabled:opacity-50
                        ${patient.actif
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                      {toggling
                        ? <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                        : patient.actif ? <Archive className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {patient.actif ? 'Archiver' : 'Réactiver'}
                    </button>
                  )}
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Consultations', value: patient.consultations.length, icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Rendez-vous', value: patient.appointments.length, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Factures', value: patient.factures.length, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { label: 'Impayés', value: `${totalImpayes.toLocaleString('fr-FR')} G`, icon: totalImpayes > 0 ? AlertTriangle : CheckCircle2, color: totalImpayes > 0 ? 'text-red-600' : 'text-emerald-600', bg: totalImpayes > 0 ? 'bg-red-50' : 'bg-emerald-50' },
                ].map(k => (
                  <div key={k.label} className={`${k.bg} rounded-xl p-3 flex items-center gap-2.5`}>
                    <k.icon className={`w-4 h-4 ${k.color} shrink-0`} />
                    <div>
                      <p className={`text-sm font-bold ${k.color}`}>{k.value}</p>
                      <p className="text-[10px] text-slate-400">{k.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Séjour en cours ── */}
      {patient.sejourEnCours && (() => {
        const s = patient.sejourEnCours!
        const from = new Date(s.dateAdmission)
        const h = Math.floor((Date.now() - from.getTime()) / 3600000)
        const duree = h < 24 ? `${h}h` : `${Math.floor(h / 24)}j ${h % 24}h`
        const TYPE_LABELS: Record<string, string> = {
          STANDARD: 'Standard', SOINS_INTENSIFS: 'Soins intensifs',
          MATERNITE: 'Maternité', PEDIATRIE: 'Pédiatrie', ISOLEMENT: 'Isolement',
        }
        return (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-red-100 border-b border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-red-700 uppercase tracking-wide">Patient actuellement hospitalisé</span>
            </div>
            <div className="p-5 flex items-start gap-5 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 border-2 border-red-200 rounded-2xl flex items-center justify-center shrink-0">
                  <BedDouble className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">Chambre {s.lit.chambre.numero} — Lit {s.lit.numero}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-500">
                    {s.lit.chambre.etage != null && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {s.lit.chambre.etage === 0 ? 'Rez-de-chaussée' : `Étage ${s.lit.chambre.etage}`}
                      </span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span>{TYPE_LABELS[s.lit.chambre.type] || s.lit.chambre.type}</span>
                    {s.lit.chambre.service && (
                      <><span className="text-slate-300">·</span><span>{s.lit.chambre.service.nom}</span></>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 flex-wrap text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Admis le</p>
                  <p className="font-semibold text-slate-800">{new Date(s.dateAdmission).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Durée</p>
                  <p className="font-semibold text-slate-800">{duree}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Médecin référent</p>
                  <p className="font-semibold text-slate-800">Dr. {s.medecin.prenom} {s.medecin.nom}</p>
                </div>
                {s.motif && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Motif</p>
                    <p className="font-semibold text-slate-800">{s.motif}</p>
                  </div>
                )}
              </div>
              <Link href="/hospitalisations"
                className="ml-auto self-center flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 px-3 py-2 rounded-xl transition-colors shrink-0">
                Voir hospitalisations <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )
      })()}

      {/* ── Infos + Prochain RDV ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Identité & contact */}
        <Section icon={<User className="w-3.5 h-3.5 text-blue-600" />} label="Dossier patient" color="bg-blue-50">
          <dl className="space-y-3">
            {[
              { label: 'Né(e) le', value: fmtDate(patient.dateNaissance) },
              { label: 'Téléphone', value: patient.telephone, icon: <Phone className="w-3 h-3" /> },
              { label: 'Adresse', value: patient.adresse || '—', icon: <MapPin className="w-3 h-3" /> },
              { label: 'Enregistré le', value: fmtDate(patient.createdAt) },
            ].map(r => (
              <div key={r.label} className="flex justify-between gap-2 text-sm">
                <dt className="text-slate-400 shrink-0">{r.label}</dt>
                <dd className="font-medium text-slate-800 text-right">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Médical */}
        <Section icon={<HeartPulse className="w-3.5 h-3.5 text-red-600" />} label="Informations médicales" color="bg-red-50">
          <div className="space-y-3">
            {patient.groupeSanguin && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <Droplets className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Groupe sanguin</p>
                  <p className="font-bold text-red-600">{patient.groupeSanguin}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Antécédents</p>
              <p className="text-sm text-slate-700 leading-relaxed">{patient.antecedents || <span className="text-slate-300 italic">Non renseigné</span>}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Allergies</p>
              {patient.allergies
                ? <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">{patient.allergies}</p>
                  </div>
                : <p className="text-sm text-slate-300 italic">Aucune allergie connue</p>}
            </div>
          </div>
        </Section>

        {/* Prochain RDV */}
        <Section icon={<Clock className="w-3.5 h-3.5 text-violet-600" />} label="Prochain rendez-vous" color="bg-violet-50"
          action={
            <Link href="/appointments" className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1">
              <Plus className="w-3 h-3" />Planifier
            </Link>
          }>
          {upcoming.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun RDV à venir</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map(a => {
                const cfg = statutColors[a.statut] || statutColors.PLANIFIE
                return (
                  <div key={a.id} className="border border-slate-100 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs text-slate-400">{a.service.nom}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{fmtDateTime(a.dateHeure)}</p>
                    <p className="text-xs text-slate-400">Dr. {a.medecin.prenom} {a.medecin.nom}</p>
                    {a.motif && <p className="text-xs text-slate-500 italic">"{a.motif}"</p>}
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </div>

      {/* ── Consultations ── */}
      <Section icon={<ClipboardList className="w-3.5 h-3.5 text-emerald-600" />} label={`Consultations (${patient.consultations.length})`} color="bg-emerald-50"
        action={canConsulter ? (
          <Link href="/consultations" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
            <Plus className="w-3 h-3" />Nouvelle
          </Link>
        ) : undefined}>
        {patient.consultations.length === 0 ? (
          <EmptyState msg="Aucune consultation dans le dossier" />
        ) : (
          <div className="space-y-4">
            {patient.consultations.map((c, i) => (
              <div key={c.id} className="relative flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 z-10">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  {i < patient.consultations.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{fmtDate(c.date)}</p>
                      <p className="text-xs text-slate-400">Dr. {c.medecin.prenom} {c.medecin.nom}</p>
                    </div>
                  </div>

                  {c.diagnostic && (
                    <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 mb-2">
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Diagnostic</p>
                      <p className="text-sm text-slate-800">{c.diagnostic}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {c.notes && (
                      <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 max-w-xs">
                        <StickyNote className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 line-clamp-2">{c.notes}</p>
                      </div>
                    )}
                    {c.prescriptions && (
                      <div className="flex items-start gap-1.5 bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1.5">
                        <Pill className="w-3 h-3 text-violet-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-violet-700 font-medium">Ordonnance émise</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Examens ── */}
      <Section icon={<FlaskConical className="w-3.5 h-3.5 text-sky-600" />} label={`Examens médicaux (${patient.examens.length})`} color="bg-sky-50"
        action={canPrescrire ? (
          <Link href="/examens" className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1">
            <Plus className="w-3 h-3" />Prescrire
          </Link>
        ) : undefined}>
        {patient.examens.length === 0 ? (
          <EmptyState msg="Aucun examen prescrit dans le dossier" />
        ) : (
          <div className="space-y-2">
            {patient.examens.slice(0, 8).map(e => {
              const cfg = examenStatutColors[e.statut]
              return (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
                    <FlaskConical className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{e.type}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(e.createdAt).toLocaleDateString('fr-FR')} · Dr. {e.medecin.prenom} {e.medecin.nom}
                    </p>
                    {e.resultat && (
                      <p className="text-xs text-emerald-600 mt-0.5 line-clamp-1">{e.resultat}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
            {patient.examens.length > 8 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{patient.examens.length - 8} autres</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Rendez-vous + Facturation côte à côte ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Historique RDV */}
        <Section icon={<Calendar className="w-3.5 h-3.5 text-violet-600" />} label={`Rendez-vous (${patient.appointments.length})`} color="bg-violet-50">
          {patient.appointments.length === 0 ? (
            <EmptyState msg="Aucun rendez-vous dans l'historique" />
          ) : (
            <div className="space-y-2">
              {patient.appointments.slice(0, 6).map(a => {
                const cfg = statutColors[a.statut] || statutColors.PLANIFIE
                return (
                  <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {new Date(a.dateHeure).toLocaleDateString('fr-FR')} · {a.service.nom}
                      </p>
                      <p className="text-xs text-slate-400">Dr. {a.medecin.prenom} {a.medecin.nom}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
              {patient.appointments.length > 6 && (
                <p className="text-xs text-slate-400 text-center pt-1">+{patient.appointments.length - 6} autres</p>
              )}
            </div>
          )}
        </Section>

        {/* Facturation */}
        <Section icon={<CreditCard className="w-3.5 h-3.5 text-orange-600" />} label={`Facturation (${patient.factures.length})`} color="bg-orange-50"
          action={canFacturer ? (
            <Link href="/factures" className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1">
              <Plus className="w-3 h-3" />Nouvelle
            </Link>
          ) : undefined}>
          {patient.factures.length === 0 ? (
            <EmptyState msg="Aucune facture dans le dossier" />
          ) : (
            <div className="space-y-2">
              {patient.factures.slice(0, 6).map(f => {
                const cfg = factureStatutColors[f.statut]
                const pct = f.montantTotal > 0 ? Math.min(100, Math.round((f.montantPaye / f.montantTotal) * 100)) : 0
                return (
                  <div key={f.id} className="border border-slate-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">{f.numero}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{f.montantPaye.toLocaleString('fr-FR')} / {f.montantTotal.toLocaleString('fr-FR')} HTG</span>
                      <span className="font-semibold text-slate-700">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {patient.factures.length > 6 && (
                <p className="text-xs text-slate-400 text-center pt-1">+{patient.factures.length - 6} autres</p>
              )}
            </div>
          )}
        </Section>
      </div>

      {/* ── Dossier clinique (DME) ── */}
      {(patient.sejourEnCours || sejours.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Prescriptions actives */}
          {patient.sejourEnCours && (
            <Section icon={<Pill className="w-3.5 h-3.5 text-blue-600" />}
              label={`Prescriptions actives${prescriptionsActives.length > 0 ? ` (${prescriptionsActives.length})` : ''}`}
              color="bg-blue-50"
              action={canAccessDossier ? (
                <button onClick={() => setDossierSejourId(patient.sejourEnCours!.id)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  <FolderOpen className="w-3 h-3" />Dossier complet
                </button>
              ) : undefined}>
              {prescriptionsActives.length === 0 ? (
                <div className="text-center py-4">
                  <Pill className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Aucune prescription active</p>
                  {canAccessDossier && (
                    <button onClick={() => setDossierSejourId(patient.sejourEnCours!.id)}
                      className="mt-2 text-xs text-blue-600 hover:underline">
                      Ouvrir le dossier de séjour →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {prescriptionsActives.map(p => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{p.medicament} <span className="font-normal text-slate-500">{p.dosage}</span></p>
                        <p className="text-xs text-slate-400">{p.frequence} · Dr. {p.medecin.prenom} {p.medecin.nom}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">{p.voie}</span>
                    </div>
                  ))}
                  {canAccessDossier && (
                    <button onClick={() => setDossierSejourId(patient.sejourEnCours!.id)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors mt-2">
                      <FolderOpen className="w-3.5 h-3.5" />Voir dossier complet (soins, MAR, notes)
                    </button>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Historique des séjours */}
          {sejours.length > 0 && (
            <Section icon={<History className="w-3.5 h-3.5 text-indigo-600" />}
              label={`Hospitalisations (${sejours.length})`} color="bg-indigo-50">
              <div className="space-y-2">
                {sejours.slice(0, 5).map(s => {
                  const dureeMs  = (s.dateSortie ? new Date(s.dateSortie) : new Date()).getTime() - new Date(s.dateAdmission).getTime()
                  const jours    = Math.ceil(dureeMs / 86_400_000)
                  const isActif  = s.statut === 'EN_COURS'
                  return (
                    <div key={s.id} className={`border rounded-xl p-3 ${isActif ? 'border-red-200 bg-red-50/50' : 'border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {isActif && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                          <p className="text-xs font-semibold text-slate-700">
                            Ch. {s.lit.chambre.numero} — Lit {s.lit.numero}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActif ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isActif ? 'En cours' : `${jours}j`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(s.dateAdmission).toLocaleDateString('fr-FR')}
                        {s.dateSortie && ` → ${new Date(s.dateSortie).toLocaleDateString('fr-FR')}`}
                        {' · '}Dr. {s.medecin.prenom} {s.medecin.nom}
                      </p>
                      {s.motif && <p className="text-xs text-slate-500 italic mt-0.5">"{s.motif}"</p>}
                      {isActif && canAccessDossier && (
                        <button onClick={() => setDossierSejourId(s.id)}
                          className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 transition-colors">
                          <FolderOpen className="w-3 h-3" />Ouvrir le dossier
                        </button>
                      )}
                    </div>
                  )
                })}
                {sejours.length > 5 && (
                  <p className="text-xs text-slate-400 text-center pt-1">+{sejours.length - 5} autres séjours</p>
                )}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ── Activité récente ── */}
      {(patient.consultations.length > 0 || patient.appointments.length > 0) && (
        <Section icon={<Activity className="w-3.5 h-3.5 text-slate-600" />} label="Signes vitaux (dernière consultation)" color="bg-slate-100">
          {(() => {
            if (!lastVitals?.signesVitaux) return <EmptyState msg="Aucun signe vital enregistré" />
            const sv = lastVitals.signesVitaux as { tension?: string; temperature?: number; poids?: number }
            return (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tension', value: sv.tension || '—', unit: 'mmHg', icon: HeartPulse, color: 'text-red-600 bg-red-50' },
                  { label: 'Température', value: sv.temperature ? `${sv.temperature}` : '—', unit: '°C', icon: Activity, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Poids', value: sv.poids ? `${sv.poids}` : '—', unit: 'kg', icon: User, color: 'text-blue-600 bg-blue-50' },
                ].map(v => (
                  <div key={v.label} className="text-center">
                    <div className={`w-10 h-10 ${v.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <v.icon className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-slate-900">{v.value}</p>
                    <p className="text-xs text-slate-400">{v.unit}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{v.label}</p>
                  </div>
                ))}
              </div>
            )
          })()}
          {lastVitals && (
            <p className="text-xs text-slate-400 text-center mt-3">
              Mesure du {fmtDate(lastVitals.date)}
            </p>
          )}
        </Section>
      )}

      {/* Bouton retour bas */}
      <div className="flex justify-between items-center pt-2 pb-4">
        <Link href="/patients" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />Retour à la liste
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <ClipboardList className="w-3.5 h-3.5" />
          Dossier créé le {fmtDate(patient.createdAt)}
        </div>
      </div>

    </div>
  )
}
