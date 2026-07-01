'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Bed, Bath, Maximize2, Zap, Droplets, Star, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { cn, formatPrice, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from '../../lib/utils';
import { favoritesApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export interface PropertyCardData {
  id: string;
  title: string;
  propertyType: string;
  listingType: string;
  price: number | string;
  currency: 'HTG' | 'USD';
  priceNegotiable?: boolean;
  city: string;
  neighborhood?: string;
  department: string;
  landmark?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  hasElectricity?: boolean;
  hasWater?: boolean;
  isAvailableNow?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  viewCount?: number;
  favoriteCount?: number;
  createdAt: string;
  images?: Array<{ url: string; alt?: string }>;
  owner?: { id: string; firstName: string; lastName: string; avatar?: string; isVerified?: boolean };
  agency?: { id: string; name: string; logo?: string; isVerified?: boolean };
  isFavorite?: boolean;
}

interface Props {
  listing: PropertyCardData;
  onFavoriteChange?: (id: string, isFavorite: boolean) => void;
}

export function PropertyCard({ listing, onFavoriteChange }: Props) {
  const [isFavorite, setIsFavorite] = useState(listing.isFavorite || false);
  const [favLoading, setFavLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const imageUrl = listing.images?.[0]?.url || null;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(listing.id);
        setIsFavorite(false);
        onFavoriteChange?.(listing.id, false);
      } else {
        await favoritesApi.add(listing.id);
        setIsFavorite(true);
        onFavoriteChange?.(listing.id, true);
      }
    } catch { /* ignore */ }
    finally { setFavLoading(false); }
  };

  return (
    <Link href={`/properties/${listing.id}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image avec overlays */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          )}

          {/* Gradient overlay pour le prix */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Badges haut gauche */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm',
              listing.listingType === 'RENT'
                ? 'bg-blue-600/90 text-white'
                : 'bg-emerald-600/90 text-white'
            )}>
              {LISTING_TYPE_LABELS[listing.listingType]}
            </span>
            {listing.isFeatured && (
              <span className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
          </div>

          {/* Bouton favori haut droite */}
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm',
              isFavorite
                ? 'bg-red-500 text-white shadow-lg scale-110'
                : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500 hover:scale-110'
            )}
          >
            <Heart className={cn('w-4 h-4 transition-transform', isFavorite && 'fill-current')} />
          </button>

          {/* Prix en bas de l'image */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-lg leading-none drop-shadow-md">
              {formatPrice(listing.price, listing.currency)}
              {listing.listingType === 'RENT' && (
                <span className="text-white/70 text-sm font-normal">/mois</span>
              )}
            </p>
            {listing.priceNegotiable && (
              <span className="text-white/80 text-xs">Négociable</span>
            )}
          </div>

          {/* Badge disponible */}
          {listing.isAvailableNow && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Dispo
            </div>
          )}
        </div>

        {/* Corps de la carte */}
        <div className="p-4">
          {/* Type de bien */}
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            {PROPERTY_TYPE_LABELS[listing.propertyType]}
          </p>

          {/* Titre */}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2.5 group-hover:text-primary transition-colors duration-200">
            {listing.title}
          </h3>

          {/* Localisation */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/60" />
            <span className="truncate font-medium">
              {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
            </span>
          </div>

          {/* Caractéristiques */}
          {(listing.bedrooms || listing.bathrooms || listing.area) ? (
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-50">
              {listing.bedrooms !== undefined && listing.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-gray-400" />
                  {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms !== undefined && listing.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-gray-400" />
                  {listing.bathrooms}
                </span>
              )}
              {listing.area && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                  {listing.area} m²
                </span>
              )}
              {/* Équipements clés en ligne */}
              <div className="ml-auto flex gap-1.5">
                {listing.hasElectricity && (
                  <span title="Électricité" className="w-5 h-5 bg-yellow-50 rounded-md flex items-center justify-center">
                    <Zap className="w-3 h-3 text-yellow-600" />
                  </span>
                )}
                {listing.hasWater && (
                  <span title="Eau courante" className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                    <Droplets className="w-3 h-3 text-blue-600" />
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Propriétaire ou agence */}
          {(listing.owner || listing.agency) && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden shrink-0">
                {listing.agency?.logo
                  ? <img src={listing.agency.logo} alt="" className="w-full h-full object-cover" />
                  : listing.owner?.avatar
                    ? <img src={listing.owner.avatar} alt="" className="w-full h-full object-cover" />
                    : (listing.agency?.name?.[0] ?? listing.owner?.firstName?.[0] ?? '?')
                }
              </div>
              <span className="text-xs text-gray-500 truncate flex-1">
                {listing.agency
                  ? listing.agency.name
                  : `${listing.owner?.firstName} ${listing.owner?.lastName}`}
              </span>
              {(listing.agency?.isVerified || listing.owner?.isVerified) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
