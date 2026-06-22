'use client'
import { AlertTriangle, X, Trash2, Ban } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open, title, message,
  confirmLabel = 'Confirmer',
  variant = 'danger',
  loading = false,
  onConfirm, onCancel
}: ConfirmModalProps) {
  if (!open) return null

  const isDanger  = variant === 'danger'
  const iconBg    = isDanger ? 'bg-red-100'    : 'bg-amber-100'
  const iconColor = isDanger ? 'text-red-600'  : 'text-amber-600'
  const btnClass  = isDanger
    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
  const Icon = isDanger ? Trash2 : Ban

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Bande couleur */}
        <div className={`h-1 w-full ${isDanger ? 'bg-red-500' : 'bg-amber-500'}`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
              <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base leading-tight">{title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
            </div>
            <button onClick={onCancel}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all">
              Annuler
            </button>
            <button type="button" onClick={onConfirm} disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md ${btnClass} disabled:opacity-60 transition-all`}>
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Icon className="w-3.5 h-3.5" />{confirmLabel}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
