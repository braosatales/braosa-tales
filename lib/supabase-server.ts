import { createClient } from '@supabase/supabase-js'

export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getUserByClerkId(clerkId: string) {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()
  return data
}
