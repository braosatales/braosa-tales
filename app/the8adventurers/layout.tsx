import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import Sidebar from './_components/Sidebar'

export const metadata = {
  title: 'The Eight Adventurers',
}

export default async function The8AdventurersLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/sign-in?next=/the8adventurers')

  const admin = await isAdmin()

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar isAdmin={admin} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
