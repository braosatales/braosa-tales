import React from 'react'

type Props = {
  portrait_url?: string | null
  title: string
  /** The body: reveal blocks, links, etc. */
  children?: React.ReactNode
  /** Campaign site base, e.g. /campaigns/the-8-adventurers (kept for callers; mentions render inside the children). */
  base?: string
}

export default function RichCard({ portrait_url, title, children }: Props) {
  return (
    <div className="dark-card">
      {portrait_url && (
        <img
          src={portrait_url}
          alt={title}
          className="w-full max-h-64 object-cover rounded-lg mb-4 border border-plum-line"
        />
      )}
      <h3 className="font-cinzel text-vellum font-semibold text-lg leading-tight mb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}
