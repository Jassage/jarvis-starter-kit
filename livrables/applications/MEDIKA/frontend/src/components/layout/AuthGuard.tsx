'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated()) {
      router.replace('/login')
    }
  }, [hydrated, isAuthenticated, router])

  if (!hydrated) return <div className="min-h-screen bg-slate-50" />
  if (!isAuthenticated()) return null

  return <>{children}</>
}
