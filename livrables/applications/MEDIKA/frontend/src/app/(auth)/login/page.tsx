'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import {
  Activity, Shield, Users, Clock,
  FileText, ChevronRight, Eye, EyeOff, Stethoscope
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Dossiers patients centralisés',
    desc: 'Historique complet, antécédents, allergies et consultations accessibles en un clic',
  },
  {
    icon: Clock,
    title: 'File d\'attente intelligente',
    desc: 'Gérez les rendez-vous et la file d\'attente de chaque médecin en temps réel',
  },
  {
    icon: FileText,
    title: 'Facturation automatisée',
    desc: 'Générez des factures, suivez les impayés et encaissez en quelques secondes',
  },
  {
    icon: Shield,
    title: 'Sécurité médicale',
    desc: 'Contrôle d\'accès par rôle — chaque utilisateur voit uniquement ce qu\'il doit voir',
  },
]

const stats = [
  { value: '4', label: 'Modules MVP', sub: 'patients · RDV · consultations · facturation' },
  { value: '5', label: 'Rôles métier', sub: 'admin · médecin · infirmier · caissier · accueil' },
  { value: '100%', label: 'Données locales', sub: 'votre infrastructure, votre contrôle' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Panneau gauche ── */}
      <div className="hidden lg:flex lg:w-[58%] relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col overflow-hidden">

        {/* Cercles décoratifs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-3xl" />

        {/* Grille de fond subtile */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-md opacity-50" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-white text-xl font-bold tracking-wide">MEDIKA</span>
              <div className="text-blue-400 text-[10px] font-medium tracking-widest uppercase">Système hospitalier</div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-16 mb-10">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              La santé,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                numérisée.
              </span>
            </h1>
            <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-md">
              Centralisez la gestion de votre hôpital — patients, consultations, rendez-vous et facturation — dans un seul système sécurisé.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 flex-1">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 group">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
            {stats.map(({ value, label, sub }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-blue-400 text-xs font-semibold mt-0.5">{label}</div>
                <div className="text-slate-600 text-[10px] mt-0.5 leading-relaxed">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Header mobile */}
        <div className="lg:hidden flex items-center gap-2 px-6 py-5 border-b">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-slate-900 font-bold">MEDIKA</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">

            {/* Icône + titre */}
            <div className="mb-8">
              <div className="hidden lg:flex w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl items-center justify-center mb-6">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Bon retour</h2>
              <p className="text-slate-500 mt-1 text-sm">Connectez-vous à votre espace de travail</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@medika.ht"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Rôles disponibles */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Rôles du système</p>
              <div className="flex flex-wrap gap-1.5">
                {['Admin', 'Médecin', 'Infirmier', 'Caissier', 'Accueil'].map(role => (
                  <span key={role} className="text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-full">
                    {role}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            MEDIKA © {new Date().getFullYear()} · Système de gestion hospitalière
          </p>
        </div>
      </div>
    </div>
  )
}
