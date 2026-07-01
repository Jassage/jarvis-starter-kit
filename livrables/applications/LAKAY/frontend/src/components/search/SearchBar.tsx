'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { searchApi } from '../../lib/api';
import { cn } from '../../lib/utils';

interface AutocompleteItem {
  type: string;
  label: string;
  department: string;
}

interface Props {
  defaultValue?: string;
  defaultType?: 'RENT' | 'SALE';
  size?: 'default' | 'large';
  className?: string;
}

export function SearchBar({ defaultValue = '', defaultType = 'RENT', size = 'default', className }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [listingType, setListingType] = useState<'RENT' | 'SALE'>(defaultType);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchApi.autocomplete(query);
        setSuggestions(data.data || []);
        setShowSuggestions(true);
      } catch { /* ignore */ }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    params.set('listingType', listingType);
    setShowSuggestions(false);
    router.push(`/properties?${params.toString()}`);
  };

  const isLarge = size === 'large';

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'flex items-center bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden',
        isLarge ? 'h-14' : 'h-11'
      )}>
        {/* Toggle Louer/Acheter */}
        <div className="flex border-r border-gray-100 shrink-0">
          {(['RENT', 'SALE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setListingType(type)}
              className={cn(
                'px-3 font-medium text-sm transition-colors h-full',
                isLarge ? 'px-4' : 'px-3',
                listingType === type ? 'text-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {type === 'RENT' ? 'Louer' : 'Acheter'}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex-1 flex items-center px-3 gap-2">
          <MapPin className={cn('shrink-0 text-gray-400', isLarge ? 'w-5 h-5' : 'w-4 h-4')} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Quartier, ville, département..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className={cn(
              'flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400',
              isLarge ? 'text-base' : 'text-sm'
            )}
          />
        </div>

        {/* Bouton */}
        <button
          onClick={() => handleSearch()}
          className={cn(
            'bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors shrink-0 flex items-center gap-2',
            isLarge ? 'px-6 h-full text-base' : 'px-4 h-full text-sm'
          )}
        >
          <Search className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          <div className="fixed inset-0" onClick={() => setShowSuggestions(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s.label); handleSearch(s.label); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-400 capitalize">{s.type} • {s.department}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
