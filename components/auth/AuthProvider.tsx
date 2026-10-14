'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type AuthUser = { id: string; email: string | null; name: string | null; avatar: string | null }

type AuthContextValue = {
  user: AuthUser | null
  isSignedIn: boolean
  signOut: () => Promise<void>
  /** Re-read the session after a profile change so the new name/picture show everywhere. */
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isSignedIn: false,
  signOut: async () => {},
  refreshUser: async () => {},
})

function toAuthUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
  if (!u) return null
  const meta = u.user_metadata ?? {}
  const name = (meta.display_name || meta.full_name || meta.name || null) as string | null
  const avatar = typeof meta.bt_avatar === 'string' && meta.bt_avatar ? (meta.bt_avatar as string) : null
  return { id: u.id, email: u.email ?? null, name, avatar }
}

export default function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<AuthUser | null>(initialUser)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(toAuthUser(session?.user ?? null))
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') router.refresh()
    })
    return () => data.subscription.unsubscribe()
  }, [supabase, router])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }, [supabase, router])

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.refreshSession()
    setUser(toAuthUser(data.session?.user ?? null))
    router.refresh()
  }, [supabase, router])

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
