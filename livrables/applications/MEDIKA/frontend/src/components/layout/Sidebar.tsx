'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Calendar, Stethoscope,
  FileText, UserCog, LogOut, Activity, ChevronRight, Building2, FlaskConical, ListOrdered, Settings, Shield, BedDouble, Pill, CalendarDays, BarChart2, AlertTriangle
} from 'lucide-react'
import { Role } from '@/types'
import api from '@/lib/api'

const navItems = [
  { href: '/dashboard',        label: 'Tableau de bord',   icon: LayoutDashboard, roles: ['ADMIN', 'MEDECIN', 'INFIRMIER', 'CAISSIER', 'ACCUEIL'] },
  { href: '/urgences',         label: 'Urgences',           icon: AlertTriangle,   roles: ['ADMIN', 'MEDECIN', 'INFIRMIER', 'ACCUEIL'] },
  { href: '/file-attente',     label: 'File d\'attente',    icon: ListOrdered,     roles: ['ADMIN', 'MEDECIN', 'INFIRMIER', 'ACCUEIL'] },
  { href: '/patients',         label: 'Patients',           icon: Users,           roles: ['ADMIN', 'MEDECIN', 'INFIRMIER', 'ACCUEIL'] },
  { href: '/appointments',     label: 'Rendez-vous',        icon: Calendar,        roles: ['ADMIN', 'MEDECIN', 'INFIRMIER', 'ACCUEIL'] },
  { href: '/consultations',    label: 'Consultations',      icon: Stethoscope,     roles: ['ADMIN', 'MEDECIN'] },
  { href: '/examens',          label: 'Examens',            icon: FlaskConical,    roles: ['ADMIN', 'MEDECIN', 'INFIRMIER'] },
  { href: '/factures',         label: 'Facturation',        icon: FileText,        roles: ['ADMIN', 'CAISSIER'] },
  { href: '/hospitalisations', label: 'Hospitalisations',   icon: BedDouble,       roles: ['ADMIN', 'MEDECIN', 'INFIRMIER'] },
  { href: '/pharmacie',        label: 'Pharmacie',          icon: Pill,            roles: ['ADMIN', 'MEDECIN', 'INFIRMIER'] },
  { href: '/planning',         label: 'Planning',           icon: CalendarDays,    roles: ['ADMIN', 'MEDECIN', 'INFIRMIER'] },
  { href: '/rapports',         label: 'Rapports',           icon: BarChart2,       roles: ['ADMIN', 'CAISSIER', 'MEDECIN'] },
  { href: '/users',            label: 'Utilisateurs',       icon: UserCog,         roles: ['ADMIN'] },
  { href: '/services',         label: 'Services',           icon: Building2,       roles: ['ADMIN'] },
  { href: '/settings',         label: 'Paramètres',         icon: Settings,        roles: ['ADMIN'] },
  { href: '/audit',            label: 'Journal d\'audit',   icon: Shield,          roles: ['ADMIN'] },
]

const roleColors: Record<string, string> = {
  ADMIN:     'bg-rose-500/20 text-rose-400',
  MEDECIN:   'bg-blue-500/20 text-blue-400',
  INFIRMIER: 'bg-teal-500/20 text-teal-400',
  CAISSIER:  'bg-amber-500/20 text-amber-400',
  ACCUEIL:   'bg-violet-500/20 text-violet-400',
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [alertesPharmacie, setAlertesPharmacie] = useState(0)
  const [medicamentsDus, setMedicamentsDus]     = useState(0)
  const [critiqueCount, setCritiqueCount]       = useState(0)
  const [critiqueAlert, setCritiqueAlert]       = useState(false)

  const fetchCritiques = useCallback(async () => {
    try {
      const r = await api.get('/urgences')
      const entries: any[] = r.data.data ?? []
      setCritiqueCount(entries.filter((e: any) => e.priorite === 'CRITIQUE').length)
    } catch {}
  }, [])

  useEffect(() => {
    if (!user) return

    async function fetchAlertes() {
      try {
        const r = await api.get('/pharmacie/alertes')
        setAlertesPharmacie(r.data.data?.total ?? 0)
      } catch {}
    }

    async function fetchMedsDus() {
      if (!['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')) return
      try {
        const r = await api.get('/hospitalisations/medicaments-dus')
        setMedicamentsDus((r.data.data || []).length)
      } catch {}
    }

    fetchAlertes()
    fetchMedsDus()
    fetchCritiques()

    const token = typeof window !== 'undefined' ? localStorage.getItem('medika_token') : null
    if (!token) return

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    const sse = new EventSource(`${apiBase}/events?token=${token}`)
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.resource === 'pharmacie')         fetchAlertes()
        if (data.resource === 'hospitalisations')  fetchMedsDus()
        if (data.resource === 'fileattente')       fetchCritiques()
        if (data.resource === 'urgence-critique') {
          fetchCritiques()
          setCritiqueAlert(true)
          setTimeout(() => setCritiqueAlert(false), 8000)
        }
      } catch {}
    }

    const poll = setInterval(fetchMedsDus, 120_000)
    return () => { sse.close(); clearInterval(poll) }
  }, [user, fetchCritiques])

  const visible = navItems.filter(item =>
    user?.role && item.roles.includes(user.role as Role)
  )

  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'U'

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col z-10 bg-slate-950 border-r border-slate-800/50">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800/50">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-40" />
          <div className="relative w-9 h-9 bg-linear-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-wide">MEDIKA</span>
          <div className="text-slate-500 text-[10px] tracking-widest uppercase">Gestion hospitalière</div>
        </div>
      </div>

      {/* Alerte CRITIQUE */}
      {critiqueAlert && (
        <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2.5 bg-red-600 rounded-xl text-white text-xs font-bold animate-pulse shadow-lg shadow-red-500/40">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Patient CRITIQUE en urgences !
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Menu principal</p>
        {visible.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          const isPharmacie        = href === '/pharmacie'
          const isHospitalisations = href === '/hospitalisations'
          const isUrgences         = href === '/urgences'
          const badge = isPharmacie && alertesPharmacie > 0
            ? alertesPharmacie
            : isHospitalisations && medicamentsDus > 0
              ? medicamentsDus
              : isUrgences && critiqueCount > 0
                ? critiqueCount
                : 0
          const isUrgenceBadge = isUrgences && badge > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 shrink-0',
                  active ? 'text-white'
                  : isUrgenceBadge ? 'text-red-400 group-hover:text-red-300'
                  : 'text-slate-500 group-hover:text-slate-300'
                )} />
                <span className={isUrgenceBadge && !active ? 'text-red-400 group-hover:text-red-300' : ''}>{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {badge > 0 && (
                  <span className={cn('text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center',
                    isUrgenceBadge ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500 text-white')}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Profil + déconnexion */}
      <div className="px-3 py-4 border-t border-slate-800/50 space-y-2">
        <Link href="/profile" className="flex items-center gap-3 px-3 py-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors group">
          <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate group-hover:text-blue-300 transition-colors">{user?.prenom} {user?.nom}</p>
            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', roleColors[user?.role || ''] || 'bg-slate-700 text-slate-400')}>
              {user?.role}
            </span>
          </div>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
