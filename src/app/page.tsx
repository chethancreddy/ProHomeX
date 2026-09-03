import Link from 'next/link';
import {
  Shield, Zap, Battery, Phone, ArrowRight, ArrowUpRight,
  CheckCircle2, Sparkles, Cpu, Lock, Sun, RefreshCw, Layers,
  Droplets, Lightbulb
} from 'lucide-react';
import { getAllSiteSettings, HeroShowcaseCard } from '@/lib/cms';
import WhatsAppFloatingButton from '@/components/ui/WhatsAppFloatingButton';
import AnnouncementBar from '@/components/ui/AnnouncementBar';

export const dynamic = 'force-dynamic';

function renderHeroIcon(iconName?: string) {
  switch (iconName) {
    case 'sun': return <Sun size={16} />;
    case 'shield': return <Shield size={16} />;
    case 'battery': return <Battery size={16} />;
    case 'cpu': return <Cpu size={16} />;
    case 'droplets': return <Droplets size={16} />;
    case 'zap': return <Zap size={16} />;
    case 'lightbulb': return <Lightbulb size={16} />;
    case 'lock': return <Lock size={16} />;
    default: return <Sun size={16} />;
  }
}

function getCardColorClass(colorName?: string) {
  switch (colorName) {
    case 'lilac': return 'block-lilac text-black';
    case 'lime': return 'block-lime text-black';
    case 'coral': return 'block-coral text-black';
    case 'mint': return 'block-mint text-black';
    case 'cream': return 'block-cream text-black';
    case 'navy': return 'block-navy text-white';
    default: return 'block-lilac text-black';
  }
}

