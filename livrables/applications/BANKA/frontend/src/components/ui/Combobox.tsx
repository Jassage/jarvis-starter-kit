'use client';
import { useState, useRef, useEffect } from 'react';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}

interface Props {
  options: ComboboxOption[];
  value: string;
  onChange: (val: string, opt?: ComboboxOption) => void;
  onSearch?: (q: string) => void;
  loading?: boolean;
  placeholder?: string;
  displayValue?: string;
  emptyMessage?: string;
  className?: string;
}

export default function Combobox({
  options,
  value,
  onChange,
  onSearch,
  loading = false,
  placeholder = 'Rechercher...',
  displayValue,
  emptyMessage = 'Aucun résultat',
  className = '',
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleQuery = (q: string) => {
    setQuery(q);
    onSearch?.(q);
    setOpen(true);
  };

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.value, opt);
    setQuery('');
    setOpen(false);
  };

  const selectedOpt = options.find(o => o.value === value);
  const inputDisplay = open ? query : (displayValue || selectedOpt?.label || '');

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8b94b0' }}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={inputDisplay}
          onChange={(e) => handleQuery(e.target.value)}
          onFocus={() => { setOpen(true); setQuery(''); }}
          placeholder={placeholder}
          className={`input pl-10 pr-10 ${value ? 'font-medium' : ''}`}
          style={{ color: value && !open ? '#0b1733' : undefined }}
        />
        {loading ? (
          <svg className="animate-spin w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
            <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        ) : value ? (
          <button
            type="button"
            onClick={() => { onChange(''); setQuery(''); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
            style={{ background: '#f0f2f9', color: '#4a5578' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8b94b0' }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {open && (
        <div className="combobox-dropdown">
          {loading ? (
            <div className="px-4 py-4 text-center">
              <svg className="animate-spin w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p className="text-xs mt-1.5" style={{ color: '#8b94b0' }}>Recherche en cours...</p>
            </div>
          ) : options.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm" style={{ color: '#8b94b0' }}>{emptyMessage}</p>
            </div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                className={`combobox-item ${opt.value === value ? 'active' : ''}`}
                onMouseDown={() => handleSelect(opt)}
              >
                {opt.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#0b1733' }}>{opt.label}</p>
                  {opt.sublabel && <p className="text-xs truncate" style={{ color: '#8b94b0' }}>{opt.sublabel}</p>}
                </div>
                {opt.badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: opt.badgeColor ? `${opt.badgeColor}20` : '#f0f2f9', color: opt.badgeColor || '#4a5578' }}>
                    {opt.badge}
                  </span>
                )}
                {opt.value === value && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#2563eb' }}>
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
