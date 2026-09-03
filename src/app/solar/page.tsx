import Link from 'next/link';
import { Zap, Sun, Shield, Award, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function SolarPage() {
  const [solar, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('solar_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <PublicNav branding={branding} />

      <main className="space-y-16 md:space-y-24 py-10 md:py-16">
        {/* Hero: Signature Lilac Block */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lilac rounded-[24px] p-8 sm:p-12 md:p-16">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                SOLUTIONS / CLEAN ENERGY &amp; SOLAR
              </span>
              <h1 className="display-lg text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black mb-6">
                {solar.hero_title || 'Turnkey Solar Rooftop Power Plants'}
              </h1>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-6">
                {solar.hero_subtitle || 'Harness clean solar energy with tier-1 bifacial panels, hybrid inverters, and net-metering approvals.'}
              </p>

              {solar.subsidy_text && (
                <div className="inline-block bg-black text-white px-4 py-1.5 rounded-full text-xs font-mono mb-8">
                  <strong className="text-white font-bold">{solar.subsidy_text}</strong>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  href="/request-quote?service=Solar"
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full transition-all active:scale-98 text-sm"
                >
                  Request Solar Quote <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black transition-all active:scale-98 text-sm"
                >
                  Book Free Site Survey ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* System Types */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="eyebrow-text text-black/60 font-mono block mb-2">PLANT CONFIGURATIONS</span>
            <h2 className="headline-text text-3xl font-semibold text-black tracking-tight">Solar Power Architectures</h2>
            <p className="text-black/70 text-sm mt-1">Engineered to match grid availability, backup needs, and tariff benefits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'On-Grid (Grid-Tied)', desc: 'Synchronized with utility EB grid. Export surplus generation back for bill credits via bi-directional net metering.', best: 'Commercial Buildings & Homes' },
              { title: 'Off-Grid System', desc: 'Completely autonomous setup with high-capacity Lithium / Tubular battery banks for 24/7 power independence.', best: 'Farmhouses & Remote Sites' },
              { title: 'Hybrid Solar Plant', desc: 'Best of both worlds: feeds excess solar to the grid while maintaining critical battery storage during blackouts.', best: 'Hospitals & IT Data Centers' },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-[20px] border border-[#e6e6e6] p-6 hover:border-black transition-all duration-200">
                <span className="caption-text text-black/50 font-mono block mb-2">{s.best}</span>
                <h3 className="text-lg font-bold text-black mb-2">{s.title}</h3>
                <p className="text-xs text-black/70 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's Included */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f7f7f5] rounded-[24px] p-8 sm:p-12 border border-[#e6e6e6]">
            <span className="eyebrow-text text-black/60 font-mono block mb-2">FULL SCOPE OF DELIVERY</span>
            <h2 className="headline-text text-2xl sm:text-3xl font-semibold text-black tracking-tight mb-8">What&apos;s Included in Our Solar Packages</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(solar.features && solar.features.length > 0 ? solar.features : [
                'Tier-1 Monocrystalline Bifacial Half-Cut Solar Modules',
                'MNRE Government DBT Subsidy Approval & Portal Registration',
                'Hot-Dip Galvanized (HDG) Rooftop Mounting Structure',
                'Bi-directional Net Metering Application & DISCOM Liaisoning',
                'Remote Smartphone Generation Telemetry Monitoring',
                solar.warranty_text || '25-Year Performance Warranty on Solar PV Modules',
              ]).map((feat, idx) => (
                <div key={idx} className="bg-white p-4 rounded-[16px] border border-[#e6e6e6] flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c8e6cd] text-[#1ea64a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-medium text-black leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lilac rounded-[24px] p-10 sm:p-16 text-center">
            <div className="max-w-2xl mx-auto">
              <span className="eyebrow-text text-black/80 font-mono block mb-2">REDUCE ELECTRICITY BILLS</span>
              <h2 className="display-lg text-3xl sm:text-4xl font-semibold text-black mb-4">Ready to Generate Your Own Power?</h2>
              <p className="text-sm font-light text-black/80 mb-8">
                {solar.warranty_text || '25-Year Performance Warranty on Modules with On-Site Engineering Support.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/request-quote?service=Solar"
                  className="bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all active:scale-98"
                >
                  Calculate Solar Savings
                </Link>
                <Link
                  href="/contact"
                  className="bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black text-sm transition-all active:scale-98"
                >
                  Talk to Solar Engineer
                </Link>
              </div>
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
          <Link href="/solar" className="text-black font-semibold">Solar</Link>
          <Link href="/ups" className="hover:opacity-60 transition-opacity">UPS</Link>
          <Link href="/home-automation" className="hover:opacity-60 transition-opacity">Automation</Link>
          <Link href="/about" className="hover:opacity-60 transition-opacity">About</Link>
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
            href="/request-quote?service=Solar"
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

