import { getAuthUser, getUserProfile } from '@/lib/auth'
import Nav from './Nav'

export default async function NavServer() {
  const user = await getAuthUser()
  let userProfile = null
  if (user) {
    try {
      userProfile = await getUserProfile(user.id)
    } catch {}
  }
  return <Nav userProfile={userProfile} />
}
