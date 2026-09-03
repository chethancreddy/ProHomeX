import Link from 'next/link';
import { Shield, Award, Users, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { getSectionSettings, AboutPageSettings, BrandingSettings } from '@/lib/cms';

export default async function AboutPage() {
  const [about, branding] = await Promise.all([
    getSectionSettings<AboutPageSettings>('about_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <PublicNav branding={branding} />

      <main className="space-y-16 md:space-y-24 py-10 md:py-16">
        {/* Header Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="eyebrow-text inline-block mb-3 text-black/60 font-mono">
              ABOUT US / COMPANY HERITAGE
            </span>
            <h1 className="display-lg text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black mb-6">
              {about.title || 'Engineering Quality & Infrastructure Excellence'}
            </h1>
            <p className="text-lg sm:text-xl font-light text-black/80 leading-relaxed">
              {about.subtitle || 'ProHomeX delivers certified engineering solutions for smart security, renewable energy, and power backup systems.'}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <span className="eyebrow-text text-black/60 font-mono block">OUR JOURNEY</span>
              <h2 className="headline-text text-2xl sm:text-3xl font-semibold text-black tracking-tight">
                Built on Engineering Integrity
              </h2>
              <div className="text-sm sm:text-base font-light text-black/80 leading-relaxed space-y-4">
                <p>{about.story}</p>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#f7f7f5] border border-[#e6e6e6] p-6 rounded-[20px]">
                  <h3 className="font-mono text-xs text-black/60 uppercase tracking-widest mb-2">OUR MISSION</h3>
                  <p className="text-xs text-black/80 leading-relaxed">{about.mission}</p>
                </div>
                <div className="bg-[#f7f7f5] border border-[#e6e6e6] p-6 rounded-[20px]">
                  <h3 className="font-mono text-xs text-black/60 uppercase tracking-widest mb-2">OUR VISION</h3>
                  <p className="text-xs text-black/80 leading-relaxed">{about.vision}</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/request-quote"
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all active:scale-98"
                >
                  Request Consultation <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Tier-1 Hardware', desc: 'Direct OEM partnership warranties on all cameras, panels & batteries.' },
                { icon: Award, title: 'In-House Engineers', desc: 'Every installation is certified by trained ProHomeX staff.' },
                { icon: Users, title: '850+ Sites Powered', desc: 'Trusted by residential communities and corporate facilities.' },
                { icon: Check, title: 'Same-Day SLA', desc: 'Rapid field response and scheduled preventive maintenance.' },
              ].map((v, i) => (
                <div key={i} className="bg-white rounded-[20px] p-6 border border-[#e6e6e6] hover:border-black transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#f7f7f5] text-black flex items-center justify-center mb-3">
                    <v.icon size={18} />
                  </div>
                  <h3 className="font-bold text-black text-sm mb-1">{v.title}</h3>
                  <p className="text-xs text-black/70 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter branding={branding} />
    </div>
  );
}

function PublicNav({ branding }: { branding: any }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg tracking-tight text-black flex items-center gap-1">
          <span>{branding?.company_name || 'ProHomeX'}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-normal text-black">
          <Link href="/cctv" className="hover:opacity-60 transition-opacity">CCTV</Link>
          <Link href="/solar" className="hover:opacity-60 transition-opacity">Solar</Link>
          <Link href="/ups" className="hover:opacity-60 transition-opacity">UPS</Link>
          <Link href="/home-automation" className="hover:opacity-60 transition-opacity">Automation</Link>
          <Link href="/about" className="text-black font-semibold">About</Link>
          <Link href="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-medium text-black px-3.5 py-1.5 rounded-full hover:bg-[#f7f7f5] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/request-quote"
            className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-900 text-white text-xs font-medium px-4 py-2 rounded-full transition-all active:scale-95"
          >
            Get Quote <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicFooter({ branding }: { branding: any }) {
  return (
    <footer className="bg-white text-black border-t border-[#e6e6e6] pt-12 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/60 font-mono">
        <p>© {new Date().getFullYear()} {branding?.company_name || 'ProHomeX'}. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/cctv" className="hover:text-black">CCTV</Link>
          <Link href="/solar" className="hover:text-black">Solar</Link>
          <Link href="/ups" className="hover:text-black">UPS</Link>
          <Link href="/home-automation" className="hover:text-black">Automation</Link>
        </div>
      </div>
    </footer>
  );
}

