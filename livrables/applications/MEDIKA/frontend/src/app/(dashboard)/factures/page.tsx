'use client'
import { useEffect, useState } from 'react'
import { Facture, FactureStatut, Patient } from '@/types'
import api from '@/lib/api'
import {
  FileText, Plus, X, ChevronRight, Check, Search,
  User as UserIcon, ShoppingCart, CreditCard, AlertTriangle,
  CheckCircle2, Clock, Banknote, Smartphone, AlertCircle, Info, Trash2, Printer, BookOpen
} from 'lucide-react'
import { TarifMedical } from '@/types'
import { printFacture } from '@/lib/print'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ─── Types ────────────────────────────────────────────────────────────────────

type Errors  = Record<string, string>
type Touched = Record<string, boolean>
interface LigneItem { description: string; quantite: string; prixUnitaire: string }
type LigneErrors = { description?: string; quantite?: string; prixUnitaire?: string }

// ─── Validation ───────────────────────────────────────────────────────────────

function validateLigne(l: LigneItem): LigneErrors {
  const e: LigneErrors = {}
  if (!l.description.trim())         e.description  = 'Description requise'
  else if (l.description.trim().length < 2) e.description = 'Trop court (min 2 caractères)'
  const q = parseInt(l.quantite)
  if (!l.quantite || isNaN(q) || q < 1) e.quantite = 'Quantité invalide (min 1)'
  const p = parseFloat(l.prixUnitaire)
  if (!l.prixUnitaire || isNaN(p) || p <= 0) e.prixUnitaire = 'Prix invalide (> 0)'
  return e
}

