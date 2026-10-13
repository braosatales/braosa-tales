import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createServerSupabase } from '@/lib/supabase-server'

/**
 * The signed-in Supabase user for this request, or null.
 * getUser() re-validates the JWT with Supabase Auth — never trust getSession() on the server.
 * Cached per request, so calling it from several places costs one round-trip.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/** The user's row in public.users (credits, tier…). users.id === auth.uid(). */
export async function getUserProfile(userId: string) {
  const { data } = await createServerSupabase()
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data
}

export function displayName(user: User): string {
  const meta = user.user_metadata ?? {}
  return (meta.full_name || meta.name || '').toString().trim()
}
