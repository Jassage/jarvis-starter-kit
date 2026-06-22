'use client'
import { useState, useRef, useEffect, useId } from 'react'
import { Search, ChevronDown, X, Check } from 'lucide-react'

export interface ComboboxOption {
  value: string
  label: string
  sub?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  className?: string
  clearable?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Rechercher...',
  emptyLabel = 'Aucun résultat',
  disabled = false,
  className = '',
  clearable = true,
}: ComboboxProps) {
  const id             = useId()
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef       = useRef<HTMLInputElement>(null)
  const containerRef   = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = query.trim()
    ? options.filter(o =>
        `${o.label} ${o.sub ?? ''}`.toLowerCase().includes(query.toLowerCase())
      )
    : options

  // Ferme au clic extérieur
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openDropdown() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function pick(opt: ComboboxOption) {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        id={id}
        onClick={openDropdown}
        disabled={disabled}
        className={`
          w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm text-left
          transition-all bg-white
          ${disabled ? 'opacity-50 cursor-not-allowed border-slate-200' : 'cursor-pointer border-slate-200 hover:border-slate-300'}
          ${open ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
      >
        <span className={`flex-1 truncate ${selected ? 'text-slate-900' : 'text-slate-300'}`}>
          {selected ? selected.label : placeholder}
        </span>
        {selected && selected.sub && (
          <span className="text-xs text-slate-400 shrink-0 hidden sm:block">{selected.sub}</span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {clearable && selected && (
            <span
              role="button"
              tabIndex={0}
              onMouseDown={clear}
              onKeyDown={e => e.key === 'Enter' && clear(e as any)}
              className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors rounded"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-slate-50"
                onKeyDown={e => {
                  if (e.key === 'Escape') { setOpen(false); setQuery('') }
                  if (e.key === 'Enter' && filtered.length === 1) pick(filtered[0])
                }}
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">{emptyLabel}</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={() => pick(opt)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-blue-50 transition-colors
                    ${opt.value === value ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{opt.label}</p>
                    {opt.sub && <p className="text-xs text-slate-400 truncate">{opt.sub}</p>}
                  </div>
                  {opt.value === value && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </button>
              ))
            )}
          </div>

          {/* Compteur si beaucoup d'options */}
          {options.length > 10 && (
            <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] text-slate-400">
                {filtered.length} / {options.length} résultat{filtered.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
