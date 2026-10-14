import Link from 'next/link'
import React from 'react'

// Parses @[Article Title](lore_entry_id) tokens and renders them as links
function renderDescription(text: string, base: string): React.ReactNode[] {
  const MENTION_RE = /@\[([^\]]+)\]\(([a-f0-9-]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = MENTION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <React.Fragment key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</React.Fragment>
      )
    }
    const [, title, id] = match
    parts.push(
      <Link
        key={`l-${id}-${match.index}`}
        href={`${base}/lore/entry/${id}`}
        className="text-leaf-soft underline decoration-leaf/50 hover:text-leaf transition-colors"
      >
        {title}
      </Link>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(<React.Fragment key="t-end">{text.slice(lastIndex)}</React.Fragment>)
  }

  return parts
}

type Props = {
  portrait_url?: string | null
  title: string
  description?: string | null
  children?: React.ReactNode
  /** Campaign site base, e.g. /campaigns/the-8-adventurers (for @mention links) */
  base: string
}

export default function RichCard({ portrait_url, title, description, children, base }: Props) {
  const descParts = description ? renderDescription(description, base) : null

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
      {descParts && descParts.length > 0 && (
        <div className="font-fell text-prose text-sm leading-relaxed whitespace-pre-wrap">
          {descParts}
        </div>
      )}
      {children}
    </div>
  )
}
