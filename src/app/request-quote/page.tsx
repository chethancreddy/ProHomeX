import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getSectionSettings, QuotePageSettings, BrandingSettings, WhatsAppButtonSettings } from '@/lib/cms';
import WhatsAppFloatingButton from '@/components/ui/WhatsAppFloatingButton';
import QuoteFormClient from './QuoteFormClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSectionSettings<QuotePageSettings>('quote_page');
  return {
    title: `${settings.title || 'Request a Free Quote'} | ProHomeX`,
    description: settings.subtitle || 'Get a customized quote for CCTV, Solar, UPS, and Home Automation systems.',
  };
}

export default async function RequestQuotePage() {
  const [quoteSettings, branding, whatsapp] = await Promise.all([
    getSectionSettings<QuotePageSettings>('quote_page'),
    getSectionSettings<BrandingSettings>('branding'),
    getSectionSettings<WhatsAppButtonSettings>('whatsapp_button'),
  ]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white flex flex-col justify-between">
      <div>
        <PublicNav branding={branding} />

        <main className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header / Hero */}
            <div className="max-w-3xl mb-10 md:mb-12">
              {quoteSettings.badge && (
                <span className="eyebrow-text inline-block mb-3 text-black/60 font-mono">
                  {quoteSettings.badge}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black mb-3">
                {quoteSettings.title || 'Request a Free Quote'}
              </h1>
              <p className="text-base sm:text-lg font-light text-black/80 leading-relaxed">
                {quoteSettings.subtitle ||
                  'Fill in your details and our team will prepare a customised quotation. No commitment required.'}
              </p>
            </div>

            {/* Client Form */}
            <Suspense
              fallback={
                <div className="py-24 text-center text-xs font-mono text-black/40">
                  Loading quote calculator...
                </div>
              }
            >
              <QuoteFormClient settings={quoteSettings} branding={branding} />
            </Suspense>
          </div>
        </main>
      </div>

      <PublicFooter branding={branding} />

      {/* Floating WhatsApp Button */}
      {whatsapp?.enabled && <WhatsAppFloatingButton settings={whatsapp} />}
    </div>
  );
}

function PublicNav({ branding }: { branding: any }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-black flex items-center gap-1">
          <span>{branding?.company_name || 'ProHomeX'}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-normal text-black">
          <Link href="/cctv" className="hover:opacity-60 transition-opacity">CCTV</Link>
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
    <footer className="bg-white text-black border-t border-[#e6e6e6] pt-12 pb-8 text-sm mt-16">
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
