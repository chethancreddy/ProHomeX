import Link from 'next/link';
import {
  Shield, Zap, Battery, Phone, ChevronRight, CheckCircle,
  Star, Award, Clock, HeadphonesIcon, ArrowRight, Cpu, Sparkles
} from 'lucide-react';
import { getAllSiteSettings } from '@/lib/cms';
import WhatsAppFloatingButton from '@/components/ui/WhatsAppFloatingButton';
import AnnouncementBar from '@/components/ui/AnnouncementBar';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getAllSiteSettings();
  const { branding, home_page, announcement_bar, whatsapp_button } = settings;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar settings={announcement_bar} />

      {/* Navigation */}
      <PublicNav branding={branding} />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 md:py-28">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500 opacity-10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {home_page.hero_badge && (
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
                  <Shield size={12} /> {home_page.hero_badge}
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                {home_page.hero_title}
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {home_page.hero_subtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link
                  href="/request-quote"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 text-sm"
                >
                  {home_page.hero_cta_primary || 'Get Free Quote'} <ChevronRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm"
                >
                  <Phone size={16} /> {branding.phone || 'Talk to Team'}
                </Link>
              </div>

              {/* Dynamic Metric Badges */}
              {home_page.stats && home_page.stats.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {home_page.stats.map((stat, idx) => (
                    <div key={idx}>
                      <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stat.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <TrustSection />

        {/* Services Section */}
        <ServicesSection />

        {/* Why Choose Us */}
        <WhyProHomeX items={home_page.why_choose_us} />

        {/* CTA Section */}
        <CTASection branding={branding} />
      </main>

      {/* Footer */}
      <PublicFooter branding={branding} />

      {/* Floating WhatsApp Widget */}
      <WhatsAppFloatingButton settings={whatsapp_button} />
    </div>
  );
}

function PublicNav({ branding }: { branding: any }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-slate-900 flex items-center gap-0.5">
            <span className="text-blue-600 font-extrabold">ProHome</span><span className="text-slate-900 font-extrabold">X</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link href="/cctv" className="text-gray-600 hover:text-blue-600 transition-colors">CCTV</Link>
            <Link href="/solar" className="text-gray-600 hover:text-blue-600 transition-colors">Solar</Link>
            <Link href="/ups" className="text-gray-600 hover:text-blue-600 transition-colors">UPS</Link>
            <Link href="/home-automation" className="text-gray-600 hover:text-blue-600 transition-colors">Automation</Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors hidden sm:block">
              Staff / Admin
            </Link>
            <Link href="/request-quote" className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Get Quote <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function TrustSection() {
  const items = [
    { icon: Award, title: 'Certified Engineers', desc: 'In-house trained and certified technicians' },
    { icon: Star, title: 'Tier-1 OEM Brands', desc: 'Direct manufacturer warranty coverage' },
    { icon: HeadphonesIcon, title: '24/7 Rapid SLA', desc: 'Emergency on-site field support' },
    { icon: Shield, title: 'Turnkey Execution', desc: 'Survey, supply, cabling, setup & testing' },
    { icon: Clock, title: 'Same-Day Service', desc: 'Quick dispatch and scheduled AMCs' },
  ];

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {items.map(item => (
            <div key={item.title} className="text-center group">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform shadow-md shadow-blue-200">
                <item.icon size={20} />
              </div>
              <p className="text-xs font-bold text-slate-800">{item.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight hidden md:block">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: Shield,
      title: 'CCTV Surveillance Systems',
      description: 'HD IP and Analog camera solutions, 2MP to 4K Ultra-HD, night vision, mobile live-view, and intelligent video analytics.',
      href: '/cctv',
      cta: 'Explore CCTV Packages',
      color: 'from-blue-600 to-indigo-700',
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
    },
    {
      icon: Zap,
      title: 'Solar Power Rooftop',
      description: 'On-grid, off-grid, and hybrid solar plants. Up to ₹78,000 MNRE government subsidies and net-metering approvals.',
      href: '/solar',
      cta: 'Explore Solar Solutions',
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
    },
    {
      icon: Battery,
      title: 'UPS & Power Backup',
      description: 'Pure sine wave online UPS and tubular/lithium battery systems for zero downtime in homes, IT racks, and factories.',
      href: '/ups',
      cta: 'Explore UPS Models',
      color: 'from-emerald-600 to-teal-700',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
    },
    {
      icon: Cpu,
      title: 'Home & Sump Automation',
      description: 'Automatic water sump motor controllers with dry-run trip, motion-sensor lights, capacitive glass switches & smart hubs.',
      href: '/home-automation',
      cta: 'Explore Automation',
      color: 'from-indigo-600 to-purple-700',
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900">Engineering Solutions We Deliver</h2>
          <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
            Turnkey infrastructure solutions backed by certified engineers and on-site warranty support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(s => (
            <div key={s.title} className={`rounded-2xl border ${s.border} ${s.bg} p-7 flex flex-col hover:shadow-xl transition-all group`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md`}>
                <s.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-5">{s.description}</p>
              <Link href={s.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                {s.cta} <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyProHomeX({ items }: { items: { title: string; desc: string }[] }) {
  const defaultItems = [
    { title: 'Authorized OEM Brands', desc: 'We only supply certified cameras, tier-1 solar panels, and pure sine-wave UPS systems with direct manufacturer warranties.' },
    { title: 'Trained In-House Engineers', desc: 'No subcontracting. Every project is executed and certified by ProHomeX certified field engineers.' },
    { title: 'Same-Day Dispatch & SLA Support', desc: 'Fast on-site resolution, emergency backup support, and scheduled annual maintenance contracts.' },
  ];

  const list = items && items.length > 0 ? items : defaultItems;

  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold">Why Choose ProHomeX?</h2>
          <p className="mt-2 text-slate-400 text-sm">Our commitment to engineering quality and customer satisfaction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((item, idx) => (
            <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 font-mono font-bold text-sm flex items-center justify-center">
                0{idx + 1}
              </span>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ branding }: { branding: any }) {
  return (
    <section className="py-16 bg-blue-600 text-white text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold">Ready to Upgrade Your Security or Energy?</h2>
        <p className="mt-3 text-blue-100 text-sm max-w-xl mx-auto">
          Get a free on-site survey and customized quotation from our engineering team today.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/request-quote"
            className="px-7 py-3 bg-white text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
          >
            Request Free Assessment
          </Link>
          <a
            href={`tel:${branding.phone?.replace(/[^0-9+]/g, '') || '+919876543210'}`}
            className="px-7 py-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl border border-blue-400/40 transition-all"
          >
            Call {branding.phone || '+91 98765 43210'}
          </a>
        </div>
      </div>
    </section>
  );
}

function PublicFooter({ branding }: { branding: any }) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <p className="text-white font-extrabold text-base tracking-tight">{branding.company_name || 'ProHomeX Systems'}</p>
          <p className="text-slate-400 leading-relaxed">{branding.tagline || 'Smart Security, Reliable Power & Sustainable Solar Energy.'}</p>
          {branding.gstin && <p className="font-mono text-slate-500">GSTIN: {branding.gstin}</p>}
        </div>

        <div>
          <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Solutions</p>
          <ul className="space-y-2">
            <li><Link href="/cctv" className="hover:text-white transition-colors">CCTV Surveillance</Link></li>
            <li><Link href="/solar" className="hover:text-white transition-colors">Solar Rooftop Plants</Link></li>
            <li><Link href="/ups" className="hover:text-white transition-colors">UPS Power Backup</Link></li>
            <li><Link href="/home-automation" className="hover:text-white transition-colors">Home &amp; Sump Automation</Link></li>
            <li><Link href="/request-quote" className="hover:text-white transition-colors">Request a Quote</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Company</p>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Staff Login</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Contact &amp; Support</p>
          <p className="text-slate-300 font-semibold">{branding.phone || '+91 98765 43210'}</p>
          <p className="text-slate-400 mt-1">{branding.email || 'info@prohomex.com'}</p>
          <p className="text-slate-500 mt-2 leading-relaxed">{branding.address}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-900 text-center text-slate-600">
        © {new Date().getFullYear()} {branding.company_name || 'ProHomeX'}. All rights reserved.
      </div>
    </footer>
  );
}
