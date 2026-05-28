import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/supabase-server'
import Nav from './Nav'

export default async function NavServer() {
  const { userId } = await auth()
  let userProfile = null
  if (userId) {
    try {
      userProfile = await getUserByClerkId(userId)
    } catch {}
  }
  return <Nav userProfile={userProfile} />
}
