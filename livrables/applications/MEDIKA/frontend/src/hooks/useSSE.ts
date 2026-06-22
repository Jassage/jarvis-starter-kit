'use client'
import { useEffect, useRef } from 'react'

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api')
  .replace(/\/api$/, '')

export function useSSE(resources: string[], onRefresh: () => void) {
  const cbRef = useRef(onRefresh)
  useEffect(() => { cbRef.current = onRefresh })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('medika_token')
    if (!token) return

    let es: EventSource
    let retryTimeout: ReturnType<typeof setTimeout>

    function connect() {
      es = new EventSource(`${BASE}/api/events?token=${token}`)

      es.onmessage = (e) => {
        try {
          const { resource } = JSON.parse(e.data)
          if (resources.includes(resource)) cbRef.current()
        } catch {}
      }

      es.onerror = () => {
        es.close()
        // Reconnect après 3s
        retryTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      clearTimeout(retryTimeout)
      es?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
