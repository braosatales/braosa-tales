'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/safe-next'

const inputCls =
  'w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2.5 text-base text-brand-parchment ' +
  'placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-gold-400 transition-colors'
const linkCls = 'text-brand-gold-300 hover:text-brand-parchment transition-colors'
const MIN_PASSWORD = 8

function callbackUrl(next: string) {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
}

function friendlyError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'That email and password don’t match.'
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for the link.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a minute and try again.'
  if (m.includes('already registered')) return 'An account with this email already exists. Try signing in.'
  if (m.includes('same as the old') || m.includes('different from the old')) return 'Choose a password different from your current one.'
  return message
}

function Field({
  label, type, value, onChange, autoComplete, placeholder, minLength,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  placeholder?: string
  minLength?: number
}) {
  return (
    <label className="block">
      <span className="section-label block">{label}</span>
      <input
        type={type}
        required
        value={value}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  )
}

function Alert({ tone, children }: { tone: 'error' | 'info'; children: React.ReactNode }) {
  const cls =
    tone === 'error'
      ? 'border-red-400/40 text-red-300 bg-red-950/20'
      : 'border-brand-gold-400/40 text-brand-gold-300 bg-brand-gold-400/5'
  return <p role={tone === 'error' ? 'alert' : 'status'} className={`border rounded-sm px-3 py-2 text-sm ${cls}`}>{children}</p>
}

function Divider() {
  return (
    <div className="flex items-center my-5">
      <span className="h-px flex-1 bg-brand-border" />
      <span className="mx-3 font-cinzel text-[0.6rem] tracking-widest uppercase text-brand-muted/60">or</span>
      <span className="h-px flex-1 bg-brand-border" />
    </div>
  )
}

function GoogleButton({ next, label }: { next: string; label: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function go() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl(next) },
    })
    // On success the browser navigates away to Google.
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={go} disabled={loading} className="btn-outline w-full flex items-center justify-center gap-3 text-xs disabled:opacity-60">
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
        {loading ? 'Opening Google…' : label}
      </button>
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  )
}

/* ───────────────────────── Sign in ───────────────────────── */

export function SignInForm({ next: rawNext, initialError }: { next?: string; initialError?: string }) {
  const next = safeNext(rawNext)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError ?? null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
      return
    }
    router.replace(next)
    router.refresh()
  }

  const nextQs = next !== '/' ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <>
      <GoogleButton next={next} label="Continue with Google" />
      <Divider />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@example.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="flex justify-end -mt-2">
          <Link href="/forgot-password" className={`text-sm ${linkCls}`}>Forgot password?</Link>
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-muted">
        New to Braosa Tales? <Link href={`/sign-up${nextQs}`} className={linkCls}>Create an account</Link>
      </p>
    </>
  )
}

/* ───────────────────────── Sign up ───────────────────────── */

export function SignUpForm({ next: rawNext }: { next?: string }) {
  const next = safeNext(rawNext)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    setLoading(true)
    setError(null)
    const cleanEmail = email.trim()
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: callbackUrl(next),
      },
    })
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
      return
    }
    // Supabase hides "already registered" behind an empty identities list.
    if (data.user && data.user.identities?.length === 0) {
      setError('An account with this email already exists. Try signing in.')
      setLoading(false)
      return
    }
    if (data.session) {
      // Email confirmation is off — already signed in.
      router.replace(next)
      router.refresh()
      return
    }
    setSentTo(cleanEmail)
    setLoading(false)
  }

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <Alert tone="info">
          We sent a confirmation link to <strong className="text-brand-parchment">{sentTo}</strong>.
        </Alert>
        <p className="text-sm text-brand-muted">Open it on this device to finish creating your account. Check spam if it doesn’t arrive in a minute.</p>
        <Link href="/sign-in" className={`inline-block text-sm ${linkCls}`}>Back to sign in</Link>
      </div>
    )
  }

  const nextQs = next !== '/' ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <>
      <GoogleButton next={next} label="Sign up with Google" />
      <Divider />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name" type="text" value={name} onChange={setName} autoComplete="name" placeholder="How the table knows you" />
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@example.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={MIN_PASSWORD} placeholder={`At least ${MIN_PASSWORD} characters`} />
        {error && <Alert tone="error">{error}</Alert>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-muted">
        Already have an account? <Link href={`/sign-in${nextQs}`} className={linkCls}>Sign in</Link>
      </p>
    </>
  )
}

/* ───────────────────────── Forgot password ───────────────────────── */

export function ForgotPasswordForm() {
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl('/reset-password'),
    })
    setLoading(false)
    if (error) return setError(friendlyError(error.message))
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <Alert tone="info">If an account exists for that email, a reset link is on its way.</Alert>
        <Link href="/sign-in" className={`inline-block text-sm ${linkCls}`}>Back to sign in</Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@example.com" />
      {error && <Alert tone="error">{error}</Alert>}
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
      <p className="text-center text-sm">
        <Link href="/sign-in" className={linkCls}>Back to sign in</Link>
      </p>
    </form>
  )
}

/* ───────────────────────── Reset password ───────────────────────── */

export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`)
    if (password !== confirm) return setError('Passwords don’t match.')
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
      return
    }
    router.replace('/atelier/signet')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="New password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={MIN_PASSWORD} />
      <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" minLength={MIN_PASSWORD} />
      {error && <Alert tone="error">{error}</Alert>}
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  )
}
