import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import NewPlayerClient from '../../_components/NewPlayerClient'

export const metadata = { title: 'Add Player' }

export default async function NewPlayerPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/the8adventurers')
  return <NewPlayerClient />
}
