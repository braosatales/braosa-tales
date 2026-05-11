import type { Metadata } from 'next'
import { Cinzel, IM_Fell_English } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
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
  title: 'Braosa Tales — Forge the world. Tell the story. Run the game.',
  description:
    'TTRPG tools, original stories, and live campaigns — all under one roof.',
  icons: {
    icon: '/logo-mark.png',
    shortcut: '/logo-mark.png',
    apple: '/logo-mark.png',
  },
  openGraph: {
    title: 'Braosa Tales',
    description: 'Forge the world. Tell the story. Run the game.',
    url: 'https://braosatales.com',
    siteName: 'Braosa Tales',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${cinzel.variable} ${imFell.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
