'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, Bed, Bath, Maximize2, Zap, Droplets, Wifi, Car, Shield,
  Phone, MessageSquare, Heart, Share2, Flag, ChevronLeft, ChevronRight,
  Star, Waves, Sun, Leaf, Wind, Thermometer, CheckCircle2, Copy, Check
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { listingsApi, messagesApi, favoritesApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import {
  formatPrice, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS,
  DEPARTMENT_LABELS, timeAgo, cn
} from '../../../../lib/utils';
import { PropertyCard } from '../../../../components/properties/PropertyCard';
import type { PropertyCardData } from '../../../../components/properties/PropertyCard';

// Carte Leaflet chargée côté client uniquement (SSR incompatible)
const PropertyMap = dynamic(() => import('../../../../components/map/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
      Chargement de la carte…
    </div>
  ),
});

const AMENITY_MAP = [
  { key: 'hasWater', label: 'Eau courante', icon: Droplets, color: 'text-blue-500' },
  { key: 'hasElectricity', label: 'Électricité EDH', icon: Zap, color: 'text-yellow-500' },
  { key: 'hasGenerator', label: 'Groupe électrogène', icon: Zap, color: 'text-orange-500' },
  { key: 'hasSolarPanel', label: 'Panneaux solaires', icon: Sun, color: 'text-amber-500' },
  { key: 'hasCistern', label: 'Citerne', icon: Droplets, color: 'text-cyan-500' },
  { key: 'hasInternet', label: 'Internet', icon: Wifi, color: 'text-purple-500' },
  { key: 'hasParking', label: 'Parking', icon: Car, color: 'text-gray-500' },
  { key: 'hasPool', label: 'Piscine', icon: Waves, color: 'text-blue-400' },
  { key: 'hasAC', label: 'Climatisation', icon: Wind, color: 'text-sky-500' },
  { key: 'isFurnished', label: 'Meublé', icon: Leaf, color: 'text-green-500' },
  { key: 'hasSecurity', label: 'Sécurité', icon: Shield, color: 'text-red-500' },
  { key: 'hasSeaView', label: 'Vue sur mer', icon: Waves, color: 'text-teal-500' },
  { key: 'hasMountainView', label: 'Vue montagne', icon: Thermometer, color: 'text-brown-500' },
  { key: 'hasBalcony', label: 'Balcon/Terrasse', icon: Leaf, color: 'text-green-400' },
  { key: 'hasGarden', label: 'Jardin', icon: Leaf, color: 'text-green-600' },
  { key: 'petsAllowed', label: 'Animaux acceptés', icon: Heart, color: 'text-pink-500' },
];

