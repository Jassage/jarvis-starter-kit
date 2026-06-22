'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useSSE } from '@/hooks/useSSE'
import { Combobox } from '@/components/ui/Combobox'
import {
  Calendar, Clock, Users, Plus, X, ChevronLeft, ChevronRight,
  Sun, Moon, AlertCircle, UserCheck, UserX, Stethoscope, Trash2,
  Edit2
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Garde {
  id: string; type: string; date: string; heureDebut: string; heureFin: string; notes: string | null
  user: { id: string; prenom: string; nom: string; role: string }
  service: { id: string; nom: string } | null
}
interface Absence {
  id: string; type: string; dateDebut: string; dateFin: string; raison: string | null; statut: string
  user: { id: string; prenom: string; nom: string; role: string }
  approvedBy: { id: string; prenom: string; nom: string } | null
}
interface UserDispo { id: string; prenom: string; nom: string; role: string; enGarde: boolean; enAbsence: boolean; disponible: boolean }
interface Service   { id: string; nom: string }
interface VueSemaine { periode: { debut: string; fin: string }; gardes: Garde[]; absences: Absence[]; services: Service[] }

// ── Helpers ───────────────────────────────────────────────────────────────────

const TABS = ['Mon planning', 'Vue semaine', "Aujourd'hui", 'Absences'] as const
type Tab = typeof TABS[number]

const TYPE_GARDE: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  JOUR:      { label: 'Garde jour',  icon: Sun,          bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-300' },
  NUIT:      { label: 'Garde nuit',  icon: Moon,         bg: 'bg-indigo-100',  text: 'text-indigo-800',  border: 'border-indigo-300' },
  ASTREINTE: { label: 'Astreinte',   icon: Clock,        bg: 'bg-slate-100',   text: 'text-slate-700',   border: 'border-slate-300' },
  URGENCE:   { label: 'Urgence',     icon: AlertCircle,  bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-300' },
}

const TYPE_ABSENCE: Record<string, string> = { CONGE: 'Congé', MALADIE: 'Maladie', FORMATION: 'Formation', AUTRE: 'Autre' }

const ROLE_BADGE: Record<string, string> = {
  MEDECIN:   'bg-blue-100 text-blue-700',
  INFIRMIER: 'bg-teal-100 text-teal-700',
  ADMIN:     'bg-rose-100 text-rose-700',
}

function fmt(d: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(d).toLocaleDateString('fr-FR', opts || { weekday: 'short', day: '2-digit', month: 'short' })
}
function mondayOf(d: Date) { const day = d.getDay() || 7; const m = new Date(d); m.setDate(d.getDate() - day + 1); m.setHours(0,0,0,0); return m }
function isoDate(d: Date)  { return d.toISOString().split('T')[0] }
function daysOfWeek(mon: Date) { return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d }) }

