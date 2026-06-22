'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { printRapport } from '@/lib/print'
import {
  BarChart2, Calendar, Stethoscope, FlaskConical, FileText,
  Banknote, AlertTriangle, RefreshCw, Printer, Clock, CheckCircle2,
  BedDouble, TrendingUp, Users
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface RapportJour {
  date: string
  hopital: { nom: string; adresse?: string | null; telephone?: string | null } | null
  appointments: { id: string; dateHeure: string; statut: string; motif?: string; patient: { prenom: string; nom: string; numero: string }; medecin: { prenom: string; nom: string }; service: { nom: string } }[]
  consultations: { id: string; date: string; plainte?: string; diagnostic?: string; patient: { prenom: string; nom: string; numero: string }; medecin: { prenom: string; nom: string } }[]
  examens: { id: string; type: string; statut: string; patient: { prenom: string; nom: string }; medecin: { prenom: string; nom: string } }[]
  facturesJour: { id: string; numero: string; montantTotal: number; montantPaye: number; statut: string; patient: { prenom: string; nom: string } }[]
  recettesJour: number
  impayesTotal: number
}

interface StatsHospi {
  tauxOccupation: number
  totalLits: number
  occupes: number
  sejoursActifsCount: number
  dureeMoyenneH: number
  admissions30j: number
  parService: { nom: string; count: number }[]
  sejoursLongs: { id: string; dateAdmission: string; chambre: string; lit: string; joursHospitalises: number }[]
  admissionsParJour: { date: string; admissions: number; sorties: number }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function fmtMontant(n: number) {
  return n.toLocaleString('fr-FR') + ' HTG'
}

const statutRdvCfg: Record<string, { label: string; color: string }> = {
  PLANIFIE:        { label: 'Planifié',    color: 'text-blue-600 bg-blue-50' },
  EN_ATTENTE:      { label: 'En attente',  color: 'text-amber-600 bg-amber-50' },
  EN_CONSULTATION: { label: 'En cours',    color: 'text-violet-600 bg-violet-50' },
  TERMINE:         { label: 'Terminé',     color: 'text-emerald-600 bg-emerald-50' },
  ANNULE:          { label: 'Annulé',      color: 'text-slate-400 bg-slate-50' },
}

const statutFactureCfg: Record<string, { label: string; color: string }> = {
  EN_ATTENTE:         { label: 'En attente',  color: 'text-red-600 bg-red-50' },
  PARTIELLEMENT_PAYE: { label: 'Partielle',   color: 'text-amber-600 bg-amber-50' },
  PAYE:               { label: 'Payée',       color: 'text-emerald-600 bg-emerald-50' },
  ANNULE:             { label: 'Annulée',     color: 'text-slate-400 bg-slate-50' },
}

function KpiCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: typeof BarChart2; label: string; value: string | number; sub?: string; color: string; bg: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 border border-slate-100`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionTitle({ icon: Icon, label, count }: { icon: typeof BarChart2; label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-slate-400" />
      <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
      {count !== undefined && (
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
      )}
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function RapportsPage() {
  const [rapport, setRapport]     = useState<RapportJour | null>(null)
  const [hospi, setHospi]         = useState<StatsHospi | null>(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [printing, setPrinting]   = useState(false)
  const [activeTab, setActiveTab] = useState<'journalier' | 'hospitalisations'>('journalier')

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const [r, h] = await Promise.all([
        api.get('/stats/rapport'),
        api.get('/hospitalisations/statistiques'),
      ])
      setRapport(r.data.data)
      setHospi(h.data.data)
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function handlePrint() {
    if (!rapport) return
    setPrinting(true)
    try { printRapport(rapport) } finally { setPrinting(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!rapport) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      Impossible de charger les données.
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rapports</h1>
          <p className="text-sm text-slate-400 mt-0.5">{fmtDate(rapport.date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(true)} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button onClick={handlePrint} disabled={printing}
            className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-xl transition-colors disabled:opacity-60">
            {printing
              ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Printer className="w-3.5 h-3.5" />}
            Imprimer le rapport
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'journalier',       label: 'Rapport journalier',    icon: Calendar },
          { id: 'hospitalisations', label: 'Hospitalisations',      icon: BedDouble },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Rapport journalier ─────────────────────────────────────────────── */}
      {activeTab === 'journalier' && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard icon={Calendar}    label="RDV aujourd'hui"   value={rapport.appointments.length}  color="text-blue-600"    bg="bg-blue-50"    />
            <KpiCard icon={Stethoscope} label="Consultations"     value={rapport.consultations.length} color="text-violet-600"  bg="bg-violet-50"  />
            <KpiCard icon={FlaskConical}label="Examens"           value={rapport.examens.length}       color="text-indigo-600"  bg="bg-indigo-50"  />
            <KpiCard icon={FileText}    label="Factures émises"   value={rapport.facturesJour.length}  color="text-orange-600"  bg="bg-orange-50"  />
            <KpiCard icon={Banknote}    label="Recettes du jour"  value={fmtMontant(rapport.recettesJour)} color="text-emerald-600" bg="bg-emerald-50" sub="encaissé aujourd'hui" />
            <KpiCard icon={AlertTriangle} label="Impayés total"  value={fmtMontant(rapport.impayesTotal)} color="text-red-600"     bg="bg-red-50"     sub="toutes factures ouvertes" />
          </div>

          {/* RDV */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <SectionTitle icon={Calendar} label="Rendez-vous du jour" count={rapport.appointments.length} />
            {rapport.appointments.length === 0
              ? <p className="text-sm text-slate-300 italic">Aucun rendez-vous aujourd'hui.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-400 pb-2 pr-4">Heure</th>
                        <th className="text-left text-xs font-semibold text-slate-400 pb-2 pr-4">Patient</th>
                        <th className="text-left text-xs font-semibold text-slate-400 pb-2 pr-4">Médecin</th>
                        <th className="text-left text-xs font-semibold text-slate-400 pb-2 pr-4">Service</th>
                        <th className="text-left text-xs font-semibold text-slate-400 pb-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {rapport.appointments.map(a => {
                        const s = statutRdvCfg[a.statut] || { label: a.statut, color: 'text-slate-500 bg-slate-50' }
                        return (
                          <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{fmtTime(a.dateHeure)}</td>
                            <td className="py-2.5 pr-4 font-medium text-slate-800">{a.patient.prenom} {a.patient.nom} <span className="text-slate-400 font-normal text-xs">#{a.patient.numero}</span></td>
                            <td className="py-2.5 pr-4 text-slate-600">Dr {a.medecin.prenom} {a.medecin.nom}</td>
                            <td className="py-2.5 pr-4 text-slate-500 text-xs">{a.service.nom}</td>
                            <td className="py-2.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </div>

          {/* Consultations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <SectionTitle icon={Stethoscope} label="Consultations du jour" count={rapport.consultations.length} />
            {rapport.consultations.length === 0
              ? <p className="text-sm text-slate-300 italic">Aucune consultation aujourd'hui.</p>
              : (
                <div className="space-y-2">
                  {rapport.consultations.map(c => (
                    <div key={c.id} className="flex items-start gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                      <Stethoscope className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{c.patient.prenom} {c.patient.nom} <span className="text-slate-400 font-normal text-xs">#{c.patient.numero}</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">Dr {c.medecin.prenom} {c.medecin.nom} · {fmtTime(c.date)}</p>
                        {c.plainte && <p className="text-xs text-slate-600 mt-1 italic">Plainte : {c.plainte}</p>}
                        {c.diagnostic && <p className="text-xs text-slate-700 mt-0.5 font-medium">Diag : {c.diagnostic}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Facturation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <SectionTitle icon={FileText} label="Facturation du jour" count={rapport.facturesJour.length} />
            {rapport.facturesJour.length === 0
              ? <p className="text-sm text-slate-300 italic">Aucune facture émise aujourd'hui.</p>
              : (
                <div className="space-y-2">
                  {rapport.facturesJour.map(f => {
                    const s = statutFactureCfg[f.statut] || { label: f.statut, color: 'text-slate-500 bg-slate-50' }
                    return (
                      <div key={f.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{f.patient.prenom} {f.patient.nom}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{f.numero}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">{fmtMontant(f.montantTotal)}</p>
                            {f.montantPaye > 0 && f.montantPaye < f.montantTotal && (
                              <p className="text-[10px] text-amber-600">Payé : {fmtMontant(f.montantPaye)}</p>
                            )}
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                        </div>
                      </div>
                    )
                  })}
                  {/* Total recettes */}
                  <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800">Recettes encaissées aujourd'hui</span>
                    </div>
                    <span className="text-base font-bold text-emerald-700">{fmtMontant(rapport.recettesJour)}</span>
                  </div>
                  {rapport.impayesTotal > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-800">Total impayés (toutes périodes)</span>
                      </div>
                      <span className="text-base font-bold text-red-600">{fmtMontant(rapport.impayesTotal)}</span>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* ── Statistiques hospitalisations ─────────────────────────────────── */}
      {activeTab === 'hospitalisations' && hospi && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard icon={BedDouble}    label="Total lits"          value={hospi.totalLits}           color="text-slate-600"   bg="bg-slate-50"    />
            <KpiCard icon={Users}        label="Lits occupés"        value={hospi.occupes}             color="text-red-600"     bg="bg-red-50"      />
            <KpiCard icon={TrendingUp}   label="Taux d'occupation"   value={`${hospi.tauxOccupation}%`} color="text-blue-600"  bg="bg-blue-50"     />
            <KpiCard icon={BedDouble}    label="Séjours actifs"      value={hospi.sejoursActifsCount}  color="text-violet-600"  bg="bg-violet-50"   />
            <KpiCard icon={Clock}        label="Durée moy. séjour"   value={`${hospi.dureeMoyenneH}h`} color="text-amber-600"  bg="bg-amber-50"    sub="séjours clôturés ce mois" />
            <KpiCard icon={Calendar}     label="Admissions (30j)"    value={hospi.admissions30j}       color="text-emerald-600" bg="bg-emerald-50"  />
          </div>

          {/* Admissions 7 derniers jours */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <SectionTitle icon={BarChart2} label="Admissions et sorties — 7 derniers jours" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-400 pb-2 pr-6">Date</th>
                    <th className="text-center text-xs font-semibold text-slate-400 pb-2 pr-6">Admissions</th>
                    <th className="text-center text-xs font-semibold text-slate-400 pb-2">Sorties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {hospi.admissionsParJour.map(j => (
                    <tr key={j.date} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-6 text-slate-600">
                        {new Date(j.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2.5 pr-6 text-center">
                        <span className={`font-bold ${j.admissions > 0 ? 'text-blue-600' : 'text-slate-300'}`}>{j.admissions}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`font-bold ${j.sorties > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{j.sorties}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Par service */}
          {hospi.parService.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <SectionTitle icon={Users} label="Patients hospitalisés par service" />
              <div className="space-y-3">
                {hospi.parService.map(s => {
                  const max = hospi.parService[0]?.count || 1
                  return (
                    <div key={s.nom}>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>{s.nom}</span>
                        <span className="text-slate-400">{s.count} patient{s.count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(s.count / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Séjours longs */}
          {hospi.sejoursLongs.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-amber-800 text-sm">
                  Séjours longs ({hospi.sejoursLongs.length}) — Hospitalisés depuis plus de 7 jours
                </h3>
              </div>
              <div className="space-y-2">
                {hospi.sejoursLongs.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm">
                    <span className="text-slate-700">Chambre {s.chambre} — Lit {s.lit}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        Depuis le {new Date(s.dateAdmission).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs">
                        {s.joursHospitalises}j
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
