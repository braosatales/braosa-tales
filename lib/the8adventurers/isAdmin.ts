import { getAuthUser } from '@/lib/auth'

const ADMIN_EMAIL = 'braosa.tales@gmail.com'

export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser()
  if (!user?.email) return false
  // Require a verified address — otherwise anyone could sign up with the admin email.
  if (!user.email_confirmed_at) return false
  return user.email.toLowerCase() === ADMIN_EMAIL
}
