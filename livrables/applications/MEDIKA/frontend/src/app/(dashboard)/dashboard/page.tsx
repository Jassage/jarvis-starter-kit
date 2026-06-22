'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { useSSE } from '@/hooks/useSSE'
import {
  Users, Calendar, FileText, Activity, Clock, Stethoscope, Plus, ChevronRight,
  TrendingUp, Banknote, RefreshCw, UserCheck, Building2, Printer, FlaskConical,
  BedDouble, AlertCircle, CheckCircle2, ArrowRight, Phone, CreditCard, Pill,
} from 'lucide-react'
import Link from 'next/link'
import { printRapport } from '@/lib/print'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartPoint  { date: string; label: string; value: number }
interface ChartGroup  { statut: string; count: number }
interface ChartData {
  consultations7j:     ChartPoint[]
  recettes7j:          ChartPoint[]
  rdvParStatut:        ChartGroup[]
  facturesParStatut:   ChartGroup[]
  examensParStatut:    ChartGroup[]
  paiementsParMethode: { methode: string; montant: number }[]
  fileAttenteStatuts:  ChartGroup[]
  litsOccupation:      { occupe: number; libre: number }
}
interface AppointmentSummary {
  id: string; dateHeure: string; statut: string; motif?: string
  patient: { id: string; prenom: string; nom: string; numero: string }
  medecin: { id: string; prenom: string; nom: string }
  service: { id: string; nom: string }
}
interface RecentPatient {
  id: string; prenom: string; nom: string; numero: string
  dateNaissance: string; telephone: string; sexe: 'M' | 'F'; createdAt: string
}
interface DashboardStats {
  patientsTotal: number
  appointmentsAujourdhui: number
  appointmentsEnAttente: number
  consultationsAujourdhui: number
  facturesImpayes: number
  montantImpayes: number
  examensEnAttente: number
  sejoursActifs: number
  litsOccupes: number
  litsTotal: number
  recettesJour: number
  patientsAujourdhui: number
  appointmentDetails: AppointmentSummary[]
  recentPatients: RecentPatient[]
  chartData: ChartData
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(d: string)    { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
function age(dob: string)      { return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)) }
function fmtMontant(n: number) { return n.toLocaleString('fr-FR') + ' HTG' }

