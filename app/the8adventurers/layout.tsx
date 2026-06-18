import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import Sidebar from './_components/Sidebar'

export const metadata = {
  title: 'The Eight Adventurers',
}

export default async function The8AdventurersLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

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
