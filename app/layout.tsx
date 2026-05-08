import type { Metadata } from 'next'
import { Cinzel, Lora } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Braosa Tales — Forge the world. Tell the story. Run the game.',
  description:
    'TTRPG tools, original stories, and live campaigns — all under one roof. Build campaigns, buy the books, and sit at the table.',
  openGraph: {
    title: 'Braosa Tales',
    description: 'Forge the world. Tell the story. Run the game.',
    url: 'https://braosatales.com',
    siteName: 'Braosa Tales',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Braosa Tales',
    description: 'Forge the world. Tell the story. Run the game.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  )
}
