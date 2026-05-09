import { Metadata } from 'next'
import GamesClient from '@/components/pages/GamesClient'

export const metadata: Metadata = {
  title: 'The Arena',
  description: 'Actual play, campaigns and session recaps from the table.',
}

export default function GamesPage() {
  return <GamesClient />
}