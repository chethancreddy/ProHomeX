import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowRight, MessageCircle, ArrowUpRight } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <PublicNav branding={branding} />

      <main className="space-y-16 md:space-y-24 py-10 md:py-16">
        {/* Header Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="eyebrow-text inline-block mb-3 text-black/60 font-mono">
              CONTACT &amp; FIELD SUPPORT
            </span>
            <h1 className="display-lg text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black mb-4">
              {contact.title || 'Get In Touch With Engineering'}
            </h1>
            <p className="text-lg sm:text-xl font-light text-black/80 leading-relaxed">
              {contact.subtitle || 'Connect directly with our solutions team for on-site surveys, equipment quotes, and technical support.'}
            </p>
          </div>
        </section>

        {/* Contact Info & Map Card */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="eyebrow-text text-black/60 font-mono block mb-4">DIRECT CHANNELS</span>
                <div className="space-y-4">
                  <ContactItem icon={Phone} label="Central Engineering Helpline" value={phone} sub="Direct technical consultation & inquiries" />
                  <ContactItem icon={Mail} label="Official Communications" value={email} sub="Guaranteed response within 4 business hours" />
                  <ContactItem icon={MapPin} label="Logistics & Experience Center" value={address} sub="Live equipment demo & walkthrough available" />
                  <ContactItem icon={Clock} label="Operational Hours" value={hours} sub="24/7 Priority SLA response for active AMC clients" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href={`https://wa.me/${cleanWa}?text=Hello%20ProHomeX%20team,%20I%20would%20like%20to%20inquire%20about%20your%20services.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1ea64a] hover:bg-[#188c3e] text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all active:scale-98"
                >
                  <MessageCircle size={16} /> WhatsApp Consultation
                </a>
                <Link
                  href="/request-quote"
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all active:scale-98"
                >
                  Request a Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Logistics & Facility Card */}
            <div className="lg:col-span-5 bg-[#f7f7f5] border border-[#e6e6e6] rounded-[24px] p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-4">
                  <MapPin size={22} />
                </div>
                <span className="caption-text text-black/60 font-mono block mb-1">REGIONAL HEADQUARTERS</span>
                <h3 className="text-xl font-bold text-black tracking-tight mb-2">Central Operations &amp; Dispatch Facility</h3>
                <p className="text-xs text-black/70 leading-relaxed">{address}</p>
              </div>

              <div className="pt-6 border-t border-[#e6e6e6] grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-black/50 font-mono text-[10px] uppercase block">GSTIN / TAX ID</span>
                  <p className="font-mono font-bold text-black mt-0.5">{branding.gstin || '29ABCDE1234F1Z5'}</p>
                </div>
                <div>
                  <span className="text-black/50 font-mono text-[10px] uppercase block">EMERGENCY LINE</span>
                  <p className="font-medium text-black mt-0.5">{branding.emergency_phone || phone}</p>
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
    <div className="flex gap-4 p-4 rounded-[20px] border border-[#e6e6e6] bg-white hover:border-black transition-all">
      <div className="w-10 h-10 rounded-full bg-[#f7f7f5] text-black flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="caption-text text-black/50 font-mono">{label}</p>
        <p className="text-sm font-semibold text-black mt-0.5">{value}</p>
        <p className="text-xs text-black/60 mt-0.5">{sub}</p>
      </div>
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
          <Link href="/about" className="hover:opacity-60 transition-opacity">About</Link>
          <Link href="/contact" className="text-black font-semibold">Contact</Link>
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

