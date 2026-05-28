import Nav from '@/components/NavServer'
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

      {/* The Keeper's Life */}
      <section className="py-20 px-6 border-t border-brand-border">
        <div className="max-w-5xl mx-auto">
          {/* Label */}
          <p className="section-label text-center mb-4">BEYOND THE TABLE</p>

          {/* Heading */}
          <h2 className="font-cinzel text-3xl md:text-4xl text-center text-brand-gold-300 mb-4">
            The Keeper&apos;s Life
          </h2>

          {/* Subtitle */}
          <p className="text-center text-[#F0E8FF] mb-6 max-w-xl mx-auto">
            Those who build worlds still have bills to pay and goals to chase. These tools are for the life behind the lore.
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="h-px w-16 bg-brand-gold-400 opacity-40" />
            <span className="text-brand-gold-400 text-sm">✦</span>
            <div className="h-px w-16 bg-brand-gold-400 opacity-40" />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Waypoint */}
            <div className="relative rounded-xl p-6 flex flex-col gap-3"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,174,88,0.15)' }}>
              <span className="absolute top-3 right-3 text-xs border border-[#D4AE58] text-[#D4AE58] rounded-full px-2 py-0.5 opacity-70">
                Free
              </span>
              <h3 className="font-cinzel text-lg text-[#D4AE58]">Waypoint</h3>
              <p className="text-[#F0E8FF] text-sm leading-relaxed">
                Personal goals, tracked with intention. Share your progress with the people that matter.
              </p>
              <div className="mt-auto pt-2">
                <a
                  href="https://goals.braosatales.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm border border-[#D4AE58] text-[#D4AE58] rounded-full px-4 py-1.5 hover:bg-[#D4AE58] hover:text-brand-bg transition-colors duration-200"
                >
                  Open Waypoint
                </a>
              </div>
            </div>

            {/* Purse */}
            <div className="relative rounded-xl p-6 flex flex-col gap-3"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,174,88,0.15)' }}>
              <span className="absolute top-3 right-3 text-xs border border-[#D4AE58] text-[#D4AE58] rounded-full px-2 py-0.5 opacity-70">
                Free
              </span>
              <h3 className="font-cinzel text-lg text-[#D4AE58]">Purse</h3>
              <p className="text-[#F0E8FF] text-sm leading-relaxed">
                Simple budget and finance tracking. Invite others and manage up to three shared spaces.
              </p>
              <div className="mt-auto pt-2">
                <a
                  href="https://budget.braosatales.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm border border-[#D4AE58] text-[#D4AE58] rounded-full px-4 py-1.5 hover:bg-[#D4AE58] hover:text-brand-bg transition-colors duration-200"
                >
                  Open Purse
                </a>
              </div>
            </div>

            {/* Hearth — coming soon */}
            <div className="relative rounded-xl p-6 flex flex-col gap-3"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,174,88,0.15)' }}>
              <span className="absolute top-3 right-3 text-xs border border-[#D4AE58] text-[#D4AE58] rounded-full px-2 py-0.5 opacity-70">
                Free
              </span>
              <h3 className="font-cinzel text-lg text-[#D4AE58]">Hearth</h3>
              <p className="text-[#F0E8FF] text-sm leading-relaxed">
                Household management for the whole family. Calendar, tasks, groceries and recipes — all in one place.
              </p>
              <div className="mt-auto pt-2">
                <button
                  disabled
                  className="inline-block text-sm border border-[#D4AE58] text-[#D4AE58] rounded-full px-4 py-1.5 opacity-40 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
