import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'

export default function ToolsPage() {
  return (
    <main>
      <Nav />
      <section className="px-8 py-24 text-center">
        <p className="section-label text-brand-purple-600 mb-2">The Tools</p>
        <h1 className="font-cinzel font-bold text-5xl text-brand-purple-800 mb-4">Campaign Suite</h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Full app coming soon. Sign up to be the first in.
        </p>
      </section>
      <Footer />
    </main>
  )
}
