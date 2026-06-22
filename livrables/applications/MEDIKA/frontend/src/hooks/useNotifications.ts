'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, string> | null
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const r = await api.get('/notifications')
      setNotifications(r.data.data.notifications ?? [])
      setUnreadCount(r.data.data.unreadCount ?? 0)
    } catch {}
  }, [user])

  // SSE — écoute les événements 'notifications' ciblés vers cet utilisateur
  useEffect(() => {
    if (!user) return
    load()

    const token = typeof window !== 'undefined' ? localStorage.getItem('medika_token') : null
    if (!token) return
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    const sse = new EventSource(`${apiBase}/events?token=${token}`)
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.resource === 'notifications') load()
      } catch {}
    }
    return () => sse.close()
  }, [user, load])

  const markRead = useCallback(async (id: string) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await api.patch('/notifications/read-all').catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, markRead, markAllRead, reload: load }
}

// Enregistrement du service worker + souscription push
export async function registerPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return

  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const keyRes = await api.get('/notifications/vapid-public-key')
    const vapidKey = keyRes.data.key
    if (!vapidKey) return

    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      // Ré-envoie au cas où le serveur l'aurait perdu
      await sendSubscription(existing)
      return
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })
    await sendSubscription(sub)
  } catch {}
}

async function sendSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  await api.post('/notifications/push-subscribe', {
    endpoint: json.endpoint,
    p256dh:   json.keys?.p256dh,
    auth:     json.keys?.auth,
  }).catch(() => {})
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}
