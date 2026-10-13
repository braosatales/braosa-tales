import AuthShell from '@/components/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/auth/AuthForms'

export const metadata = { title: 'Reset password' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Lost the key?" title="Reset password" subtitle="We’ll send you a link to set a new one">
      <ForgotPasswordForm />
    </AuthShell>
  )
}
