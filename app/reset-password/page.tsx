import { redirect } from 'next/navigation'
import AuthShell from '@/components/auth/AuthShell'
import { ResetPasswordForm } from '@/components/auth/AuthForms'
import { getAuthUser } from '@/lib/auth'

export const metadata = { title: 'Set new password' }

// Reached via the reset email → /auth/callback, which signs the user in with a recovery session.
export default async function ResetPasswordPage() {
  if (!(await getAuthUser())) redirect('/forgot-password')

  return (
    <AuthShell eyebrow="Almost there" title="New password">
      <ResetPasswordForm />
    </AuthShell>
  )
}
