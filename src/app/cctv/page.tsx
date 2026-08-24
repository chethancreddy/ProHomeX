import Link from 'next/link';
import { Shield, Camera, Monitor, Wifi, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function CCTVPage() {
  const [cctv, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('cctv_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider mb-5">
                <Shield size={12} /> CCTV Surveillance Systems
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                {cctv.hero_title}
              </h1>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                {cctv.hero_subtitle}
              </p>
              {cctv.starting_price && (
                <div className="mt-4 inline-block bg-blue-600/30 border border-blue-400/30 px-3.5 py-1 rounded-xl text-xs text-blue-200">
                  Turnkey Packages Starting from <span className="font-bold text-white font-mono text-sm">{cctv.starting_price}</span>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/request-quote?service=CCTV" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg">
                  Request CCTV Quote <ChevronRight size={14} />
                </Link>
                <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm">
                  Talk to an Expert ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Camera Types */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Camera Types We Supply &amp; Install</h2>
            <p className="text-gray-500 text-sm mb-10">We work with all major camera types and configurations to suit any environment.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Bullet Cameras', desc: 'Ideal for long-distance monitoring outdoors. Weatherproof and high-resolution for perimeters.', mp: '2MP – 8MP', icons: '📹' },
                { title: 'Dome Cameras', desc: 'Discreet indoor/outdoor cameras. Vandal-proof housing with wide-angle coverage.', mp: '2MP – 5MP', icons: '🔵' },
                { title: '360° Panoramic', desc: 'Full room coverage with no blind spots. One camera replaces multiple units.', mp: '5MP – 12MP', icons: '⭕' },
                { title: 'PTZ Cameras', desc: 'Remote pan, tilt, and zoom control. Perfect for large areas and parking lots.', mp: '2MP – 4MP', icons: '🎥' },
                { title: 'Turret Cameras', desc: 'Flexible ball-in-socket design. Easy to position for any angle.', mp: '2MP – 8MP', icons: '📷' },
                { title: 'Fisheye Cameras', desc: 'Ultra-wide 180°–360° view. Ideal for retail floors and open spaces.', mp: '5MP+', icons: '👁️' },
              ].map(c => (
                <div key={c.title} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="text-2xl mb-3">{c.icons}</div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{c.mp}</p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-14 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">What&apos;s Included in Our CCTV Solutions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              {(cctv.features && cctv.features.length > 0 ? cctv.features : [
                'Site survey and camera placement planning',
                'Supply of cameras, cables, and recording unit',
                'Professional mounting and wiring',
                'DVR/NVR configuration and mobile app setup',
                'User training for playback and monitoring',
                cctv.warranty_text || '2-Year Comprehensive Warranty',
              ]).map((i, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">{i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-blue-600 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold">Get Your Custom CCTV Quotation</h2>
            <p className="text-blue-100 mt-2 text-sm">{cctv.warranty_text || '2-Year Comprehensive On-Site Warranty on all setups.'}</p>
            <Link href="/request-quote?service=CCTV" className="mt-6 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
              Request Free Site Survey <ChevronRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter branding={branding} />
    </div>
  );
}

function PublicNav() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl text-slate-900 flex items-center gap-0.5"><span className="text-blue-600 font-extrabold">ProHome</span><span className="text-slate-900 font-extrabold">X</span></Link>
        <nav className="hidden md:flex items-center gap-7">
          {[['CCTV', '/cctv'], ['Solar', '/solar'], ['UPS', '/ups'], ['Automation', '/home-automation'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
            <Link key={h} href={h} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{l}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/request-quote" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">Get Quote</Link>
        </div>
      </div>
    </header>
  );
}

function PublicFooter({ branding }: { branding: any }) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link href="/" className="font-bold text-white text-base"><span className="text-blue-400 font-extrabold">ProHome</span>X</Link>
        <span>© {new Date().getFullYear()} {branding?.company_name || 'ProHomeX'}. All rights reserved.</span>
      </div>
    </footer>
  );
}
