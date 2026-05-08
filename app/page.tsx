import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Pillars from '@/components/Pillars'
import ToolsSection from '@/components/ToolsSection'
import StoriesSection from '@/components/StoriesSection'
import GamesSection from '@/components/GamesSection'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Pillars />
      <ToolsSection />
      <StoriesSection />
      <GamesSection />
      <Newsletter />
      <Footer />
    </main>
  )
}
