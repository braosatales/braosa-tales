'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'

/** After the page has shown, quietly refresh stale D&D Beyond sheets and re-render if anything changed. */
export default function PartySync() {
  const { api } = useHub()
  const router = useRouter()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    fetch(`${api}/sync`, { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.refreshed) router.refresh()
      })
      .catch(() => {})
  }, [api, router])
  return null
}