function validatePaiement(montant: string, methode: string, restant: number): Errors {
  const e: Errors = {}
  const m = parseFloat(montant)
  if (!montant)              e.montant = 'Montant requis'
  else if (isNaN(m) || m <= 0)  e.montant = 'Montant invalide'
  else if (m > restant + 0.01)  e.montant = `Maximum : ${restant.toLocaleString('fr-FR')} HTG`
  if (!methode)              e.methode = 'Sélectionnez une méthode'
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
  return `${base} border-slate-200 focus:ring-orange-500/30 focus:border-orange-400`
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

// ─── Statut config ────────────────────────────────────────────────────────────

const statutConfig: Record<FactureStatut, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  EN_ATTENTE:         { label: 'En attente',  color: 'text-red-600',    bg: 'bg-red-50 border-red-200',    icon: AlertTriangle },
  PARTIELLEMENT_PAYE: { label: 'Partielle',   color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200', icon: Clock },
  PAYE:               { label: 'Payée',       color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  ANNULE:             { label: 'Annulée',     color: 'text-slate-400',  bg: 'bg-slate-50 border-slate-200', icon: X as typeof CheckCircle2 },
}

const methodesOptions = [
  { value: 'CASH',      label: 'Espèces',   icon: Banknote },
  { value: 'CARTE',     label: 'Carte',     icon: CreditCard },
  { value: 'MONCASH',   label: 'MonCash',   icon: Smartphone },
  { value: 'ASSURANCE', label: 'Assurance', icon: CheckCircle2 },
]

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
      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold">
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
      <input
        className={`${inputCls(hasError ? 'err' : undefined)} pl-9`}
        value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, prénom ou numéro de dossier..." />
      {open && results.length > 0 && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {results.slice(0, 6).map(p => (
            <button key={p.id} type="button" onClick={() => pick(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left border-b border-slate-50 last:border-0">
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

// ─── Catalogue picker ─────────────────────────────────────────────────────────

function TarifPicker({ onSelect }: { onSelect: (libelle: string, prix: number) => void }) {
  const [open, setOpen]     = useState(false)
  const [tarifs, setTarifs] = useState<TarifMedical[]>([])
  const [search, setSearch] = useState('')
  const [loaded, setLoaded] = useState(false)

  async function openPicker() {
    if (!loaded) {
      try {
        const r = await api.get('/tarifs')
        setTarifs(r.data.data || [])
        setLoaded(true)
      } catch {}
    }
    setOpen(o => !o)
  }

  const filtered = tarifs.filter(t =>
    !search ||
    t.libelle.toLowerCase().includes(search.toLowerCase()) ||
    (t.categorie || '').toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <button type="button" onClick={openPicker}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
        <BookOpen className="w-3.5 h-3.5" /> Catalogue
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setSearch('') }} />
          <div className="absolute z-20 bottom-full mb-2 left-0 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                placeholder="Chercher un acte médical..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  {tarifs.length === 0 ? 'Aucun tarif configuré dans les Paramètres' : 'Aucun résultat'}
                </p>
              ) : filtered.map(t => (
                <button key={t.id} type="button"
                  onClick={() => { onSelect(t.libelle, t.prixDefaut); setOpen(false); setSearch('') }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0">
                  <div className="min-w-0 mr-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{t.libelle}</p>
                    {t.categorie && <p className="text-xs text-slate-400">{t.categorie}</p>}
                  </div>
                  <span className="text-sm font-bold text-slate-700 shrink-0">{t.prixDefaut.toLocaleString('fr-FR')} HTG</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Lignes de facturation ────────────────────────────────────────────────────

function LignesFacture({ lignes, setLignes, submitted }: {
  lignes: LigneItem[]
  setLignes: (l: LigneItem[]) => void
  submitted: boolean
}) {
  const [touchedRows, setTouchedRows] = useState<Record<number, Touched>>({})

  function touchRow(i: number, field: string) {
    setTouchedRows(t => ({ ...t, [i]: { ...(t[i] || {}), [field]: true } }))
  }

  function update(i: number, field: keyof LigneItem, val: string) {
    setLignes(lignes.map((l, idx) => idx === i ? { ...l, [field]: val } : l))
    touchRow(i, field)
  }

  function add()    { setLignes([...lignes, { description: '', quantite: '1', prixUnitaire: '' }]) }
  function remove(i: number) { setLignes(lignes.filter((_, idx) => idx !== i)) }

  const total = lignes.reduce((s, l) => s + (parseFloat(l.quantite || '0') * parseFloat(l.prixUnitaire || '0')), 0)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid gap-2 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wide" style={{ gridTemplateColumns: '1fr 72px 112px 80px 28px' }}>
        <span>Description</span><span>Qté</span><span>Prix (HTG)</span><span className="text-right">Total</span><span />
      </div>

      {lignes.map((l, i) => {
        const errs  = (submitted || touchedRows[i]) ? validateLigne(l) : {}
        const t     = touchedRows[i] || {}
        const rowTotal = parseFloat(l.quantite || '0') * parseFloat(l.prixUnitaire || '0')
        return (
          <div key={i} className="space-y-1">
            <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '1fr 72px 112px 80px 28px' }}>
              <div>
                <input
                  className={inputCls((submitted || t.description) ? errs.description : undefined, !!l.description && !errs.description)}
                  placeholder="Ex : Consultation générale"
                  value={l.description}
                  onChange={e => update(i, 'description', e.target.value)}
                  onBlur={() => touchRow(i, 'description')} />
              </div>
              <div>
                <input type="number" min="1" step="1"
                  className={inputCls((submitted || t.quantite) ? errs.quantite : undefined, !!l.quantite && !errs.quantite)}
                  value={l.quantite}
                  onChange={e => update(i, 'quantite', e.target.value)}
                  onBlur={() => touchRow(i, 'quantite')} />
              </div>
              <div>
                <input type="number" min="0" step="0.01"
                  className={inputCls((submitted || t.prixUnitaire) ? errs.prixUnitaire : undefined, !!l.prixUnitaire && !errs.prixUnitaire)}
                  placeholder="0.00"
                  value={l.prixUnitaire}
                  onChange={e => update(i, 'prixUnitaire', e.target.value)}
                  onBlur={() => touchRow(i, 'prixUnitaire')} />
              </div>
              <div className={`text-sm font-semibold text-right pt-2.5 ${rowTotal > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                {rowTotal > 0 ? rowTotal.toLocaleString('fr-FR') : '—'}
              </div>
              <div className="flex items-center justify-center pt-1.5">
                {lignes.length > 1 && (
                  <button type="button" onClick={() => remove(i)}
                    className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {(submitted || Object.keys(touchedRows[i] || {}).length > 0) && (
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 72px 112px 80px 28px' }}>
                <FieldError msg={errs.description} />
                <FieldError msg={errs.quantite} />
                <FieldError msg={errs.prixUnitaire} />
              </div>
            )}
          </div>
        )
      })}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button type="button" onClick={add}
            className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
          </button>
          <span className="text-slate-200 text-xs">|</span>
          <TarifPicker onSelect={(libelle, prix) => {
            setLignes([...lignes, { description: libelle, quantite: '1', prixUnitaire: String(prix) }])
          }} />
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">Total facture</p>
            <p className="text-xl font-bold text-slate-900">{total.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">HTG</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Facture modal ────────────────────────────────────────────────────────────

function FactureModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [patientId, setPatientId] = useState('')
  const [patientMissing, setPatientMissing] = useState(false)
  const [lignes, setLignes]       = useState<LigneItem[]>([{ description: '', quantite: '1', prixUnitaire: '' }])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [apiErr, setApiErr]       = useState('')

  const lignesValid = lignes.every(l => {
    const e = validateLigne(l)
    return Object.keys(e).length === 0
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!patientId) { setPatientMissing(true); return }
    if (!lignesValid) return
    setLoading(true); setApiErr('')
    try {
      await api.post('/factures', {
        patientId,
        lignes: lignes.map(l => ({ description: l.description, quantite: parseInt(l.quantite), prixUnitaire: parseFloat(l.prixUnitaire) }))
      })
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1400)
    } catch (err: unknown) {
      setApiErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  function close() {
    setPatientId(''); setPatientMissing(false); setLignes([{ description: '', quantite: '1', prixUnitaire: '' }])
    setSubmitted(false); setApiErr(''); setDone(false); onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-linear-to-br from-orange-500 to-amber-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Nouvelle facture</h2>
              <p className="text-orange-100 text-xs">Créer un acte de facturation</p>
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
              <p className="font-semibold text-slate-900">Facture créée</p>
              <p className="text-sm text-slate-500 mt-1">Enregistrez le paiement depuis la liste</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-5">

              <div>
                <SectionHeader icon={<UserIcon className="w-3 h-3 text-orange-600" />} bg="bg-orange-100" label="Patient" />
                <PatientSearch onSelect={p => { setPatientId(p?.id || ''); setPatientMissing(false) }} hasError={patientMissing && !patientId} />
                {patientMissing && !patientId ? <FieldError msg="Sélectionnez un patient" /> : <Hint msg="Associez cette facture à un dossier patient" />}
              </div>

              <div>
                <SectionHeader icon={<ShoppingCart className="w-3 h-3 text-amber-600" />} bg="bg-amber-100" label="Lignes de facturation" />
                <LignesFacture lignes={lignes} setLignes={setLignes} submitted={submitted} />
                {submitted && !lignesValid && (
                  <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />Corrigez les erreurs dans les lignes avant de continuer
                  </div>
                )}
              </div>

              {apiErr && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{apiErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-400">Toutes les lignes sont obligatoires</p>
              <div className="flex gap-2">
                <button type="button" onClick={close}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-60 transition-all">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Créer la facture <ChevronRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Paiement modal ───────────────────────────────────────────────────────────

function PaiementModal({ facture, open, onClose, onSuccess }: { facture: Facture; open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [montant, setMontant]   = useState('')
  const [methode, setMethode]   = useState('')
  const [touched, setTouched]   = useState<Touched>({})
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [apiErr, setApiErr]     = useState('')

  const restant = facture.montantTotal - facture.montantPaye
  const errors  = validatePaiement(montant, methode, restant)
  const showErr = (f: string) => !!touched[f] && errors[f]

  function touch(f: string) { setTouched(t => ({ ...t, [f]: true })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ montant: true, methode: true })
    const errs = validatePaiement(montant, methode, restant)
    if (Object.keys(errs).length) return
    setLoading(true); setApiErr('')
    try {
      await api.post(`/factures/${facture.id}/paiements`, { methode, montant: parseFloat(montant) })
      setDone(true)
      setTimeout(() => { setDone(false); onSuccess() }, 1400)
    } catch (err: unknown) {
      setApiErr((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  function close() { setMontant(''); setMethode(''); setTouched({}); setApiErr(''); setDone(false); onClose() }

  if (!open) return null

  const montantNum = parseFloat(montant)
  const isFullPay  = !isNaN(montantNum) && Math.abs(montantNum - restant) < 0.01

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-linear-to-br from-emerald-600 to-teal-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Enregistrer un paiement</h3>
              <p className="text-emerald-200 text-xs">{facture.numero}</p>
            </div>
          </div>
          <button onClick={close} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900">Paiement enregistré</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="p-5 space-y-4">
            {/* Solde */}
            <div className="bg-slate-50 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Restant à payer</p>
                <p className="text-2xl font-bold text-slate-900">{restant.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">HTG</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total facture</p>
                <p className="text-sm font-semibold text-slate-600">{facture.montantTotal.toLocaleString('fr-FR')} HTG</p>
                <p className="text-xs text-slate-400">Payé : {facture.montantPaye.toLocaleString('fr-FR')} HTG</p>
              </div>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Montant <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input type="number" min="0.01" step="0.01"
                  className={`${inputCls(showErr('montant') ? errors.montant : undefined, !!montant && !errors.montant)} pr-24`}
                  placeholder={restant.toString()} value={montant}
                  onChange={e => { setMontant(e.target.value); touch('montant') }}
                  onBlur={() => touch('montant')} />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                  <button type="button" onClick={() => { setMontant(restant.toString()); touch('montant') }}
                    className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold px-2 py-1 rounded-lg transition-colors">
                    Tout
                  </button>
                  <span className="text-xs text-slate-400 font-medium self-center pr-1">HTG</span>
                </div>
              </div>
              <FieldError msg={showErr('montant') ? errors.montant : undefined} />
              {montant && !errors.montant && isFullPay && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />Solde intégralement réglé
                </p>
              )}
              {montant && !errors.montant && !isFullPay && montantNum > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Reste après paiement : {(restant - montantNum).toLocaleString('fr-FR')} HTG
                </p>
              )}
            </div>

            {/* Méthode */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Méthode de paiement <span className="text-emerald-500">*</span>
              </label>
              <Select value={methode} onValueChange={v => { setMethode(String(v)); touch('methode') }} onOpenChange={o => { if (!o) touch('methode') }}>
                <SelectTrigger className={`h-10.5 rounded-xl text-sm border ${showErr('methode') ? 'border-red-300 bg-red-50' : methode ? 'border-emerald-300' : 'border-slate-200'}`}>
                  <SelectValue placeholder="Choisir la méthode">
                    {methode ? methodesOptions.find(m => m.value === methode)?.label ?? null : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {methodesOptions.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-2"><m.icon className="w-3.5 h-3.5" />{m.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={showErr('methode') ? errors.methode : undefined} />
            </div>

            {apiErr && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{apiErr}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={close}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-60 transition-all">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Valider le paiement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Facture card ─────────────────────────────────────────────────────────────

function FactureCard({ facture, onRefresh }: { facture: Facture; onRefresh: () => void }) {
  const [paiementOpen, setPaiementOpen] = useState(false)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [cancelling, setCancelling]     = useState(false)
  const cfg  = statutConfig[facture.statut]
  const Icon = cfg.icon
  const pct  = facture.montantTotal > 0 ? Math.min(100, Math.round((facture.montantPaye / facture.montantTotal) * 100)) : 0

  async function handleAnnuler() {
    setCancelling(true)
    try { await api.patch(`/factures/${facture.id}/annuler`, {}); setConfirmOpen(false); onRefresh() }
    catch {}
    finally { setCancelling(false) }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-linear-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold">
                {facture.patient.prenom[0]}{facture.patient.nom[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{facture.patient.prenom} {facture.patient.nom}</p>
                <p className="text-xs text-slate-400 font-mono">{facture.numero}</p>
              </div>
            </div>
            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${cfg.bg} ${cfg.color}`}>
              <Icon className="w-3 h-3" />{cfg.label}
            </span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>{facture.montantPaye.toLocaleString('fr-FR')} HTG payés</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-red-400'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <p className="text-right text-xs text-slate-400 mt-1.5">
              Total : <span className="font-bold text-slate-700">{facture.montantTotal.toLocaleString('fr-FR')} HTG</span>
            </p>
          </div>

          {facture.lignes?.length > 0 && (
            <div className="text-xs text-slate-400 border-t border-slate-50 pt-2.5 space-y-0.5">
              {facture.lignes.slice(0, 3).map((l, i) => (
                <p key={i} className="truncate">{l.quantite}× {l.description}</p>
              ))}
              {facture.lignes.length > 3 && <p className="text-slate-300">+{facture.lignes.length - 3} autre(s)</p>}
            </div>
          )}
        </div>

        <div className="px-4 pb-3 flex gap-2">
          {!['PAYE', 'ANNULE'].includes(facture.statut) && (
            <>
              <button onClick={() => setPaiementOpen(true)}
                className="flex-1 text-xs font-semibold py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Paiement
              </button>
              <button onClick={() => setConfirmOpen(true)} disabled={cancelling}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors flex items-center gap-1 disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" /> Annuler
              </button>
            </>
          )}
          <button onClick={() => printFacture(facture)} title="Imprimer la facture"
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 hover:bg-violet-50 text-slate-400 hover:text-violet-600 border border-slate-200 hover:border-violet-200 transition-colors flex items-center gap-1">
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <PaiementModal facture={facture} open={paiementOpen}
        onClose={() => setPaiementOpen(false)}
        onSuccess={() => { setPaiementOpen(false); onRefresh() }} />

      <ConfirmModal
        open={confirmOpen}
        title="Annuler la facture"
        message={`Annuler la facture ${facture.numero} (${facture.montantTotal.toLocaleString('fr-FR')} HTG) ? Cette action est irréversible.`}
        confirmLabel="Annuler la facture"
        loading={cancelling}
        onConfirm={handleAnnuler}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(false)
  const [filter, setFilter]     = useState<FactureStatut | 'TOUTES'>('TOUTES')

  async function fetchFactures() {
    setLoading(true)
    try {
      const url = filter !== 'TOUTES' ? `/factures?statut=${filter}` : '/factures'
      const r = await api.get(url)
      setFactures(r.data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchFactures() }, [filter])

  const filters: { value: FactureStatut | 'TOUTES'; label: string }[] = [
    { value: 'TOUTES',              label: 'Toutes' },
    { value: 'EN_ATTENTE',          label: 'Non payées' },
    { value: 'PARTIELLEMENT_PAYE',  label: 'Partielles' },
    { value: 'PAYE',                label: 'Payées' },
    { value: 'ANNULE',              label: 'Annulées' },
  ]

  const totalImpayes = factures
    .filter(f => ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'].includes(f.statut))
    .reduce((s, f) => s + (f.montantTotal - f.montantPaye), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${filter === f.value ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
              {f.label}
            </button>
          ))}
          {totalImpayes > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />{totalImpayes.toLocaleString('fr-FR')} HTG impayés
            </div>
          )}
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all">
          <Plus className="w-4 h-4" /> Nouvelle facture
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : factures.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">Aucune facture trouvée</p>
          <button onClick={() => setOpen(true)} className="mt-4 text-sm text-orange-600 hover:underline">Créer une facture</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {factures.map(f => <FactureCard key={f.id} facture={f} onRefresh={fetchFactures} />)}
        </div>
      )}

      <FactureModal open={open} onClose={() => setOpen(false)} onSuccess={() => { setOpen(false); fetchFactures() }} />
    </div>
  )
}
