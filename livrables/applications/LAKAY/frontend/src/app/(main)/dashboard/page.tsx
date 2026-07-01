'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Home, Eye, Heart, MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { listingsApi } from '../../../lib/api';
import { formatPrice, timeAgo, LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '../../../lib/utils';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'text-gray-500 bg-gray-100', icon: Clock },
  PENDING_REVIEW: { label: 'En attente', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  ACTIVE: { label: 'Active', color: 'text-green-600 bg-green-100', icon: CheckCircle2 },
  REJECTED: { label: 'Rejetée', color: 'text-red-600 bg-red-100', icon: AlertCircle },
  EXPIRED: { label: 'Expirée', color: 'text-gray-500 bg-gray-100', icon: AlertCircle },
  RENTED: { label: 'Louée', color: 'text-blue-600 bg-blue-100', icon: CheckCircle2 },
  SOLD: { label: 'Vendue', color: 'text-blue-600 bg-blue-100', icon: CheckCircle2 },
  SUSPENDED: { label: 'Suspendue', color: 'text-red-600 bg-red-100', icon: AlertCircle },
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Charge les 5 dernières pour l'affichage + les 100 premiers pour les stats agrégées
  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['my-listings-recent'],
    queryFn: () => listingsApi.getMyListings({ limit: '5' }).then((r) => r.data),
    enabled: !!user,
  });

  const { data: statsData } = useQuery({
    queryKey: ['my-listings-stats'],
    queryFn: () => listingsApi.getMyListings({ limit: '100' }).then((r) => r.data),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const listings = listingsData?.data || [];
  const allListings: Array<{ status: string; viewCount?: number; favoriteCount?: number }> = statsData?.data || [];

  const stats = {
    total: statsData?.meta?.pagination?.total ?? allListings.length,
    active: allListings.filter((l) => l.status === 'ACTIVE').length,
    views: allListings.reduce((sum, l) => sum + (l.viewCount || 0), 0),
    favorites: allListings.reduce((sum, l) => sum + (l.favoriteCount || 0), 0),
  };

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Bonjour, {user?.firstName} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Voici un aperçu de votre activité sur LAKAY
            </p>
          </div>
          <Link href="/dashboard/listings/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle annonce
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Home,        label: 'Mes annonces', value: stats.total,     color: 'text-primary-500 bg-primary-50' },
            { icon: CheckCircle2, label: 'Actives',     value: stats.active,    color: 'text-green-500 bg-green-50' },
            { icon: Eye,         label: 'Total vues',   value: stats.views,     color: 'text-blue-500 bg-blue-50' },
            { icon: Heart,       label: 'Favoris reçus', value: stats.favorites, color: 'text-red-500 bg-red-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mes annonces récentes */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">Mes dernières annonces</h2>
              <Link href="/dashboard/listings" className="text-sm text-primary-500 hover:text-primary-600">Voir tout →</Link>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-600 mb-2">Aucune annonce encore</p>
                <Link href="/dashboard/listings/new" className="text-primary-500 text-sm hover:underline">
                  Publiez votre première annonce
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {listings.map((listing: {
                  id: string; title: string; propertyType: string; listingType: string;
                  price: string | number; currency: 'HTG' | 'USD'; city: string; status: string;
                  viewCount?: number; createdAt: string;
                  images?: Array<{ url: string }>;
                }) => {
                  const StatusIcon = STATUS_CONFIG[listing.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
                  const statusConfig = STATUS_CONFIG[listing.status as keyof typeof STATUS_CONFIG];
                  return (
                    <div key={listing.id} className="flex items-center gap-4 p-5 hover:bg-gray-50">
                      <div className="w-16 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {listing.images?.[0] ? (
                          <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🏠</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{listing.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {PROPERTY_TYPE_LABELS[listing.propertyType]} • {LISTING_TYPE_LABELS[listing.listingType]} • {listing.city}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(listing.price, listing.currency)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusConfig?.color || 'bg-gray-100 text-gray-500'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig?.label || listing.status}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Eye className="w-3 h-3" />
                          {listing.viewCount || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar rapide */}
          <div className="space-y-4">
            {/* Actions rapides */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-2">
                {[
                  { icon: Plus, label: 'Nouvelle annonce', href: '/dashboard/listings/new', color: 'text-primary-500' },
                  { icon: Home, label: 'Mes annonces', href: '/dashboard/listings', color: 'text-blue-500' },
                  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages', color: 'text-purple-500' },
                  { icon: Heart, label: 'Favoris', href: '/dashboard/favorites', color: 'text-red-500' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Abonnement */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-5 text-white">
              <p className="font-semibold mb-1">Plan {user?.subscription?.plan || 'FREE'}</p>
              <p className="text-primary-100 text-xs mb-4">
                {user?.subscription?.plan === 'FREE' ? '3 annonces actives maximum' : 'Annonces illimitées'}
              </p>
              <Link href="/pricing" className="text-xs font-semibold bg-white text-primary-600 px-4 py-2 rounded-lg inline-block hover:bg-primary-50 transition-colors">
                Mettre à niveau
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
