import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAIL = 'braosa.tales@gmail.com'

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser()
  if (!user) return false
  const email = user.emailAddresses[0]?.emailAddress ?? ''
  return email.toLowerCase() === ADMIN_EMAIL
}
