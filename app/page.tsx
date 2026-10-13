import Nav from '@/components/NavServer'
import HomeHero from '@/components/home/HomeHero'
import NowPlaying from '@/components/home/NowPlaying'
import AtelierTeaser from '@/components/home/AtelierTeaser'
import StoriesTeaser from '@/components/home/StoriesTeaser'
import KeepersLife from '@/components/home/KeepersLife'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import Quill from '@/components/home/Quill'

export default function Home() {
  return (
    <main className="bg-night">
      <Nav />
      <div className="relative">
        <Quill />
        <HomeHero />
        <NowPlaying />
        <AtelierTeaser />
        <StoriesTeaser />
        <KeepersLife />
        <Newsletter />
      </div>
      <Footer />
    </main>
  )
}
