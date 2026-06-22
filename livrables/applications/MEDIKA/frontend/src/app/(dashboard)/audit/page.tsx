'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { Shield, ChevronLeft, ChevronRight, Filter, RotateCcw } from 'lucide-react'

interface AuditLog {
  id: string; action: string; resource: string; recordId?: string
  label?: string; userEmail?: string; userRole?: string
  changes?: Record<string, unknown>; createdAt: string
}

const ACTION_CFG: Record<string, { label: string; color: string; bg: string }> = {
  CREATE: { label: 'Création',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  UPDATE: { label: 'Modification', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  DELETE: { label: 'Suppression',  color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
  LOGIN:  { label: 'Connexion',    color: 'text-slate-600',   bg: 'bg-slate-100 border-slate-200' },
}

const RESOURCES = ['Patient', 'Consultation', 'Examen', 'Facture', 'User', 'Auth']
const ACTIONS   = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN']

export default function AuditPage() {
  const [logs, setLogs]       = useState<AuditLog[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(true)

  const [resource, setResource] = useState('')
  const [action, setAction]     = useState('')
  const [from, setFrom]         = useState('')
  const [to, setTo]             = useState('')

  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' })
      if (resource) params.set('resource', resource)
      if (action)   params.set('action', action)
      if (from)     params.set('from', from)
      if (to)       params.set('to', to)
      const r = await api.get(`/audit-logs?${params}`)
      setLogs(r.data.data.logs)
      setTotal(r.data.data.total)
      setPages(r.data.data.totalPages)
      setPage(p)
    } catch {} finally { setLoading(false) }
  }, [resource, action, from, to])

  useEffect(() => { fetch(1) }, [fetch])

  function reset() {
    setResource(''); setAction(''); setFrom(''); setTo('')
  }

  const selCls = 'px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-slate-500" />
            <h1 className="text-xl font-bold text-slate-900">Journal d'audit</h1>
          </div>
          <p className="text-sm text-slate-400">Traçabilité complète des actions réalisées dans le système.</p>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          {total.toLocaleString('fr-FR')} entrée{total > 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select className={selCls} value={resource} onChange={e => setResource(e.target.value)}>
            <option value="">Toutes les ressources</option>
            {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className={selCls} value={action} onChange={e => setAction(e.target.value)}>
            <option value="">Toutes les actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{ACTION_CFG[a]?.label || a}</option>)}
          </select>
          <input type="date" className={selCls} value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-slate-300 text-sm">→</span>
          <input type="date" className={selCls} value={to} onChange={e => setTo(e.target.value)} />
          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors">
            <RotateCcw className="w-3 h-3" />Réinitialiser
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Aucune entrée pour ces filtres</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-2.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-2">Date / Heure</div>
              <div className="col-span-2">Utilisateur</div>
              <div className="col-span-1">Action</div>
              <div className="col-span-2">Ressource</div>
              <div className="col-span-5">Détail</div>
            </div>
            {logs.map(log => {
              const cfg  = ACTION_CFG[log.action] || ACTION_CFG.LOGIN
              const date = new Date(log.createdAt)
              const isExpanded = expanded === log.id
              return (
                <div key={log.id}>
                  <div
                    className={`grid grid-cols-12 px-5 py-3 hover:bg-slate-50 transition-colors text-sm ${log.changes ? 'cursor-pointer' : ''}`}
                    onClick={() => log.changes && setExpanded(isExpanded ? null : log.id)}
                  >
                    <div className="col-span-2 text-xs text-slate-500">
                      <p className="font-medium text-slate-700">{date.toLocaleDateString('fr-FR')}</p>
                      <p className="text-slate-400">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    </div>
                    <div className="col-span-2 text-xs">
                      <p className="font-medium text-slate-700 truncate">{log.userEmail || '—'}</p>
                      {log.userRole && <p className="text-slate-400">{log.userRole}</p>}
                    </div>
                    <div className="col-span-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs font-medium text-slate-600">{log.resource}</div>
                    <div className="col-span-5 text-xs text-slate-500 flex items-center justify-between gap-2">
                      <span className="truncate">{log.label || log.recordId || '—'}</span>
                      {log.changes && (
                        <span className="text-[10px] text-slate-300 shrink-0">{isExpanded ? '▲' : '▼'} détails</span>
                      )}
                    </div>
                  </div>
                  {isExpanded && log.changes && (
                    <div className="px-5 pb-3 bg-slate-50 border-t border-slate-100">
                      <pre className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded-xl p-3 overflow-x-auto">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Page {page} sur {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => fetch(page - 1)} disabled={page <= 1}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />Préc.
              </button>
              <button onClick={() => fetch(page + 1)} disabled={page >= pages}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                Suiv.<ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
