'use client'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Bell, Search } from 'lucide-react'

const pageTitles: Record<string, { title: string; desc: string }> = {
  '/dashboard':    { title: 'Tableau de bord',  desc: 'Vue d\'ensemble de l\'activité hospitalière' },
  '/patients':     { title: 'Patients',          desc: 'Gestion des dossiers patients' },
  '/appointments': { title: 'Rendez-vous',       desc: 'Planning et file d\'attente' },
  '/consultations':{ title: 'Consultations',     desc: 'Suivi des consultations médicales' },
  '/factures':     { title: 'Facturation',       desc: 'Factures, paiements et impayés' },
  '/users':        { title: 'Utilisateurs',      desc: 'Gestion des comptes et des accès' },
  '/services':     { title: 'Services',          desc: 'Services et départements hospitaliers' },
}

export default function Header() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const isPatientDetail = /^\/patients\/[^/]+$/.test(pathname)
  const page = pageTitles[pathname]
    ?? (isPatientDetail ? { title: 'Dossier patient', desc: 'Détails et historique médical' } : { title: 'MEDIKA', desc: '' })
  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'U'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Titre de la page */}
      <div>
        <h2 className="text-base font-semibold text-slate-900">{page.title}</h2>
        {page.desc && <p className="text-xs text-slate-400">{page.desc}</p>}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-3">
        {/* Recherche rapide */}
        <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rechercher...</span>
          <kbd className="hidden sm:inline text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 font-mono text-slate-400">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.prenom} {user?.nom}</p>
            <p className="text-[10px] text-slate-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
