import Link from 'next/link';
import { Shield, Award, Users, ChevronRight, CheckCircle } from 'lucide-react';
import { getSectionSettings, AboutPageSettings, BrandingSettings } from '@/lib/cms';

export default async function AboutPage() {
  const [about, branding] = await Promise.all([
    getSectionSettings<AboutPageSettings>('about_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold">{about.title}</h1>
            <p className="mt-4 text-slate-300 text-base max-w-2xl leading-relaxed">
              {about.subtitle}
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-slate-900">Our Story &amp; Heritage</h2>
                <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line space-y-3">
                  <p>{about.story}</p>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl">
                    <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">Our Mission</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{about.mission}</p>
                  </div>
                  <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
                    <h3 className="font-bold text-indigo-900 text-xs uppercase tracking-wider mb-1">Our Vision</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{about.vision}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/request-quote" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-md">
                    Request Consultation <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: 'Quality First', desc: 'We never compromise on OEM equipment certified standards.' },
                  { icon: Award, title: 'Certified Engineers', desc: 'All technicians are in-house trained and background checked.' },
                  { icon: Users, title: 'Customer Trust', desc: 'Over 850+ commercial & residential clients across South India.' },
                  { icon: CheckCircle, title: 'Rapid Support SLA', desc: 'Guaranteed same-day on-site support for service contracts.' },
                ].map((v, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-all">
                    <v.icon size={22} className="text-blue-600 mb-3" />
                    <h3 className="font-bold text-slate-900 text-sm">{v.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
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
