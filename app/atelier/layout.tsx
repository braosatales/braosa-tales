import NavServer from '@/components/NavServer'

export default async function AtelierLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavServer />
      {children}
    </>
  )
}
