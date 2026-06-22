'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: () => boolean
  updateProfile: (data: { prenom: string; nom: string; currentPassword?: string; newPassword?: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { token, user } = res.data.data
        localStorage.setItem('medika_token', token)
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem('medika_token')
        set({ user: null, token: null })
        window.location.href = '/login'
      },

      updateProfile: async (data) => {
        const res = await api.put('/auth/me', data)
        const updated = res.data.data
        set(s => ({ user: s.user ? { ...s.user, prenom: updated.prenom, nom: updated.nom } : null }))
      },

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    { name: 'medika_auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