const avatarGradients = [
  'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600',
  'from-teal-400 to-teal-600', 'from-rose-400 to-rose-600', 'from-amber-400 to-amber-600',
]
const statutConfig: Record<string, { label: string; dot: string; badge: string }> = {
  PLANIFIE:        { label: 'Planifié',  dot: 'bg-blue-400',              badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  EN_ATTENTE:      { label: 'En attente', dot: 'bg-amber-400 animate-pulse', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  EN_CONSULTATION: { label: 'En cours',   dot: 'bg-violet-500 animate-pulse', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  TERMINE:         { label: 'Terminé',    dot: 'bg-emerald-400',           badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ANNULE:          { label: 'Annulé',     dot: 'bg-slate-300',             badge: 'bg-slate-50 text-slate-400 border-slate-200' },
}

// ─── Chart: Bar ───────────────────────────────────────────────────────────────

const BAR_H = 96 // pixels — matches h-24

function BarChart({ data, color = '#6366f1', formatVal }: {
  data: ChartPoint[]
  color?: string
  formatVal?: (v: number) => string
}) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5 h-24">
        {data.map((d, i) => {
          const barPx = Math.max((d.value / max) * BAR_H, d.value > 0 ? 3 : 0)
          return (
            <div key={i} className="relative flex-1 group" style={{ height: `${barPx}px` }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {formatVal ? formatVal(d.value) : d.value}
              </div>
              <div
                className="w-full h-full rounded-t-md"
                style={{
                  backgroundColor: color,
                  opacity: 0.5 + (d.value / max) * 0.5,
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-slate-400 truncate">{d.label}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Chart: Donut ─────────────────────────────────────────────────────────────

function DonutChart({ data, colors }: {
  data: { label: string; value: number }[]
  colors: string[]
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <p className="text-center text-slate-300 text-xs py-6 italic">Aucune donnée</p>

  const cx = 60, cy = 60, R = 46, ri = 30
  let angle = -90

  const segments = data.filter(d => d.value > 0).map((d, i) => {
    const start  = angle
    const sweep  = (d.value / total) * 360
    angle += sweep
    if (sweep >= 359.99) {
      return { isCircle: true, color: colors[i % colors.length], label: d.label, value: d.value, pct: 100, path: '' }
    }
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const x1 = cx + R * Math.cos(toRad(start));  const y1 = cy + R * Math.sin(toRad(start))
    const x2 = cx + R * Math.cos(toRad(angle));  const y2 = cy + R * Math.sin(toRad(angle))
    const xi1 = cx + ri * Math.cos(toRad(start)); const yi1 = cy + ri * Math.sin(toRad(start))
    const xi2 = cx + ri * Math.cos(toRad(angle)); const yi2 = cy + ri * Math.sin(toRad(angle))
    const large = sweep > 180 ? 1 : 0
    const path = `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${ri},${ri} 0 ${large},0 ${xi1},${yi1} Z`
    return { isCircle: false, path, color: colors[i % colors.length], label: d.label, value: d.value, pct: Math.round((d.value / total) * 100) }
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0">
        {segments.map((s, i) =>
          s.isCircle ? (
            <g key={i}>
              <circle cx={cx} cy={cy} r={R} fill={s.color} />
              <circle cx={cx} cy={cy} r={ri} fill="white" />
            </g>
          ) : (
            <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
          )
        )}
        <text x="60" y="56" textAnchor="middle" fill="#0f172a" style={{ fontSize: '15px', fontWeight: 700 }}>{total}</text>
        <text x="60" y="68" textAnchor="middle" fill="#94a3b8" style={{ fontSize: '8px' }}>total</text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-500 truncate flex-1">{s.label}</span>
            <span className="font-semibold text-slate-700 shrink-0">{s.value}</span>
            <span className="text-slate-400 shrink-0 w-7 text-right text-[10px]">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared: KPI Card ─────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, gradient, iconBg, textColor, href, sub, alert }: {
  label: string; value: string | number; icon: any; gradient: string
  iconBg: string; textColor: string; href: string; sub?: string; alert?: string | null
}) {
  return (
    <Link href={href}
      className={`group bg-linear-to-br ${gradient} rounded-2xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <ChevronRight className={`w-3.5 h-3.5 ${textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
      {sub && (
        <div className="flex items-center gap-1 mt-1.5">
          {alert === 'danger' && <AlertCircle className="w-3 h-3 text-orange-500" />}
          {alert === 'ok'     && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
          {alert === 'warn'   && <Clock className="w-3 h-3 text-amber-500" />}
          <span className={`text-xs font-medium ${
            alert === 'danger' ? 'text-orange-600' :
            alert === 'ok'     ? 'text-emerald-600' :
            alert === 'warn'   ? 'text-amber-600' : 'text-slate-400'
          }`}>{sub}</span>
        </div>
      )}
    </Link>
  )
}

// ─── Shared: Chart Card ───────────────────────────────────────────────────────

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Shared: Queue List (FileAttente) ────────────────────────────────────────

interface FAEntry {
  id: string; numero: number; priorite?: string; statut: string
  patient: { prenom: string; nom: string; numero: string }
  medecin?: { prenom: string; nom: string } | null
  motif?: string
}

const FA_STATUT: Record<string, { label: string; dot: string; badge: string }> = {
  EN_ATTENTE:      { label: 'En attente',     dot: 'bg-amber-400 animate-pulse',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  EN_CONSULTATION: { label: 'En consultation', dot: 'bg-violet-500 animate-pulse', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  TERMINE:         { label: 'Terminé',         dot: 'bg-emerald-400',              badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ABSENT:          { label: 'Absent',           dot: 'bg-slate-300',               badge: 'bg-slate-50 text-slate-400 border-slate-200' },
}

function QueueList({ entries, loading }: { entries: FAEntry[]; loading: boolean }) {
  const active = entries.filter(e => ['EN_ATTENTE', 'EN_CONSULTATION'].includes(e.statut))
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">File d'attente</h3>
            <p className="text-xs text-slate-400">{active.length} patient{active.length !== 1 ? 's' : ''} en attente ou en cours</p>
          </div>
        </div>
        <Link href="/file-attente" className="text-xs text-amber-600 font-semibold flex items-center gap-1">
          Gérer <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      {loading ? (
        <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : active.length === 0 ? (
        <div className="text-center py-10">
          <CheckCircle2 className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">File d'attente vide</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {active.slice(0, 6).map(e => {
            const cfg = FA_STATUT[e.statut] ?? FA_STATUT.EN_ATTENTE
            const grad = avatarGradients[(e.patient.prenom.charCodeAt(0) + e.patient.nom.charCodeAt(0)) % avatarGradients.length]
            const isUrgent = e.priorite === 'URGENT' || e.priorite === 'CRITIQUE'
            return (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                  isUrgent && e.priorite === 'CRITIQUE' ? 'bg-red-600 text-white' :
                  isUrgent ? 'bg-orange-500 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}>#{e.numero}</div>
                <div className={`w-8 h-8 bg-linear-to-br ${grad} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {e.patient.prenom[0]}{e.patient.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{e.patient.prenom} {e.patient.nom}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {e.motif ?? e.patient.numero}
                    {e.medecin && ` · Dr. ${e.medecin.prenom} ${e.medecin.nom}`}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badge} shrink-0`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Shared: Header ───────────────────────────────────────────────────────────

function DashboardHeader({ prenom, role, loading, refreshing, lastUpdate, onRefresh, onPrint, printLoading }: {
  prenom?: string; role?: string; loading: boolean; refreshing: boolean
  lastUpdate: Date; onRefresh: () => void; onPrint: () => void; printLoading: boolean
}) {
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrateur', MEDECIN: 'Médecin', INFIRMIER: 'Infirmier',
    CAISSIER: 'Caissier', ACCUEIL: 'Accueil',
  }
  return (
    <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{role ? roleLabel[role] : ''}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {prenom}</h1>
        <p className="text-slate-500 mt-0.5 capitalize text-sm">{today}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onRefresh} disabled={refreshing || loading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </button>
        {(role === 'ADMIN' || role === 'MEDECIN') && (
          <button onClick={onPrint} disabled={printLoading}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
            {printLoading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <Printer className="w-4 h-4" />}
            Rapport
          </button>
        )}
      </div>
    </div>
  )
}

// ─── ADMIN Dashboard ──────────────────────────────────────────────────────────

function DashboardAdmin({ stats, loading, queue }: { stats: DashboardStats | null; loading: boolean; queue: FAEntry[] }) {
  const kpis = stats ? [
    { label: 'Patients actifs',       value: stats.patientsTotal,           icon: Users,         gradient: 'from-blue-50 to-blue-100/50',     iconBg: 'bg-blue-500',    textColor: 'text-blue-600',    href: '/patients',      sub: `+${stats.patientsAujourdhui} aujourd'hui`, alert: null },
    { label: "RDV aujourd'hui",        value: stats.appointmentsAujourdhui,  icon: Calendar,      gradient: 'from-violet-50 to-violet-100/50', iconBg: 'bg-violet-500',  textColor: 'text-violet-600',  href: '/appointments',  sub: `${stats.appointmentsEnAttente} en attente`, alert: stats.appointmentsEnAttente > 0 ? 'warn' : null },
    { label: 'Consultations du jour', value: stats.consultationsAujourdhui, icon: Stethoscope,   gradient: 'from-teal-50 to-teal-100/50',    iconBg: 'bg-teal-500',    textColor: 'text-teal-600',    href: '/consultations', sub: 'saisies aujourd\'hui', alert: null },
    { label: 'Factures impayées',     value: stats.facturesImpayes,         icon: Banknote,      gradient: stats.facturesImpayes > 0 ? 'from-orange-50 to-orange-100/50' : 'from-emerald-50 to-emerald-100/50', iconBg: stats.facturesImpayes > 0 ? 'bg-orange-500' : 'bg-emerald-500', textColor: stats.facturesImpayes > 0 ? 'text-orange-600' : 'text-emerald-600', href: '/factures', sub: fmtMontant(stats.montantImpayes), alert: stats.facturesImpayes > 0 ? 'danger' : 'ok' },
    { label: 'Examens en attente',    value: stats.examensEnAttente ?? 0,   icon: FlaskConical,  gradient: (stats.examensEnAttente ?? 0) > 0 ? 'from-sky-50 to-sky-100/50' : 'from-slate-50 to-slate-100/50', iconBg: (stats.examensEnAttente ?? 0) > 0 ? 'bg-sky-500' : 'bg-slate-400', textColor: (stats.examensEnAttente ?? 0) > 0 ? 'text-sky-600' : 'text-slate-400', href: '/examens', sub: 'résultats à saisir', alert: (stats.examensEnAttente ?? 0) > 0 ? 'warn' : null },
    { label: 'Hospitalisés',          value: stats.sejoursActifs,            icon: BedDouble,     gradient: 'from-red-50 to-red-100/50',      iconBg: 'bg-red-500',     textColor: 'text-red-600',     href: '/hospitalisations', sub: `${stats.litsOccupes}/${stats.litsTotal} lits`, alert: null },
    { label: 'Recettes du jour',      value: fmtMontant(stats.recettesJour), icon: TrendingUp,   gradient: 'from-emerald-50 to-emerald-100/50', iconBg: 'bg-emerald-600', textColor: 'text-emerald-600', href: '/factures', sub: 'paiements encaissés', alert: 'ok' },
  ] : []

  const rdvColors: Record<string, string> = { PLANIFIE: '#3b82f6', EN_ATTENTE: '#f59e0b', EN_CONSULTATION: '#8b5cf6', TERMINE: '#10b981', ANNULE: '#94a3b8' }
  const rdvLabels: Record<string, string> = { PLANIFIE: 'Planifié', EN_ATTENTE: 'En attente', EN_CONSULTATION: 'En cours', TERMINE: 'Terminé', ANNULE: 'Annulé' }
  const factureColors: Record<string, string> = { EN_ATTENTE: '#ef4444', PARTIELLEMENT_PAYE: '#f59e0b', PAYE: '#10b981', ANNULE: '#94a3b8' }
  const factureLabels: Record<string, string> = { EN_ATTENTE: 'Impayée', PARTIELLEMENT_PAYE: 'Partielle', PAYE: 'Payée', ANNULE: 'Annulée' }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
        {loading ? [...Array(7)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)
          : kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <ChartCard title="Consultations — 7 derniers jours" sub="Toutes consultations">
          {loading ? <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
            : <BarChart data={stats?.chartData?.consultations7j ?? []} color="#14b8a6" />}
        </ChartCard>

        <ChartCard title="Recettes — 7 derniers jours" sub="Paiements encaissés">
          {loading ? <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
            : <BarChart data={stats?.chartData?.recettes7j ?? []} color="#10b981" formatVal={fmtMontant} />}
        </ChartCard>

        <ChartCard title="RDV par statut" sub="Aujourd'hui">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart
                data={(stats?.chartData?.rdvParStatut ?? []).map(r => ({ label: rdvLabels[r.statut] ?? r.statut, value: r.count }))}
                colors={(stats?.chartData?.rdvParStatut ?? []).map(r => rdvColors[r.statut] ?? '#94a3b8')}
              />}
        </ChartCard>

        <ChartCard title="Factures par statut" sub="Total global">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart
                data={(stats?.chartData?.facturesParStatut ?? []).map(r => ({ label: factureLabels[r.statut] ?? r.statut, value: r.count }))}
                colors={(stats?.chartData?.facturesParStatut ?? []).map(r => factureColors[r.statut] ?? '#94a3b8')}
              />}
        </ChartCard>
      </div>

      {/* File + Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <QueueList entries={queue} loading={loading} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Derniers patients</h3>
            </div>
            <Link href="/patients" className="text-xs text-blue-600 font-semibold flex items-center gap-1">Voir <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {loading ? <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            : (stats?.recentPatients ?? []).map(p => {
              const grad = avatarGradients[(p.prenom.charCodeAt(0) + p.nom.charCodeAt(0)) % avatarGradients.length]
              return (
                <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <div className={`w-8 h-8 bg-linear-to-br ${grad} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>{p.prenom[0]}{p.nom[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.prenom} {p.nom}</p>
                    <p className="text-[10px] text-slate-400">{age(p.dateNaissance)} ans · {p.sexe === 'M' ? 'M' : 'F'}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
                </Link>
              )
            })}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 text-sm">Actions rapides</h2>
          <Link href="/users" className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"><Building2 className="w-3 h-3" />Gérer les accès</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/patients',      icon: Users,       label: 'Nouveau patient',  gradient: 'from-blue-500 to-blue-600',     shadow: 'shadow-blue-500/25' },
            { href: '/appointments',  icon: Calendar,    label: 'Rendez-vous',       gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/25' },
            { href: '/consultations', icon: Stethoscope, label: 'Consultation',      gradient: 'from-teal-500 to-teal-600',    shadow: 'shadow-teal-500/25' },
            { href: '/factures',      icon: FileText,    label: 'Facturation',       gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/25' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-2.5 p-3.5 bg-linear-to-r ${a.gradient} rounded-xl shadow-md ${a.shadow} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <a.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white text-sm font-semibold">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MEDECIN Dashboard ────────────────────────────────────────────────────────

function DashboardMedecin({ stats, loading, queue }: { stats: DashboardStats | null; loading: boolean; queue: FAEntry[] }) {
  const examenColors: Record<string, string> = { EN_ATTENTE: '#f59e0b', EN_COURS: '#0ea5e9', RESULTAT_DISPONIBLE: '#10b981', ANNULE: '#94a3b8' }
  const examenLabels: Record<string, string> = { EN_ATTENTE: 'En attente', EN_COURS: 'En cours', RESULTAT_DISPONIBLE: 'Résultat dispo.', ANNULE: 'Annulé' }

  const kpis = stats ? [
    { label: 'Mes consultations',  value: stats.consultationsAujourdhui, icon: Stethoscope, gradient: 'from-teal-50 to-teal-100/50',   iconBg: 'bg-teal-500',   textColor: 'text-teal-600',   href: '/consultations', sub: 'réalisées aujourd\'hui', alert: null },
    { label: 'Mes RDV du jour',    value: stats.appointmentsAujourdhui,  icon: Calendar,   gradient: 'from-violet-50 to-violet-100/50', iconBg: 'bg-violet-500', textColor: 'text-violet-600', href: '/appointments',  sub: `${stats.appointmentsEnAttente} en attente`, alert: stats.appointmentsEnAttente > 0 ? 'warn' : null },
    { label: 'Examens prescrits',  value: stats.examensEnAttente ?? 0,   icon: FlaskConical, gradient: (stats.examensEnAttente ?? 0) > 0 ? 'from-sky-50 to-sky-100/50' : 'from-slate-50 to-slate-100/50', iconBg: (stats.examensEnAttente ?? 0) > 0 ? 'bg-sky-500' : 'bg-slate-400', textColor: 'text-sky-600', href: '/examens', sub: 'résultats attendus', alert: (stats.examensEnAttente ?? 0) > 0 ? 'warn' : null },
    { label: 'Patients hospitalisés', value: stats.sejoursActifs,        icon: BedDouble,  gradient: 'from-red-50 to-red-100/50',      iconBg: 'bg-red-500',    textColor: 'text-red-600',    href: '/hospitalisations', sub: `${stats.litsOccupes}/${stats.litsTotal} lits`, alert: null },
  ] : []

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)
          : kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Mes consultations — 7 jours" sub="Filtrées à mes patients">
          {loading ? <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
            : <BarChart data={stats?.chartData?.consultations7j ?? []} color="#14b8a6" />}
        </ChartCard>

        <ChartCard title="Examens par statut" sub="Mes prescriptions">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart
                data={(stats?.chartData?.examensParStatut ?? []).map(r => ({ label: examenLabels[r.statut] ?? r.statut, value: r.count }))}
                colors={(stats?.chartData?.examensParStatut ?? []).map(r => examenColors[r.statut] ?? '#94a3b8')}
              />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <QueueList entries={queue} loading={loading} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Actions</h3>
          <div className="space-y-2.5">
            {[
              { href: '/consultations', icon: Stethoscope, label: 'Nouvelle consultation', gradient: 'from-teal-500 to-teal-600' },
              { href: '/appointments',  icon: Calendar,    label: 'Mes rendez-vous',        gradient: 'from-violet-500 to-violet-600' },
              { href: '/examens',       icon: FlaskConical, label: 'Prescrire un examen',   gradient: 'from-sky-500 to-sky-600' },
              { href: '/hospitalisations', icon: BedDouble, label: 'Hospitalisations',      gradient: 'from-red-500 to-red-600' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`flex items-center gap-3 p-3 bg-linear-to-r ${a.gradient} rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0"><a.icon className="w-4 h-4 text-white" /></div>
                <p className="text-white text-sm font-semibold">{a.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── INFIRMIER Dashboard ──────────────────────────────────────────────────────

function DashboardInfirmier({ stats, loading, queue }: { stats: DashboardStats | null; loading: boolean; queue: FAEntry[] }) {
  const fileAttenteStatuts = stats?.chartData?.fileAttenteStatuts ?? []
  const enAttente = fileAttenteStatuts.find(s => s.statut === 'EN_ATTENTE')?.count ?? 0
  const enConsultation = fileAttenteStatuts.find(s => s.statut === 'EN_CONSULTATION')?.count ?? 0

  const kpis = stats ? [
    { label: 'Patients hospitalisés', value: stats.sejoursActifs,  icon: BedDouble,   gradient: 'from-red-50 to-red-100/50',    iconBg: 'bg-red-500',    textColor: 'text-red-600',    href: '/hospitalisations', sub: 'séjours en cours', alert: null },
    { label: 'Lits occupés',          value: `${stats.litsOccupes}/${stats.litsTotal}`, icon: Building2, gradient: 'from-amber-50 to-amber-100/50', iconBg: 'bg-amber-500', textColor: 'text-amber-600', href: '/hospitalisations', sub: `${stats.litsTotal - stats.litsOccupes} lits libres`, alert: null },
    { label: 'En attente',            value: enAttente,             icon: Users,       gradient: 'from-violet-50 to-violet-100/50', iconBg: 'bg-violet-500', textColor: 'text-violet-600', href: '/file-attente', sub: `${enConsultation} en consultation`, alert: enAttente > 0 ? 'warn' : null },
    { label: 'Examens en attente',    value: stats.examensEnAttente ?? 0, icon: FlaskConical, gradient: 'from-sky-50 to-sky-100/50', iconBg: 'bg-sky-500', textColor: 'text-sky-600', href: '/examens', sub: 'résultats à saisir', alert: null },
  ] : []

  const litData = stats ? [
    { label: 'Occupés', value: stats.litsOccupes },
    { label: 'Libres',  value: Math.max(0, stats.litsTotal - stats.litsOccupes) },
  ] : []

  const fileData = fileAttenteStatuts.map(s => ({
    label: { EN_ATTENTE: 'En attente', EN_CONSULTATION: 'En consultation', TERMINE: 'Terminé', ABSENT: 'Absent' }[s.statut] ?? s.statut,
    value: s.count,
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />) : kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Occupation des lits" sub="État actuel">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart data={litData} colors={['#ef4444', '#10b981']} />}
        </ChartCard>

        <ChartCard title="File d'attente" sub="Aujourd'hui par statut">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart data={fileData} colors={['#f59e0b', '#8b5cf6', '#10b981', '#94a3b8']} />}
        </ChartCard>
      </div>

      <QueueList entries={queue} loading={loading} />

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 text-sm mb-4">Accès rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/file-attente',     icon: Users,       label: 'File d\'attente',    gradient: 'from-violet-500 to-violet-600' },
            { href: '/hospitalisations', icon: BedDouble,   label: 'Hospitalisations',   gradient: 'from-red-500 to-red-600' },
            { href: '/pharmacie',        icon: Pill,        label: 'Pharmacie',          gradient: 'from-blue-500 to-blue-600' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-2.5 p-3.5 bg-linear-to-r ${a.gradient} rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all`}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0"><a.icon className="w-4 h-4 text-white" /></div>
              <p className="text-white text-sm font-semibold">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── CAISSIER Dashboard ───────────────────────────────────────────────────────

function DashboardCaissier({ stats, loading, queue: _q }: { stats: DashboardStats | null; loading: boolean; queue: FAEntry[] }) {
  const factureColors: Record<string, string> = { EN_ATTENTE: '#ef4444', PARTIELLEMENT_PAYE: '#f59e0b', PAYE: '#10b981', ANNULE: '#94a3b8' }
  const factureLabels: Record<string, string> = { EN_ATTENTE: 'Impayée', PARTIELLEMENT_PAYE: 'Partielle', PAYE: 'Payée', ANNULE: 'Annulée' }
  const methodColors: Record<string, string>  = { CASH: '#10b981', CARTE: '#3b82f6', ASSURANCE: '#8b5cf6', MONCASH: '#f97316' }

  const kpis = stats ? [
    { label: 'Recettes du jour',   value: fmtMontant(stats.recettesJour),    icon: TrendingUp, gradient: 'from-emerald-50 to-emerald-100/50', iconBg: 'bg-emerald-600', textColor: 'text-emerald-600', href: '/factures', sub: 'paiements encaissés', alert: 'ok' },
    { label: 'Factures impayées',  value: stats.facturesImpayes,              icon: Banknote,   gradient: stats.facturesImpayes > 0 ? 'from-orange-50 to-orange-100/50' : 'from-slate-50 to-slate-100/50', iconBg: stats.facturesImpayes > 0 ? 'bg-orange-500' : 'bg-slate-400', textColor: 'text-orange-600', href: '/factures', sub: fmtMontant(stats.montantImpayes), alert: stats.facturesImpayes > 0 ? 'danger' : null },
    { label: 'Montant impayé',     value: fmtMontant(stats.montantImpayes),   icon: CreditCard, gradient: 'from-red-50 to-red-100/50',         iconBg: 'bg-red-500',     textColor: 'text-red-600',     href: '/factures', sub: `${stats.facturesImpayes} factures`, alert: stats.montantImpayes > 0 ? 'danger' : null },
    { label: 'Patients du jour',   value: stats.patientsAujourdhui,           icon: Users,      gradient: 'from-blue-50 to-blue-100/50',       iconBg: 'bg-blue-500',    textColor: 'text-blue-600',    href: '/patients', sub: 'enregistrés aujourd\'hui', alert: null },
  ] : []

  const methodeData = (stats?.chartData?.paiementsParMethode ?? []).map(m => ({
    label: m.methode,
    value: Math.round(m.montant),
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />) : kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Recettes — 7 derniers jours" sub="Paiements encaissés (HTG)">
            {loading ? <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
              : <BarChart data={stats?.chartData?.recettes7j ?? []} color="#10b981" formatVal={fmtMontant} />}
          </ChartCard>
        </div>

        <ChartCard title="Méthodes de paiement" sub="7 derniers jours">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart
                data={methodeData}
                colors={methodeData.map(m => methodColors[m.label] ?? '#94a3b8')}
              />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Factures par statut" sub="Total global">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart
                data={(stats?.chartData?.facturesParStatut ?? []).map(r => ({ label: factureLabels[r.statut] ?? r.statut, value: r.count }))}
                colors={(stats?.chartData?.facturesParStatut ?? []).map(r => factureColors[r.statut] ?? '#94a3b8')}
              />}
        </ChartCard>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Actions</h3>
          <div className="space-y-2.5">
            {[
              { href: '/factures',  icon: FileText,  label: 'Nouvelle facture',   gradient: 'from-orange-500 to-orange-600' },
              { href: '/factures',  icon: CreditCard, label: 'Encaisser paiement', gradient: 'from-emerald-500 to-emerald-600' },
              { href: '/patients',  icon: Users,     label: 'Dossiers patients',   gradient: 'from-blue-500 to-blue-600' },
            ].map(a => (
              <Link key={a.label} href={a.href}
                className={`flex items-center gap-3 p-3 bg-linear-to-r ${a.gradient} rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0"><a.icon className="w-4 h-4 text-white" /></div>
                <p className="text-white text-sm font-semibold">{a.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ACCUEIL Dashboard ────────────────────────────────────────────────────────

function DashboardAccueil({ stats, loading, queue }: { stats: DashboardStats | null; loading: boolean; queue: FAEntry[] }) {
  const fileAttenteStatuts = stats?.chartData?.fileAttenteStatuts ?? []
  const enAttente      = fileAttenteStatuts.find(s => s.statut === 'EN_ATTENTE')?.count ?? 0
  const enConsultation = fileAttenteStatuts.find(s => s.statut === 'EN_CONSULTATION')?.count ?? 0

  const rdvColors: Record<string, string> = { PLANIFIE: '#3b82f6', EN_ATTENTE: '#f59e0b', EN_CONSULTATION: '#8b5cf6', TERMINE: '#10b981', ANNULE: '#94a3b8' }
  const rdvLabels: Record<string, string> = { PLANIFIE: 'Planifié', EN_ATTENTE: 'En attente', EN_CONSULTATION: 'En cours', TERMINE: 'Terminé', ANNULE: 'Annulé' }

  const kpis = stats ? [
    { label: 'En attente',          value: enAttente,                        icon: Users,    gradient: 'from-amber-50 to-amber-100/50',   iconBg: 'bg-amber-500',  textColor: 'text-amber-600',  href: '/file-attente', sub: 'patients dans la file', alert: enAttente > 0 ? 'warn' : null },
    { label: 'En consultation',     value: enConsultation,                   icon: Stethoscope, gradient: 'from-violet-50 to-violet-100/50', iconBg: 'bg-violet-500', textColor: 'text-violet-600', href: '/file-attente', sub: 'en cours de consultation', alert: null },
    { label: "RDV aujourd'hui",     value: stats.appointmentsAujourdhui,     icon: Calendar, gradient: 'from-blue-50 to-blue-100/50',     iconBg: 'bg-blue-500',   textColor: 'text-blue-600',   href: '/appointments', sub: `${stats.appointmentsEnAttente} restants`, alert: stats.appointmentsEnAttente > 0 ? 'warn' : null },
    { label: 'Nouveaux patients',   value: stats.patientsAujourdhui,         icon: UserCheck, gradient: 'from-teal-50 to-teal-100/50',   iconBg: 'bg-teal-500',   textColor: 'text-teal-600',   href: '/patients', sub: 'enregistrés aujourd\'hui', alert: null },
  ] : []

  const fileData = fileAttenteStatuts.map(s => ({
    label: { EN_ATTENTE: 'En attente', EN_CONSULTATION: 'En consultation', TERMINE: 'Terminé', ABSENT: 'Absent' }[s.statut] ?? s.statut,
    value: s.count,
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />) : kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="File d'attente" sub="Aujourd'hui par statut">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart data={fileData} colors={['#f59e0b', '#8b5cf6', '#10b981', '#94a3b8']} />}
        </ChartCard>

        <ChartCard title="RDV par statut" sub="Aujourd'hui">
          {loading ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            : <DonutChart
                data={(stats?.chartData?.rdvParStatut ?? []).map(r => ({ label: rdvLabels[r.statut] ?? r.statut, value: r.count }))}
                colors={(stats?.chartData?.rdvParStatut ?? []).map(r => rdvColors[r.statut] ?? '#94a3b8')}
              />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <QueueList entries={queue} loading={loading} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Actions</h3>
          <div className="space-y-2.5">
            {[
              { href: '/patients',     icon: Users,    label: 'Nouveau patient',  gradient: 'from-blue-500 to-blue-600' },
              { href: '/appointments', icon: Calendar, label: 'Rendez-vous',      gradient: 'from-violet-500 to-violet-600' },
              { href: '/file-attente', icon: Phone,    label: 'File d\'attente',  gradient: 'from-amber-500 to-amber-600' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`flex items-center gap-3 p-3 bg-linear-to-r ${a.gradient} rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0"><a.icon className="w-4 h-4 text-white" /></div>
                <p className="text-white text-sm font-semibold">{a.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user: currentUser } = useAuthStore()
  const [stats, setStats]           = useState<DashboardStats | null>(null)
  const [queue, setQueue]           = useState<FAEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [printLoading, setPrint]    = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const [statsRes, queueRes] = await Promise.all([
        api.get('/stats'),
        api.get('/file-attente'),
      ])
      setStats(statsRes.data.data)
      setQueue(queueRes.data.data ?? [])
      setLastUpdate(new Date())
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  useSSE(['fileattente', 'hospitalisations'], () => fetchStats(true))

  async function handlePrint() {
    setPrint(true)
    try { const r = await api.get('/stats/rapport'); printRapport(r.data.data) }
    catch {} finally { setPrint(false) }
  }

  const headerProps = {
    prenom: currentUser?.prenom, role: currentUser?.role,
    loading, refreshing, lastUpdate,
    onRefresh: () => fetchStats(true), onPrint: handlePrint, printLoading,
  }

  const roleProps = { stats, loading, queue }

  return (
    <div>
      <DashboardHeader {...headerProps} />
      {currentUser?.role === 'ADMIN'     && <DashboardAdmin     {...roleProps} />}
      {currentUser?.role === 'MEDECIN'   && <DashboardMedecin   {...roleProps} />}
      {currentUser?.role === 'INFIRMIER' && <DashboardInfirmier  {...roleProps} />}
      {currentUser?.role === 'CAISSIER'  && <DashboardCaissier  {...roleProps} />}
      {currentUser?.role === 'ACCUEIL'   && <DashboardAccueil   {...roleProps} />}
    </div>
  )
}
