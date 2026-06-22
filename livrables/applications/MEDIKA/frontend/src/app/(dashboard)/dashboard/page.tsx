'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { useSSE } from '@/hooks/useSSE'
import {
  Users, Calendar, FileText, Activity,
  ArrowRight, AlertCircle, CheckCircle2,
  Clock, Stethoscope, Plus, ChevronRight,
  TrendingUp, Banknote, RefreshCw, UserCheck,
  Building2, Printer, FlaskConical, BedDouble
} from 'lucide-react'
import Link from 'next/link'
import { printRapport } from '@/lib/print'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  appointmentDetails: AppointmentSummary[]
  recentPatients: RecentPatient[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function age(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
}
function fmtMontant(n: number) {
  return n.toLocaleString('fr-FR') + ' HTG'
}

const statutConfig: Record<string, { label: string; dot: string; badge: string }> = {
  PLANIFIE:        { label: 'Planifié',    dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  EN_ATTENTE:      { label: 'En attente',  dot: 'bg-amber-400 animate-pulse', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  EN_CONSULTATION: { label: 'En cours',    dot: 'bg-violet-500 animate-pulse', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  TERMINE:         { label: 'Terminé',     dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ANNULE:          { label: 'Annulé',      dot: 'bg-slate-300',   badge: 'bg-slate-50 text-slate-400 border-slate-200' },
}

const avatarGradients = [
  'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600',
  'from-teal-400 to-teal-600', 'from-rose-400 to-rose-600', 'from-amber-400 to-amber-600',
]

const quickActions = [
  { href: '/patients',     icon: Users,       label: 'Nouveau patient',   desc: 'Enregistrer un dossier',  gradient: 'from-blue-500 to-blue-600',     shadow: 'shadow-blue-500/25' },
  { href: '/appointments', icon: Calendar,    label: 'Rendez-vous',       desc: 'Planifier un RDV',        gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/25' },
  { href: '/consultations',icon: Stethoscope, label: 'Consultation',      desc: 'Saisir une consultation', gradient: 'from-emerald-500 to-emerald-600',shadow: 'shadow-emerald-500/25' },
  { href: '/factures',     icon: FileText,    label: 'Facturation',       desc: 'Créer une facture',       gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/25' },
]

const systemStatus = [
  { label: 'Base de données', status: 'ok',      detail: 'PostgreSQL · medika_db' },
  { label: 'API Backend',     status: 'ok',      detail: 'Express · port 4000' },
  { label: 'Authentification',status: 'ok',      detail: 'JWT · actif' },
  { label: 'Stockage fichiers',status: 'pending', detail: 'Non configuré' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [printingRapport, setPrintingRapport] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const today = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const r = await api.get('/stats')
      setStats(r.data.data)
      setLastUpdate(new Date())
    } catch {}
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  useSSE(['fileattente', 'hospitalisations'], () => fetchStats(true))

  async function handlePrintRapport() {
    setPrintingRapport(true)
    try {
      const r = await api.get('/stats/rapport')
      printRapport(r.data.data)
    } catch {} finally { setPrintingRapport(false) }
  }

  // ── Listes filtrées ──
  const queue      = stats?.appointmentDetails.filter(a => ['PLANIFIE', 'EN_ATTENTE', 'EN_CONSULTATION'].includes(a.statut)) ?? []
  const done       = stats?.appointmentDetails.filter(a => a.statut === 'TERMINE') ?? []
  const cancelled  = stats?.appointmentDetails.filter(a => a.statut === 'ANNULE') ?? []

  const kpis = stats ? [
    {
      label: 'Patients enregistrés',
      value: stats.patientsTotal,
      icon: Users,
      sub: 'dossiers actifs',
      gradient: 'from-blue-50 to-blue-100/50',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600',
      href: '/patients',
      alert: null
    },
    {
      label: "Rendez-vous aujourd'hui",
      value: stats.appointmentsAujourdhui,
      icon: Calendar,
      sub: `${stats.appointmentsEnAttente} en attente`,
      gradient: 'from-violet-50 to-violet-100/50',
      iconBg: 'bg-violet-500',
      textColor: 'text-violet-600',
      href: '/appointments',
      alert: stats.appointmentsEnAttente > 0 ? 'warning' : null
    },
    {
      label: 'Consultations du jour',
      value: stats.consultationsAujourdhui,
      icon: Stethoscope,
      sub: 'saisies aujourd\'hui',
      gradient: 'from-teal-50 to-teal-100/50',
      iconBg: 'bg-teal-500',
      textColor: 'text-teal-600',
      href: '/consultations',
      alert: null
    },
    {
      label: 'Factures impayées',
      value: stats.facturesImpayes,
      icon: Banknote,
      sub: fmtMontant(stats.montantImpayes),
      gradient: stats.facturesImpayes > 0 ? 'from-orange-50 to-orange-100/50' : 'from-emerald-50 to-emerald-100/50',
      iconBg: stats.facturesImpayes > 0 ? 'bg-orange-500' : 'bg-emerald-500',
      textColor: stats.facturesImpayes > 0 ? 'text-orange-600' : 'text-emerald-600',
      href: '/factures',
      alert: stats.facturesImpayes > 0 ? 'danger' : 'ok'
    },
    {
      label: 'Examens en attente',
      value: stats.examensEnAttente ?? 0,
      icon: FlaskConical,
      sub: 'résultats à saisir',
      gradient: (stats.examensEnAttente ?? 0) > 0 ? 'from-sky-50 to-sky-100/50' : 'from-slate-50 to-slate-100/50',
      iconBg: (stats.examensEnAttente ?? 0) > 0 ? 'bg-sky-500' : 'bg-slate-400',
      textColor: (stats.examensEnAttente ?? 0) > 0 ? 'text-sky-600' : 'text-slate-400',
      href: '/examens',
      alert: (stats.examensEnAttente ?? 0) > 0 ? 'warning' : null
    },
  ] : []

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Système actif</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {user?.prenom}</h1>
          <p className="text-slate-500 mt-0.5 capitalize text-sm">{today}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => fetchStats(true)}
            className={`flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </button>
          <button onClick={handlePrintRapport} disabled={printingRapport}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {printingRapport
              ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              : <Printer className="w-4 h-4" />}
            Rapport du jour
          </button>
          <Link href="/patients"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Nouveau patient
          </Link>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : kpis.map(({ label, value, icon: Icon, gradient, iconBg, textColor, href, sub, alert }) => (
          <Link key={label} href={href}
            className={`group bg-linear-to-br ${gradient} rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <ChevronRight className={`w-4 h-4 ${textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
            {sub && (
              <div className="flex items-center gap-1 mt-2">
                {alert === 'danger' && value > 0 && <AlertCircle className="w-3 h-3 text-orange-500" />}
                {alert === 'ok' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                {alert === 'warning' && <Clock className="w-3 h-3 text-amber-500" />}
                <span className={`text-xs font-medium ${
                  alert === 'danger' && value > 0 ? 'text-orange-600' :
                  alert === 'ok' ? 'text-emerald-600' :
                  alert === 'warning' ? 'text-amber-600' : 'text-slate-400'
                }`}>{sub}</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* ── KPIs hospitalisations ── */}
      {!loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/hospitalisations"
            className="group bg-linear-to-br from-teal-50 to-teal-100/50 rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <BedDouble className="w-5 h-5 text-white" />
              </div>
              <ChevronRight className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.sejoursActifs}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Patients hospitalisés</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs font-medium text-slate-400">
                {stats.litsOccupes}/{stats.litsTotal} lits occupés
              </span>
            </div>
          </Link>
          <div className="bg-linear-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{fmtMontant(stats.recettesJour)}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Recettes du jour</p>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">Paiements encaissés</span>
            </div>
          </div>
        </div>
      )}

      {/* ── File d'attente + Récents ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* File d'attente du jour */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">File d'attente du jour</h3>
                <p className="text-xs text-slate-400">{queue.length} patient{queue.length > 1 ? 's' : ''} en attente ou en consultation</p>
              </div>
            </div>
            <Link href="/appointments" className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1">
              Tout voir <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">File d'attente vide</p>
              {done.length > 0 && (
                <p className="text-xs text-slate-300 mt-1">{done.length} consultation{done.length > 1 ? 's' : ''} terminée{done.length > 1 ? 's' : ''} aujourd'hui</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {queue.map((a, i) => {
                const cfg = statutConfig[a.statut] ?? statutConfig.PLANIFIE
                const initials = `${a.patient.prenom[0]}${a.patient.nom[0]}`.toUpperCase()
                const grad = avatarGradients[(a.patient.prenom.charCodeAt(0) + a.patient.nom.charCodeAt(0)) % avatarGradients.length]
                return (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    {/* Position */}
                    <div className="w-6 text-center text-xs font-bold text-slate-300 shrink-0">{i + 1}</div>

                    {/* Avatar */}
                    <div className={`w-9 h-9 bg-linear-to-br ${grad} rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                      {initials}
                    </div>

                    {/* Infos patient */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {a.patient.prenom} {a.patient.nom}
                        </p>
                        <span className="text-[10px] font-mono text-slate-300">{a.patient.numero}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400">Dr. {a.medecin.prenom} {a.medecin.nom}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-xs text-slate-400">{a.service.nom}</span>
                        {a.motif && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 italic truncate max-w-32">"{a.motif}"</span></>}
                      </div>
                    </div>

                    {/* Heure + statut */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-semibold text-slate-700">{fmtTime(a.dateHeure)}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badge}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Résumé bas de section */}
          {!loading && stats && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{done.length} terminé{done.length > 1 ? 's' : ''}</span>
              <span>{cancelled.length} annulé{cancelled.length > 1 ? 's' : ''}</span>
              <span>{stats.appointmentsAujourdhui} total</span>
            </div>
          )}
        </div>

        {/* Derniers patients */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Derniers patients</h3>
            </div>
            <Link href="/patients" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Voir tous <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-2.5">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !stats?.recentPatients.length ? (
            <p className="text-center text-sm text-slate-400 py-10">Aucun patient</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {stats.recentPatients.map(p => {
                const grad = avatarGradients[(p.prenom.charCodeAt(0) + p.nom.charCodeAt(0)) % avatarGradients.length]
                const initials = `${p.prenom[0]}${p.nom[0]}`.toUpperCase()
                return (
                  <Link key={p.id} href={`/patients/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                    <div className={`w-8 h-8 bg-linear-to-br ${grad} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
                        {p.prenom} {p.nom}
                      </p>
                      <p className="text-[10px] text-slate-400">{age(p.dateNaissance)} ans · {p.sexe === 'M' ? 'M' : 'F'}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Actions + Statut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Actions rapides */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Actions rapides</h2>
            <span className="text-xs text-slate-400">Accès direct</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ href, icon: Icon, label, desc, gradient, shadow }) => (
              <Link key={href} href={href}
                className={`group flex items-center gap-3 p-4 bg-linear-to-r ${gradient} rounded-xl shadow-md ${shadow} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-white/70 text-xs truncate">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Flux patient */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Flux patient standard</p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Enregistrement', href: '/patients', icon: Users },
                { label: 'Rendez-vous', href: '/appointments', icon: Calendar },
                { label: 'Consultation', href: '/consultations', icon: Stethoscope },
                { label: 'Facturation', href: '/factures', icon: FileText },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-2">
                  <Link href={step.href} className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-2.5 py-1 rounded-full transition-colors">
                    <step.icon className="w-3 h-3" />{step.label}
                  </Link>
                  {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statut système */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Statut système</h2>
          </div>
          <div className="space-y-3">
            {systemStatus.map(({ label, status, detail }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${status === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium">{label}</p>
                  <p className="text-xs text-slate-400 truncate">{detail}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {status === 'ok' ? 'OK' : 'En attente'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-300" />
              <div>
                <p className="text-xs text-slate-400">Mis à jour à</p>
                <p className="text-sm font-semibold text-slate-700">
                  {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Connecté en tant que</p>
              <p className="text-sm font-semibold text-slate-800">{user?.prenom} {user?.nom}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">{user?.role}</span>
                {user?.role === 'ADMIN' && (
                  <Link href="/users" className="text-xs bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full hover:bg-slate-300 transition-colors flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5" />Gérer les accès
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
