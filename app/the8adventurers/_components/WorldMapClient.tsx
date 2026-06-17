'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WorldMap } from '@/lib/the8adventurers/types'

type Props = {
  initialMap: WorldMap | null
  isAdmin: boolean
}

export default function WorldMapClient({ initialMap, isAdmin }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mapData, setMapData] = useState<WorldMap | null>(initialMap)
  const [caption, setCaption] = useState(initialMap?.caption ?? '')
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setErr('')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('caption', caption)

    const res = await fetch('/api/the8adventurers/world-map/upload', {
      method: 'POST',
      body: formData,
    })

    const json = await res.json()
    setUploading(false)

    if (!res.ok) { setErr(json.error ?? 'Upload failed'); return }

    setMapData((prev) => ({
      id: prev?.id ?? '',
      image_url: json.image_url,
      caption: caption || null,
      updated_at: new Date().toISOString(),
    }))
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    router.refresh()
  }

  async function handleSaveCaption() {
    if (!mapData) return
    setUploading(true)
    const res = await fetch('/api/the8adventurers/world-map/upload', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
    })
    const json = await res.json()
    setUploading(false)
    if (!res.ok) { setErr(json.error ?? 'Error'); return }
    setMapData((prev) => prev ? { ...prev, caption: caption || null } : prev)
    router.refresh()
  }

  const displayImage = preview ?? mapData?.image_url ?? null

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="section-label">Campaign</p>
        <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">World Map</h1>
      </div>

      {/* Map display */}
      {displayImage ? (
        <div className="mb-6">
          <img
            src={displayImage}
            alt={mapData?.caption ?? 'World map'}
            className="w-full rounded-sm border border-brand-border object-contain max-h-[70vh]"
          />
          {mapData?.caption && !preview && (
            <p className="mt-2 font-fell text-brand-muted text-sm text-center italic">{mapData.caption}</p>
          )}
        </div>
      ) : (
        <div className="mb-6 border border-dashed border-brand-border rounded-sm flex items-center justify-center h-64 bg-brand-card">
          <p className="font-fell text-brand-muted italic">No map uploaded yet.</p>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <div className="dark-card space-y-4">
          <h3 className="font-cinzel text-brand-parchment font-semibold text-sm">Upload / Replace Map</h3>

          <div>
            <label className="section-label block mb-1">Image File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block text-sm text-brand-muted font-fell file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border file:border-brand-border file:bg-brand-bg file:text-brand-parchment file:font-cinzel file:text-xs file:tracking-widest file:uppercase file:cursor-pointer hover:file:border-brand-purple-600 transition-colors"
            />
          </div>

          <div>
            <label className="section-label block mb-1">Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. The Known World, circa Year 3"
              className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
            />
          </div>

          {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

          <div className="flex gap-3">
            {selectedFile && (
              <button onClick={handleUpload} disabled={uploading} className="btn-primary text-xs">
                {uploading ? 'Uploading…' : 'Upload Map'}
              </button>
            )}
            {!selectedFile && mapData && (
              <button onClick={handleSaveCaption} disabled={uploading} className="btn-outline text-xs">
                {uploading ? 'Saving…' : 'Save Caption'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
