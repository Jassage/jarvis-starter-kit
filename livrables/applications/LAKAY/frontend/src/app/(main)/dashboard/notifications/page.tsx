'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

const NOTIF_ICONS: Record<string, { icon: string; color: string }> = {
  NEW_MESSAGE: { icon: '💬', color: 'bg-blue-50' },
  LISTING_APPROVED: { icon: '✅', color: 'bg-green-50' },
  LISTING_REJECTED: { icon: '❌', color: 'bg-red-50' },
  LISTING_EXPIRED: { icon: '⏰', color: 'bg-yellow-50' },
  NEW_FAVORITE: { icon: '❤️', color: 'bg-pink-50' },
  VISIT_REQUEST: { icon: '🏠', color: 'bg-purple-50' },
  VISIT_CONFIRMED: { icon: '📅', color: 'bg-green-50' },
  VISIT_CANCELLED: { icon: '❌', color: 'bg-red-50' },
  PAYMENT_SUCCESS: { icon: '💳', color: 'bg-green-50' },
  SYSTEM: { icon: '📢', color: 'bg-gray-50' },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationsApi.getNotifications({ unreadOnly: filter === 'unread' }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} non lue{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-sm text-primary hover:underline"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'unread', label: 'Non lues' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as 'all' | 'unread')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="font-semibold text-gray-700 mb-1">Aucune notification</h3>
          <p className="text-sm text-gray-500">Tu seras notifié ici pour les messages, visites et activités sur tes annonces.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: {
            id: string;
            type: string;
            title: string;
            message: string;
            link?: string;
            isRead: boolean;
            createdAt: string;
          }) => {
            const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.SYSTEM;
            if (notif.link) {
              return (
                <Link
                  key={notif.id}
                  href={notif.link}
                onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer hover:bg-gray-50 ${
                  notif.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </Link>
              );
            }

            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer hover:bg-gray-50 ${
                  notif.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
