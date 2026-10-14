'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { TEXT_SIZES, type TextSize } from '@/lib/prefs'

const input =
  'w-full rounded-lg border border-plum-line bg-night px-4 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none'

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-plum-line py-10 first:border-t-0 first:pt-0">
      <div className="grid gap-6 md:grid-cols-[15rem_1fr] md:gap-12">
        <div>
          <h2 className="font-cinzel text-[1.25rem] font-bold text-vellum">{title}</h2>
          {intro && <p className="mt-1 text-[0.92rem] leading-snug text-mist">{intro}</p>}
        </div>
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </section>
  )
}

function Status({ msg }: { msg: { tone: 'ok' | 'error'; text: string } | null }) {
  if (!msg) return null
  return (
    <p role={msg.tone === 'error' ? 'alert' : 'status'} className={`text-[0.92rem] ${msg.tone === 'error' ? 'text-red-300' : 'text-leaf-soft'}`}>
      {msg.text}
    </p>
  )
}

/** Crop the centre square and scale to 256px WebP in the browser before upload. */
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/webp', 0.88))
}

export default function SettingsForms({
  initialName,
  email,
  avatar: initialAvatar,
  providers,
  textSize: initialTextSize,
  tier,
  credits,
}: {
  initialName: string
  email: string
  avatar: string | null
  providers: string[]
  textSize: TextSize
  tier: string | null
  credits: number | null
}) {
  const router = useRouter()
  const { refreshUser, signOut } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  /* Profile */
  const [name, setName] = useState(initialName)
  const [avatar, setAvatar] = useState(initialAvatar)
  const [profileMsg, setProfileMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [savingName, setSavingName] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setSavingName(true)
    setProfileMsg(null)
    const res = await fetch('/api/account/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: name }) })
    const data = await res.json()
    setSavingName(false)
    if (!res.ok) return setProfileMsg({ tone: 'error', text: data.error ?? 'That didn’t save. Try again.' })
    setName(data.displayName)
    setProfileMsg({ tone: 'ok', text: 'Name saved.' })
    await refreshUser()
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setProfileMsg(null)
    try {
      const blob = await toSquareWebp(file)
      const form = new FormData()
      form.append('file', new File([blob], 'avatar.webp', { type: 'image/webp' }))
      const res = await fetch('/api/account/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAvatar(data.url)
      setProfileMsg({ tone: 'ok', text: 'Picture updated.' })
      await refreshUser()
    } catch (err) {
      setProfileMsg({ tone: 'error', text: err instanceof Error && err.message !== 'encode' ? err.message : 'That image couldn’t be used. Try a JPG or PNG.' })
    } finally {
      setUploading(false)
    }
  }

  async function removeAvatar() {
    setUploading(true)
    await fetch('/api/account/avatar', { method: 'DELETE' })
    setAvatar(null)
    setUploading(false)
    await refreshUser()
  }

  /* Sign-in */
  const hasPassword = providers.includes('email')
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [pwMsg, setPwMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailMsg(null)
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/settings` }
    )
    if (error) return setEmailMsg({ tone: 'error', text: error.message })
    setEmailMsg({ tone: 'ok', text: `Check ${newEmail.trim()} for a confirmation link. Your email changes once you click it.` })
    setNewEmail('')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (password.length < 8) return setPwMsg({ tone: 'error', text: 'Use at least 8 characters.' })
    if (password !== password2) return setPwMsg({ tone: 'error', text: 'The two passwords don’t match.' })
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setPwMsg({ tone: 'error', text: error.message })
    setPassword('')
    setPassword2('')
    setPwMsg({ tone: 'ok', text: hasPassword ? 'Password changed.' : 'Password set. You can now also sign in with your email.' })
  }

  /* Appearance */
  const [textSize, setTextSize] = useState<TextSize>(initialTextSize)
  async function pickTextSize(v: TextSize) {
    setTextSize(v)
    document.documentElement.dataset.textSize = v
    await fetch('/api/account/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ textSize: v }) })
  }

  /* Delete */
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault()
    setDeleting(true)
    const res = await fetch('/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: confirmText }) })
    const data = await res.json()
    if (!res.ok) {
      setDeleting(false)
      return setDeleteMsg({ tone: 'error', text: data.error })
    }
    await signOut()
    router.replace('/?account=deleted')
  }

  const initial = (name || email || '?').trim().charAt(0).toUpperCase()

  return (
    <div>
      <Section id="profile" title="Profile" intro="How you appear across Braosa Tales. Characters get their own name and picture inside each campaign.">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-leaf/50 bg-plum">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Your profile picture" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-cinzel text-[2rem] font-bold text-leaf-soft">{initial}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onPick} aria-label="Upload a profile picture" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-ghost px-5 py-2 disabled:opacity-60">
              {uploading ? 'Uploading…' : avatar ? 'Change picture' : 'Upload picture'}
            </button>
            {avatar && (
              <button type="button" onClick={removeAvatar} disabled={uploading} className="text-[0.92rem] text-mist hover:text-vellum">
                Remove
              </button>
            )}
          </div>
        </div>

        <form onSubmit={saveName} className="max-w-md">
          <label htmlFor="display-name" className="mb-1.5 block text-[0.9rem] text-mist">Name</label>
          <div className="flex gap-2">
            <input id="display-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required className={input} autoComplete="name" />
            <button type="submit" disabled={savingName || !name.trim() || name.trim() === initialName} className="btn-gold shrink-0 px-5 py-2 disabled:opacity-50">
              {savingName ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
        <Status msg={profileMsg} />
      </Section>

      <Section id="sign-in" title="Sign-in" intro="The email you sign in with, and how you sign in.">
        <div>
          <p className="text-[0.9rem] text-mist">Email</p>
          <p className="text-vellum">{email}</p>
          <p className="mt-1 text-[0.88rem] text-mist">
            Signs in with {providers.map((p) => (p === 'email' ? 'email and password' : p.charAt(0).toUpperCase() + p.slice(1))).join(' and ') || 'email'}
          </p>
        </div>

        <form onSubmit={changeEmail} className="max-w-md">
          <label htmlFor="new-email" className="mb-1.5 block text-[0.9rem] text-mist">Change email</label>
          <div className="flex gap-2">
            <input id="new-email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@email.com" className={input} autoComplete="email" />
            <button type="submit" className="btn-ghost shrink-0 px-5 py-2">Change</button>
          </div>
        </form>
        <Status msg={emailMsg} />

        <form onSubmit={changePassword} className="max-w-md space-y-2">
          <p className="text-[0.9rem] text-mist">{hasPassword ? 'Change password' : 'Set a password (optional, to also sign in with email)'}</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" minLength={8} className={input} autoComplete="new-password" aria-label="New password" />
          <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Repeat new password" minLength={8} className={input} autoComplete="new-password" aria-label="Repeat new password" />
          <button type="submit" disabled={!password} className="btn-ghost px-5 py-2 disabled:opacity-50">{hasPassword ? 'Change password' : 'Set password'}</button>
        </form>
        <Status msg={pwMsg} />
      </Section>

      <Section id="appearance" title="Appearance" intro="Applies on every device you sign in on.">
        <div>
          <p className="mb-2 text-[0.9rem] text-mist" id="text-size-label">Text size</p>
          <div role="radiogroup" aria-labelledby="text-size-label" className="inline-flex flex-wrap rounded-full border border-plum-line p-1">
            {TEXT_SIZES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={textSize === t.value}
                onClick={() => pickTextSize(t.value)}
                className={`rounded-full px-3 py-1.5 transition-colors sm:px-4 ${textSize === t.value ? 'bg-leaf text-night' : 'text-prose hover:text-vellum'}`}
                style={{ fontSize: `${t.px * 0.8}px` }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[0.9rem] text-mist">Theme</p>
          <div className="grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-leaf bg-night p-4" aria-current="true">
              <div className="flex h-12 items-end gap-1.5 rounded-md bg-plum p-2">
                <span className="h-2 w-10 rounded bg-vellum/80" /><span className="h-2 w-6 rounded bg-leaf" />
              </div>
              <p className="mt-3 font-cinzel font-bold text-vellum">Night</p>
              <p className="text-[0.85rem] text-leaf-soft">In use</p>
            </div>
            <div className="rounded-xl border border-plum-line p-4 opacity-60" aria-disabled="true">
              <div className="flex h-12 items-end gap-1.5 rounded-md bg-[#efe4cc] p-2">
                <span className="h-2 w-10 rounded bg-[#3b2a1a]/70" /><span className="h-2 w-6 rounded bg-[#9c7a2f]" />
              </div>
              <p className="mt-3 font-cinzel font-bold text-vellum">Parchment</p>
              <p className="text-[0.85rem] text-mist">Coming soon</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="plan" title="Plan" intro="Your Atelier plan and credits.">
        <p className="text-prose">
          {tier ? <span className="capitalize text-vellum">{tier}</span> : 'Free'} plan
          {credits !== null && <>, {credits.toLocaleString()} credits available</>}.
        </p>
        <p className="text-[0.95rem] text-mist">
          <Link href="/pricing" className="link-quiet">Compare plans</Link>. To change or cancel a paid plan, email{' '}
          <a href="mailto:braosa.tales@gmail.com?subject=%5BBraosa%20Tales%5D%20Billing" className="link-quiet">braosa.tales@gmail.com</a>.
        </p>
      </Section>

      <Section id="delete" title="Delete account" intro="Permanent. There’s no undo.">
        <div className="rounded-xl border border-red-400/30 bg-red-950/10 p-5">
          <p className="leading-relaxed text-prose">
            This deletes your account, profile picture, saved names, history, presets, favourites and campaign memberships.
            {tier && tier !== 'wanderer' && (
              <> <span className="text-vellum">You’re on a paid plan:</span> email us first so we can stop the billing.</>
            )}
          </p>
          <form onSubmit={deleteAccount} className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
            <label htmlFor="confirm-delete" className="sr-only">Type DELETE to confirm</label>
            <input id="confirm-delete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type DELETE to confirm" className={input} autoComplete="off" />
            <button type="submit" disabled={confirmText !== 'DELETE' || deleting} className="shrink-0 rounded-full bg-red-800 px-5 py-2 font-cinzel text-[0.8rem] font-bold tracking-[0.08em] text-vellum transition-colors hover:bg-red-700 disabled:opacity-40">
              {deleting ? 'Deleting…' : 'Delete account'}
            </button>
          </form>
          <div className="mt-2"><Status msg={deleteMsg} /></div>
        </div>
      </Section>
    </div>
  )
}
