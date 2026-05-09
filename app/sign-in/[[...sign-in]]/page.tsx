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
    card: 'shadow-none border-0 bg-transparent p-0 w-full',
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

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-sm p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="font-cinzel font-bold text-brand-gold-300 text-3xl tracking-widest">
            Braosa Tales
          </h1>
          <p className="font-fell italic text-brand-gold-400/70 mt-2 text-base">
            Your tale begins here
          </p>
        </div>

        <div className="flex items-center w-full">
          <span className="h-px flex-1 bg-brand-border" />
          <span className="text-brand-gold-400 mx-3 opacity-60 text-xs">✦</span>
          <span className="h-px flex-1 bg-brand-border" />
        </div>

        <SignIn appearance={clerkAppearance} />
      </div>
    </main>
  )
}
