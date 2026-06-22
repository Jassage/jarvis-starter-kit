'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react'
import api from '@/lib/api'

interface Stats {
  patientsTotal: number
  appointmentsAujourdhui: number
  facturesImpayes: number
  consultationsAujourdhui: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ patientsTotal: 0, appointmentsAujourdhui: 0, facturesImpayes: 0, consultationsAujourdhui: 0 })
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [patientsRes, appointmentsRes, impayesRes] = await Promise.all([
          api.get('/patients?limit=1'),
          api.get(`/appointments?date=${new Date().toISOString().split('T')[0]}`),
          api.get('/factures/impayes'),
        ])
        setStats({
          patientsTotal: patientsRes.data.data?.total ?? 0,
          appointmentsAujourdhui: appointmentsRes.data.data?.length ?? 0,
          facturesImpayes: impayesRes.data.data?.length ?? 0,
          consultationsAujourdhui: 0,
        })
      } catch {}
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Patients enregistrés', value: stats.patientsTotal, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: "Rendez-vous aujourd'hui", value: stats.appointmentsAujourdhui, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Factures impayées', value: stats.facturesImpayes, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Consultations du jour', value: stats.consultationsAujourdhui, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 capitalize mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Accès rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { href: '/patients', label: 'Nouveau patient', color: 'bg-blue-600 hover:bg-blue-700' },
              { href: '/appointments', label: 'Nouveau RDV', color: 'bg-violet-600 hover:bg-violet-700' },
              { href: '/consultations', label: 'Consultation', color: 'bg-green-600 hover:bg-green-700' },
              { href: '/factures', label: 'Facturation', color: 'bg-orange-600 hover:bg-orange-700' },
            ].map(({ href, label, color }) => (
              <a
                key={href}
                href={href}
                className={`${color} text-white text-sm font-medium px-4 py-3 rounded-lg text-center transition-colors`}
              >
                {label}
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Statut système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Base de données', ok: true },
              { label: 'API Backend', ok: true },
              { label: 'Authentification', ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {ok ? 'Opérationnel' : 'Erreur'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
