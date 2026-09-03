import Link from 'next/link';
import { 
  Cpu, 
  Droplets, 
  Lightbulb, 
  Sliders, 
  Smartphone, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Gauge, 
  Lock, 
  SunMedium, 
  Sparkles,
  ToggleRight,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function HomeAutomationPage() {
  const [automation, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('automation_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <PublicNav branding={branding} />

      <main className="space-y-16 md:space-y-24 py-10 md:py-16">
        {/* Hero Section: Signature Mint Block */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-mint rounded-[24px] p-8 sm:p-12 md:p-16">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                SOLUTIONS / IOT &amp; HOME AUTOMATION
              </span>
              <h1 className="display-lg text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black mb-6">
                {automation.hero_title || 'Smart Sump & Motion Lighting Automation'}
              </h1>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-6">
                {automation.hero_subtitle || 'Autonomous water level management with dry-run protection, scheduled motor cycles, capacitive touch glass switches, and smart sensor hubs.'}
              </p>

              {automation.starting_price && (
                <div className="inline-block bg-black text-white px-4 py-1.5 rounded-full text-xs font-mono mb-8">
                  Controllers Starting from <strong className="text-white font-bold">{automation.starting_price}</strong>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3.5">
                <Link 
                  href="/request-quote?service=Home Automation" 
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full transition-all active:scale-98 text-sm"
                >
                  Configure Automation Quote <ArrowRight size={16} />
                </Link>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black transition-all active:scale-98 text-sm"
                >
                  Technical Consultation ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1: Automatic Sump Motor Control */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f7f7f5] rounded-[24px] p-8 sm:p-12 md:p-16 border border-[#e6e6e6]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="eyebrow-text text-black/60 font-mono block mb-2">WATER LEVEL MANAGEMENT</span>
                <h2 className="headline-text text-3xl font-semibold text-black tracking-tight mb-4">
                  Intelligent Sump &amp; Overhead Tank Controller
                </h2>
                <p className="text-sm sm:text-base font-light text-black/80 leading-relaxed mb-8">
                  Never worry about water overflow, dry pump motor burnout, or manual valve switching again. Our smart microcontroller monitors underground sumps and overhead tanks continuously.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { title: 'Continuous Level Monitoring', desc: 'Precision magnetic and ultrasonic level probes.' },
                    { title: 'Auto ON / Auto OFF', desc: 'Fills overhead tank automatically and shuts off at 100%.' },
                    { title: 'Dry-Run & Overload Cutoff', desc: 'Instantly trips motor if sump is dry or voltage fluctuates.' },
                    { title: 'Manual Override Switch', desc: 'Physical manual bypass for emergency operation.' },
                    { title: 'Live Telemetry Dashboard', desc: 'Check motor ON/OFF state and tank water levels in app.' },
                    { title: 'Digital Audit Logs', desc: 'Logs start, stop, fault, and dry-run events.' },
                  ].map((feat, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-[16px] border border-[#e6e6e6] flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#c8e6cd] text-[#1ea64a] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black">{feat.title}</h4>
                        <p className="text-[11px] text-black/60 mt-0.5 leading-tight">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sump Graphic Telemetry Card */}
              <div className="bg-black text-white rounded-[24px] p-6 sm:p-8 space-y-5 border border-black shadow-lg">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                      <Gauge size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">SumpMaster Pro Controller</h4>
                      <p className="text-[11px] text-[#1ea64a] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1ea64a] animate-pulse" /> Telemetry Live · Auto Mode
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-white/10 text-white px-3 py-1 rounded-full">
                    230V · 4.2A
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-neutral-900 p-4 rounded-[16px] border border-neutral-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-neutral-300 font-medium">Overhead Tank</span>
                      <span className="text-[#c8e6cd] font-bold font-mono">82% Full</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#c8e6cd] h-full rounded-full w-[82%]" />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5 font-mono">Auto-cut threshold: 95% full</p>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-[16px] border border-neutral-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-neutral-300 font-medium">Underground Sump</span>
                      <span className="text-[#dceeb1] font-bold font-mono">68% Safe</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#dceeb1] h-full rounded-full w-[68%]" />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5 font-mono">Dry-run safety floor: 15%</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Motor State: <strong className="text-white">STANDBY (OFF)</strong></span>
                  <div className="flex items-center gap-1.5 text-[#1ea64a]">
                    <ShieldCheck size={16} />
                    <span className="text-[11px] font-semibold">Dry-Run Trip Safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Sensor Lights & Switches */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sensor Card Mockup */}
            <div className="order-2 lg:order-1 bg-black text-white rounded-[24px] p-6 sm:p-8 space-y-4 border border-black shadow-lg">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Motion &amp; Lux Zone Matrix</h4>
                    <p className="text-[11px] text-neutral-400">PIR + Microwave Radar Nodes</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-white/10 text-white px-3 py-1 rounded-full">
                  Daylight Active
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { zone: 'Main Staircase', sensor: 'PIR Motion 360°', state: 'AUTO (ON)', delay: '45s delay', color: 'text-[#1ea64a]' },
                  { zone: 'Corridor & Foyer', sensor: 'Microwave 5.8GHz', state: 'AUTO (OFF)', delay: 'No motion', color: 'text-neutral-400' },
                  { zone: 'Master Bathroom', sensor: 'Occupancy Sensor', state: 'AUTO (ON)', delay: '3m timer', color: 'text-[#1ea64a]' },
                  { zone: 'Parking & Porch', sensor: 'PIR + Lux Sensor', state: 'NIGHT AUTO', delay: 'Triggers <20 Lux', color: 'text-[#c5b0f4]' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-neutral-900 p-3.5 rounded-[14px] border border-neutral-800 text-xs">
                    <div>
                      <p className="font-semibold text-white">{r.zone}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{r.sensor} · {r.delay}</p>
                    </div>
                    <span className={`font-mono font-bold ${r.color}`}>{r.state}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
                <span>Capacitive Glass Touch Panels: <strong className="text-white">Active</strong></span>
                <ToggleRight size={18} className="text-[#c5b0f4]" />
              </div>
            </div>

            {/* Text Description */}
            <div className="order-1 lg:order-2">
              <span className="eyebrow-text text-black/60 font-mono block mb-2">ENERGY SAVING</span>
              <h2 className="headline-text text-3xl font-semibold text-black tracking-tight mb-4">
                Sensor Motion Lights &amp; Smart Glass Switches
              </h2>
              <p className="text-sm sm:text-base font-light text-black/80 leading-relaxed mb-6">
                Cut lighting electricity consumption by up to 40% with occupancy-sensing automations and luxury capacitive glass touch switchboards for residences and corporate offices.
              </p>

              <div className="space-y-3.5">
                {[
                  { title: 'Sub-Second Motion Detection', desc: 'PIR infrared and 5.8GHz Doppler radar detect presence instantly.' },
                  { title: 'Configurable Inactivity Auto-OFF', desc: 'Choose precise shut-off timers (10s to 15m) to eliminate lights left ON by mistake.' },
                  { title: 'Daylight / Lux Threshold Harvesting', desc: 'Lights only activate when natural sunlight is low, preventing daytime waste.' },
                  { title: 'Capacitive Glass Touch Panels & App', desc: 'Backlit tempered glass switchboards with remote smartphone and voice control.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#c8e6cd] text-[#1ea64a] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-black">{item.title}</h4>
                      <p className="text-xs text-black/60 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Modular Smart Modules */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="eyebrow-text text-black/60 font-mono block mb-2">MODULAR ARCHITECTURE</span>
            <h2 className="headline-text text-3xl font-semibold text-black tracking-tight">Smart Modules for Every Zone</h2>
            <p className="text-black/70 text-sm mt-1">Deploy standalone controllers or combine them into a unified automated facility.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Droplets, title: 'Sump & Tank Controller', desc: 'Dual-tank water level automation with dry-run trip safety and cyclic motor timer.', badge: 'Popular' },
              { icon: Lightbulb, title: 'Motion & Radar Lights', desc: 'Auto-turn on upon entry and shut off on timer in staircases, corridors and bathrooms.', badge: 'Energy Saver' },
              { icon: Sliders, title: 'Capacitive Touch Panels', desc: 'Luxury tempered glass touch switchboards with Wi-Fi / Zigbee connectivity.', badge: 'Luxury' },
              { icon: Lock, title: 'Biometric Smart Locks', desc: 'Fingerprint, passcode, RFID card, and mobile unlock for high-security entrance.', badge: 'Security' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-[#e6e6e6] p-6 hover:border-black transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#f7f7f5] text-black flex items-center justify-center">
                      <card.icon size={20} />
                    </div>
                    <span className="caption-text bg-[#f7f7f5] text-black font-mono px-2.5 py-1 rounded-full border border-[#e6e6e6]">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-black text-base mb-2">{card.title}</h3>
                  <p className="text-xs text-black/70 leading-relaxed">{card.desc}</p>
                </div>
                <Link 
                  href="/request-quote?service=Home Automation" 
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-black hover:opacity-60 transition-opacity"
                >
                  Include in Quote <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-mint rounded-[24px] p-10 sm:p-16 text-center">
            <div className="max-w-2xl mx-auto">
              <span className="eyebrow-text text-black/80 font-mono block mb-2">SMART LIVING</span>
              <h2 className="display-lg text-3xl sm:text-4xl font-semibold text-black mb-4">Ready to Automate Your Property?</h2>
              <p className="text-sm font-light text-black/80 mb-8">
                Turnkey installation and testing executed by certified IoT engineers within 48 hours.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <Link 
                  href="/request-quote?service=Home Automation" 
                  className="bg-black hover:bg-neutral-900 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all active:scale-98"
                >
                  Request Automation Quote
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-3.5 rounded-full border border-black/10 hover:border-black text-sm transition-all active:scale-98"
                >
                  Contact Automation Team
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
          <Link href="/ups" className="hover:opacity-60 transition-opacity">UPS</Link>
          <Link href="/home-automation" className="text-black font-semibold">Automation</Link>
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
            href="/request-quote?service=Home Automation"
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

