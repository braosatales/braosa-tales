'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type AuthUser = { id: string; email: string | null; name: string | null }

type AuthContextValue = {
  user: AuthUser | null
  isSignedIn: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isSignedIn: false,
  signOut: async () => {},
})

function toAuthUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
  if (!u) return null
  const meta = u.user_metadata ?? {}
  const name = (meta.full_name || meta.name || null) as string | null
  return { id: u.id, email: u.email ?? null, name }
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
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') router.refresh()
    })
    return () => data.subscription.unsubscribe()
  }, [supabase, router])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }, [supabase, router])

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
