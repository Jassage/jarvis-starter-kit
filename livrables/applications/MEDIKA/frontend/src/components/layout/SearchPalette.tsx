'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Users, FileText, FlaskConical, ArrowRight, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface PatientResult  { id: string; prenom: string; nom: string; numero: string; dateNaissance: string; sexe: 'M' | 'F'; telephone: string }
interface FactureResult  { id: string; numero: string; statut: string; montantTotal: number; montantPaye: number; createdAt: string; patient: { id: string; prenom: string; nom: string; numero: string } }
interface ExamenResult   { id: string; type: string; statut: string; createdAt: string; patient: { id: string; prenom: string; nom: string }; medecin: { prenom: string; nom: string } }

interface Results { patients: PatientResult[]; factures: FactureResult[]; examens: ExamenResult[] }

const FACT_STATUT: Record<string, { label: string; color: string }> = {
  EN_ATTENTE:         { label: 'Impayée',   color: 'text-red-600' },
  PARTIELLEMENT_PAYE: { label: 'Partielle', color: 'text-amber-600' },
  PAYE:               { label: 'Payée',     color: 'text-emerald-600' },
  ANNULE:             { label: 'Annulée',   color: 'text-slate-400' },
}
const EXAM_STATUT: Record<string, string> = {
  EN_ATTENTE: 'En attente', EN_COURS: 'En cours',
  RESULTAT_DISPONIBLE: 'Résultat dispo.', VALIDE: 'Validé', ANNULE: 'Annulé',
}

function age(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Item =
  | { kind: 'patient'; data: PatientResult }
  | { kind: 'facture'; data: FactureResult }
  | { kind: 'examen';  data: ExamenResult }

interface SearchPaletteProps { open: boolean; onClose: () => void }

export default function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<Results | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState(0)

  // Flat list for keyboard nav
  const items: Item[] = [
    ...(results?.patients ?? []).map(d => ({ kind: 'patient' as const, data: d })),
    ...(results?.factures ?? []).map(d => ({ kind: 'facture' as const, data: d })),
    ...(results?.examens  ?? []).map(d => ({ kind: 'examen'  as const, data: d })),
  ]

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults(null); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await api.get(`/search?q=${encodeURIComponent(query)}`)
        setResults(r.data.data)
        setSelected(0)
      } catch {} finally { setLoading(false) }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery(''); setResults(null); setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, items.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && items[selected]) { navigate(items[selected]) }
  }, [items, selected, onClose])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  function navigate(item: Item) {
    onClose()
    if (item.kind === 'patient') router.push(`/patients/${item.data.id}`)
    if (item.kind === 'facture') router.push(`/factures`)
    if (item.kind === 'examen')  router.push(`/examens`)
  }

  const hasResults = results && items.length > 0
  const isEmpty    = results && items.length === 0 && query.length >= 2

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          {loading
            ? <Loader2 className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
            : <Search className="w-4 h-4 text-slate-400 shrink-0" />}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un patient, une facture, un examen…"
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus() }}
              className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
              <X className="w-3 h-3 text-slate-500" />
            </button>
          )}
          <kbd className="shrink-0 text-[10px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-400">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">

          {/* Patients */}
          {(results?.patients ?? []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                <Users className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Patients</span>
              </div>
              {results!.patients.map(p => {
                const idx = items.findIndex(it => it.kind === 'patient' && it.data.id === p.id)
                const gradients = ['from-blue-400 to-blue-600','from-violet-400 to-violet-600','from-teal-400 to-teal-600','from-rose-400 to-rose-600','from-amber-400 to-amber-600']
                const grad = gradients[(p.prenom.charCodeAt(0) + p.nom.charCodeAt(0)) % gradients.length]
                return (
                  <button key={p.id} data-idx={idx}
                    onClick={() => navigate({ kind: 'patient', data: p })}
                    className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group',
                      selected === idx ? 'bg-blue-50' : 'hover:bg-slate-50')}>
                    <div className={`w-8 h-8 bg-gradient-to-br ${grad} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {p.prenom[0]}{p.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.prenom} {p.nom}</p>
                      <p className="text-xs text-slate-400">{age(p.dateNaissance)} ans · {p.sexe === 'M' ? 'M' : 'F'} · {p.telephone}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{p.numero}</span>
                      <ArrowRight className={cn('w-3.5 h-3.5 text-slate-300 transition-opacity', selected === idx ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100')} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Factures */}
          {(results?.factures ?? []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 border-t border-slate-50">
                <FileText className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Factures</span>
              </div>
              {results!.factures.map(f => {
                const idx = items.findIndex(it => it.kind === 'facture' && it.data.id === f.id)
                const s   = FACT_STATUT[f.statut] ?? { label: f.statut, color: 'text-slate-500' }
                return (
                  <button key={f.id} data-idx={idx}
                    onClick={() => navigate({ kind: 'facture', data: f })}
                    className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group',
                      selected === idx ? 'bg-blue-50' : 'hover:bg-slate-50')}>
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{f.patient.prenom} {f.patient.nom}</p>
                      <p className="text-xs text-slate-400">{f.numero} · {fmtDate(f.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                      <span className="text-xs font-bold text-slate-700">{f.montantTotal.toLocaleString('fr-FR')} G</span>
                      <ArrowRight className={cn('w-3.5 h-3.5 text-slate-300 transition-opacity', selected === idx ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100')} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Examens */}
          {(results?.examens ?? []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 border-t border-slate-50">
                <FlaskConical className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Examens</span>
              </div>
              {results!.examens.map(e => {
                const idx = items.findIndex(it => it.kind === 'examen' && it.data.id === e.id)
                return (
                  <button key={e.id} data-idx={idx}
                    onClick={() => navigate({ kind: 'examen', data: e })}
                    className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group',
                      selected === idx ? 'bg-blue-50' : 'hover:bg-slate-50')}>
                    <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center shrink-0">
                      <FlaskConical className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{e.patient.prenom} {e.patient.nom}</p>
                      <p className="text-xs text-slate-400">{e.type} · Dr {e.medecin.prenom} {e.medecin.nom}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400">{EXAM_STATUT[e.statut] ?? e.statut}</span>
                      <ArrowRight className={cn('w-3.5 h-3.5 text-slate-300 transition-opacity', selected === idx ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100')} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Vide */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-sm">Aucun résultat pour <strong className="text-slate-600">"{query}"</strong></p>
            </div>
          )}

          {/* Invite initiale */}
          {!results && !loading && (
            <div className="px-4 py-8 text-center text-slate-400">
              <p className="text-sm">Tapez au moins 2 caractères pour chercher</p>
              <p className="text-xs mt-1 text-slate-300">Patients · Factures · Examens</p>
            </div>
          )}
        </div>

        {/* Footer hints */}
        {hasResults && (
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
            {[['↑↓', 'Naviguer'], ['↵', 'Ouvrir'], ['Esc', 'Fermer']].map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <kbd className="text-[9px] bg-white border border-slate-200 rounded px-1 py-0.5 font-mono text-slate-500">{key}</kbd>
                <span className="text-[10px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
