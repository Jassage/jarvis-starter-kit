'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useSSE } from '@/hooks/useSSE'
import { Combobox } from '@/components/ui/Combobox'
import { DossierSejour } from './DossierSejour'
import {
  BedDouble, Users, Wrench, CheckCircle2, Plus, X, Search,
  Clock, RefreshCw, LogOut, Settings2, LayoutGrid, ChevronDown,
  List, Receipt, AlertCircle, ChevronRight, ArrowRightLeft,
  BarChart3, TrendingUp, CalendarDays, AlertTriangle, FolderOpen,
  Pencil, Trash2
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Patient  { id: string; prenom: string; nom: string; numero: string }
interface Medecin  { prenom: string; nom: string }
interface Service  { id: string; nom: string }

interface SejourBrief {
  id: string; dateAdmission: string; motif?: string
  patient: Patient; medecin: Medecin
}

interface Lit {
  id: string; numero: string; statut: 'DISPONIBLE' | 'OCCUPE' | 'MAINTENANCE' | 'RESERVE'
  sejours: SejourBrief[]
}

interface Chambre {
  id: string; numero: string; etage?: number; type: string
  service?: Service; lits: Lit[]
}

interface Stats {
  total: number; disponibles: number; occupes: number
  maintenance: number; reserve: number; sejoursEnCours: number
}

interface SejourDetail {
  id: string; dateAdmission: string; dateSortie?: string; motif?: string; notes?: string; statut: string
  patient: Patient & { dateNaissance: string; telephone: string; groupeSanguin?: string; allergies?: string }
  medecin: Medecin
  lit: Lit & { chambre: Chambre }
}

interface SejourListe {
  id: string; dateAdmission: string; motif?: string; statut: string
  patient: Patient
  medecin: Medecin
  lit: { numero: string; chambre: { numero: string; etage?: number; type: string; service?: Service } }
}

interface StatsOccupation {
  tauxOccupation: number; totalLits: number; occupes: number
  sejoursActifsCount: number; dureeMoyenneH: number; admissions30j: number
  parService: { nom: string; count: number }[]
  sejoursLongs: { id: string; dateAdmission: string; chambre: string; lit: string; joursHospitalises: number }[]
  admissionsParJour: { date: string; admissions: number; sorties: number }[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  STANDARD: 'Standard', SOINS_INTENSIFS: 'Soins intensifs',
  MATERNITE: 'Maternité', PEDIATRIE: 'Pédiatrie', ISOLEMENT: 'Isolement',
}
const TYPES = Object.entries(TYPE_LABELS)

const PRIX_NUIT: Record<string, number> = {
  STANDARD: 1500, SOINS_INTENSIFS: 5000,
  MATERNITE: 2000, PEDIATRIE: 1800, ISOLEMENT: 3000,
}

const LIT_CFG: Record<string, { label: string; dot: string; bg: string; border: string; text: string }> = {
  DISPONIBLE:  { label: 'Disponible',  dot: 'bg-emerald-400', bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700' },
  OCCUPE:      { label: 'Occupé',      dot: 'bg-red-400',     bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700' },
  MAINTENANCE: { label: 'Maintenance', dot: 'bg-amber-400',   bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700' },
  RESERVE:     { label: 'Réservé',     dot: 'bg-sky-400',     bg: 'bg-sky-50',      border: 'border-sky-200',     text: 'text-sky-700' },
}

function duree(admission: string, sortie?: string) {
  const h = Math.floor((new Date(sortie ?? Date.now()).getTime() - new Date(admission).getTime()) / 3_600_000)
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}j ${h % 24}h`
}

function nuits(admission: string, sortie?: string) {
  return Math.max(1, Math.ceil(
    (new Date(sortie ?? Date.now()).getTime() - new Date(admission).getTime()) / 86_400_000
  ))
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all'
const btnPrimary = 'flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50'
const btnGhost  = 'flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors'

// ── Modal Admission ────────────────────────────────────────────────────────────

function AdmissionModal({ lit, onClose, onDone }: { lit: Lit; onClose: () => void; onDone: () => void }) {
  const [q, setQ]               = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selected, setSelected] = useState<Patient | null>(null)
  const [motif, setMotif]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState('')

  useEffect(() => {
    if (!q || q.length < 2) { setPatients([]); return }
    const t = setTimeout(async () => {
      try { const r = await api.get(`/patients/search?q=${encodeURIComponent(q)}`); setPatients(r.data.data || []) } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  async function handleAdmettre() {
    if (!selected) { setErr('Sélectionnez un patient.'); return }
    setSaving(true); setErr('')
    try {
      await api.post('/hospitalisations/sejours', { patientId: selected.id, litId: lit.id, motif: motif.trim() || undefined })
      onDone()
    } catch (e: any) { setErr(e?.response?.data?.message || "Erreur lors de l'admission.") }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Admettre un patient</h2>
            <p className="text-xs text-slate-400 mt-0.5">Lit {lit.numero}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {!selected ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rechercher le patient</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input className={`${inputCls} pl-10`} value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, prénom ou numéro..." autoFocus />
              </div>
              {patients.length > 0 && (
                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {patients.map(p => (
                    <button key={p.id} onClick={() => { setSelected(p); setQ(''); setPatients([]) }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                        {p.prenom[0]}{p.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-slate-400">{p.numero}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                {selected.prenom[0]}{selected.nom[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{selected.prenom} {selected.nom}</p>
                <p className="text-xs text-slate-400">{selected.numero}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Motif d'hospitalisation</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={motif} onChange={e => setMotif(e.target.value)}
              placeholder="Chirurgie programmée, surveillance post-opératoire..." />
          </div>
          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className={btnGhost}>Annuler</button>
          <button onClick={handleAdmettre} disabled={saving || !selected} className={btnPrimary}>
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? 'Admission...' : 'Admettre'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Sortie (2 étapes) ────────────────────────────────────────────────────

function SortieModal({ sejour, onClose, onDone }: { sejour: SejourDetail; onClose: () => void; onDone: () => void }) {
  const [step, setStep]         = useState<'sortie' | 'facture'>('sortie')
  const [notes, setNotes]       = useState(sejour.notes || '')
  const [genFacture, setGenFacture] = useState(true)
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState('')

  // Facturation
  const chambreType = (sejour.lit as any).chambre?.type ?? 'STANDARD'
  const nbNuits     = nuits(sejour.dateAdmission)
  const prixBase    = PRIX_NUIT[chambreType] ?? 1500
  const [prixNuit, setPrixNuit] = useState(prixBase)
  const [lignesExtra, setLignesExtra] = useState<{ description: string; quantite: number; prixUnitaire: number }[]>([])
  const [factureOk, setFactureOk] = useState(false)
  const [factureNum, setFactureNum] = useState('')

  const totalFacture = nbNuits * prixNuit + lignesExtra.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0)

  async function handleSortie() {
    setSaving(true); setErr('')
    try {
      await api.patch(`/hospitalisations/sejours/${sejour.id}/sortie`, { notes: notes.trim() || undefined })
      if (genFacture) setStep('facture')
      else onDone()
    } catch (e: any) { setErr(e?.response?.data?.message || 'Erreur.') }
    finally { setSaving(false) }
  }

  async function handleFacture() {
    setSaving(true); setErr('')
    try {
      const r = await api.post(`/hospitalisations/sejours/${sejour.id}/facture`, {
        prixNuit,
        lignes: lignesExtra.filter(l => l.description.trim()),
      })
      setFactureNum(r.data.data.numero)
      setFactureOk(true)
    } catch (e: any) { setErr(e?.response?.data?.message || 'Erreur lors de la facturation.') }
    finally { setSaving(false) }
  }

  function addLigne() {
    setLignesExtra(l => [...l, { description: '', quantite: 1, prixUnitaire: 0 }])
  }
  function removeLigne(i: number) { setLignesExtra(l => l.filter((_, idx) => idx !== i)) }
  function updateLigne(i: number, field: string, val: string | number) {
    setLignesExtra(l => l.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-bold text-slate-900">
              {step === 'sortie' ? 'Sortie du patient' : 'Facturation du séjour'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {sejour.patient.prenom} {sejour.patient.nom} — Lit {sejour.lit.numero}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Étapes */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 'sortie' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
                {step === 'sortie' ? '1' : <CheckCircle2 className="w-3 h-3" />}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 'facture' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">

          {/* ── Étape 1 : Sortie ── */}
          {step === 'sortie' && (
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Admis le</span><span className="font-medium">{new Date(sejour.dateAdmission).toLocaleDateString('fr-FR')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Durée</span><span className="font-medium">{duree(sejour.dateAdmission)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Médecin</span><span className="font-medium">Dr. {sejour.medecin.prenom} {sejour.medecin.nom}</span></div>
                {sejour.motif && <div className="flex justify-between gap-4"><span className="text-slate-400 shrink-0">Motif</span><span className="font-medium text-right">{sejour.motif}</span></div>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes de sortie</label>
                <textarea rows={3} className={`${inputCls} resize-none`} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="État à la sortie, recommandations, suivi ambulatoire..." />
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <input type="checkbox" checked={genFacture} onChange={e => setGenFacture(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                    Générer la facture du séjour
                  </p>
                  <p className="text-xs text-slate-400">
                    {nbNuits} nuit{nbNuits > 1 ? 's' : ''} × {prixBase.toLocaleString('fr-FR')} HTG = {(nbNuits * prixBase).toLocaleString('fr-FR')} HTG
                  </p>
                </div>
              </label>

              {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
            </div>
          )}

          {/* ── Étape 2 : Facture ── */}
          {step === 'facture' && (
            <div className="p-6 space-y-4">
              {factureOk ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-slate-900">Facture générée</p>
                  <p className="text-sm text-slate-500">Numéro : <span className="font-mono font-semibold text-slate-800">{factureNum}</span></p>
                  <p className="text-xs text-slate-400">Retrouvez-la dans le module Facturation.</p>
                </div>
              ) : (
                <>
                  {/* Ligne hospitalisation */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hospitalisation</p>
                      <span className="text-xs text-slate-400">{TYPE_LABELS[chambreType]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          Chambre {(sejour.lit as any).chambre?.numero}, Lit {sejour.lit.numero}
                        </p>
                        <p className="text-xs text-slate-400">{nbNuits} nuit{nbNuits > 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} value={prixNuit}
                          onChange={e => setPrixNuit(Number(e.target.value))}
                          className="w-28 px-2.5 py-1.5 text-right text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        <span className="text-xs text-slate-400 w-8">HTG</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                      <span>Sous-total</span>
                      <span>{(nbNuits * prixNuit).toLocaleString('fr-FR')} HTG</span>
                    </div>
                  </div>

                  {/* Lignes supplémentaires */}
                  {lignesExtra.length > 0 && (
                    <div className="space-y-2">
                      {lignesExtra.map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input value={l.description} onChange={e => updateLigne(i, 'description', e.target.value)}
                            placeholder="Description (médicament, acte...)"
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400" />
                          <input type="number" min={1} value={l.quantite} onChange={e => updateLigne(i, 'quantite', Number(e.target.value))}
                            className="w-16 px-2 py-2 text-center text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400" />
                          <input type="number" min={0} value={l.prixUnitaire} onChange={e => updateLigne(i, 'prixUnitaire', Number(e.target.value))}
                            className="w-24 px-2 py-2 text-right text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400" />
                          <button onClick={() => removeLigne(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={addLigne}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    <Plus className="w-3.5 h-3.5" />Ajouter une ligne (médicament, acte, etc.)
                  </button>

                  {/* Total */}
                  <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl px-4 py-3">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">{totalFacture.toLocaleString('fr-FR')} HTG</span>
                  </div>

                  {err && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{err}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          {step === 'sortie' && (
            <>
              <button onClick={onClose} className={btnGhost}>Annuler</button>
              <button onClick={handleSortie} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50">
                {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Traitement...' : genFacture ? 'Confirmer la sortie →' : 'Confirmer la sortie'}
              </button>
            </>
          )}
          {step === 'facture' && !factureOk && (
            <>
              <button onClick={() => { onDone() }} className={btnGhost}>Ignorer la facture</button>
              <button onClick={handleFacture} disabled={saving} className={`flex-1 ${btnPrimary}`}>
                {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <Receipt className="w-4 h-4" />
                {saving ? 'Génération...' : 'Générer la facture'}
              </button>
            </>
          )}
          {step === 'facture' && factureOk && (
            <button onClick={onDone} className={`flex-1 ${btnPrimary}`}>
              <CheckCircle2 className="w-4 h-4" />Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal Transfert ────────────────────────────────────────────────────────────

function TransfertModal({ sejour, chambres, onClose, onDone }: {
  sejour: SejourListe; chambres: Chambre[]; onClose: () => void; onDone: () => void
}) {
  const [litId, setLitId]   = useState('')
  const [raison, setRaison] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const litsDisponibles = chambres.flatMap(c =>
    c.lits
      .filter(l => l.statut === 'DISPONIBLE')
      .map(l => ({ ...l, chambre: c }))
  )

  async function handleTransfert() {
    if (!litId) { setErr('Sélectionnez un lit de destination.'); return }
    setSaving(true); setErr('')
    try {
      await api.patch(`/hospitalisations/sejours/${sejour.id}/transfert`, { litId, raison: raison.trim() || undefined })
      onDone()
    } catch (e: any) { setErr(e?.response?.data?.message || 'Erreur lors du transfert.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Transfert de chambre</h2>
            <p className="text-xs text-slate-400 mt-0.5">{sejour.patient.prenom} {sejour.patient.nom}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Emplacement actuel */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <BedDouble className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Position actuelle</p>
              <p className="text-sm font-semibold text-slate-800">
                Chambre {sejour.lit.chambre.numero} — Lit {sejour.lit.numero}
                {sejour.lit.chambre.etage != null && ` · Étage ${sejour.lit.chambre.etage}`}
              </p>
            </div>
            <ArrowRightLeft className="w-4 h-4 text-slate-300 ml-auto" />
          </div>

          {/* Sélection du nouveau lit */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Nouveau lit *
              <span className="ml-1 font-normal text-slate-400">({litsDisponibles.length} disponible{litsDisponibles.length > 1 ? 's' : ''})</span>
            </label>
            {litsDisponibles.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                Aucun lit disponible pour le transfert.
              </p>
            ) : (
              <Combobox
                value={litId}
                onChange={setLitId}
                placeholder="Rechercher un lit disponible..."
                emptyLabel="Aucun lit disponible"
                options={litsDisponibles.map(l => ({
                  value: l.id,
                  label: `Chambre ${l.chambre.numero} — Lit ${l.numero}`,
                  sub: [
                    l.chambre.etage != null ? `Étage ${l.chambre.etage}` : null,
                    TYPE_LABELS[l.chambre.type] || l.chambre.type,
                  ].filter(Boolean).join(' · '),
                }))}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Raison du transfert</label>
            <input value={raison} onChange={e => setRaison(e.target.value)}
              className={inputCls} placeholder="Aggravation, besoin soins intensifs, demande patient..." />
          </div>

          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className={btnGhost}>Annuler</button>
          <button onClick={handleTransfert} disabled={saving || !litId || litsDisponibles.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors disabled:opacity-50`}>
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <ArrowRightLeft className="w-4 h-4" />
            {saving ? 'Transfert...' : 'Confirmer le transfert'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Onglet Statistiques ────────────────────────────────────────────────────────

function StatistiquesTab() {
  const [data, setData]     = useState<StatsOccupation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/hospitalisations/statistiques')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useSSE(['hospitalisations'], () => {
    api.get('/hospitalisations/statistiques').then(r => setData(r.data.data)).catch(() => {})
  })

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
    </div>
  )
  if (!data) return <p className="text-sm text-slate-400 text-center py-10">Impossible de charger les statistiques.</p>

  const dureeMoyenneAff = data.dureeMoyenneH < 24
    ? `${data.dureeMoyenneH}h`
    : `${Math.floor(data.dureeMoyenneH / 24)}j ${data.dureeMoyenneH % 24}h`

  const maxAdm = Math.max(...data.admissionsParJour.map(d => Math.max(d.admissions, d.sorties)), 1)
  const maxSvc = Math.max(...data.parService.map(s => s.count), 1)

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Taux d\'occupation', value: `${data.tauxOccupation}%`, sub: `${data.occupes}/${data.totalLits} lits`, icon: BedDouble, color: data.tauxOccupation > 80 ? 'text-red-600' : 'text-emerald-600', bg: data.tauxOccupation > 80 ? 'bg-red-50' : 'bg-emerald-50' },
          { label: 'Durée moy. séjour', value: dureeMoyenneAff, sub: 'séjours clôturés (30j)', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Admissions (30j)', value: data.admissions30j, sub: 'nouveaux séjours', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Séjours longs', value: data.sejoursLongs.length, sub: '> 7 jours', icon: AlertTriangle, color: data.sejoursLongs.length > 0 ? 'text-amber-600' : 'text-slate-400', bg: data.sejoursLongs.length > 0 ? 'bg-amber-50' : 'bg-slate-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} border border-slate-200 rounded-2xl p-4 flex items-center gap-3`}>
            <k.icon className={`w-5 h-5 ${k.color} shrink-0`} />
            <div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{k.label}</p>
              <p className="text-[10px] text-slate-300">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Admissions / sorties 7 jours */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-800 text-sm">Admissions & sorties — 7 derniers jours</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {data.admissionsParJour.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-24">
                  <div
                    className="flex-1 bg-blue-400 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(4, (d.admissions / maxAdm) * 100)}%` }}
                    title={`${d.admissions} admission${d.admissions > 1 ? 's' : ''}`}
                  />
                  <div
                    className="flex-1 bg-emerald-400 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(4, (d.sorties / maxAdm) * 100)}%` }}
                    title={`${d.sorties} sortie${d.sorties > 1 ? 's' : ''}`}
                  />
                </div>
                <p className="text-[9px] text-slate-400 text-center">
                  {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-400 rounded-sm" />Admissions</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-400 rounded-sm" />Sorties</span>
          </div>
        </div>

        {/* Occupation par service */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-800 text-sm">Patients actuels par service</h3>
          </div>
          {data.parService.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-8">Aucun patient hospitalisé</p>
          ) : (
            <div className="space-y-3">
              {data.parService.map(s => (
                <div key={s.nom} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate">{s.nom}</span>
                    <span className="font-bold text-slate-900 ml-2">{s.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(s.count / maxSvc) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Séjours longs */}
      {data.sejoursLongs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-amber-800 text-sm">
              Séjours longs ({data.sejoursLongs.length}) — Hospitalisés depuis plus de 7 jours
            </h3>
          </div>
          <div className="space-y-2">
            {data.sejoursLongs.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm">
                <span className="text-slate-700">Chambre {s.chambre} — Lit {s.lit}</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs">
                  {s.joursHospitalises} jour{s.joursHospitalises > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ── Onglet Configuration (ADMIN) ───────────────────────────────────────────────

interface EditChambreState {
  id: string; numero: string; etage: string; type: string; serviceId: string
}

function ConfigTab({ chambres, onRefresh }: { chambres: Chambre[]; onRefresh: () => void }) {
  const [services, setServices] = useState<Service[]>([])

  // Création chambre
  const [cNumero, setCNumero]   = useState('')
  const [cEtage, setCEtage]     = useState('')
  const [cType, setCType]       = useState('STANDARD')
  const [cService, setCService] = useState('')
  const [cSaving, setCSaving]   = useState(false)
  const [cErr, setCErr]         = useState('')
  const [cOk, setCOk]           = useState('')

  // Création lit
  const [lNumero, setLNumero]   = useState('')
  const [lChambre, setLChambre] = useState('')
  const [lSaving, setLSaving]   = useState(false)
  const [lErr, setLErr]         = useState('')
  const [lOk, setLOk]           = useState('')

  // Statut lit
  const [statutChanging, setStatutChanging] = useState<string | null>(null)

  // Edition chambre
  const [editChambre, setEditChambre] = useState<EditChambreState | null>(null)
  const [eSaving, setESaving]         = useState(false)
  const [eErr, setEErr]               = useState('')

  // Suppression
  const [deletingChambre, setDeletingChambre] = useState<string | null>(null)
  const [deletingLit, setDeletingLit]         = useState<string | null>(null)

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.data || [])).catch(() => {})
  }, [])

  async function createChambre(e: React.FormEvent) {
    e.preventDefault(); setCSaving(true); setCErr(''); setCOk('')
    try {
      await api.post('/hospitalisations/chambres', { numero: cNumero.trim(), etage: cEtage ? Number(cEtage) : undefined, type: cType, serviceId: cService || undefined })
      setCOk(`Chambre ${cNumero} créée.`); setCNumero(''); setCEtage(''); setCType('STANDARD'); setCService('')
      onRefresh()
    } catch (e: any) { setCErr(e?.response?.data?.message || 'Erreur.') }
    finally { setCSaving(false) }
  }

  async function createLit(e: React.FormEvent) {
    e.preventDefault(); setLSaving(true); setLErr(''); setLOk('')
    if (!lChambre) { setLErr('Sélectionnez une chambre.'); setLSaving(false); return }
    try {
      await api.post('/hospitalisations/lits', { numero: lNumero.trim(), chambreId: lChambre })
      setLOk(`Lit ${lNumero} ajouté.`); setLNumero(''); setLChambre('')
      onRefresh()
    } catch (e: any) { setLErr(e?.response?.data?.message || 'Erreur.') }
    finally { setLSaving(false) }
  }

  async function changeStatut(litId: string, statut: string) {
    setStatutChanging(litId)
    try { await api.patch(`/hospitalisations/lits/${litId}/statut`, { statut }); onRefresh() }
    catch {} finally { setStatutChanging(null) }
  }

  function openEditChambre(c: Chambre) {
    setEditChambre({ id: c.id, numero: c.numero, etage: c.etage != null ? String(c.etage) : '', type: c.type, serviceId: c.service?.id || '' })
    setEErr('')
  }

  async function saveEditChambre(e: React.FormEvent) {
    e.preventDefault()
    if (!editChambre) return
    setESaving(true); setEErr('')
    try {
      await api.patch(`/hospitalisations/chambres/${editChambre.id}`, {
        numero:    editChambre.numero.trim(),
        etage:     editChambre.etage !== '' ? Number(editChambre.etage) : null,
        type:      editChambre.type,
        serviceId: editChambre.serviceId || null,
      })
      setEditChambre(null)
      onRefresh()
    } catch (e: any) { setEErr(e?.response?.data?.message || 'Erreur.') }
    finally { setESaving(false) }
  }

  async function deleteChambre(id: string) {
    setDeletingChambre(id)
    try { await api.delete(`/hospitalisations/chambres/${id}`); onRefresh() }
    catch (e: any) { alert(e?.response?.data?.message || 'Impossible de supprimer cette chambre.') }
    finally { setDeletingChambre(null) }
  }

  async function deleteLit(id: string) {
    setDeletingLit(id)
    try { await api.delete(`/hospitalisations/lits/${id}`); onRefresh() }
    catch (e: any) { alert(e?.response?.data?.message || 'Impossible de supprimer ce lit.') }
    finally { setDeletingLit(null) }
  }

  const STATUTS_MANUELS = ['DISPONIBLE', 'MAINTENANCE', 'RESERVE'] as const

  return (
    <>
      {/* Modal édition chambre */}
      {editChambre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Modifier la chambre</h3>
              <button onClick={() => setEditChambre(null)} className="text-slate-300 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={saveEditChambre} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Numéro *</label>
                  <input required value={editChambre.numero} onChange={e => setEditChambre(p => p && ({ ...p, numero: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Étage</label>
                  <input type="number" value={editChambre.etage} onChange={e => setEditChambre(p => p && ({ ...p, etage: e.target.value }))} className={inputCls} min={0} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type</label>
                <Combobox
                  value={editChambre.type}
                  onChange={v => setEditChambre(p => p && ({ ...p, type: v || 'STANDARD' }))}
                  clearable={false}
                  placeholder="Type..."
                  options={TYPES.map(([v, l]) => ({ value: v, label: l, sub: `${(PRIX_NUIT[v] ?? 1500).toLocaleString('fr-FR')} HTG/nuit` }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Service (optionnel)</label>
                <Combobox
                  value={editChambre.serviceId}
                  onChange={v => setEditChambre(p => p && ({ ...p, serviceId: v || '' }))}
                  placeholder="Aucun service"
                  emptyLabel="Aucun service trouvé"
                  options={services.map(s => ({ value: s.id, label: s.nom }))}
                />
              </div>
              {eErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{eErr}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditChambre(null)} className={`${btnGhost} flex-1`}>Annuler</button>
                <button type="submit" disabled={eSaving} className={`${btnPrimary} flex-1`}>
                  {eSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Formulaire création chambre */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Nouvelle chambre</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ajoute une chambre au plan de l'hôpital</p>
          </div>
          <form onSubmit={createChambre} className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Numéro *</label>
                <input required value={cNumero} onChange={e => setCNumero(e.target.value)} className={inputCls} placeholder="101, A2..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Étage</label>
                <input type="number" value={cEtage} onChange={e => setCEtage(e.target.value)} className={inputCls} placeholder="0, 1, 2..." min={0} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type</label>
              <Combobox
                value={cType}
                onChange={v => setCType(v || 'STANDARD')}
                clearable={false}
                placeholder="Sélectionner un type..."
                options={TYPES.map(([v, l]) => ({ value: v, label: l, sub: `${(PRIX_NUIT[v] ?? 1500).toLocaleString('fr-FR')} HTG/nuit` }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Service (optionnel)</label>
              <Combobox
                value={cService}
                onChange={setCService}
                placeholder="Aucun service"
                emptyLabel="Aucun service trouvé"
                options={services.map(s => ({ value: s.id, label: s.nom }))}
              />
            </div>
            {cErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{cErr}</p>}
            {cOk  && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{cOk}</p>}
            <button type="submit" disabled={cSaving} className={`${btnPrimary} w-full mt-1`}>
              {cSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <Plus className="w-4 h-4" />{cSaving ? 'Création...' : 'Créer la chambre'}
            </button>
          </form>
        </div>

        {/* Formulaire création lit */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Nouveau lit</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ajoute un lit dans une chambre existante</p>
          </div>
          <form onSubmit={createLit} className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Numéro du lit *</label>
              <input required value={lNumero} onChange={e => setLNumero(e.target.value)} className={inputCls} placeholder="101-A, 101-B..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chambre *</label>
              {chambres.length === 0
                ? <p className="text-xs text-slate-400 italic bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">Créez d'abord une chambre.</p>
                : (
                  <Combobox
                    value={lChambre}
                    onChange={setLChambre}
                    placeholder="Rechercher une chambre..."
                    emptyLabel="Aucune chambre trouvée"
                    options={chambres.map(c => ({
                      value: c.id,
                      label: `Chambre ${c.numero} — ${TYPE_LABELS[c.type] || c.type}`,
                      sub: [c.etage != null ? `Étage ${c.etage}` : null, `${c.lits.length} lit${c.lits.length !== 1 ? 's' : ''}`].filter(Boolean).join(' · '),
                    }))}
                  />
                )}
            </div>
            {lErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{lErr}</p>}
            {lOk  && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{lOk}</p>}
            <button type="submit" disabled={lSaving || chambres.length === 0} className={`${btnPrimary} w-full mt-1`}>
              {lSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <Plus className="w-4 h-4" />{lSaving ? 'Ajout...' : 'Ajouter le lit'}
            </button>
          </form>
        </div>

        {/* Plan des chambres et lits */}
        {chambres.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-sm">Plan des chambres</h3>
              <p className="text-xs text-slate-400 mt-0.5">Modifiez ou supprimez les chambres et lits. Les lits occupés ne peuvent pas être supprimés.</p>
            </div>
            <div className="divide-y divide-slate-50">
              {chambres.map(chambre => (
                <div key={chambre.id} className="px-5 py-4">
                  {/* En-tête chambre */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800">Chambre {chambre.numero}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{TYPE_LABELS[chambre.type]}</span>
                      {chambre.etage != null && <span className="text-xs text-slate-400">Étage {chambre.etage}</span>}
                      {chambre.service && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{chambre.service.nom}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditChambre(chambre)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier la chambre"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Supprimer la chambre ${chambre.numero} ? (tous ses lits doivent être supprimés d'abord)`)) deleteChambre(chambre.id) }}
                        disabled={deletingChambre === chambre.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Supprimer la chambre"
                      >
                        {deletingChambre === chambre.id
                          ? <div className="w-3.5 h-3.5 border border-red-300 border-t-red-600 rounded-full animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Lits */}
                  {chambre.lits.length === 0 && (
                    <p className="text-xs text-slate-300 italic">Aucun lit dans cette chambre.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {chambre.lits.map(lit => {
                      const cfg = LIT_CFG[lit.statut]
                      const isChanging = statutChanging === lit.id
                      const isDeleting = deletingLit === lit.id
                      return (
                        <div key={lit.id} className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${cfg.bg} ${cfg.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                          <span className="text-xs font-semibold text-slate-700">Lit {lit.numero}</span>
                          {lit.statut !== 'OCCUPE' ? (
                            <>
                              <div className="relative ml-1">
                                <select
                                  value={lit.statut}
                                  disabled={isChanging}
                                  onChange={e => changeStatut(lit.id, e.target.value)}
                                  className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 pr-5 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50 cursor-pointer"
                                >
                                  {STATUTS_MANUELS.map(s => <option key={s} value={s}>{LIT_CFG[s].label}</option>)}
                                </select>
                                {isChanging
                                  ? <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                  : <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400 pointer-events-none" />}
                              </div>
                              <button
                                onClick={() => { if (confirm(`Supprimer le lit ${lit.numero} ?`)) deleteLit(lit.id) }}
                                disabled={isDeleting}
                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 ml-0.5"
                                title="Supprimer ce lit"
                              >
                                {isDeleting
                                  ? <div className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                                  : <Trash2 className="w-3 h-3" />}
                              </button>
                            </>
                          ) : (
                            <span className={`text-[10px] font-semibold ${cfg.text} ml-1`}>Occupé</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Onglet Patients admis ──────────────────────────────────────────────────────

function PatientsAdmisTab({ onSortie, onTransfert, onDossier }: { onSortie: (s: SejourDetail) => void; onTransfert: (s: SejourListe) => void; onDossier: (id: string) => void }) {
  const [sejours, setSejours]       = useState<SejourListe[]>([])
  const [loading, setLoading]       = useState(true)
  const [loadingId, setLoadingId]   = useState<string | null>(null)
  const [search, setSearch]         = useState('')
  const { user } = useAuthStore()
  const canAct = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')

  const fetchSejours = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/hospitalisations/sejours?statut=EN_COURS')
      setSejours(r.data.data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSejours() }, [fetchSejours])
  useSSE(['hospitalisations'], fetchSejours)

  async function handleSortie(sejourId: string) {
    setLoadingId(sejourId)
    try {
      const r = await api.get(`/hospitalisations/sejours/${sejourId}`)
      onSortie(r.data.data)
    } catch {} finally { setLoadingId(null) }
  }

  const filtered = sejours.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return `${s.patient.prenom} ${s.patient.nom} ${s.patient.numero} ${s.lit.chambre.numero} ${s.lit.numero}`.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            placeholder="Nom, chambre, lit..." />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} patient{filtered.length > 1 ? 's' : ''} admis</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <BedDouble className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            {search ? 'Aucun résultat' : 'Aucun patient hospitalisé'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Chambre / Lit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Médecin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Admission</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Durée</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{s.patient.prenom} {s.patient.nom}</p>
                    <p className="text-xs text-slate-400">{s.patient.numero}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">Chambre {s.lit.chambre.numero}</p>
                    <p className="text-xs text-slate-400">
                      Lit {s.lit.numero}
                      {s.lit.chambre.etage != null && ` · Étage ${s.lit.chambre.etage}`}
                      {s.lit.chambre.service && ` · ${s.lit.chambre.service.nom}`}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">Dr. {s.medecin.prenom} {s.medecin.nom}</p>
                    {s.motif && <p className="text-xs text-slate-400 italic truncate max-w-[160px]">"{s.motif}"</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {new Date(s.dateAdmission).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                      {duree(s.dateAdmission)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => onDossier(s.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                        <FolderOpen className="w-3 h-3" />Dossier
                      </button>
                      {canAct && (<>
                        <button onClick={() => onTransfert(s)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors">
                          <ArrowRightLeft className="w-3 h-3" />Transférer
                        </button>
                        <button onClick={() => handleSortie(s.id)} disabled={loadingId === s.id}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          {loadingId === s.id
                            ? <div className="w-3 h-3 border border-emerald-400 border-t-emerald-700 rounded-full animate-spin" />
                            : <LogOut className="w-3 h-3" />}
                          Sortie
                        </button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'vue',     label: 'Vue d\'ensemble', icon: LayoutGrid, roles: null },
  { id: 'admis',   label: 'Patients admis',  icon: List,       roles: null },
  { id: 'stats',   label: 'Statistiques',    icon: BarChart3,  roles: ['ADMIN', 'MEDECIN'] },
  { id: 'config',  label: 'Configuration',   icon: Settings2,  roles: ['ADMIN'] },
] as const
type TabId = typeof TABS[number]['id']

export default function HospitalisationsPage() {
  const { user } = useAuthStore()
  const isAdmin  = user?.role === 'ADMIN'
  const canAct   = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')

  const [tab, setTab]           = useState<TabId>('vue')
  const [chambres, setChambres] = useState<Chambre[]>([])
  const [stats, setStats]       = useState<Stats | null>(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [admissionLit, setAdmissionLit]       = useState<Lit | null>(null)
  const [sortieSejour, setSortieSejour]       = useState<SejourDetail | null>(null)
  const [transfertSejour, setTransfertSejour] = useState<SejourListe | null>(null)
  const [dossierSejourId, setDossierSejourId] = useState<string | null>(null)
  const [loadingSejour, setLoadingSejour]     = useState<string | null>(null)

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const [c, s] = await Promise.all([
        api.get('/hospitalisations/chambres'),
        api.get('/hospitalisations/stats'),
      ])
      setChambres(c.data.data)
      setStats(s.data.data)
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useSSE(['hospitalisations'], () => fetchAll(true))

  async function openSortie(sejourId: string) {
    setLoadingSejour(sejourId)
    try {
      const r = await api.get(`/hospitalisations/sejours/${sejourId}`)
      setSortieSejour(r.data.data)
    } catch {} finally { setLoadingSejour(null) }
  }

  const etages = [...new Set(chambres.map(c => c.etage ?? 0))].sort((a, b) => a - b)

  const visibleTabs = TABS.filter(t =>
    !t.roles || (user?.role && (t.roles as readonly string[]).includes(user.role))
  )

  return (
    <div className="space-y-5">

      {admissionLit && (
        <AdmissionModal lit={admissionLit} onClose={() => setAdmissionLit(null)} onDone={() => { setAdmissionLit(null); fetchAll() }} />
      )}
      {sortieSejour && (
        <SortieModal sejour={sortieSejour} onClose={() => setSortieSejour(null)} onDone={() => { setSortieSejour(null); fetchAll() }} />
      )}
      {transfertSejour && (
        <TransfertModal sejour={transfertSejour} chambres={chambres}
          onClose={() => setTransfertSejour(null)}
          onDone={() => { setTransfertSejour(null); fetchAll() }} />
      )}
      {dossierSejourId && (
        <DossierSejour sejourId={dossierSejourId} onClose={() => setDossierSejourId(null)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospitalisations</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestion des lits et des séjours</p>
        </div>
        <button onClick={() => fetchAll(true)} disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Lits total',     value: stats.total,          icon: BedDouble,    color: 'text-slate-600',   bg: 'bg-slate-50'   },
            { label: 'Disponibles',    value: stats.disponibles,    icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Occupés',        value: stats.occupes,        icon: Users,        color: 'text-red-600',     bg: 'bg-red-50'     },
            { label: 'Maintenance',    value: stats.maintenance,    icon: Wrench,       color: 'text-amber-600',   bg: 'bg-amber-50'   },
            { label: 'Séjours actifs', value: stats.sejoursEnCours, icon: Clock,        color: 'text-blue-600',    bg: 'bg-blue-50'    },
          ].map(k => (
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-slate-200 flex items-center gap-3`}>
              <k.icon className={`w-5 h-5 ${k.color} shrink-0`} />
              <div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-slate-400">{k.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {visibleTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.id === 'admis' && stats && stats.sejoursEnCours > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {stats.sejoursEnCours}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Vue d'ensemble */}
      {tab === 'vue' && (
        <>
          {!loading && chambres.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <BedDouble className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-semibold">Aucune chambre configurée</p>
              {isAdmin
                ? <p className="text-sm text-slate-400 mt-1">Allez dans <strong>Configuration</strong> pour créer vos chambres et lits.</p>
                : <p className="text-sm text-slate-400 mt-1">Un administrateur doit d'abord configurer les chambres.</p>}
            </div>
          )}
          {!loading && etages.map(etage => {
            const etageChambres = chambres.filter(c => (c.etage ?? 0) === etage)
            return (
              <div key={etage} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-700 text-sm">
                    {etage === 0 ? 'Rez-de-chaussée' : `Étage ${etage}`}
                    <span className="ml-2 text-xs text-slate-400 font-normal">{etageChambres.length} chambre{etageChambres.length > 1 ? 's' : ''}</span>
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {etageChambres.map(chambre => (
                    <div key={chambre.id} className="border border-slate-100 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">Chambre {chambre.numero}</span>
                          <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full">
                            {TYPE_LABELS[chambre.type] || chambre.type}
                          </span>
                        </div>
                        {chambre.service && <span className="text-[10px] text-slate-400">{chambre.service.nom}</span>}
                      </div>
                      <div className="p-2 space-y-2">
                        {chambre.lits.length === 0 && <p className="text-xs text-slate-300 italic text-center py-2">Aucun lit</p>}
                        {chambre.lits.map(lit => {
                          const cfg      = LIT_CFG[lit.statut]
                          const sejour   = lit.sejours[0]
                          const isLoad   = loadingSejour === sejour?.id
                          return (
                            <div key={lit.id} className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                                  <span className="text-xs font-bold text-slate-700">Lit {lit.numero}</span>
                                </div>
                                <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
                              </div>
                              {sejour ? (
                                <div className="space-y-1.5">
                                  <p className="text-sm font-semibold text-slate-800">{sejour.patient.prenom} {sejour.patient.nom}</p>
                                  <p className="text-[10px] text-slate-400">{sejour.patient.numero} · {duree(sejour.dateAdmission)}</p>
                                  {sejour.motif && <p className="text-[10px] text-slate-500 italic truncate">"{sejour.motif}"</p>}
                                  {canAct && (
                                    <button onClick={() => openSortie(sejour.id)} disabled={isLoad}
                                      className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                      {isLoad ? <div className="w-3 h-3 border border-emerald-400 border-t-emerald-700 rounded-full animate-spin" /> : <LogOut className="w-3 h-3" />}
                                      Sortie
                                    </button>
                                  )}
                                </div>
                              ) : lit.statut === 'DISPONIBLE' && canAct ? (
                                <button onClick={() => setAdmissionLit(lit)}
                                  className="mt-1 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                                  <Plus className="w-3 h-3" />Admettre
                                </button>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic mt-1">
                                  {lit.statut === 'MAINTENANCE' ? 'En maintenance' : 'Réservé'}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Patients admis */}
      {tab === 'admis' && (
        <PatientsAdmisTab onSortie={setSortieSejour} onTransfert={setTransfertSejour} onDossier={setDossierSejourId} />
      )}

      {/* Statistiques */}
      {tab === 'stats' && <StatistiquesTab />}

      {/* Configuration */}
      {tab === 'config' && isAdmin && (
        <ConfigTab chambres={chambres} onRefresh={() => fetchAll(true)} />
      )}

    </div>
  )
}
