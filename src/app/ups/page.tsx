import Link from 'next/link';
import { Battery, ChevronRight, CheckCircle, Zap } from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function UPSPage() {
  const [ups, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('ups_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>
        <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-5">
                <Battery size={12} /> UPS &amp; Power Backup Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                {ups.hero_title}
              </h1>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                {ups.hero_subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/request-quote?service=UPS" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg">
                  Request UPS Quote <ChevronRight size={14} />
                </Link>
                <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm">
                  Talk to an Engineer ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">UPS System Architectures</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Online UPS (Double Conversion)', emoji: '🟢', desc: 'Provides pure, continuous sine-wave power with 0ms transfer time. Protects servers, medical devices & mission-critical IT.', best: 'Data centres, hospitals, servers' },
                { title: 'Line-Interactive UPS', emoji: '🔵', desc: 'Automatic voltage regulation (AVR) without switching to battery. Great for workstations, network racks, and offices.', best: 'Offices, routers, workstations' },
                { title: 'Home & Inverter UPS', emoji: '🟡', desc: 'Heavy-duty inverters paired with tall tubular or LiFePO4 batteries for whole-house or shop lighting and fans.', best: 'Homes, retail shops, clinics' },
              ].map(s => (
                <div key={s.title} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <h3 className="font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Best for: {s.best}</p>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features & Warranty */}
        <section className="py-14 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">What&apos;s Included in Our UPS Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              {(ups.features && ups.features.length > 0 ? ups.features : [
                'Pure Sine Wave Online & Line-Interactive UPS Systems',
                'Heavy-duty Tall Tubular & Lithium Ferro Phosphate Batteries',
                'Scalable from 1 kVA Home Backups to 100+ kVA Industrial Plants',
                'Auto-Overload & Short Circuit Protection',
                'Periodic Health-Check and Water Topping AMC Services',
                ups.warranty_text || '3-Year Replacement Guarantee on Batteries',
              ]).map((i, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">{i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-emerald-600 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold">Ensure Zero Downtime For Your Property</h2>
            <p className="text-emerald-100 mt-2 text-sm">{ups.warranty_text || '3-Year Replacement Guarantee on Tubular & Lithium Batteries.'}</p>
            <Link href="/request-quote?service=UPS" className="mt-6 inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-7 py-3.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm">
              Request Load Sizing Quote <ChevronRight size={14} />
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
