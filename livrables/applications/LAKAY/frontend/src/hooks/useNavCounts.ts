'use client';
import { useQuery } from '@tanstack/react-query';
import { messagesApi, notificationsApi, favoritesApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function useNavCounts() {
  const { isAuthenticated } = useAuthStore();

  const { data: msgData } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: () => messagesApi.getUnreadCount().then((r) => r.data.data as { count: number }),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => notificationsApi.getAll({ limit: 1 }).then((r) => r.data.data as { unreadCount: number }),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: favData } = useQuery({
    queryKey: ['favorites-count'],
    queryFn: () => favoritesApi.getAll().then((r) => r.data.data as { favorites: unknown[] }),
    enabled: isAuthenticated,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  return {
    msgCount: msgData?.count ?? 0,
    notifCount: notifData?.unreadCount ?? 0,
    favCount: favData?.favorites?.length ?? 0,
  };
}
