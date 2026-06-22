'use client'
import { useEffect, useState } from 'react'
import { Patient } from '@/types'
import api from '@/lib/api'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search, Plus, Phone, MapPin, User, X, ChevronRight,
  Droplets, AlertTriangle, ClipboardList, UserPlus, Check, Pencil, BedDouble
} from 'lucide-react'

const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

/* ── Champ de formulaire custom ── */
function Field({
  label, required, children
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}{required && <span className="text-blue-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"

/* ── Modale création/édition patient ── */
const EMPTY_FORM = { prenom: '', nom: '', dateNaissance: '', sexe: '', telephone: '', adresse: '', groupeSanguin: '', antecedents: '', allergies: '' }

function PatientModal({ open, onClose, onSuccess, editing }: {
  open: boolean; onClose: () => void; onSuccess: () => void; editing?: Patient | null
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (editing) {
      setForm({
        prenom: editing.prenom, nom: editing.nom,
        dateNaissance: editing.dateNaissance.split('T')[0],
        sexe: editing.sexe, telephone: editing.telephone,
        adresse: editing.adresse || '', groupeSanguin: editing.groupeSanguin || '',
        antecedents: editing.antecedents || '', allergies: editing.allergies || ''
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError(''); setDone(false)
  }, [editing, open])

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: String(value ?? '') }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sexe) { setError('Le sexe est requis'); return }
    setLoading(true); setError('')
    try {
      const payload = { ...form, dateNaissance: new Date(form.dateNaissance).toISOString() }
      if (editing) await api.put(`/patients/${editing.id}`, payload)
      else await api.post('/patients', payload)
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1200)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Erreur lors de l\'enregistrement')
    } finally { setLoading(false) }
  }

  function handleClose() {
    setForm(EMPTY_FORM); setError(''); setDone(false); onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Panneau */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* En-tête coloré */}
        <div className="bg-linear-to-br from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{editing ? 'Modifier le patient' : 'Nouveau patient'}</h2>
              <p className="text-blue-200 text-xs mt-0.5">{editing ? `Dossier ${editing.numero}` : 'Remplissez les informations du dossier'}</p>
            </div>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* État succès */}
        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">{editing ? 'Dossier mis à jour' : 'Patient enregistré'}</p>
              <p className="text-sm text-slate-500 mt-1">{editing ? 'Les informations ont été sauvegardées' : 'Le dossier a été créé avec succès'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">

            <div className="overflow-y-auto px-6 py-5 space-y-6">

              {/* Section : Identité */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Identité</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" required>
                    <input className={inputCls} value={form.prenom}
                      onChange={e => set('prenom', e.target.value)} placeholder="Marie" required />
                  </Field>
                  <Field label="Nom" required>
                    <input className={inputCls} value={form.nom}
                      onChange={e => set('nom', e.target.value)} placeholder="JOSEPH" required />
                  </Field>
                  <Field label="Date de naissance" required>
                    <input type="date" className={inputCls} value={form.dateNaissance}
                      onChange={e => set('dateNaissance', e.target.value)} required />
                  </Field>
                  <Field label="Sexe" required>
                    <Select value={form.sexe} onValueChange={v => set('sexe', v)}>
                      <SelectTrigger className="h-10.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/30">
                        <SelectValue placeholder="Sélectionner">
                          {form.sexe === 'M' ? 'Masculin' : form.sexe === 'F' ? 'Féminin' : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* Section : Coordonnées */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-violet-100 rounded flex items-center justify-center">
                    <Phone className="w-3 h-3 text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Coordonnées</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Téléphone" required>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      <input className={`${inputCls} pl-9`} value={form.telephone}
                        onChange={e => set('telephone', e.target.value)} placeholder="+509 3XXX-XXXX" required />
                    </div>
                  </Field>
                  <Field label="Adresse">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      <input className={`${inputCls} pl-9`} value={form.adresse}
                        onChange={e => set('adresse', e.target.value)} placeholder="Ville, Quartier" />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Section : Médical */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-rose-100 rounded flex items-center justify-center">
                    <Droplets className="w-3 h-3 text-rose-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Informations médicales</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="space-y-3">
                  <Field label="Groupe sanguin">
                    <Select value={form.groupeSanguin} onValueChange={v => set('groupeSanguin', v)}>
                      <SelectTrigger className="h-10.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/30">
                        <SelectValue placeholder="Sélectionner">
                          {form.groupeSanguin || null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {groupesSanguins.map(g => (
                          <SelectItem key={g} value={g}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-400 rounded-full" />{g}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Antécédents médicaux">
                    <div className="relative">
                      <ClipboardList className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-300" />
                      <textarea className={`${inputCls} pl-9 resize-none`} rows={2}
                        value={form.antecedents} onChange={e => set('antecedents', e.target.value)}
                        placeholder="Diabète, hypertension, chirurgies..." />
                    </div>
                  </Field>
                  <Field label="Allergies">
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-300" />
                      <textarea className={`${inputCls} pl-9 resize-none`} rows={2}
                        value={form.allergies} onChange={e => set('allergies', e.target.value)}
                        placeholder="Pénicilline, latex, arachides..." />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Footer sticky */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-400">
                <span className="text-blue-500">*</span> Champs obligatoires
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{editing ? 'Sauvegarder' : 'Enregistrer'} <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Modal hospitalisation directe ── */
interface LitDisponible { id: string; numero: string; chambre: { numero: string; type: string; service?: { nom: string } | null } }

function HospitaliserModal({ patient, open, onClose, onSuccess }: {
  patient: Patient | null; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [lits, setLits]       = useState<LitDisponible[]>([])
  const [litId, setLitId]     = useState('')
  const [motif, setMotif]     = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (!open) return
    setLitId(''); setMotif(''); setError(''); setDone(false)
    setFetching(true)
    api.get('/hospitalisations/chambres').then(r => {
      const available: LitDisponible[] = []
      for (const ch of (r.data.data || [])) {
        for (const lit of (ch.lits || [])) {
          if (lit.statut === 'DISPONIBLE') {
            available.push({ id: lit.id, numero: lit.numero, chambre: { numero: ch.numero, type: ch.type, service: ch.service } })
          }
        }
      }
      setLits(available)
    }).catch(() => {}).finally(() => setFetching(false))
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!litId) { setError('Sélectionnez un lit'); return }
    setLoading(true); setError('')
    try {
      await api.post('/hospitalisations/sejours', { patientId: patient!.id, litId, motif: motif.trim() || undefined })
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1400)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'admission')
    } finally { setLoading(false) }
  }

  if (!open || !patient) return null

  const typeLabels: Record<string, string> = {
    STANDARD: 'Standard', SOINS_INTENSIFS: 'Soins intensifs',
    MATERNITE: 'Maternité', PEDIATRIE: 'Pédiatrie', ISOLEMENT: 'Isolement',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-linear-to-br from-teal-500 to-emerald-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <BedDouble className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Hospitaliser le patient</h2>
              <p className="text-teal-100 text-xs">{patient.prenom} {patient.nom} — {patient.numero}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Patient admis</p>
              <p className="text-sm text-slate-500 mt-1">Le séjour a été ouvert avec succès</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Lit disponible *
              </label>
              {fetching ? (
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : lits.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  Aucun lit disponible actuellement.
                </p>
              ) : (
                <select
                  value={litId}
                  onChange={e => setLitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                >
                  <option value="">— Choisir un lit —</option>
                  {lits.map(l => (
                    <option key={l.id} value={l.id}>
                      Lit {l.numero} — Ch. {l.chambre.numero} ({typeLabels[l.chambre.type] || l.chambre.type}
                      {l.chambre.service ? ` · ${l.chambre.service.nom}` : ''})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Motif d'admission
              </label>
              <input
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                placeholder="Ex : Observation post-opératoire, décompensation HTA..."
                value={motif}
                onChange={e => setMotif(e.target.value)}
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{error}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button type="submit" disabled={loading || lits.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <BedDouble className="w-4 h-4" />}
                {loading ? 'Admission en cours...' : 'Admettre le patient'}
              </button>
              <button type="button" onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Carte patient ── */
function PatientCard({ patient, onEdit, onHospitaliser }: {
  patient: Patient; onEdit?: (e: React.MouseEvent) => void; onHospitaliser?: (e: React.MouseEvent) => void
}) {
  const age = Math.floor((Date.now() - new Date(patient.dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  const initials = `${patient.prenom[0]}${patient.nom[0]}`.toUpperCase()
  const avatarColors = ['from-blue-400 to-blue-600', 'from-violet-400 to-violet-600',
    'from-teal-400 to-teal-600', 'from-rose-400 to-rose-600', 'from-amber-400 to-amber-600']
  const color = avatarColors[(patient.prenom.charCodeAt(0) + patient.nom.charCodeAt(0)) % avatarColors.length]

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden">
      {/* Accent top */}
      <div className={`h-1 w-full bg-linear-to-r ${color}`} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar initiales */}
          <div className={`w-11 h-11 bg-linear-to-br ${color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-slate-900 truncate">{patient.prenom} {patient.nom}</p>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                {patient.numero}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {age} ans &middot; {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
            </p>
          </div>
        </div>

        {/* Infos bas */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-300" />
            <span className="text-xs text-slate-500">{patient.telephone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {patient.groupeSanguin && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                <Droplets className="w-2.5 h-2.5" />{patient.groupeSanguin}
              </span>
            )}
            {onHospitaliser && (
              <button onClick={onHospitaliser} title="Hospitaliser"
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-teal-100 text-slate-300 hover:text-teal-600 flex items-center justify-center transition-colors">
                <BedDouble className="w-3 h-3" />
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} title="Modifier"
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-300 hover:text-blue-600 flex items-center justify-center transition-colors">
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Page principale ── */
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [hospOpen, setHospOpen] = useState(false)
  const [hospitaliserPatient, setHospitaliserPatient] = useState<Patient | null>(null)

  async function fetchPatients(q?: string) {
    setLoading(true)
    try {
      const res = q
        ? await api.get(`/patients/search?q=${encodeURIComponent(q)}`)
        : await api.get('/patients?limit=20')
      if (q) { setPatients(res.data.data); setTotal(res.data.data.length) }
      else { setPatients(res.data.data.patients); setTotal(res.data.data.total) }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchPatients() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(search || undefined), 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div>
      {/* Barre du haut */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">
            {loading ? '...' : `${total} patient${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" />
          Nouveau patient
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
          placeholder="Rechercher par nom, numéro ou téléphone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">Aucun patient trouvé</p>
          {search
            ? <p className="text-sm text-slate-400 mt-1">Essayez un autre terme de recherche</p>
            : <button onClick={() => setOpen(true)} className="mt-4 text-sm text-blue-600 hover:underline">
                Enregistrer le premier patient
              </button>
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map(p => (
            <Link key={p.id} href={`/patients/${p.id}`}>
              <PatientCard
                patient={p}
                onEdit={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(p); setOpen(true) }}
                onHospitaliser={(e) => { e.preventDefault(); e.stopPropagation(); setHospitaliserPatient(p); setHospOpen(true) }}
              />
            </Link>
          ))}
        </div>
      )}

      <PatientModal open={open} editing={editing}
        onClose={() => { setOpen(false); setEditing(null) }}
        onSuccess={() => { setOpen(false); setEditing(null); fetchPatients() }} />

      <HospitaliserModal
        patient={hospitaliserPatient}
        open={hospOpen}
        onClose={() => { setHospOpen(false); setHospitaliserPatient(null) }}
        onSuccess={() => { setHospOpen(false); setHospitaliserPatient(null) }}
      />
    </div>
  )
}
