import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: {
    id: string
    user_id: string
    full_name: string
    phone_number: string
    is_admin: boolean
    is_driver: boolean
  } | null
  isAdmin: boolean
  isDriver: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: AuthState['profile']) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAdmin: false,
      isDriver: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ 
        profile,
        isAdmin: profile?.is_admin || false,
        isDriver: profile?.is_driver || false
      }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        profile: null, 
        isAdmin: false, 
        isDriver: false 
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        profile: state.profile,
        isAdmin: state.isAdmin,
        isDriver: state.isDriver
      }),
    }
  )
)
