import { redirect } from 'next/navigation'
import AuthShell from '@/components/auth/AuthShell'
import { SignUpForm } from '@/components/auth/AuthForms'
import { getAuthUser } from '@/lib/auth'
import { safeNext } from '@/lib/safe-next'

export const metadata = { title: 'Create account' }

type Props = { searchParams: { next?: string } }

export default async function SignUpPage({ searchParams }: Props) {
  const next = safeNext(searchParams.next)
  if (await getAuthUser()) redirect(next)

  return (
    <AuthShell eyebrow="Join the table" title="Create account" subtitle="Your tale begins here">
      <SignUpForm next={next} />
    </AuthShell>
  )
}
