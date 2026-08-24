import Link from 'next/link';
import { 
  Cpu, 
  Droplets, 
  Lightbulb, 
  Sliders, 
  Smartphone, 
  Activity, 
  ShieldCheck, 
  CheckCircle, 
  ChevronRight, 
  ArrowRight, 
  Zap, 
  Gauge, 
  Lock, 
  SunMedium, 
  Sparkles,
  ToggleRight
} from 'lucide-react';
import { getSectionSettings, ServicePageSettings, BrandingSettings } from '@/lib/cms';

export default async function HomeAutomationPage() {
  const [automation, branding] = await Promise.all([
    getSectionSettings<ServicePageSettings>('automation_page'),
    getSectionSettings<BrandingSettings>('branding'),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-5">
                <Sparkles size={13} /> Next-Gen Smart Home &amp; IoT Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                {automation.hero_title}
              </h1>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                {automation.hero_subtitle}
              </p>
              {automation.starting_price && (
                <div className="mt-4 inline-block bg-indigo-600/30 border border-indigo-400/30 px-3.5 py-1 rounded-xl text-xs text-indigo-200">
                  Automation Controllers Starting from <span className="font-bold text-white font-mono text-sm">{automation.starting_price}</span>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link 
                  href="/request-quote?service=Home Automation" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg transition-all"
                >
                  Configure Automation Quote <ChevronRight size={14} />
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  Technical Consultation ({branding.phone || '+91 98765 43210'})
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1: Automatic Sump Motor Control */}
        <section className="py-16 bg-slate-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wide mb-3">
                  <Droplets size={14} className="text-blue-600" /> Water Management System
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                  Intelligent Automatic Sump &amp; Tank Motor Controller
                </h2>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Never worry about water overflow, dry pump running, or manual switching again. Our smart microcontroller monitors underground sumps and overhead tanks 24/7.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Continuous Level Monitoring', desc: 'Precision ultrasonic and magnetic sensors track water levels across both tanks.' },
                    { title: 'Auto ON / Auto OFF', desc: 'Starts pump when overhead tank is low and stops when tank reaches 100% capacity.' },
                    { title: 'Dry-Run & Overload Cutoff', desc: 'Instantly trips motor if sump is dry or voltage fluctuations exceed safe limits.' },
                    { title: 'Manual Bypass Switch', desc: 'Physical manual rocker override for immediate emergency operation.' },
                    { title: 'Live Dashboard Status', desc: 'Check motor ON/OFF state, pump voltage, and water depth percentage on mobile.' },
                    { title: 'Audit History Logs', desc: 'Comprehensive digital log of all start, stop, fault, and dry-run events.' },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sump Graphic / Visual Telemetry Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Gauge size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">SumpMaster Pro 2000X</h4>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Telemetry Live · Auto Mode
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                    230V · 4.2A
                  </span>
                </div>

                {/* Overhead & Sump Level Bars */}
                <div className="space-y-4">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Overhead Tank Level</span>
                      <span className="text-blue-400 font-bold font-mono">82% (High)</span>
                    </div>
                    <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full w-[82%]" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Auto-cut threshold: 95% full</p>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Underground Sump Level</span>
                      <span className="text-emerald-400 font-bold font-mono">68% (Safe)</span>
                    </div>
                    <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[68%]" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Dry-run safety floor: 15%</p>
                  </div>
                </div>

                {/* Quick Action Toggle Preview */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Motor State: <strong className="text-white">STANDBY (OFF)</strong></span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-[11px] font-semibold">Dry-Run Protection Active</span>
                    <ShieldCheck size={16} className="text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Sensor-Based Lighting & Switches */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Sensor Card Mockup */}
              <div className="order-2 lg:order-1 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Room &amp; Zone Automation</h4>
                      <p className="text-[11px] text-slate-400">PIR + Microwave Radar Nodes</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-1 rounded-lg">
                    Daylight Active
                  </span>
                </div>

                {/* Rooms Matrix */}
                <div className="space-y-3">
                  {[
                    { zone: 'Main Staircase', sensor: 'PIR Motion 360°', state: 'AUTO (ON)', delay: '45s off delay', color: 'text-emerald-400' },
                    { zone: 'Corridor & Foyer', sensor: 'Microwave 5.8GHz', state: 'AUTO (OFF)', delay: 'No motion detected', color: 'text-slate-400' },
                    { zone: 'Master Bathroom', sensor: 'Ceiling Occupancy', state: 'AUTO (ON)', delay: 'Inactivity 3m', color: 'text-emerald-400' },
                    { zone: 'Parking & Porch', sensor: 'PIR + Lux Sensor', state: 'NIGHT AUTO', delay: 'Triggers <20 Lux', color: 'text-indigo-400' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
                      <div>
                        <p className="font-bold text-white">{r.zone}</p>
                        <p className="text-[10px] text-slate-400">{r.sensor} · {r.delay}</p>
                      </div>
                      <span className={`font-mono font-bold ${r.color}`}>{r.state}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Capacitive Glass Touch Panels: <strong>Active</strong></span>
                  <ToggleRight size={18} className="text-indigo-400" />
                </div>
              </div>

              {/* Text Description */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wide mb-3">
                  <Zap size={14} className="text-amber-600" /> Energy Efficient Lighting
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                  Sensor-Based Motion Lights &amp; Smart Glass Switches
                </h2>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Save up to 40% on lighting electricity bills with occupancy-sensing automations and luxury capacitive touch switches designed for modern homes and commercial buildings.
                </p>

                <div className="mt-6 space-y-3.5">
                  {[
                    { title: 'Sub-Second Motion Detection', desc: 'Ultra-sensitive PIR infrared and 5.8GHz Doppler microwave sensors detect presence instantly upon entry.' },
                    { title: 'Configurable Inactivity Auto-OFF', desc: 'Choose precise turn-off delay intervals (10s, 30s, 1m, 5m, 15m) to eliminate lights left on by accident.' },
                    { title: 'Daylight / Lux Threshold Harvesting', desc: 'Lights only turn ON when natural sunlight is dim, preventing wasteful daytime triggers.' },
                    { title: 'Smart Touch Panels & Smartphone App', desc: 'Backlit capacitive glass switchboards with remote voice control via Alexa & Google Home.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Modular Future-Proof Ecosystem */}
        <section className="py-16 bg-slate-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900">
                Modular Smart Architecture for Every Room
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Start with sump automation or sensor lights and expand your system over time without changing wiring or hubs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Droplets, title: 'Sump & Tank Automation', desc: 'Dual-tank water level controller with dry-run trip prevention and cyclic timer.', badge: 'Popular' },
                { icon: Lightbulb, title: 'PIR & Radar Sensor Lights', desc: 'Auto-turn on upon entry and shut off after timer in staircases and bathrooms.', badge: 'Energy Saver' },
                { icon: Sliders, title: 'Capacitive Smart Switches', desc: 'Luxury tempered glass touch switchboards with Wi-Fi / Zigbee 3.0 connectivity.', badge: 'Luxury' },
                { icon: Lock, title: 'Biometric Smart Locks', desc: 'Fingerprint, passcode, RFID card, and remote mobile unlock for maximum security.', badge: 'Security' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <card.icon size={22} />
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{card.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{card.desc}</p>
                  </div>
                  <Link 
                    href="/request-quote?service=Home Automation" 
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Include in Quote <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-700 to-blue-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold">Ready to Upgrade to Smart Home Automation?</h2>
            <p className="mt-3 text-indigo-100 text-sm max-w-xl mx-auto">
              Our certified automation engineers perform on-site electrical surveys and turnkey installation within 48 hours.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link 
                href="/request-quote?service=Home Automation" 
                className="bg-white text-indigo-700 font-bold px-7 py-3 rounded-xl text-xs hover:bg-indigo-50 transition-all shadow-lg"
              >
                Request Custom Automation Quote
              </Link>
              <Link 
                href="/contact" 
                className="bg-indigo-800/60 hover:bg-indigo-800 border border-white/20 text-white font-bold px-7 py-3 rounded-xl text-xs transition-all"
              >
                Contact Engineers ({branding.phone || '+91 98765 43210'})
              </Link>
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
        <Link href="/" className="font-bold text-xl text-slate-900 flex items-center gap-0.5">
          <span className="text-blue-600 font-extrabold">ProHome</span><span className="text-slate-900 font-extrabold">X</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {[
            ['CCTV', '/cctv'],
            ['Solar', '/solar'],
            ['UPS', '/ups'],
            ['Automation', '/home-automation'],
            ['About', '/about'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/request-quote?service=Home Automation" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Get Quote
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicFooter({ branding }: { branding: any }) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link href="/" className="font-bold text-white text-base">
          <span className="text-blue-400 font-extrabold">ProHome</span>X
        </Link>
        <span>© {new Date().getFullYear()} {branding?.company_name || 'ProHomeX'}. All rights reserved.</span>
      </div>
    </footer>
  );
}
