import React from 'react'
import Link from 'next/link'

const MENTION_RE = /@\[([^\]]+)\]\(([a-f0-9-]+)\)/g

/** Renders @[Title](lore_entry_id) tokens as links to the entry. */
export function renderMentions(text: string, base: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  MENTION_RE.lastIndex = 0
  while ((match = MENTION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(<React.Fragment key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</React.Fragment>)
    const [, title, id] = match
    parts.push(
      <Link key={`l-${id}-${match.index}`} href={`${base}/lore/entry/${id}`} className="text-leaf-soft underline decoration-leaf/50 transition-colors hover:text-leaf">
        {title}
      </Link>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(<React.Fragment key="t-end">{text.slice(lastIndex)}</React.Fragment>)
  return parts
}

/** Plain text for previews: @[Title](id) becomes Title. */
export const stripMentions = (text: string) => text.replace(MENTION_RE, '$1')
