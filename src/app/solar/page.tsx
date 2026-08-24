import Link from 'next/link';
import { Zap, ChevronRight, CheckCircle, Sun, Shield, Award } from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function SolarPage() {
  const [solar, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('solar_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>
        <section className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-4 py-1.5 rounded-full text-amber-300 text-xs font-semibold uppercase tracking-wider mb-5">
                <Zap size={12} /> Rooftop Solar Power Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                {solar.hero_title}
              </h1>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                {solar.hero_subtitle}
              </p>
              {solar.subsidy_text && (
                <div className="mt-4 inline-block bg-amber-500/20 border border-amber-400/30 px-3.5 py-1.5 rounded-xl text-xs text-amber-200 font-medium">
                  🌟 {solar.subsidy_text}
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/request-quote?service=Solar" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg">
                  Request Solar Quote <ChevronRight size={14} />
                </Link>
                <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm">
                  Book Site Visit ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">System Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'On-Grid Solar', emoji: '☀️', desc: 'Connected to the utility grid. Sell surplus power back with net metering. Ideal for commercial & residential consumers with stable grid.', best: 'Commercial & Residential' },
                { title: 'Off-Grid Solar', emoji: '🔋', desc: 'Fully independent from the grid. Includes lithium/tubular battery storage for 24/7 power. Best for remote locations & farmhouses.', best: 'Remote areas & farms' },
                { title: 'Hybrid Solar', emoji: '⚡', desc: 'Combines grid connection with battery backup. Use solar first, battery as backup, grid as last resort. Ultimate reliability.', best: 'Homes & IT Offices' },
              ].map(s => (
                <div key={s.title} className="bg-amber-50/60 border border-amber-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <h3 className="font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-amber-600 font-medium mt-0.5">Best for: {s.best}</p>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features & Warranty */}
        <section className="py-14 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">What&apos;s Included in Our Solar Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              {(solar.features && solar.features.length > 0 ? solar.features : [
                'Monocrystalline High-Efficiency Half-Cut Solar Panels',
                'Complete Net-Metering Approval & Discom Liaison',
                'Hybrid Inverters with Battery Storage Support',
                'Real-time Smartphone Generation Monitoring App',
                'Turnkey Installation with GI Structure & Earthing',
                solar.warranty_text || '25-Year Performance Warranty on Solar PV Modules',
              ]).map((i, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                  <CheckCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">{i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-amber-500 text-slate-900 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold">Ready to Cut Your Power Bills?</h2>
            <p className="text-slate-800 mt-2 text-sm">{solar.warranty_text || '25-Year Performance Warranty on Solar PV Modules.'}</p>
            <Link href="/request-quote?service=Solar" className="mt-6 inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg text-sm">
              Calculate Solar Savings <ChevronRight size={14} />
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
