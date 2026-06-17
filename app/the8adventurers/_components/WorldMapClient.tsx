'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GameMap, MapPin, LoreEntry } from '@/lib/the8adventurers/types'
import RichCard from '@/components/the8adventurers/RichCard'

type Props = {
  initialMaps: GameMap[]
  initialPins: Record<string, MapPin[]> // map_id -> pins
  locationEntries: LoreEntry[]          // all Locations lore entries (for pin creation)
  isAdmin: boolean
}

function PinMarker({
  pin,
  onClick,
  onDelete,
  isAdmin,
}: {
  pin: MapPin
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  isAdmin: boolean
}) {
  return (
    <div
      className="absolute group"
      style={{ left: `${pin.pos_x}%`, top: `${pin.pos_y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClick() }}
        className="w-4 h-4 rounded-full bg-brand-gold-400 border-2 border-brand-parchment shadow-lg hover:scale-125 transition-transform focus:outline-none"
        aria-label={`Pin: ${pin.the8_lore_entries?.title ?? ''}`}
        title={pin.the8_lore_entries?.title ?? ''}
      />
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e) }}
          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete pin"
        >
          ✕
        </button>
      )}
    </div>
  )
}

function PinModal({ pin, onClose }: { pin: MapPin; onClose: () => void }) {
  const entry = pin.the8_lore_entries
  if (!entry) return null
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <RichCard portrait_url={entry.portrait_url} title={entry.title} description={entry.description}>
          <button
            onClick={onClose}
            className="mt-4 btn-outline text-xs w-full"
          >
            Close
          </button>
        </RichCard>
      </div>
    </div>
  )
}

export default function WorldMapClient({ initialMaps, initialPins, locationEntries, isAdmin }: Props) {
  const router = useRouter()
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [maps, setMaps] = useState<GameMap[]>(initialMaps)
  const [pins, setPins] = useState<Record<string, MapPin[]>>(initialPins)
  const [selectedMapId, setSelectedMapId] = useState<string>(initialMaps[0]?.id ?? '')
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)

  // Add map form
  const [showAddMap, setShowAddMap] = useState(false)
  const [newMapTitle, setNewMapTitle] = useState('')
  const [newMapCaption, setNewMapCaption] = useState('')
  const [newMapFile, setNewMapFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [mapErr, setMapErr] = useState('')

  // Pin placement
  const [pinMode, setPinMode] = useState(false)
  const [pendingPin, setPendingPin] = useState<{ pos_x: number; pos_y: number } | null>(null)
  const [pendingEntryId, setPendingEntryId] = useState('')
  const [savingPin, setSavingPin] = useState(false)

  const selectedMap = maps.find((m) => m.id === selectedMapId) ?? null
  const currentPins = selectedMapId ? (pins[selectedMapId] ?? []) : []

  function handleMapImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!pinMode || !imgRef.current) return
    e.stopPropagation()
    const rect = imgRef.current.getBoundingClientRect()
    const pos_x = ((e.clientX - rect.left) / rect.width) * 100
    const pos_y = ((e.clientY - rect.top) / rect.height) * 100
    setPendingPin({ pos_x: Math.round(pos_x * 10) / 10, pos_y: Math.round(pos_y * 10) / 10 })
  }

  async function savePin() {
    if (!pendingPin || !pendingEntryId || !selectedMapId) return
    setSavingPin(true)
    const res = await fetch(`/api/the8adventurers/maps/${selectedMapId}/pins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lore_entry_id: pendingEntryId, ...pendingPin }),
    })
    const json = await res.json()
    setSavingPin(false)
    if (!res.ok) return
    setPins((prev) => ({ ...prev, [selectedMapId]: [...(prev[selectedMapId] ?? []), json] }))
    setPendingPin(null)
    setPendingEntryId('')
    setPinMode(false)
    router.refresh()
  }

  async function deletePin(pin: MapPin) {
    if (!confirm('Delete this pin?')) return
    await fetch(`/api/the8adventurers/maps/${pin.map_id}/pins/${pin.id}`, { method: 'DELETE' })
    setPins((prev) => ({
      ...prev,
      [pin.map_id]: (prev[pin.map_id] ?? []).filter((p) => p.id !== pin.id),
    }))
    router.refresh()
  }

  async function handleAddMap() {
    if (!newMapTitle.trim() || !newMapFile) { setMapErr('Title and image are required'); return }
    setUploading(true); setMapErr('')
    const fd = new FormData()
    fd.append('file', newMapFile)
    fd.append('title', newMapTitle.trim())
    fd.append('caption', newMapCaption.trim())
    fd.append('sort_order', String(maps.length))

    const res = await fetch('/api/the8adventurers/maps', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (!res.ok) { setMapErr(json.error ?? 'Upload failed'); return }
    setMaps((prev) => [...prev, json])
    setPins((prev) => ({ ...prev, [json.id]: [] }))
    setSelectedMapId(json.id)
    setShowAddMap(false)
    setNewMapTitle(''); setNewMapCaption(''); setNewMapFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    router.refresh()
  }

  async function handleDeleteMap() {
    if (!selectedMap) return
    if (!confirm(`Delete map "${selectedMap.title}" and all its pins?`)) return
    await fetch(`/api/the8adventurers/maps/${selectedMap.id}`, { method: 'DELETE' })
    const remaining = maps.filter((m) => m.id !== selectedMap.id)
    setMaps(remaining)
    setSelectedMapId(remaining[0]?.id ?? '')
    router.refresh()
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">World Map</h1>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {selectedMap && (
              <button
                onClick={() => { setPinMode((v) => !v); setPendingPin(null) }}
                className={`btn-outline text-xs ${pinMode ? 'border-brand-gold-400 text-brand-gold-300' : ''}`}
              >
                {pinMode ? 'Cancel Pin' : '+ Add Pin'}
              </button>
            )}
            <button onClick={() => setShowAddMap((v) => !v)} className="btn-primary text-xs">
              + Add Map
            </button>
          </div>
        )}
      </div>

      {/* Map selector */}
      {maps.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {maps.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelectedMapId(m.id); setPinMode(false); setPendingPin(null) }}
              className={`px-3 py-1.5 font-cinzel text-xs tracking-widest uppercase rounded-sm border transition-colors ${
                m.id === selectedMapId
                  ? 'text-brand-gold-300 border-brand-gold-400/50 bg-brand-gold-400/10'
                  : 'text-brand-muted border-brand-border hover:text-brand-parchment'
              }`}
            >
              {m.title}
            </button>
          ))}
        </div>
      )}

      {/* Map display */}
      {selectedMap ? (
        <div className="mb-6">
          {pinMode && (
            <p className="mb-2 font-fell text-brand-gold-300 text-sm">
              Click anywhere on the map to place a pin.
            </p>
          )}
          <div
            className={`relative inline-block w-full ${pinMode ? 'cursor-crosshair' : ''}`}
            onClick={handleMapImageClick}
          >
            <img
              ref={imgRef}
              src={selectedMap.image_url}
              alt={selectedMap.caption ?? selectedMap.title}
              className="w-full rounded-sm border border-brand-border object-contain max-h-[70vh]"
              draggable={false}
            />
            {currentPins.map((pin) => (
              <PinMarker
                key={pin.id}
                pin={pin}
                onClick={() => setSelectedPin(pin)}
                onDelete={(e) => { e.stopPropagation(); deletePin(pin) }}
                isAdmin={isAdmin}
              />
            ))}
          </div>

          {selectedMap.caption && (
            <p className="mt-2 font-fell text-brand-muted text-sm text-center italic">{selectedMap.caption}</p>
          )}

          {isAdmin && (
            <div className="flex justify-end mt-2">
              <button onClick={handleDeleteMap} className="text-red-400 font-fell text-xs hover:text-red-300 transition-colors">
                Delete this map
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 border border-dashed border-brand-border rounded-sm flex items-center justify-center h-64 bg-brand-card">
          <p className="font-fell text-brand-muted italic">No maps yet. Add one above.</p>
        </div>
      )}

      {/* Pending pin selector */}
      {pendingPin && isAdmin && (
        <div className="dark-card mb-4" onClick={(e) => e.stopPropagation()}>
          <p className="section-label mb-2">New Pin at {pendingPin.pos_x.toFixed(1)}%, {pendingPin.pos_y.toFixed(1)}%</p>
          <select
            value={pendingEntryId}
            onChange={(e) => setPendingEntryId(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600 mb-3"
          >
            <option value="">Select a Locations lore entry…</option>
            {locationEntries.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={savePin} disabled={!pendingEntryId || savingPin} className="btn-primary text-xs">
              {savingPin ? 'Saving…' : 'Save Pin'}
            </button>
            <button onClick={() => setPendingPin(null)} className="btn-outline text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Add map form */}
      {showAddMap && isAdmin && (
        <div className="dark-card space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-cinzel text-brand-parchment font-semibold text-sm">Add New Map</h3>
          <div>
            <label className="section-label block mb-1">Title *</label>
            <input
              type="text"
              value={newMapTitle}
              onChange={(e) => setNewMapTitle(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
              placeholder="e.g. The Known World"
            />
          </div>
          <div>
            <label className="section-label block mb-1">Image File *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setNewMapFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-brand-muted font-fell file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border file:border-brand-border file:bg-brand-bg file:text-brand-parchment file:font-cinzel file:text-xs file:tracking-widest file:uppercase file:cursor-pointer hover:file:border-brand-purple-600 transition-colors"
            />
          </div>
          <div>
            <label className="section-label block mb-1">Caption (optional)</label>
            <input
              type="text"
              value={newMapCaption}
              onChange={(e) => setNewMapCaption(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
              placeholder="e.g. Year 3 of the Campaign"
            />
          </div>
          {mapErr && <p className="text-red-400 text-sm font-fell">{mapErr}</p>}
          <button onClick={handleAddMap} disabled={uploading} className="btn-primary text-xs">
            {uploading ? 'Uploading…' : 'Upload Map'}
          </button>
        </div>
      )}

      {/* Pin detail modal */}
      {selectedPin && (
        <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} />
      )}
    </div>
  )
}