export default async function HomePage() {
  const settings = await getAllSiteSettings();
  const { branding, home_page, announcement_bar, whatsapp_button } = settings;

  const defaultCards: HeroShowcaseCard[] = [
    {
      id: 'solar',
      slot: 'top',
      enabled: true,
      color: 'lilac',
      icon: 'sun',
      title: home_page.hero_solar_title || 'Rooftop Solar Array',
      subtitle: home_page.hero_solar_subtitle || 'Bi-directional Net Meter',
      tag: home_page.hero_solar_tag || 'Active · 4.8 kW',
      metric_label: home_page.hero_solar_metric_label || 'Daily Clean Energy',
      metric_value: home_page.hero_solar_metric_value || '28.4 kWh Generated',
      badge: home_page.hero_solar_badge || '-85% EB Bill',
    },
    {
      id: 'cctv',
      slot: 'middle',
      enabled: true,
      color: 'lime',
      icon: 'shield',
      title: home_page.hero_cctv_title || 'Perimeter Security Node',
      subtitle: home_page.hero_cctv_subtitle || '4K ColorVu AI Stream',
      tag: home_page.hero_cctv_tag || 'LIVE',
      metric_label: home_page.hero_cctv_metric_label || 'Intelligent Detection',
      metric_value: home_page.hero_cctv_metric_value || 'Human & Vehicle Recognized',
      badge: home_page.hero_cctv_badge || '24/7 NVR Encrypted',
    },
    {
      id: 'ups',
      slot: 'bottom_left',
      enabled: true,
      color: 'coral',
      icon: 'battery',
      title: home_page.hero_ups_title || 'UPS Backup',
      subtitle: home_page.hero_ups_subtitle || 'Pure Sine Wave · 100%',
      tag: '0 ms',
      metric_label: 'Switchover',
      metric_value: home_page.hero_ups_value || '0 ms',
      badge: 'Online Pure Sine',
    },
    {
      id: 'sump',
      slot: 'bottom_right',
      enabled: true,
      color: 'mint',
      icon: 'cpu',
      title: home_page.hero_sump_title || 'Auto Sump',
      subtitle: home_page.hero_sump_subtitle || 'Dry-Run Trip Safe',
      tag: 'Auto Mode',
      metric_label: 'Tank Level',
      metric_value: home_page.hero_sump_value || '92% Level',
      badge: 'Trip Safe',
    },
  ];

  const activeCards: HeroShowcaseCard[] = (home_page.hero_cards && home_page.hero_cards.length > 0)
    ? home_page.hero_cards
    : defaultCards;

  const topCard = activeCards.find(c => c.slot === 'top' && c.enabled !== false);
  const middleCard = activeCards.find(c => c.slot === 'middle' && c.enabled !== false);
  const bottomLeftCard = activeCards.find(c => c.slot === 'bottom_left' && c.enabled !== false);
  const bottomRightCard = activeCards.find(c => c.slot === 'bottom_right' && c.enabled !== false);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar settings={announcement_bar} />

      {/* Navigation */}
      <PublicNav branding={branding} />

      <main className="space-y-16 md:space-y-24 pb-24">
        {/* Hero Section: Signature Editorial Color-Block */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
          <div className="bg-[#f5eedb] border border-black/10 rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16 shadow-xs relative overflow-hidden">
            {/* Ambient decorative subtle color accents */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#c5b0f4]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#dceeb1]/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Editorial Headline & Actions */}
              <div className="lg:col-span-7 space-y-6">
                {home_page.hero_badge && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-black/10 bg-white/80 backdrop-blur-xs text-xs font-mono tracking-wider uppercase shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1ea64a] animate-pulse" />
                    <span className="text-black font-semibold">{home_page.hero_badge}</span>
                  </div>
                )}

                <h1 className="display-xl text-black font-normal tracking-tight">
                  {home_page.hero_title || 'Smart Security, Reliable Power & Sustainable Solar Energy.'}
                </h1>

                <p className="text-lg sm:text-xl text-black/85 font-light leading-relaxed max-w-xl">
                  {home_page.hero_subtitle || 'End-to-end engineering infrastructure for residential, enterprise, and industrial sites.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <Link
                    href="/request-quote"
                    className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium px-8 py-4 rounded-full transition-all duration-150 active:scale-98 text-sm shadow-md"
                  >
                    {home_page.hero_cta_primary || 'Get Free Quote'} <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-4 rounded-full border border-black/20 hover:border-black transition-all duration-150 active:scale-98 text-sm shadow-xs"
                  >
                    <Phone size={16} /> {branding.phone || 'Talk to Team'}
                  </Link>
                </div>

                {/* Dynamic Metric Badges */}
                {home_page.stats && home_page.stats.length > 0 && (
                  <div className="pt-6 border-t border-black/10 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {home_page.stats.map((stat, idx) => (
                      <div key={idx} className="p-3.5 rounded-[18px] border border-black/5 bg-white/85 backdrop-blur-xs shadow-xs">
                        <p className="text-2xl sm:text-3xl font-light text-black font-mono tracking-tight">{stat.value}</p>
                        <p className="text-[10px] text-black/60 font-mono uppercase tracking-wider mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Figma-style Pastel Interactive Infrastructure Showcase */}
              <div className="lg:col-span-5 relative space-y-4">
                {/* Slot 1: Top Banner Tile */}
                {topCard && (
                  <div className={`${getCardColorClass(topCard.color)} rounded-[24px] p-6 transition-transform duration-300 hover:scale-[1.01] border border-black/10 shadow-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                          {renderHeroIcon(topCard.icon)}
                        </div>
                        <div>
                          <p className="font-bold text-xs">{topCard.title}</p>
                          <p className="text-[10px] opacity-75 font-mono">{topCard.subtitle}</p>
                        </div>
                      </div>
                      {topCard.tag && (
                        <div className="flex items-center gap-1.5">
                          {topCard.tag.toUpperCase() === 'LIVE' ? (
                            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-0.5 rounded-full border border-black/5">
                              <span className="w-2 h-2 rounded-full bg-[#1ea64a] animate-pulse" />
                              <span className="text-[10px] font-mono font-bold text-black">{topCard.tag}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono bg-black text-white font-semibold px-2.5 py-1 rounded-full">
                              {topCard.tag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {(topCard.metric_label || topCard.metric_value || topCard.badge) && (
                      <div className="bg-white/90 text-black backdrop-blur-xs rounded-[16px] p-3.5 border border-black/5 flex items-center justify-between text-xs shadow-xs">
                        <div>
                          {topCard.metric_label && (
                            <span className="text-[10px] text-black/60 uppercase font-mono block">{topCard.metric_label}</span>
                          )}
                          {topCard.metric_value && (
                            <strong className="text-sm font-mono text-black font-bold">{topCard.metric_value}</strong>
                          )}
                        </div>
                        {topCard.badge && (
                          <span className="text-[11px] font-semibold text-black bg-black/5 px-2.5 py-0.5 rounded-full border border-black/5">
                            {topCard.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Slot 2: Middle Banner Tile */}
                {middleCard && (
                  <div className={`${getCardColorClass(middleCard.color)} rounded-[24px] p-6 transition-transform duration-300 hover:scale-[1.01] border border-black/10 shadow-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                          {renderHeroIcon(middleCard.icon)}
                        </div>
                        <div>
                          <p className="font-bold text-xs">{middleCard.title}</p>
                          <p className="text-[10px] opacity-75 font-mono">{middleCard.subtitle}</p>
                        </div>
                      </div>
                      {middleCard.tag && (
                        <div className="flex items-center gap-1.5">
                          {middleCard.tag.toUpperCase() === 'LIVE' ? (
                            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-0.5 rounded-full border border-black/5">
                              <span className="w-2 h-2 rounded-full bg-[#1ea64a] animate-pulse" />
                              <span className="text-[10px] font-mono font-bold text-black">{middleCard.tag}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono bg-black text-white font-semibold px-2.5 py-1 rounded-full">
                              {middleCard.tag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {(middleCard.metric_label || middleCard.metric_value || middleCard.badge) && (
                      <div className="bg-white/90 text-black backdrop-blur-xs rounded-[16px] p-3.5 border border-black/5 flex items-center justify-between text-xs shadow-xs">
                        <div>
                          {middleCard.metric_label && (
                            <span className="text-[10px] text-black/60 uppercase font-mono block">{middleCard.metric_label}</span>
                          )}
                          {middleCard.metric_value && (
                            <strong className="text-xs font-mono text-black font-bold">{middleCard.metric_value}</strong>
                          )}
                        </div>
                        {middleCard.badge && (
                          <span className="text-[10px] font-mono bg-black text-white px-2.5 py-0.5 rounded-full">
                            {middleCard.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Slot 3 & 4: Bottom Split Half Tiles */}
                {(bottomLeftCard || bottomRightCard) && (
                  <div className="grid grid-cols-2 gap-4">
                    {bottomLeftCard && (
                      <div className={`${getCardColorClass(bottomLeftCard.color)} rounded-[22px] p-4 border border-black/10 shadow-sm flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderHeroIcon(bottomLeftCard.icon)}
                            <span className="text-xs font-bold">{bottomLeftCard.title}</span>
                          </div>
                          <p className="text-xl font-mono font-bold leading-none">{bottomLeftCard.metric_value || bottomLeftCard.tag}</p>
                        </div>
                        <p className="text-[10px] opacity-75 mt-2 font-medium">{bottomLeftCard.subtitle || bottomLeftCard.badge}</p>
                      </div>
                    )}

                    {bottomRightCard && (
                      <div className={`${getCardColorClass(bottomRightCard.color)} rounded-[22px] p-4 border border-black/10 shadow-sm flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderHeroIcon(bottomRightCard.icon)}
                            <span className="text-xs font-bold">{bottomRightCard.title}</span>
                          </div>
                          <p className="text-xl font-mono font-bold leading-none">{bottomRightCard.metric_value || bottomRightCard.tag}</p>
                        </div>
                        <p className="text-[10px] opacity-75 mt-2 font-medium">{bottomRightCard.subtitle || bottomRightCard.badge}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Trust Strip */}
        <MarqueeStrip />

        {/* Story Color-Block Section 1: CCTV (Lime Block) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lime rounded-[24px] p-8 sm:p-12 md:p-16 transition-all duration-300">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                01 / SURVEILLANCE &amp; INTELLIGENCE
              </span>
              <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black mb-6">
                AI-Powered CCTV Surveillance Systems
              </h2>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-8">
                High-definition IP and ColorVu camera systems engineered for clarity 24/7. Continuous remote monitoring, tamper detection, and intelligent perimeter analytics.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">4K Ultra HD &amp; Night Vision</p>
                  <p className="text-xs text-black/70 mt-1">Full spectrum ColorVu sensor arrays</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Mobile Live-View</p>
                  <p className="text-xs text-black/70 mt-1">iOS and Android encrypted streaming</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Cloud &amp; NVR Storage</p>
                  <p className="text-xs text-black/70 mt-1">30 to 90 days retention with failover</p>
                </div>
              </div>

              <Link
                href="/cctv"
                className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-7 py-3.5 rounded-full text-sm font-medium transition-all active:scale-98"
              >
                Explore CCTV Packages <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Story Color-Block Section 2: Solar (Lilac Block) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lilac rounded-[24px] p-8 sm:p-12 md:p-16 transition-all duration-300">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                02 / CLEAN ENERGY INFRASTRUCTURE
              </span>
              <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black mb-6">
                Turnkey Solar Rooftop Power Plants
              </h2>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-8">
                Harness clean energy with Tier-1 bifacial panels, hybrid inverters, and seamless net-metering approvals. Save up to 90% on utility bills with direct MNRE government subsidy assistance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">MNRE Subsidy Support</p>
                  <p className="text-xs text-black/70 mt-1">Up to ₹78,000 direct DBT subsidy</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Net-Metering Approvals</p>
                  <p className="text-xs text-black/70 mt-1">Complete EB liaisoning &amp; grid sync</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">25-Year Performance</p>
                  <p className="text-xs text-black/70 mt-1">Tier-1 manufacturer warranty backed</p>
                </div>
              </div>

              <Link
                href="/solar"
                className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-7 py-3.5 rounded-full text-sm font-medium transition-all active:scale-98"
              >
                Explore Solar Solutions <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Story Color-Block Section 3: UPS (Coral Block) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-coral rounded-[24px] p-8 sm:p-12 md:p-16 transition-all duration-300">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                03 / UNINTERRUPTED POWER
              </span>
              <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black mb-6">
                Online UPS &amp; Pure Sine Wave Backup
              </h2>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-8">
                Zero transfer time systems for workstations, server racks, medical gear, and whole-home resilience. Powered by heavy-duty tubular and lithium battery packs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Zero Millisecond Transfer</p>
                  <p className="text-xs text-black/70 mt-1">True online double-conversion tech</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Tubular &amp; LiFePO4</p>
                  <p className="text-xs text-black/70 mt-1">Extended cycle life &amp; fast recharge</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Surge Protection</p>
                  <p className="text-xs text-black/70 mt-1">Shields sensitive electronics</p>
                </div>
              </div>

              <Link
                href="/ups"
                className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-7 py-3.5 rounded-full text-sm font-medium transition-all active:scale-98"
              >
                Explore UPS Models <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Story Color-Block Section 4: Home Automation (Mint Block) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-mint rounded-[24px] p-8 sm:p-12 md:p-16 transition-all duration-300">
            <div className="max-w-3xl">
              <span className="eyebrow-text inline-block mb-4 text-black/80 font-mono">
                04 / SMART CONTROLS
              </span>
              <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black mb-6">
                Smart Sump &amp; Lighting Automation
              </h2>
              <p className="text-lg sm:text-xl font-light text-black/90 leading-relaxed mb-8">
                Autonomous water level management with dry-run protection, scheduled motor cycles, touch switches, and centralized sensor hubs for effortless living.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Auto Sump Controller</p>
                  <p className="text-xs text-black/70 mt-1">Dry-run trip &amp; overhead tank sync</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Glass Touch Switches</p>
                  <p className="text-xs text-black/70 mt-1">Retrofit Wi-Fi &amp; Zigbee modules</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xs rounded-[16px] p-4 border border-black/5">
                  <p className="font-semibold text-sm text-black">Smart Schedule</p>
                  <p className="text-xs text-black/70 mt-1">App control with voice integration</p>
                </div>
              </div>

              <Link
                href="/home-automation"
                className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-7 py-3.5 rounded-full text-sm font-medium transition-all active:scale-98"
              >
                Explore Automation <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Navy Story Block: Why ProHomeX */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-navy rounded-[24px] p-8 sm:p-12 md:p-16 text-white">
            <div className="max-w-4xl">
              <span className="eyebrow-text inline-block mb-4 text-white/70 font-mono">
                05 / ENGINEERING PROTOCOLS
              </span>
              <h2 className="display-lg text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-6">
                Why Industry Leaders Choose ProHomeX
              </h2>
              <p className="text-lg sm:text-xl font-light text-white/80 leading-relaxed mb-12 max-w-2xl">
                We combine tier-1 hardware with certified in-house engineering and ironclad on-site warranties. No subcontracting, no shortcuts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xs rounded-[20px] p-6 border border-white/10">
                  <span className="font-mono text-xs text-white/60 uppercase tracking-widest block mb-3">STANDARD 01</span>
                  <h3 className="text-lg font-semibold text-white mb-2">Authorized OEM Supply</h3>
                  <p className="text-sm font-light text-white/70 leading-relaxed">
                    Direct manufacturer warranties with authentic components from Dahua, Hikvision, Tata Power, Luminous &amp; Microtek.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-[20px] p-6 border border-white/10">
                  <span className="font-mono text-xs text-white/60 uppercase tracking-widest block mb-3">STANDARD 02</span>
                  <h3 className="text-lg font-semibold text-white mb-2">Certified In-House Team</h3>
                  <p className="text-sm font-light text-white/70 leading-relaxed">
                    Every installation is executed, tested, and certified by dedicated technical staff adhering to national safety standards.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-[20px] p-6 border border-white/10">
                  <span className="font-mono text-xs text-white/60 uppercase tracking-widest block mb-3">STANDARD 03</span>
                  <h3 className="text-lg font-semibold text-white mb-2">Same-Day Field SLA</h3>
                  <p className="text-sm font-light text-white/70 leading-relaxed">
                    Rapid on-site dispatch, spare replacement buffers, and customized annual maintenance contracts (AMCs).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Signature Lime Call-to-Action Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lime rounded-[24px] p-10 sm:p-14 md:p-20 text-center">
            <div className="max-w-3xl mx-auto">
              <span className="eyebrow-text inline-block mb-3 text-black/80 font-mono">
                GET STARTED TODAY
              </span>
              <h2 className="display-lg text-3xl sm:text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">
                Ready to Upgrade Your Security or Energy?
              </h2>
              <p className="text-base sm:text-lg font-light text-black/80 max-w-xl mx-auto mb-8">
                Request a complimentary on-site engineering assessment and detailed estimate tailored to your site requirements.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/request-quote"
                  className="bg-black hover:bg-neutral-900 text-white font-medium px-8 py-4 rounded-full text-sm transition-all active:scale-98 shadow-none"
                >
                  Request Assessment
                </Link>
                <a
                  href={`tel:${branding.phone?.replace(/[^0-9+]/g, '') || '+919876543210'}`}
                  className="bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-4 rounded-full border border-black/10 hover:border-black text-sm transition-all active:scale-98"
                >
                  Call {branding.phone || '+91 98765 43210'}
                </a>
              </div>
            </div>
          </div>
        </section>
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-lg tracking-tight text-black flex items-center gap-1">
            <span>{branding.company_name || 'ProHomeX'}</span>
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
      </div>
    </header>
  );
}

function MarqueeStrip() {
  const items = [
    'CERTIFIED IN-HOUSE ENGINEERS',
    'TIER-1 OEM HARDWARE',
    '24/7 RAPID ON-SITE SLA',
    'TURNKEY INFRASTRUCTURE',
    'MNRE GOVT SUBSIDY LIAISONING',
    '25-YEAR PERFORMANCE WARRANTIES',
    'RESIDENTIAL & INDUSTRIAL SOLUTIONS',
  ];

  return (
    <div className="bg-black text-white py-3 overflow-hidden select-none border-y border-neutral-800">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono tracking-widest">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center gap-8">
            <span className="text-white/90">{item}</span>
            <span className="text-white/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function PublicFooter({ branding }: { branding: any }) {
  return (
    <footer className="bg-white text-black border-t border-[#e6e6e6] pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <p className="font-bold text-xl tracking-tight text-black">{branding.company_name || 'ProHomeX'}</p>
            <p className="text-black/70 text-sm leading-relaxed max-w-sm">
              {branding.tagline || 'Smart Security, Reliable Power & Sustainable Solar Energy Solutions.'}
            </p>
            {branding.gstin && <p className="font-mono text-xs text-black/50">GSTIN: {branding.gstin}</p>}
          </div>

          <div>
            <p className="caption-text text-black/60 mb-4 font-mono">SOLUTIONS</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/cctv" className="text-black hover:opacity-60 transition-opacity">CCTV Surveillance</Link></li>
              <li><Link href="/solar" className="text-black hover:opacity-60 transition-opacity">Solar Rooftop Plants</Link></li>
              <li><Link href="/ups" className="text-black hover:opacity-60 transition-opacity">UPS Power Backup</Link></li>
              <li><Link href="/home-automation" className="text-black hover:opacity-60 transition-opacity">Home &amp; Sump Automation</Link></li>
              <li><Link href="/request-quote" className="text-black hover:opacity-60 transition-opacity">Request a Quote</Link></li>
            </ul>
          </div>

          <div>
            <p className="caption-text text-black/60 mb-4 font-mono">COMPANY</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-black hover:opacity-60 transition-opacity">About Us</Link></li>
              <li><Link href="/contact" className="text-black hover:opacity-60 transition-opacity">Contact &amp; Support</Link></li>
              <li><Link href="/login" className="text-black hover:opacity-60 transition-opacity">Customer Portal</Link></li>
            </ul>
          </div>

          <div>
            <p className="caption-text text-black/60 mb-4 font-mono">CONTACT</p>
            <div className="space-y-2 text-sm text-black">
              <p className="font-medium">{branding.phone || '+91 98765 43210'}</p>
              <p className="text-black/70">{branding.email || 'info@prohomex.com'}</p>
              <p className="text-black/60 text-xs leading-relaxed mt-2">{branding.address}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#f1f1f1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/50 font-mono">
          <p>© {new Date().getFullYear()} {branding.company_name || 'ProHomeX'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

