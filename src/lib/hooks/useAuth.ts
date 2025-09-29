import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/auth'

export const useAuth = () => {
  const router = useRouter()
  const { user, profile, setUser, setProfile, setLoading, logout } = useAuthStore()

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }, [setProfile])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading, fetchUserProfile])


  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: {
    fullName: string
    phoneNumber: string
    dateOfBirth?: string
    address?: string
  }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: userData.fullName,
            phone_number: userData.phoneNumber,
            date_of_birth: userData.dateOfBirth,
            address: userData.address,
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      logout()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const requireAuth = () => {
    if (!user) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  const requireAdmin = () => {
    if (!user) {
      router.push('/auth/login')
      return false
    }
    if (!profile?.is_admin) {
      router.push('/')
      return false
    }
    return true
  }

  return {
    user,
    profile,
    signIn,
    signUp,
    signOut,
    requireAuth,
    requireAdmin,
    isLoading: useAuthStore.getState().isLoading,
  }
}
