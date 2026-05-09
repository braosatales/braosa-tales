import { SignIn } from '@clerk/nextjs'

const clerkAppearance = {
  variables: {
    colorPrimary: '#534AB7',
    colorBackground: '#130F1E',
    colorText: '#F0E4C4',
    colorTextSecondary: '#8A7E9A',
    colorInputBackground: '#0A0712',
    colorInputText: '#F0E4C4',
    colorNeutral: '#2A2040',
    borderRadius: '2px',
    fontFamily: "'IM Fell English', Georgia, serif",
    fontSize: '14px',
  },
  elements: {
    card: 'shadow-none border border-[#2A2040] bg-[#130F1E]',
    headerTitle: 'font-cinzel tracking-widest uppercase text-[#F0E4C4] text-base',
    headerSubtitle: 'text-[#8A7E9A] text-sm',
    socialButtonsBlockButton: 'border border-[#2A2040] hover:border-[#534AB7] text-[#F0E4C4] bg-[#0A0712]',
    socialButtonsBlockButtonText: 'text-[#F0E4C4]',
    dividerLine: 'bg-[#2A2040]',
    dividerText: 'text-[#8A7E9A]',
    formFieldLabel: 'text-[#8A7E9A] text-xs tracking-widest uppercase',
    formFieldInput: 'bg-[#0A0712] border-[#2A2040] text-[#F0E4C4] focus:border-[#534AB7]',
    formButtonPrimary: 'bg-[#534AB7] hover:bg-[#7F77DD] text-[#F0E4C4] tracking-widest uppercase text-xs font-cinzel rounded-none',
    footerActionLink: 'text-[#AFA9EC] hover:text-[#F0E4C4]',
    footerActionText: 'text-[#8A7E9A]',
    identityPreviewEditButton: 'text-[#AFA9EC]',
    formFieldSuccessText: 'text-[#E8C97A]',
    formFieldErrorText: 'text-red-400',
    alertText: 'text-[#F0E4C4]',
    otpCodeFieldInput: 'bg-[#0A0712] border-[#2A2040] text-[#F0E4C4]',
  },
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <p className="section-label">Welcome back</p>
        <h1 className="font-cinzel text-2xl font-bold text-brand-parchment tracking-widest">
          THE ATELIER
        </h1>
        <div className="flex items-center justify-center mt-3">
          <span className="h-px w-16 bg-brand-border" />
          <span className="ornament text-xs">✦</span>
          <span className="h-px w-16 bg-brand-border" />
        </div>
      </div>
      <SignIn appearance={clerkAppearance} />
    </main>
  )
}