function buildWhatsAppUrl(whatsapp: string, listingTitle: string, listingUrl: string) {
  // Normalise le numéro : supprime espaces/tirets, ajoute le préfixe +509 si absent
  let number = whatsapp.replace(/[\s\-().]/g, '');
  if (!number.startsWith('+')) number = `+509${number.replace(/^509/, '')}`;
  const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${listingTitle}" sur LAKAY.\n${listingUrl}`);
  return `https://wa.me/${number.replace('+', '')}?text=${message}`;
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactMsg, setContactMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id).then((r) => r.data.data.listing),
    enabled: !!id,
  });

  const { data: similarData } = useQuery({
    queryKey: ['similar', id],
    queryFn: () => listingsApi.getSimilar(id).then((r) => r.data.data.listings as PropertyCardData[]),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation favoris
  const favoriteMutation = useMutation({
    mutationFn: async (isFav: boolean) => {
      if (isFav) return favoritesApi.remove(id);
      return favoritesApi.add(id);
    },
    onMutate: async (isFav) => {
      await queryClient.cancelQueries({ queryKey: ['listing', id] });
      const prev = queryClient.getQueryData(['listing', id]);
      queryClient.setQueryData(['listing', id], (old: Record<string, unknown>) =>
        old ? { ...old, isFavorite: !isFav } : old
      );
      return { prev };
    },
    onError: (_err, _isFav, context) => {
      if (context?.prev) queryClient.setQueryData(['listing', id], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
    },
  });

  const handleFavorite = useCallback(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    favoriteMutation.mutate(data?.isFavorite ?? false);
  }, [isAuthenticated, router, favoriteMutation, data?.isFavorite]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = data?.title ?? 'Annonce LAKAY';
    const text = data ? `${title} — ${formatPrice(data.price, data.currency)}` : title;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch { /* annulé par l'utilisateur */ }
    }

    // Fallback : copier le lien
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  const handleContact = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!contactMsg.trim()) return;
    setMsgError('');
    setSendingMsg(true);
    try {
      await messagesApi.start({
        otherUserId: data.owner.id,
        listingId: data.id,
        firstMessage: contactMsg,
      });
      setContactMsg('');
      router.push('/dashboard/messages');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMsgError(msg || 'Erreur lors de l\'envoi. Réessayez.');
    } finally { setSendingMsg(false); }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-gray-500">Annonce introuvable</p>
        <Link href="/properties" className="text-primary-500 hover:underline">← Retour aux annonces</Link>
      </div>
    );
  }

  const listing = data;
  const images = listing.images || [];
  const activeAmenities = AMENITY_MAP.filter((a) => listing[a.key as keyof typeof listing]);
  const isFavorite = listing.isFavorite ?? false;
  const isOwner = isAuthenticated && currentUser?.id === (listing.owner?.id ?? listing.ownerId);
  const whatsappUrl = listing.owner?.whatsapp
    ? buildWhatsAppUrl(listing.owner.whatsapp, listing.title, typeof window !== 'undefined' ? window.location.href : '')
    : null;

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/" className="hover:text-primary-500">Accueil</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-primary-500">Annonces</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie photos */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
              {images.length > 0 ? (
                <>
                  <div className="h-80 sm:h-[480px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={images[currentImageIndex]?.url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
                        disabled={currentImageIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((i) => Math.min(images.length - 1, i + 1))}
                        disabled={currentImageIndex === images.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 disabled:opacity-30"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_: unknown, i: number) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={cn('w-2 h-2 rounded-full transition-colors', i === currentImageIndex ? 'bg-white' : 'bg-white/40')}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3 bg-black/30 overflow-x-auto">
                      {images.map((img: { url: string }, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={cn('relative w-16 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-colors', i === currentImageIndex ? 'border-primary-500' : 'border-transparent')}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  <span className="text-5xl">📷</span>
                </div>
              )}
            </div>

            {/* Titre + Prix */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', listing.listingType === 'RENT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')}>
                      {LISTING_TYPE_LABELS[listing.listingType]}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{PROPERTY_TYPE_LABELS[listing.propertyType]}</span>
                    {listing.isAvailableNow && (
                      <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Disponible
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-display font-bold text-gray-900">{listing.title}</h1>
                  <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 shrink-0 text-primary-500" />
                    <span>
                      {listing.neighborhood && `${listing.neighborhood}, `}
                      {listing.city}, {DEPARTMENT_LABELS[listing.department]}
                      {listing.landmark && ` — repère: ${listing.landmark}`}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(listing.price, listing.currency)}</p>
                  {listing.listingType === 'RENT' && <p className="text-sm text-gray-400">/mois</p>}
                  {listing.priceNegotiable && <p className="text-xs text-green-600 mt-1">Négociable</p>}
                </div>
              </div>

              {/* Caractéristiques rapides */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-50">
                {listing.bedrooms > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span>{listing.bedrooms} chambre{listing.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                )}
                {listing.bathrooms > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Bath className="w-4 h-4 text-gray-400" />
                    <span>{listing.bathrooms} salle{listing.bathrooms > 1 ? 's' : ''} de bain</span>
                  </div>
                )}
                {listing.area && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                    <span>{listing.area} m²</span>
                  </div>
                )}
                {listing.floor !== null && listing.floor !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="text-gray-400">Étage</span>
                    <span>{listing.floor === 0 ? 'RDC' : `${listing.floor}e`}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Équipements */}
            {activeAmenities.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-4">Équipements & Services</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeAmenities.map((a) => (
                    <div key={a.key} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                      <a.icon className={cn('w-4 h-4 shrink-0', a.color)} />
                      <span className="text-sm text-gray-700">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Carte propriétaire / agence */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">
                {listing.agency ? 'À propos de l\'agence' : 'À propos du propriétaire'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden">
                  {listing.agency?.logo
                    ? <img src={listing.agency.logo} alt={listing.agency.name} className="w-full h-full object-cover" />
                    : listing.owner?.avatar
                      ? <img src={listing.owner.avatar} alt="" className="w-full h-full object-cover" />
                      : `${listing.owner?.firstName?.[0] ?? '?'}${listing.owner?.lastName?.[0] ?? ''}`
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">
                      {listing.agency ? listing.agency.name : `${listing.owner?.firstName} ${listing.owner?.lastName}`}
                    </p>
                    {(listing.agency?.isVerified || listing.owner?.isVerified) && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Vérifié
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {listing.agency ? 'Agence immobilière enregistrée' : 'Propriétaire particulier'}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {listing.owner?.phone && (
                      <a
                        href={`tel:${listing.owner.phone}`}
                        className="flex items-center gap-1.5 text-sm font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {listing.owner.phone}
                      </a>
                    )}
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium bg-[#25D366]/10 text-[#128C7E] px-3 py-1.5 rounded-lg hover:bg-[#25D366]/20 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tour virtuel */}
            {listing.virtualTourUrl && (
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">Visite virtuelle</h2>
                <a
                  href={listing.virtualTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                  </svg>
                  Lancer la visite virtuelle 360°
                </a>
                <p className="text-xs text-gray-400 text-center mt-2">Ouverture dans un nouvel onglet</p>
              </div>
            )}

            {/* Localisation */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">Localisation</h2>
              {listing.landmark && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                  <span><strong>Point de repère:</strong> {listing.landmark}</span>
                </div>
              )}
              {listing.latitude && listing.longitude ? (
                <PropertyMap lat={listing.latitude} lng={listing.longitude} title={listing.title} />
              ) : (
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200">
                  Coordonnées GPS non renseignées
                </div>
              )}
              {listing.googleMapsUrl && (
                <a
                  href={listing.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-primary-500 hover:text-primary-600"
                >
                  <MapPin className="w-4 h-4" /> Voir sur Google Maps
                </a>
              )}
            </div>

            {/* Avis */}
            {listing.reviews?.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-4">Avis ({listing.reviews.length})</h2>
                <div className="space-y-4">
                  {listing.reviews.map((review: { id: string; rating: number; comment?: string; createdAt: string; user: { avatar?: string; firstName: string; lastName: string } }) => (
                    <div key={review.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {review.user.firstName[0]}{review.user.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{review.user.firstName}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn('w-3 h-3', i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200')} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                        </div>
                        {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar contact */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 sticky top-24">
              {/* Propriétaire / Agence */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 overflow-hidden shrink-0">
                  {listing.agency?.logo
                    ? <img src={listing.agency.logo} alt="" className="w-full h-full object-cover" />
                    : listing.owner?.avatar
                      ? <img src={listing.owner.avatar} alt="" className="w-full h-full object-cover" />
                      : `${listing.owner?.firstName[0]}${listing.owner?.lastName[0]}`
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                    {listing.agency ? listing.agency.name : `${listing.owner?.firstName} ${listing.owner?.lastName}`}
                    {(listing.agency?.isVerified || listing.owner?.isVerified) && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {listing.agency ? 'Agence immobilière' : 'Propriétaire particulier'}
                  </p>
                </div>
              </div>

              {/* Bouton téléphone */}
              {listing.owner?.phone && (
                <a
                  href={`tel:${listing.owner.phone}`}
                  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors mb-2"
                >
                  <Phone className="w-4 h-4" />
                  Appeler maintenant
                </a>
              )}

              {/* Bouton WhatsApp */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 rounded-xl transition-colors mb-3"
                >
                  {/* Icône WhatsApp SVG inline */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}

              {/* Message interne */}
              {isOwner ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
                  C'est votre annonce.{' '}
                  <Link href="/dashboard/listings" className="underline font-medium">Gérer mes annonces</Link>
                </div>
              ) : (
                <div>
                  <textarea
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Bonjour, je suis intéressé(e) par cette annonce…"
                    className="input resize-none h-24 text-sm mb-2"
                  />
                  {msgError && <p className="text-red-500 text-xs mb-2">{msgError}</p>}
                  <button
                    onClick={handleContact}
                    disabled={sendingMsg || !contactMsg.trim()}
                    className="flex items-center justify-center gap-2 w-full btn-primary"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {sendingMsg ? 'Envoi…' : 'Envoyer un message'}
                  </button>
                </div>
              )}

              {/* Actions secondaires */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg border transition-colors',
                    isFavorite
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                  {isFavorite ? 'Retiré' : 'Favori'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Partager'}
                </button>
              </div>

              {/* Signaler */}
              <button className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
                <Flag className="w-3.5 h-3.5" />
                Signaler cette annonce
              </button>
            </div>

            {/* Infos rapides */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-sm space-y-2">
              <div className="flex justify-between text-gray-500">
                <span>Référence</span>
                <span className="font-medium text-gray-700 font-mono text-xs">{listing.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Publié</span>
                <span className="font-medium text-gray-700">{timeAgo(listing.createdAt)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Vues</span>
                <span className="font-medium text-gray-700">{listing.viewCount}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Favoris</span>
                <span className="font-medium text-gray-700">{listing._count?.favorites ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Annonces similaires */}
        {similarData && similarData.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Annonces similaires</h2>
              <Link
                href={`/properties?propertyType=${listing.propertyType}&listingType=${listing.listingType}&department=${listing.department}`}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarData.map((item) => (
                <PropertyCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
