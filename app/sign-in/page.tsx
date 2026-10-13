import { redirect } from 'next/navigation'
import AuthShell from '@/components/auth/AuthShell'
import { SignInForm } from '@/components/auth/AuthForms'
import { getAuthUser } from '@/lib/auth'
import { safeNext } from '@/lib/safe-next'

export const metadata = { title: 'Sign in' }

type Props = { searchParams: { next?: string; error?: string } }

export default async function SignInPage({ searchParams }: Props) {
  const next = safeNext(searchParams.next, '/dashboard')
  if (await getAuthUser()) redirect(next)

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Your tale continues here"
      footer={
        <>
          <span className="text-brand-gold-300">Alpha tester?</span> Sign-in has moved. Create an account with the same
          email you used before — your credits, saved names and history come with you once it’s confirmed.
        </>
      }
    >
      <SignInForm next={next} initialError={searchParams.error} />
    </AuthShell>
  )
}
