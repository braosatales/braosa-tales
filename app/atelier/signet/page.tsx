import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TheSignet from "@/components/tools/TheSignet";

export default function SignetPage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-bg">
      <Nav />
      {/* Hero */}
      <section className="relative py-20 text-center border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-6">
          <p className="section-label mb-4">The Atelier · The Signet</p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-brand-parchment mb-6">The Signet</h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-24 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400 text-sm">✦</span>
            <div className="h-px flex-1 max-w-24 bg-brand-gold-400/30" />
          </div>
          <p className="font-fell italic text-brand-muted text-lg">Forge names from ancient tongues</p>
        </div>
      </section>
      {/* Tool */}
      <div className="flex-1">
        <TheSignet />
      </div>
      <Footer />
    </main>
  );
}
