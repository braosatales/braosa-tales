import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import Newsletter from '@/components/Newsletter'
import PageHero from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Dev updates, lore drops and session recaps from Braosa Tales.',
  robots: { index: false, follow: true },
}

export default function BlogPage() {
  return (
    <main className="bg-night">
      <Nav />
      <PageHero
        title="The journal"
        intro="Dev updates, lore drops and session recaps. The first posts are being written now."
      >
        <p className="text-mist">
          Until then, follow the campaigns on the <Link href="/games" className="link-quiet">Sessions</Link> page, or
          subscribe below to get each post by email.
        </p>
      </PageHero>
      <Newsletter />
      <Footer />
    </main>
  )
}
