import type { Metadata } from 'next'
import { Cinzel, IM_Fell_English } from 'next/font/google'
import AuthProvider from '@/components/auth/AuthProvider'
import { getAuthUser, displayName } from '@/lib/auth'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
})

const imFell = IM_Fell_English({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-fell',
  display: 'swap',
})

export const metadata: Metadata = {
  icons: {
    icon: '/logo-mark.png',
    shortcut: '/logo-mark.png',
    apple: '/logo-mark.png',
  },

  metadataBase: new URL('https://braosatales.com'),
  title: {
    default: 'Braosa Tales — Forge the world. Tell the story. Run the game.',
    template: '%s | Braosa Tales',
  },
  description: 'TTRPG tools, original stories, and live campaigns — all under one roof.',
  keywords: ['worldbuilding', 'DnD', 'tabletop RPG', 'name generator', 'fantasy tools', 'game master', 'TTRPG', 'lore builder'],
  authors: [{ name: 'Braosa Tales' }],
  creator: 'Braosa Tales',
 
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://braosatales.com',
    siteName: 'Braosa Tales',
    title: 'Braosa Tales — Forge the Worlds Others Only Dream Of',
    description: 'AI-powered worldbuilding tools for tabletop RPG players, game masters and storytellers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Braosa Tales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Braosa Tales — Forge the Worlds Others Only Dream Of',
    description: 'AI-powered worldbuilding tools for tabletop RPG players, game masters and storytellers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  const initialUser = user
    ? { id: user.id, email: user.email ?? null, name: displayName(user) || null }
    : null

  return (
    <html lang="en" className={`${cinzel.variable} ${imFell.variable}`}>
      <body>
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  )
}
