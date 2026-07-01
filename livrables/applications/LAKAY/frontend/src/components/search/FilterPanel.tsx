'use client';
import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn, HAITI_DEPARTMENTS } from '../../lib/utils';

const PROPERTY_TYPES = [
  { value: 'ROOM', label: 'Chambre' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OFFICE', label: 'Bureau' },
  { value: 'WAREHOUSE', label: 'Entrepôt' },
];

const AMENITIES = [
  { key: 'hasWater', label: 'Eau courante', icon: '💧' },
  { key: 'hasElectricity', label: 'Électricité EDH', icon: '⚡' },
  { key: 'hasGenerator', label: 'Groupe électrogène', icon: '🔋' },
  { key: 'hasSolarPanel', label: 'Panneaux solaires', icon: '☀️' },
  { key: 'hasCistern', label: 'Citerne', icon: '🪣' },
  { key: 'hasInternet', label: 'Internet', icon: '📶' },
  { key: 'hasParking', label: 'Parking', icon: '🚗' },
  { key: 'hasPool', label: 'Piscine', icon: '🏊' },
  { key: 'hasAC', label: 'Climatisation', icon: '❄️' },
  { key: 'isFurnished', label: 'Meublé', icon: '🛋️' },
  { key: 'petsAllowed', label: 'Animaux acceptés', icon: '🐾' },
  { key: 'hasSecurity', label: 'Sécurité/Gardien', icon: '🔐' },
  { key: 'hasSeaView', label: 'Vue sur mer', icon: '🌊' },
  { key: 'isAvailableNow', label: 'Disponible maintenant', icon: '✅' },
];

export interface Filters {
  propertyTypes: string[];
  department: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  minBedrooms: string;
  amenities: Record<string, boolean>;
  sortBy: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Partial<Filters>) => void;
  onApply: () => void;
  onReset: () => void;
  totalResults?: number;
}

export function FilterPanel({ filters, onChange, onApply, onReset, totalResults }: Props) {
  const [expanded, setExpanded] = useState(false);

  const togglePropertyType = (type: string) => {
    const types = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    onChange({ propertyTypes: types });
  };

  const toggleAmenity = (key: string) => {
    onChange({ amenities: { ...filters.amenities, [key]: !filters.amenities[key] } });
  };

  const activeFiltersCount = [
    filters.department,
    filters.minPrice || filters.maxPrice,
    filters.minBedrooms,
    filters.propertyTypes.length > 0,
    Object.values(filters.amenities).some(Boolean),
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800"
        >
          <SlidersHorizontal className="w-4 h-4 text-primary-500" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', expanded && 'rotate-180')} />
        </button>

        <div className="flex items-center gap-3">
          {totalResults !== undefined && (
            <span className="text-sm text-gray-500">{totalResults} résultat{totalResults > 1 ? 's' : ''}</span>
          )}
          {activeFiltersCount > 0 && (
            <button onClick={onReset} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-5">
          {/* Tri */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Trier par</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value })}
              className="input text-sm"
            >
              <option value="">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="views">Plus vus</option>
              <option value="date_asc">Plus ancien</option>
            </select>
          </div>

          {/* Département */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Département</label>
            <select
              value={filters.department}
              onChange={(e) => onChange({ department: e.target.value })}
              className="input text-sm"
            >
              <option value="">Tous les départements</option>
              {HAITI_DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Budget</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => onChange({ minPrice: e.target.value })}
                className="input text-sm w-full"
              />
              <span className="text-gray-400 text-sm shrink-0">à</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onChange({ maxPrice: e.target.value })}
                className="input text-sm w-full"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {(['HTG', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ currency: c })}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors',
                    filters.currency === c ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Chambres */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Chambres minimum</label>
            <div className="flex gap-2">
              {['', '1', '2', '3', '4', '5+'].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ minBedrooms: n === '5+' ? '5' : n })}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors',
                    filters.minBedrooms === (n === '5+' ? '5' : n)
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  )}
                >
                  {n || 'Tous'}
                </button>
              ))}
            </div>
          </div>

          {/* Type de bien */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Type de bien</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => togglePropertyType(type.value)}
                  className={cn(
                    'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
                    filters.propertyTypes.includes(type.value)
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Équipements */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Équipements</label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((a) => (
                <label key={a.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filters.amenities[a.key]}
                    onChange={() => toggleAmenity(a.key)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 accent-orange-500"
                  />
                  <span className="text-xs text-gray-700">{a.icon} {a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Appliquer */}
          <button onClick={onApply} className="w-full btn-primary text-sm py-2.5">
            Appliquer les filtres
          </button>
        </div>
      )}
    </div>
  );
}
