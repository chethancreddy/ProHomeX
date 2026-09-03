import Link from 'next/link';
import { Battery, Zap, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function UPSPage() {
  const [ups, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('ups_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <PublicNav branding={branding} />

      <main className="space-y-16 md:space-y-24 py-10 md:py-16">
        {/* Hero: Signature Coral Block */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-coral rounded-[24px] p-8 sm:p-12 md:p-16">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                SOLUTIONS / POWER INFRASTRUCTURE &amp; UPS
              </span>
              <h1 className="display-lg text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black mb-6">
                {ups.hero_title || 'Online UPS & Pure Sine Wave Backup'}
              </h1>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-8">
                {ups.hero_subtitle || 'Zero-transfer-time double conversion power backup systems for critical servers, medical gear, and entire facilities.'}
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  href="/request-quote?service=UPS"
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full transition-all active:scale-98 text-sm"
                >
                  Request UPS Quote <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black transition-all active:scale-98 text-sm"
                >
                  Consult Power Engineer ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* UPS Architecture Types */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="eyebrow-text text-black/60 font-mono block mb-2">POWER TOPOLOGY</span>
            <h2 className="headline-text text-3xl font-semibold text-black tracking-tight">UPS System Architectures</h2>
            <p className="text-black/70 text-sm mt-1">High-efficiency power topologies sized from 1 kVA home setups to 100+ kVA three-phase plants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Online UPS (Double Conversion)', desc: 'Continuous pure sine-wave with 0ms transfer time. Completely isolates sensitive IT loads, servers & diagnostic medical machines.', best: 'Data Centers, Hospitals & CNC Labs' },
              { title: 'Line-Interactive UPS', desc: 'Integrated Automatic Voltage Regulation (AVR) to correct sags/surges without draining battery backup needlessly.', best: 'Office Racks, Workstations & POS' },
              { title: 'Home & Inverter UPS', desc: 'Heavy-duty copper transformer inverters paired with high-durability tubular or LiFePO4 battery banks for whole-property backup.', best: 'Residences, Clinics & Retail Stores' },
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
            <span className="eyebrow-text text-black/60 font-mono block mb-2">ENGINEERING SCOPE</span>
            <h2 className="headline-text text-2xl sm:text-3xl font-semibold text-black tracking-tight mb-8">What&apos;s Included in Our UPS Packages</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(ups.features && ups.features.length > 0 ? ups.features : [
                'Pure Sine Wave Online & Line-Interactive UPS Topologies',
                'Heavy-Duty Tall Tubular & Lithium Ferro Phosphate (LiFePO4) Battery Packs',
                'Scalable Capacity from 1 kVA to 100+ kVA 3-Phase Industrial Units',
                'Automatic Overload, Short-Circuit & Thermal Runaway Protection',
                'Comprehensive Battery Health-Checks & Water-Topping AMC Support',
                ups.warranty_text || '3-Year Direct Replacement Guarantee on Batteries',
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
          <div className="block-coral rounded-[24px] p-10 sm:p-16 text-center">
            <div className="max-w-2xl mx-auto">
              <span className="eyebrow-text text-black/80 font-mono block mb-2">ZERO DOWNTIME GUARANTEED</span>
              <h2 className="display-lg text-3xl sm:text-4xl font-semibold text-black mb-4">Ensure Uninterrupted Power For Your Site</h2>
              <p className="text-sm font-light text-black/80 mb-8">
                {ups.warranty_text || '3-Year Direct Replacement Guarantee on Batteries & 24/7 Field Support.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/request-quote?service=UPS"
                  className="bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all active:scale-98"
                >
                  Request Load Sizing Quote
                </Link>
                <Link
                  href="/contact"
                  className="bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black text-sm transition-all active:scale-98"
                >
                  Contact Power Specialist
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
          <Link href="/solar" className="hover:opacity-60 transition-opacity">Solar</Link>
          <Link href="/ups" className="text-black font-semibold">UPS</Link>
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
            href="/request-quote?service=UPS"
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

