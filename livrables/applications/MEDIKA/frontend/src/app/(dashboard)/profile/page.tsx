'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { User, Lock, CheckCircle2, Eye, EyeOff, Save } from 'lucide-react'

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur', MEDECIN: 'Médecin', INFIRMIER: 'Infirmier(e)',
  CAISSIER: 'Caissier(e)', ACCUEIL: 'Accueil',
}
const roleColors: Record<string, string> = {
  ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
  MEDECIN: 'bg-blue-50 text-blue-700 border-blue-200',
  INFIRMIER: 'bg-teal-50 text-teal-700 border-teal-200',
  CAISSIER: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCUEIL: 'bg-violet-50 text-violet-700 border-violet-200',
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()

  const [prenom, setPrenom] = useState(user?.prenom || '')
  const [nom, setNom]       = useState(user?.nom || '')

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)

  const [savingInfo, setSavingInfo]   = useState(false)
  const [savingPwd, setSavingPwd]     = useState(false)
  const [savedInfo, setSavedInfo]     = useState(false)
  const [savedPwd, setSavedPwd]       = useState(false)
  const [errInfo, setErrInfo]         = useState('')
  const [errPwd, setErrPwd]           = useState('')

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all'
  const labelCls = 'block text-xs font-semibold text-slate-500 mb-1.5'

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    if (!prenom.trim() || !nom.trim()) { setErrInfo('Prénom et nom requis.'); return }
    setSavingInfo(true); setErrInfo(''); setSavedInfo(false)
    try {
      await updateProfile({ prenom: prenom.trim(), nom: nom.trim() })
      setSavedInfo(true)
    } catch {
      setErrInfo('Erreur lors de la sauvegarde.')
    } finally { setSavingInfo(false) }
  }

  async function handleSavePwd(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPwd) { setErrPwd('Mot de passe actuel requis.'); return }
    if (!newPwd)     { setErrPwd('Nouveau mot de passe requis.'); return }
    if (newPwd.length < 6) { setErrPwd('Au moins 6 caractères.'); return }
    if (newPwd !== confirmPwd) { setErrPwd('Les mots de passe ne correspondent pas.'); return }
    setSavingPwd(true); setErrPwd(''); setSavedPwd(false)
    try {
      await updateProfile({ prenom: prenom.trim(), nom: nom.trim(), currentPassword: currentPwd, newPassword: newPwd })
      setSavedPwd(true)
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (err: any) {
      setErrPwd(err?.response?.data?.message || 'Erreur lors du changement.')
    } finally { setSavingPwd(false) }
  }

  if (!user) return null

  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()

  return (
    <div className="max-w-2xl space-y-6">

      <div>
        <h1 className="text-xl font-bold text-slate-900">Mon profil</h1>
        <p className="text-sm text-slate-400 mt-1">Gérez vos informations personnelles et votre mot de passe.</p>
      </div>

      {/* Carte identité */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">{user.prenom} {user.nom}</p>
          <p className="text-sm text-slate-400">{user.email}</p>
          <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleColors[user.role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {roleLabels[user.role] || user.role}
          </span>
        </div>
      </div>

      {/* Informations */}
      <form onSubmit={handleSaveInfo} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-900 text-sm">Informations personnelles</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Prénom</label>
              <input className={inputCls} value={prenom} onChange={e => { setPrenom(e.target.value); setSavedInfo(false) }} />
            </div>
            <div>
              <label className={labelCls}>Nom</label>
              <input className={inputCls} value={nom} onChange={e => { setNom(e.target.value); setSavedInfo(false) }} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Adresse email</label>
            <input className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed`} value={user.email} disabled />
            <p className="text-[11px] text-slate-300 mt-1">L'email ne peut pas être modifié.</p>
          </div>

          {errInfo && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errInfo}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {savedInfo
            ? <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold"><CheckCircle2 className="w-4 h-4" />Enregistré</span>
            : <span />}
          <button type="submit" disabled={savingInfo}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
            {savingInfo ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {savingInfo ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {/* Mot de passe */}
      <form onSubmit={handleSavePwd} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h2 className="font-semibold text-slate-900 text-sm">Changer le mot de passe</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Mot de passe actuel</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} className={`${inputCls} pr-10`}
                value={currentPwd} onChange={e => { setCurrentPwd(e.target.value); setSavedPwd(false) }}
                placeholder="••••••••" autoComplete="current-password" />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Nouveau mot de passe</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} className={`${inputCls} pr-10`}
                value={newPwd} onChange={e => { setNewPwd(e.target.value); setSavedPwd(false) }}
                placeholder="Min. 6 caractères" autoComplete="new-password" />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Confirmer le nouveau mot de passe</label>
            <input type="password" className={`${inputCls} ${confirmPwd && confirmPwd !== newPwd ? 'border-red-300 focus:ring-red-400' : ''}`}
              value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setSavedPwd(false) }}
              placeholder="••••••••" autoComplete="new-password" />
            {confirmPwd && confirmPwd !== newPwd && (
              <p className="text-[11px] text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {errPwd && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errPwd}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {savedPwd
            ? <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold"><CheckCircle2 className="w-4 h-4" />Mot de passe mis à jour</span>
            : <span />}
          <button type="submit" disabled={savingPwd}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors disabled:opacity-50">
            {savingPwd ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            {savingPwd ? 'Mise à jour...' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>

    </div>
  )
}
