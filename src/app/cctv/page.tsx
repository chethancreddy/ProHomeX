import Link from 'next/link';
import { Shield, Camera, Monitor, Wifi, ArrowRight, CheckCircle2, ArrowUpRight, Check } from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function CCTVPage() {
  const [cctv, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('cctv_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <PublicNav branding={branding} />

      <main className="space-y-16 md:space-y-24 py-10 md:py-16">
        {/* Hero: Signature Lime Block */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lime rounded-[24px] p-8 sm:p-12 md:p-16">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                SOLUTIONS / SURVEILLANCE &amp; CCTV
              </span>
              <h1 className="display-lg text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black mb-6">
                {cctv.hero_title || 'Enterprise CCTV & AI Video Analytics'}
              </h1>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-6">
                {cctv.hero_subtitle || 'Engineered surveillance systems for round-the-clock physical security and perimeter awareness.'}
              </p>

              {cctv.starting_price && (
                <div className="inline-block bg-black text-white px-4 py-1.5 rounded-full text-xs font-mono mb-8">
                  Turnkey Packages Starting from <strong className="text-white font-bold">{cctv.starting_price}</strong>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  href="/request-quote?service=CCTV"
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full transition-all active:scale-98 text-sm"
                >
                  Request CCTV Quote <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black transition-all active:scale-98 text-sm"
                >
                  Talk to Specialist ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Camera Systems Architecture */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="eyebrow-text text-black/60 font-mono block mb-2">HARDWARE SPECIFICATIONS</span>
            <h2 className="headline-text text-3xl font-semibold text-black tracking-tight">Camera Formats We Supply &amp; Install</h2>
            <p className="text-black/70 text-sm mt-1">Certified commercial-grade optics tailored to indoor, outdoor, and high-security zones.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Bullet Cameras', desc: 'Long-range perimeter surveillance. Weatherproof IP67 aluminum chassis with integrated IR arrays.', mp: '2MP – 8MP 4K' },
              { title: 'Dome Cameras', desc: 'Discreet ceiling-mounted housings. IK10 vandal-proof polycarbonate dome for indoor & office suites.', mp: '2MP – 5MP' },
              { title: '360° Panoramic Fisheye', desc: 'Eliminates blind spots across open showrooms, warehouses, and lobbies with virtual ePTZ de-warping.', mp: '5MP – 12MP' },
              { title: 'PTZ Speed Domes', desc: 'Continuous 360° pan, 90° tilt, and up to 36x optical zoom. Auto-tracking for parking areas and large yards.', mp: '2MP – 4MP Optical' },
              { title: 'Turret Eyeball', desc: 'Zero reflection from glass dome surfaces, flexible ball-and-socket orientation, superior night vision.', mp: '2MP – 8MP ColorVu' },
              { title: 'Thermal & ANPR', desc: 'Automatic Number Plate Recognition (ANPR) cameras and heat-sensing thermal nodes for gates.', mp: 'Specialized Sensors' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-[20px] border border-[#e6e6e6] p-6 hover:border-black transition-all duration-200">
                <span className="caption-text text-black/50 font-mono block mb-2">{c.mp}</span>
                <h3 className="text-lg font-bold text-black mb-2">{c.title}</h3>
                <p className="text-xs text-black/70 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's Included */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f7f7f5] rounded-[24px] p-8 sm:p-12 border border-[#e6e6e6]">
            <span className="eyebrow-text text-black/60 font-mono block mb-2">SCOPE OF WORK</span>
            <h2 className="headline-text text-2xl sm:text-3xl font-semibold text-black tracking-tight mb-8">What&apos;s Included in Our CCTV Solutions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(cctv.features && cctv.features.length > 0 ? cctv.features : [
                'On-site field survey and camera angle optimization plan',
                'Supply of tier-1 cameras, Cat6 cabling, and NVR recorder',
                'Concealed PVC conduit casing and professional mounting',
                'Mobile app configuration on iOS/Android for remote monitoring',
                'Intelligent motion detection, intrusion alerts & email push',
                cctv.warranty_text || '2-Year Comprehensive On-Site Warranty',
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
          <div className="block-lime rounded-[24px] p-10 sm:p-16 text-center">
            <div className="max-w-2xl mx-auto">
              <span className="eyebrow-text text-black/80 font-mono block mb-2">GET A SITE ESTIMATE</span>
              <h2 className="display-lg text-3xl sm:text-4xl font-semibold text-black mb-4">Request a Customized CCTV Quote</h2>
              <p className="text-sm font-light text-black/80 mb-8">
                {cctv.warranty_text || 'Backed by 2-Year Comprehensive On-Site Warranty & Same-Day Dispatch.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/request-quote?service=CCTV"
                  className="bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all active:scale-98"
                >
                  Request Free Site Survey
                </Link>
                <Link
                  href="/contact"
                  className="bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black text-sm transition-all active:scale-98"
                >
                  Contact Engineering Team
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
          <Link href="/cctv" className="text-black font-semibold">CCTV</Link>
          <Link href="/solar" className="hover:opacity-60 transition-opacity">Solar</Link>
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
            href="/request-quote?service=CCTV"
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

