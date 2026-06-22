'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Bell, Search, CheckCheck, FlaskConical, AlertTriangle, Info } from 'lucide-react'
import { useNotifications, registerPush, type AppNotification } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import SearchPalette from './SearchPalette'

const pageTitles: Record<string, { title: string; desc: string }> = {
  '/dashboard':        { title: 'Tableau de bord',      desc: 'Vue d\'ensemble de l\'activité hospitalière' },
  '/urgences':         { title: 'Urgences',              desc: 'Salle de triage — patients URGENT et CRITIQUE' },
  '/file-attente':     { title: 'File d\'attente',       desc: 'Patients en attente de consultation' },
  '/patients':         { title: 'Patients',              desc: 'Gestion des dossiers patients' },
  '/appointments':     { title: 'Rendez-vous',           desc: 'Planning et gestion des rendez-vous' },
  '/consultations':    { title: 'Consultations',         desc: 'Suivi des consultations médicales' },
  '/examens':          { title: 'Examens',               desc: 'Examens et résultats' },
  '/factures':         { title: 'Facturation',           desc: 'Factures, paiements et impayés' },
  '/hospitalisations': { title: 'Hospitalisations',      desc: 'Séjours, lits et prescriptions' },
  '/pharmacie':        { title: 'Pharmacie',             desc: 'Stocks et dispensations' },
  '/planning':         { title: 'Planning',              desc: 'Gardes et absences du personnel' },
  '/rapports':         { title: 'Rapports',              desc: 'Statistiques et rapports d\'activité' },
  '/users':            { title: 'Utilisateurs',          desc: 'Gestion des comptes et des accès' },
  '/services':         { title: 'Services',              desc: 'Services et départements hospitaliers' },
  '/settings':         { title: 'Paramètres',            desc: 'Configuration de l\'établissement' },
  '/audit':            { title: 'Journal d\'audit',      desc: 'Traçabilité des actions' },
}

const NOTIF_ICONS: Record<string, React.ElementType> = {
  EXAM_RESULT:      FlaskConical,
  URGENCE_CRITIQUE: AlertTriangle,
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)    return 'À l\'instant'
  if (diff < 3600)  return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`
  return `${Math.floor(diff / 86400)} j`
}

function NotifItem({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) {
  const router = useRouter()
  const Icon = NOTIF_ICONS[n.type] ?? Info

  function handleClick() {
    if (!n.read) onRead(n.id)
    if (n.data?.patientId) router.push(`/patients/${n.data.patientId}`)
    else if (n.type === 'EXAM_RESULT') router.push('/examens')
  }

  return (
    <button onClick={handleClick}
      className={cn('w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0', !n.read && 'bg-blue-50/50')}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
        n.type === 'EXAM_RESULT' ? 'bg-blue-100 text-blue-600' :
        n.type === 'URGENCE_CRITIQUE' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500')}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', n.read ? 'text-slate-600' : 'text-slate-900 font-medium')}>{n.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{n.body}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
      </div>
    </button>
  )
}

export default function Header() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isPatientDetail = /^\/patients\/[^/]+$/.test(pathname)
  const page = pageTitles[pathname]
    ?? (isPatientDetail ? { title: 'Dossier patient', desc: 'Détails et historique médical' } : { title: 'MEDIKA', desc: '' })
  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'U'

  // Enregistrement push au montage
  useEffect(() => {
    if (user) registerPush()
  }, [user])

  // Raccourci Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearch(v => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Ferme le dropdown notifications si clic extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <>
    <SearchPalette open={search} onClose={() => setSearch(false)} />
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{page.title}</h2>
        {page.desc && <p className="text-xs text-slate-400">{page.desc}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Recherche rapide */}
        <button onClick={() => setSearch(true)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rechercher...</span>
          <kbd className="hidden sm:inline text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 font-mono text-slate-400">⌘K</kbd>
        </button>

        {/* Cloche notifications */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* En-tête dropdown */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
              </div>

              {/* Liste */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <Bell className="w-8 h-8 opacity-30" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <NotifItem key={n.id} n={n} onRead={(id) => { markRead(id); setOpen(false) }} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
    </>
  )
}
