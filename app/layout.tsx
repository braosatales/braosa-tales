import type { Metadata } from 'next'
import localFont from 'next/font/local'
import AuthProvider from '@/components/auth/AuthProvider'
import NavigationProgress from '@/components/NavigationProgress'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { getAuthUser, displayName, avatarUrl } from '@/lib/auth'
import { TEXT_SIZE_COOKIE, isTextSize } from '@/lib/prefs'
import './globals.css'

// Self-hosted (no Google Fonts request at build or runtime).
// Cinzel: display. Alegreya: reading text (replaces IM Fell English — far more legible).
const cinzel = localFont({
  src: '../node_modules/@fontsource-variable/cinzel/files/cinzel-latin-wght-normal.woff2',
  weight: '400 900',
  variable: '--font-cinzel',
  display: 'swap',
})

const alegreya = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/alegreya/files/alegreya-latin-wght-normal.woff2', weight: '400 900', style: 'normal' },
    { path: '../node_modules/@fontsource-variable/alegreya/files/alegreya-latin-wght-italic.woff2', weight: '400 900', style: 'italic' },
  ],
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
    ? { id: user.id, email: user.email ?? null, name: displayName(user) || null, avatar: avatarUrl(user) }
    : null
  const textSize = cookies().get(TEXT_SIZE_COOKIE)?.value

  return (
    <html lang="en" className={`${cinzel.variable} ${alegreya.variable}`} data-text-size={isTextSize(textSize) ? textSize : 'md'}>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  )
}