function gardeDateTime(date: string, time: string): Date {
  const d = new Date(date)
  const [h, m] = time.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

function absenceBadge(statut: string) {
  const map: Record<string, string> = { EN_ATTENTE: 'bg-amber-100 text-amber-700', APPROUVE: 'bg-emerald-100 text-emerald-700', REJETE: 'bg-red-100 text-red-700' }
  const labels: Record<string, string> = { EN_ATTENTE: 'En attente', APPROUVE: 'Approuvée', REJETE: 'Rejetée' }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[statut] || 'bg-slate-100 text-slate-600'}`}>{labels[statut] || statut}</span>
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function PlanningPage() {
  const { user } = useAuthStore()
  const [tab, setTab]   = useState<Tab>('Mon planning')
  const isAdmin = user?.role === 'ADMIN'

  const [monday, setMonday] = useState(() => mondayOf(new Date()))
  const [vueSemaine, setVueSemaine]         = useState<VueSemaine | null>(null)
  const [gardesAujourdhui, setGardesAuj]    = useState<Garde[]>([])
  const [disponibilite, setDispo]           = useState<UserDispo[]>([])
  const [absences, setAbsences]             = useState<Absence[]>([])
  const [mesGardes, setMesGardes]           = useState<Garde[]>([])
  const [mesAbsences, setMesAbsences]       = useState<Absence[]>([])

  const [showAddGarde, setShowAddGarde]     = useState(false)
  const [showAddAbsence, setShowAddAbsence] = useState(false)
  const [selectedGarde, setSelectedGarde]   = useState<Garde | null>(null)
  const [editGarde, setEditGarde]           = useState<Garde | null>(null)
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null)

  const fetchVueSemaine = useCallback(async () => {
    const r = await api.get('/planning/vue-semaine', { params: { semaine: isoDate(monday) } })
    setVueSemaine(r.data.data)
  }, [monday])

  const fetchAujourdhui = useCallback(async () => {
    const [g, d] = await Promise.all([api.get('/planning/gardes/today'), api.get('/planning/disponibilite')])
    setGardesAuj(g.data.data); setDispo(d.data.data)
  }, [])

  const fetchAbsences = useCallback(async () => {
    const r = await api.get('/planning/absences'); setAbsences(r.data.data)
  }, [])

  const fetchMonPlanning = useCallback(async () => {
    if (!user?.id) return
    const from = isoDate(new Date())
    const toD  = new Date(); toD.setDate(toD.getDate() + 60)
    const [g, a] = await Promise.all([
      api.get('/planning/gardes', { params: { userId: user.id, from, to: isoDate(toD) } }),
      api.get('/planning/absences', { params: { userId: user.id } }),
    ])
    setMesGardes(g.data.data); setMesAbsences(a.data.data)
  }, [user?.id])

  useEffect(() => {
    if (tab === 'Mon planning')  fetchMonPlanning()
    if (tab === 'Vue semaine')   fetchVueSemaine()
    if (tab === "Aujourd'hui")   fetchAujourdhui()
    if (tab === 'Absences')      fetchAbsences()
  }, [tab, fetchMonPlanning, fetchVueSemaine, fetchAujourdhui, fetchAbsences])

  useSSE(['planning'], () => {
    fetchMonPlanning()
    if (tab === 'Vue semaine')   fetchVueSemaine()
    if (tab === "Aujourd'hui")   fetchAujourdhui()
    if (tab === 'Absences')      fetchAbsences()
  })

  const days   = daysOfWeek(monday)
  const today  = isoDate(new Date())
  const prevWeek = () => { const m = new Date(monday); m.setDate(m.getDate() - 7); setMonday(m) }
  const nextWeek = () => { const m = new Date(monday); m.setDate(m.getDate() + 7); setMonday(m) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Planning du personnel
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Gardes, astreintes et absences</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => setShowAddGarde(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Planifier une garde
            </button>
          )}
          <button onClick={() => setShowAddAbsence(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Déclarer une absence
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Mon planning ──────────────────────────────────────────────────────── */}
      {tab === 'Mon planning' && (
        <MonPlanningTab user={user} gardes={mesGardes} absences={mesAbsences}
          onDeclareAbsence={() => setShowAddAbsence(true)}
          onGardeClick={setSelectedGarde}
          onAbsenceTraiter={isAdmin ? setSelectedAbsence : undefined} />
      )}

      {/* ── Vue semaine ───────────────────────────────────────────────────────── */}
      {tab === 'Vue semaine' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={prevWeek} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setMonday(mondayOf(new Date()))} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-xl transition-colors">Aujourd'hui</button>
            <button onClick={nextWeek} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
            <span className="text-slate-600 text-sm">
              Semaine du <span className="font-semibold text-slate-900">{fmt(isoDate(days[0]), { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const dayStr      = isoDate(day)
              const isToday     = dayStr === today
              const dayGardes   = vueSemaine?.gardes.filter(g => isoDate(new Date(g.date)) === dayStr) || []
              const dayAbsences = vueSemaine?.absences.filter(a => dayStr >= isoDate(new Date(a.dateDebut)) && dayStr <= isoDate(new Date(a.dateFin))) || []
              return (
                <div key={dayStr} className={`min-h-35 rounded-xl p-2 space-y-1 ${isToday ? 'bg-blue-50 border border-blue-300' : 'bg-white border border-slate-200'}`}>
                  <div className={`text-xs font-medium text-center pb-1 border-b ${isToday ? 'text-blue-700 border-blue-200' : 'text-slate-500 border-slate-100'}`}>
                    <div className="capitalize">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                    <div className={`text-base font-bold ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>{day.toLocaleDateString('fr-FR', { day: '2-digit' })}</div>
                  </div>
                  {dayGardes.map(g => {
                    const t = TYPE_GARDE[g.type] || TYPE_GARDE.JOUR
                    return (
                      <button key={g.id} onClick={() => setSelectedGarde(g)}
                        className={`w-full text-left rounded-lg px-2 py-1.5 border text-[11px] leading-tight transition-all hover:brightness-95 ${t.bg} ${t.text} ${t.border}`}>
                        <div className="font-semibold truncate">{g.user.prenom} {g.user.nom[0]}.</div>
                        <div className="opacity-70">{g.heureDebut}–{g.heureFin}</div>
                      </button>
                    )
                  })}
                  {dayAbsences.map(a => (
                    <div key={a.id} className="w-full rounded-lg px-2 py-1.5 bg-red-50 border border-red-200 text-[11px] text-red-700">
                      <div className="truncate">{a.user.prenom} {a.user.nom[0]}.</div>
                      <div className="opacity-70">{TYPE_ABSENCE[a.type]}</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(TYPE_GARDE).map(([, v]) => (
              <div key={v.label} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${v.bg} ${v.text} ${v.border}`}>
                <v.icon className="w-3 h-3" />{v.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700">Absence</div>
          </div>
        </div>
      )}

      {/* ── Aujourd'hui ───────────────────────────────────────────────────────── */}
      {tab === "Aujourd'hui" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Gardes aujourd'hui ({gardesAujourdhui.length})
            </h2>
            {gardesAujourdhui.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm shadow-sm">Aucune garde planifiée aujourd'hui</div>
            ) : (
              <div className="space-y-2">
                {gardesAujourdhui.map(g => {
                  const t = TYPE_GARDE[g.type] || TYPE_GARDE.JOUR; const Icon = t.icon
                  return (
                    <div key={g.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${t.bg} ${t.border}`}><Icon className={`w-4 h-4 ${t.text}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-900 text-sm font-semibold">{g.user.prenom} {g.user.nom}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[g.user.role] || 'bg-slate-100 text-slate-600'}`}>{g.user.role}</span>
                          {g.service && <span className="text-slate-400 text-xs">{g.service.nom}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-slate-700 text-xs font-medium">{g.heureDebut}</div>
                        <div className="text-slate-400 text-xs">→ {g.heureFin}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" /> Disponibilité ({disponibilite.filter(d => d.disponible).length}/{disponibilite.length})
            </h2>
            <div className="space-y-1.5">
              {disponibilite.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm shadow-sm">Chargement...</div>
              ) : disponibilite.map(u => (
                <div key={u.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${u.enAbsence ? 'bg-red-50 border-red-200' : u.enGarde ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${u.enAbsence ? 'bg-red-500' : u.enGarde ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1 text-sm text-slate-900">{u.prenom} {u.nom}</div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                  <div className="shrink-0 text-xs">
                    {u.enAbsence ? <span className="text-red-600 flex items-center gap-1"><UserX className="w-3 h-3" />Absent</span>
                      : u.enGarde ? <span className="text-blue-600 flex items-center gap-1"><Stethoscope className="w-3 h-3" />En garde</span>
                      : <span className="text-emerald-600 flex items-center gap-1"><UserCheck className="w-3 h-3" />Disponible</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Absences ──────────────────────────────────────────────────────────── */}
      {tab === 'Absences' && (
        <div className="space-y-3">
          {absences.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" /> Aucune absence déclarée
            </div>
          ) : absences.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 font-semibold text-sm">{a.user.prenom} {a.user.nom}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[a.user.role] || 'bg-slate-100 text-slate-600'}`}>{a.user.role}</span>
                  </div>
                  <div className="text-slate-600 text-xs mt-1">{TYPE_ABSENCE[a.type]} · {fmt(a.dateDebut)} → {fmt(a.dateFin)}</div>
                  {a.raison && <div className="text-slate-400 text-xs mt-0.5">"{a.raison}"</div>}
                  {a.approvedBy && (
                    <div className="text-slate-500 text-xs mt-1">
                      Traité par {a.approvedBy.prenom} {a.approvedBy.nom}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {absenceBadge(a.statut)}
                  {isAdmin && a.statut === 'EN_ATTENTE' && (
                    <button onClick={() => setSelectedAbsence(a)} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">Traiter</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddGarde   && <AddGardeModal onClose={() => setShowAddGarde(false)} onSuccess={() => { setShowAddGarde(false); fetchVueSemaine(); fetchMonPlanning() }} />}
      {editGarde      && <AddGardeModal garde={editGarde} onClose={() => setEditGarde(null)} onSuccess={() => { setEditGarde(null); fetchVueSemaine(); fetchMonPlanning() }} />}
      {showAddAbsence && <AddAbsenceModal onClose={() => setShowAddAbsence(false)} onSuccess={() => { setShowAddAbsence(false); fetchMonPlanning(); fetchAbsences() }} />}
      {selectedGarde  && <GardeDetailModal garde={selectedGarde} isAdmin={isAdmin} onClose={() => setSelectedGarde(null)} onEdit={isAdmin ? g => { setSelectedGarde(null); setEditGarde(g) } : undefined} onUpdate={() => { setSelectedGarde(null); fetchVueSemaine(); fetchMonPlanning(); fetchAujourdhui() }} />}
      {selectedAbsence && <TraiterAbsenceModal absence={selectedAbsence} onClose={() => setSelectedAbsence(null)} onSuccess={() => { setSelectedAbsence(null); fetchAbsences(); fetchMonPlanning() }} />}
    </div>
  )
}

// ── MonPlanningTab ────────────────────────────────────────────────────────────

function MonPlanningTab({ user, gardes, absences, onDeclareAbsence, onGardeClick, onAbsenceTraiter }:
  { user: any; gardes: Garde[]; absences: Absence[]; onDeclareAbsence: () => void; onGardeClick: (g: Garde) => void; onAbsenceTraiter?: (a: Absence) => void }) {

  const today      = isoDate(new Date())
  const fin7j      = new Date(); fin7j.setDate(fin7j.getDate() + 7)
  const now        = new Date()

  const gardesAuj   = gardes.filter(g => isoDate(new Date(g.date)) === today)
  const gardesSem   = gardes.filter(g => { const d = isoDate(new Date(g.date)); return d > today && d <= isoDate(fin7j) })
  const gardesFutur = gardes.filter(g => isoDate(new Date(g.date)) > isoDate(fin7j))

  const absEnCours   = absences.find(a => today >= isoDate(new Date(a.dateDebut)) && today <= isoDate(new Date(a.dateFin)) && a.statut === 'APPROUVE')
  const gardeEnCours = gardesAuj.find(g => gardeDateTime(g.date, g.heureDebut) <= now && gardeDateTime(g.date, g.heureFin) >= now)

  const statut = absEnCours
    ? { label: 'En absence', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' }
    : gardeEnCours
    ? { label: 'En garde',   bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' }
    : { label: 'Disponible', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' }

  return (
    <div className="space-y-6">
      {/* Carte statut */}
      <div className={`flex items-center gap-4 p-5 rounded-2xl border ${statut.bg} ${statut.border}`}>
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-lg shadow-sm shrink-0">
          {user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-900 font-bold text-base">{user?.prenom} {user?.nom}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[user?.role || ''] || 'bg-slate-100 text-slate-600'}`}>{user?.role}</span>
          </div>
          <div className={`flex items-center gap-2 mt-1 ${statut.text}`}>
            <div className={`w-2 h-2 rounded-full ${statut.dot} animate-pulse`} />
            <span className="text-sm font-medium">{statut.label}</span>
            {gardeEnCours && <span className="text-xs opacity-70">· {TYPE_GARDE[gardeEnCours.type]?.label} jusqu'à {gardeEnCours.heureFin}</span>}
            {absEnCours   && <span className="text-xs opacity-70">· {TYPE_ABSENCE[absEnCours.type]} jusqu'au {fmt(absEnCours.dateFin)}</span>}
          </div>
        </div>
        <button onClick={onDeclareAbsence} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors shadow-sm shrink-0">
          <Plus className="w-3.5 h-3.5" /> Absence
        </button>
      </div>

      {/* 3 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: "Aujourd'hui",        dot: 'bg-blue-500',   items: gardesAuj },
          { title: 'Cette semaine',      dot: 'bg-amber-500',  items: gardesSem },
          { title: 'Prochaines gardes',  dot: 'bg-slate-400',  items: gardesFutur.slice(0, 6) },
        ].map(col => (
          <div key={col.title} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${col.dot}`} />{col.title}
            </h3>
            {col.items.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucune garde</p>
            ) : (
              <div className="space-y-2">
                {col.items.map(g => <GardeCard key={g.id} garde={g} onClick={() => onGardeClick(g)} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline complète */}
      {gardes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Planning complet (60 jours)</h3>
          <div className="space-y-2">
            {gardes.map(g => {
              const t = TYPE_GARDE[g.type] || TYPE_GARDE.JOUR; const Icon = t.icon
              return (
                <button key={g.id} onClick={() => onGardeClick(g)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all hover:brightness-95 shadow-sm ${t.bg} ${t.border}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/60`}><Icon className={`w-4 h-4 ${t.text}`} /></div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm capitalize ${t.text}`}>
                      {new Date(g.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </div>
                    <div className="text-xs opacity-70">{t.label}{g.service ? ` · ${g.service.nom}` : ''}</div>
                  </div>
                  <div className="text-right shrink-0 text-xs">
                    <div className={`font-medium ${t.text}`}>{g.heureDebut} → {g.heureFin}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Mes absences */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Mes absences</h3>
        {absences.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-400 text-sm text-center shadow-sm">Aucune absence déclarée</div>
        ) : (
          <div className="space-y-2">
            {absences.map(a => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-900 text-sm font-semibold">{TYPE_ABSENCE[a.type]}</span>
                    <div className="text-slate-500 text-xs mt-0.5">
                      {fmt(a.dateDebut, { day: '2-digit', month: 'long', year: 'numeric' })} → {fmt(a.dateFin, { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    {a.raison && <div className="text-slate-400 text-xs mt-0.5">"{a.raison}"</div>}
                    {a.approvedBy && (
                      <div className="text-slate-500 text-xs mt-1">Traité par {a.approvedBy.prenom} {a.approvedBy.nom}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {absenceBadge(a.statut)}
                    {onAbsenceTraiter && a.statut === 'EN_ATTENTE' && (
                      <button onClick={() => onAbsenceTraiter(a)} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">Traiter</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GardeCard({ garde, onClick }: { garde: Garde; onClick: () => void }) {
  const t = TYPE_GARDE[garde.type] || TYPE_GARDE.JOUR
  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-xl px-3 py-2.5 border transition-all hover:brightness-95 shadow-sm ${t.bg} ${t.border}`}>
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${t.text}`}>
        <t.icon className="w-3 h-3" />{t.label}
      </div>
      <div className={`text-[11px] mt-0.5 ${t.text} opacity-70`}>
        {new Date(garde.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })} · {garde.heureDebut}–{garde.heureFin}
      </div>
      {garde.service && <div className={`text-[11px] ${t.text} opacity-60`}>{garde.service.nom}</div>}
    </button>
  )
}

// ── Modals ────────────────────────────────────────────────────────────────────

function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-slate-900 font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-slate-600 text-xs font-medium mb-1.5">{label}</label>{children}</div>
}
const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400'

function AddGardeModal({ garde, onClose, onSuccess }: { garde?: Garde; onClose: () => void; onSuccess: () => void }) {
  const [users, setUsers]     = useState<{ value: string; label: string; sub?: string }[]>([])
  const [services, setServices] = useState<{ value: string; label: string }[]>([])
  const [form, setForm] = useState({
    userId:     garde?.user.id     || '',
    serviceId:  garde?.service?.id || '',
    type:       garde?.type        || 'JOUR',
    date:       garde ? isoDate(new Date(garde.date)) : '',
    heureDebut: garde?.heureDebut  || '08:00',
    heureFin:   garde?.heureFin    || '16:00',
    notes:      garde?.notes       || '',
  })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/services')]).then(([u, s]) => {
      setUsers(u.data.data.filter((x: any) => ['MEDECIN', 'INFIRMIER'].includes(x.role)).map((x: any) => ({ value: x.id, label: `${x.prenom} ${x.nom}`, sub: x.role })))
      setServices(s.data.data.map((x: any) => ({ value: x.id, label: x.nom })))
    }).catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      if (garde) {
        await api.patch(`/planning/gardes/${garde.id}`, {
          type: form.type,
          serviceId: form.serviceId || null,
          heureDebut: form.heureDebut,
          heureFin: form.heureFin,
          notes: form.notes || null,
        })
      } else {
        await api.post('/planning/gardes', {
          userId: form.userId,
          serviceId: form.serviceId || undefined,
          type: form.type,
          date: form.date,
          heureDebut: form.heureDebut,
          heureFin: form.heureFin,
          notes: form.notes || undefined,
        })
      }
      onSuccess()
    } catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }

  return (
    <ModalWrapper title={garde ? 'Modifier la garde' : 'Planifier une garde'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {!garde && (
          <Field label="Personnel *">
            <Combobox options={users} value={form.userId} onChange={v => set('userId', v || '')} placeholder="Sélectionner un membre du personnel..." />
          </Field>
        )}
        {garde && <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">{garde.user.prenom} {garde.user.nom}</div>}
        <Field label="Service">
          <Combobox options={services} value={form.serviceId} onChange={v => set('serviceId', v || '')} placeholder="Optionnel..." clearable />
        </Field>
        <Field label="Type de garde">
          <Combobox options={Object.entries(TYPE_GARDE).map(([v, t]) => ({ value: v, label: t.label }))} value={form.type} onChange={v => set('type', v || 'JOUR')} />
        </Field>
        {!garde && (
          <Field label="Date *">
            <input className={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Heure début *"><input className={inp} type="time" value={form.heureDebut} onChange={e => set('heureDebut', e.target.value)} /></Field>
          <Field label="Heure fin *"><input className={inp} type="time" value={form.heureFin} onChange={e => set('heureFin', e.target.value)} /></Field>
        </div>
        <Field label="Notes"><textarea className={inp + ' resize-none'} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
        {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || (!garde && (!form.userId || !form.date))}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Enregistrement...' : garde ? 'Mettre à jour' : 'Planifier'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function AddAbsenceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ type: 'CONGE', dateDebut: '', dateFin: '', raison: '' })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try { await api.post('/planning/absences', form); onSuccess() }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }
  return (
    <ModalWrapper title="Déclarer une absence" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Type d'absence">
          <Combobox options={Object.entries(TYPE_ABSENCE).map(([v, l]) => ({ value: v, label: l }))} value={form.type} onChange={v => set('type', v || 'CONGE')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date de début *"><input className={inp} type="date" value={form.dateDebut} onChange={e => set('dateDebut', e.target.value)} /></Field>
          <Field label="Date de fin *"><input className={inp} type="date" value={form.dateFin} onChange={e => set('dateFin', e.target.value)} /></Field>
        </div>
        <Field label="Raison"><textarea className={inp + ' resize-none'} rows={2} value={form.raison} onChange={e => set('raison', e.target.value)} placeholder="Facultatif..." /></Field>
        {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || !form.dateDebut || !form.dateFin}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Enregistrement...' : 'Soumettre'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function GardeDetailModal({ garde, isAdmin, onClose, onEdit, onUpdate }: { garde: Garde; isAdmin: boolean; onClose: () => void; onEdit?: (g: Garde) => void; onUpdate: () => void }) {
  const [saving, setSaving] = useState(false)
  const t = TYPE_GARDE[garde.type] || TYPE_GARDE.JOUR

  async function supprimer() {
    setSaving(true)
    try { await api.delete(`/planning/gardes/${garde.id}`); onUpdate() }
    catch {} finally { setSaving(false) }
  }

  return (
    <ModalWrapper title="Détail de la garde" onClose={onClose}>
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${t.bg} ${t.border}`}>
        <t.icon className={`w-6 h-6 shrink-0 ${t.text}`} />
        <div>
          <div className={`font-semibold text-sm ${t.text}`}>{t.label}</div>
          <div className={`text-xs opacity-70 ${t.text}`}>{new Date(garde.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          ['Personnel', `${garde.user.prenom} ${garde.user.nom} (${garde.user.role})`],
          ['Horaires',  `${garde.heureDebut} → ${garde.heureFin}`],
          garde.service && ['Service', garde.service.nom],
          garde.notes   && ['Notes', garde.notes],
        ].filter(Boolean).map(([label, value]: any) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-800 text-right font-medium">{value}</span>
          </div>
        ))}
      </div>
      {isAdmin && (
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <button onClick={() => onEdit(garde)} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
              <Edit2 className="w-3.5 h-3.5" /> Modifier
            </button>
          )}
          <button onClick={supprimer} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm transition-colors">
            <Trash2 className="w-3.5 h-3.5" />{saving ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      )}
    </ModalWrapper>
  )
}

function TraiterAbsenceModal({ absence, onClose, onSuccess }: { absence: Absence; onClose: () => void; onSuccess: () => void }) {
  const [saving, setSaving] = useState(false)
  async function traiter(statut: 'APPROUVE' | 'REJETE') {
    setSaving(true)
    try { await api.patch(`/planning/absences/${absence.id}`, { statut }); onSuccess() }
    catch {} finally { setSaving(false) }
  }
  return (
    <ModalWrapper title="Traiter la demande d'absence" onClose={onClose}>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
        <div className="text-slate-900 font-semibold">{absence.user.prenom} {absence.user.nom}</div>
        <div className="text-slate-600 text-sm">{TYPE_ABSENCE[absence.type]} · {new Date(absence.dateDebut).toLocaleDateString('fr-FR')} → {new Date(absence.dateFin).toLocaleDateString('fr-FR')}</div>
        {absence.raison && <div className="text-slate-400 text-xs">"{absence.raison}"</div>}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
        <button onClick={() => traiter('REJETE')} disabled={saving}
          className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-medium">Rejeter</button>
        <button onClick={() => traiter('APPROUVE')} disabled={saving}
          className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
          {saving ? '...' : 'Approuver'}
        </button>
      </div>
    </ModalWrapper>
  )
}
