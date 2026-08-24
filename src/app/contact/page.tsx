import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ChevronRight, MessageCircle } from 'lucide-react';
import { getSectionSettings, ContactPageSettings, BrandingSettings } from '@/lib/cms';

export default async function ContactPage() {
  const [contact, branding] = await Promise.all([
    getSectionSettings<ContactPageSettings>('contact_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  const phone = contact.phone || branding.phone || '+91 98765 43210';
  const email = contact.email || branding.email || 'info@techmaha.com';
  const address = contact.address || branding.address || 'TechMaha Tower, Bangalore, Karnataka 560068';
  const hours = contact.working_hours || branding.business_hours || 'Monday – Saturday: 9:00 AM to 7:00 PM';
  const whatsapp = branding.whatsapp_number || '+919876543210';
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold">{contact.title}</h1>
            <p className="mt-3 text-slate-300 text-base max-w-xl">{contact.subtitle}</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-5">Get In Touch Directly</h2>
                  <div className="space-y-4">
                    <ContactItem icon={Phone} label="Direct Helpline" value={phone} sub="Direct voice consultation" />
                    <ContactItem icon={Mail} label="Official Email" value={email} sub="We reply within 4 business hours" />
                    <ContactItem icon={MapPin} label="Office & Warehouse" value={address} sub="Site visits & demo available" />
                    <ContactItem icon={Clock} label="Business Working Hours" value={hours} sub="24/7 Emergency response for AMC clients" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href={`https://wa.me/${cleanWa}?text=Hello%20TechMaha%20team,%20I%20would%20like%20to%20inquire%20about%20your%20services.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-all"
                  >
                    <MessageCircle size={16} /> Chat on WhatsApp ({branding.whatsapp_number || '+91 98765 43210'})
                  </a>
                  <Link
                    href="/request-quote"
                    className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-xs hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Request a Quote <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Map & Facility Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Headquarters &amp; Service Logistics Center</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{address}</p>
                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">GSTIN</span>
                    <p className="font-mono font-bold text-slate-800">{branding.gstin || '29ABCDE1234F1Z5'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Emergency Line</span>
                    <p className="font-semibold text-slate-800">{branding.emergency_phone || phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter branding={branding} />
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, sub }: { icon: React.ComponentType<any>; label: string; value: string; sub: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
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
