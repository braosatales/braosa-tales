'use client'

import { createContext, useContext } from 'react'

export type HubMemberLite = { user_id: string; name: string | null; email: string | null; role: 'gm' | 'player' }

export type HubValue = {
  slug: string
  /** Page base, e.g. /campaigns/the-8-adventurers */
  base: string
  /** API base, e.g. /api/hub/the-8-adventurers */
  api: string
  campaignId: string
  title: string
  gm: boolean
  userId: string
  members: HubMemberLite[]
  /** Ids of lore entries and quests this person pinned to their overview */
  pinned: string[]
}

const HubCtx = createContext<HubValue | null>(null)

export function HubProvider({ value, children }: { value: HubValue; children: React.ReactNode }) {
  return <HubCtx.Provider value={value}>{children}</HubCtx.Provider>
}

export function useHub(): HubValue {
  const v = useContext(HubCtx)
  if (!v) throw new Error('useHub must be used inside a campaign site')
  return v
}
