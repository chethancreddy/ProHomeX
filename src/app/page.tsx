import Link from 'next/link';
import Image from 'next/image';
import {
  Shield, Zap, Battery, Phone, ArrowRight, ArrowUpRight,
  CheckCircle2, Sparkles, Cpu, Lock, Sun, RefreshCw, Layers,
  Droplets, Lightbulb, Building2, Home as HomeIcon, Factory,
  Check, Award, Clock, Wrench, ShieldCheck, FileCheck2, Camera, Smartphone
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
                  {home_page.hero_subtitle || 'End-to-end engineering infrastructure for residential villas, enterprise campuses, commercial buildings and industrial facilities.'}
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

        {/* REAL ESTATE & COMMERCIAL SECTORS WE SERVE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="eyebrow-text inline-block mb-3 text-black/60 font-mono">
              TARGETED INFRASTRUCTURE SOLUTIONS
            </span>
            <h2 className="headline-text text-3xl sm:text-4xl font-semibold text-black tracking-tight mb-4">
              Engineered for Real-Estate, Commercial &amp; Enterprise Facilities
            </h2>
            <p className="text-base sm:text-lg font-light text-black/75">
              Turnkey security, solar generation, and power resilience tailored specifically to modern property types.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sector 1: Luxury Villas */}
            <div className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[24px] p-6 space-y-4 hover:border-black transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#e6e6e6] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <HomeIcon size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-1">Luxury Villas &amp; Estates</h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Rooftop solar net-metering, discreet perimeter 4K surveillance, smart sump automation &amp; zero-switchover home UPS.
                </p>
              </div>
              <ul className="text-xs text-black/80 space-y-2 pt-2 border-t border-[#e6e6e6]/60">
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> -85% Electricity Bills</li>
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> Aesthetic Hidden Cabling</li>
              </ul>
            </div>

            {/* Sector 2: Tech Parks & Corporate Offices */}
            <div className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[24px] p-6 space-y-4 hover:border-black transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#e6e6e6] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-1">Commercial Offices &amp; Tech Parks</h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Server rack online UPS, ANPR parking cameras, access control, and high-efficiency rooftop power generation.
                </p>
              </div>
              <ul className="text-xs text-black/80 space-y-2 pt-2 border-t border-[#e6e6e6]/60">
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> 100% Server &amp; IT Uptime</li>
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> 24/7 NVR Encrypted Logs</li>
              </ul>
            </div>

            {/* Sector 3: High-Rise Residential Townships */}
            <div className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[24px] p-6 space-y-4 hover:border-black transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#e6e6e6] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <Layers size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-1">Apartments &amp; Townships</h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Automated dual-tank sump motors, club-house solar plants, lift inverter backups &amp; common area IP security.
                </p>
              </div>
              <ul className="text-xs text-black/80 space-y-2 pt-2 border-t border-[#e6e6e6]/60">
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> Dry-Run Motor Protection</li>
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> Centralized App Management</li>
              </ul>
            </div>

            {/* Sector 4: Industrial Warehouses & Factories */}
            <div className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[24px] p-6 space-y-4 hover:border-black transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#e6e6e6] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <Factory size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-1">Industrial Plants &amp; Logistics</h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  High-capacity 3-phase online UPS, commercial CAPEX/OPEX solar arrays, thermal cameras &amp; perimeter radar.
                </p>
              </div>
              <ul className="text-xs text-black/80 space-y-2 pt-2 border-t border-[#e6e6e6]/60">
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> 100+ kVA Scalable Backups</li>
                <li className="flex items-center gap-2"><Check size={13} className="text-[#1ea64a]" /> Tier-1 OEM Direct Support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* VISUAL SOLUTION 1: CCTV SURVEILLANCE (LIME BLOCK + REAL SITE PHOTO) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lime rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-14 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-6 space-y-6">
                <span className="eyebrow-text inline-block text-black/80 font-mono">
                  01 / COMMERCIAL SECURITY &amp; SURVEILLANCE
                </span>
                <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black">
                  AI-Powered 4K CCTV Surveillance Systems
                </h2>
                <p className="text-base sm:text-lg font-light text-black/90 leading-relaxed">
                  High-definition ColorVu &amp; IP camera installations engineered for 24/7 perimeter protection on luxury residences, commercial complexes, and retail showrooms.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">4K ColorVu Full-Color Night Vision</p>
                    <p className="text-[11px] text-black/70">Crystal-clear color imaging even in zero ambient lux.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">AI Human &amp; Vehicle Filtering</p>
                    <p className="text-[11px] text-black/70">Zero false alarms from animals or moving foliage.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Mobile Live-View &amp; Cloud NVR</p>
                    <p className="text-[11px] text-black/70">Encrypted multi-screen streaming on iOS &amp; Android.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">2-Year On-Site Comprehensive Warranty</p>
                    <p className="text-[11px] text-black/70">Guaranteed same-day technician dispatch.</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3.5">
                  <Link
                    href="/cctv"
                    className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-98 shadow-sm"
                  >
                    Explore CCTV Packages <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/request-quote?service=CCTV"
                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-[#f7f7f5] px-6 py-3.5 rounded-full text-xs font-semibold border border-black/15 transition-all"
                  >
                    Get Estimate
                  </Link>
                </div>
              </div>

              {/* Right Column: Large Photo Visual with Live Telemetry */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-[24px] overflow-hidden border border-black/10 shadow-lg bg-black/5 aspect-[16/10]">
                  <Image
                    src="/images/cctv_commercial_security.jpg"
                    alt="CCTV Commercial Security Installation"
                    width={800}
                    height={500}
                    className="object-cover w-full h-full transform hover:scale-102 transition-transform duration-500"
                  />
                  {/* Visual Overlay Status */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-2 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#1ea64a] animate-pulse" />
                    <span>4K AI STREAM · LIVE PERIMETER</span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-black px-4 py-2 rounded-2xl text-xs font-semibold shadow-md border border-black/5 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#1ea64a]" />
                    <span>Authorized Hikvision &amp; Dahua Partner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL SOLUTION 2: SOLAR ROOFTOP PLANTS (LILAC BLOCK + REAL ROOFTOP PHOTO) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lilac rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-14 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Large Rooftop Photo Visual */}
              <div className="lg:col-span-6 order-2 lg:order-1 relative">
                <div className="relative rounded-[24px] overflow-hidden border border-black/10 shadow-lg bg-black/5 aspect-[16/10]">
                  <Image
                    src="/images/solar_rooftop_project.jpg"
                    alt="Rooftop Solar Array on Luxury Building"
                    width={800}
                    height={500}
                    className="object-cover w-full h-full transform hover:scale-102 transition-transform duration-500"
                  />
                  {/* Visual Overlay Status */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-2 border border-white/10">
                    <Sun size={13} className="text-[#ffe066]" />
                    <span>BI-DIRECTIONAL NET-METERING ACTIVE</span>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-black p-3 rounded-2xl text-xs shadow-md border border-black/5">
                    <p className="text-[10px] text-black/60 font-mono uppercase">Direct DBT Subsidy</p>
                    <p className="font-bold text-sm text-black">Up to ₹78,000 Govt. Assistance</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
                <span className="eyebrow-text inline-block text-black/80 font-mono">
                  02 / CLEAN ENERGY INFRASTRUCTURE
                </span>
                <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black">
                  Turnkey Rooftop Solar Power Plants
                </h2>
                <p className="text-base sm:text-lg font-light text-black/90 leading-relaxed">
                  Slash building electricity costs by up to 90% with Tier-1 half-cut monocrystalline solar panels, hybrid storage inverters, and end-to-end DISCOM net-metering approvals.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">25-Year Linear Power Warranty</p>
                    <p className="text-[11px] text-black/70">Tier-1 high-efficiency PV half-cut modules.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Complete Discom Net-Metering</p>
                    <p className="text-[11px] text-black/70">We handle all inspections, meter swaps &amp; approvals.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Smart Generation Monitoring</p>
                    <p className="text-[11px] text-black/70">Real-time daily kWh production &amp; savings app.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Turnkey Structural Engineering</p>
                    <p className="text-[11px] text-black/70">GI wind-resistant mounting &amp; chemical earthing.</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3.5">
                  <Link
                    href="/solar"
                    className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-98 shadow-sm"
                  >
                    Explore Solar Systems <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/request-quote?service=Solar"
                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-[#f7f7f5] px-6 py-3.5 rounded-full text-xs font-semibold border border-black/15 transition-all"
                  >
                    Calculate Solar ROI
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL SOLUTION 3: ONLINE UPS & BATTERY POWER (CORAL BLOCK + REAL SERVER/UPS PHOTO) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-coral rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-14 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-6 space-y-6">
                <span className="eyebrow-text inline-block text-black/80 font-mono">
                  03 / UNINTERRUPTED POWER RESILIENCE
                </span>
                <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black">
                  Zero-Transfer Online UPS &amp; Pure Sine Wave Systems
                </h2>
                <p className="text-base sm:text-lg font-light text-black/90 leading-relaxed">
                  Protect sensitive enterprise equipment, lifts, diagnostic centers, workstations, and high-end residential appliances with 0-millisecond double-conversion power resilience.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">0 ms True Switchover</p>
                    <p className="text-[11px] text-black/70">No reboot or data loss during blackout.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Tubular &amp; LiFePO4 Lithium</p>
                    <p className="text-[11px] text-black/70">Heavy-duty deep cycle batteries with fast recharge.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">1 kVA to 100+ kVA Capacity</p>
                    <p className="text-[11px] text-black/70">Custom engineering from residential to factories.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">3-Year Full Replacement Guarantee</p>
                    <p className="text-[11px] text-black/70">On-site AMC health check &amp; battery care.</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3.5">
                  <Link
                    href="/ups"
                    className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-98 shadow-sm"
                  >
                    Explore UPS Models <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/request-quote?service=UPS"
                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-[#f7f7f5] px-6 py-3.5 rounded-full text-xs font-semibold border border-black/15 transition-all"
                  >
                    Request Load Survey
                  </Link>
                </div>
              </div>

              {/* Right Column: Large Photo Visual */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-[24px] overflow-hidden border border-black/10 shadow-lg bg-black/5 aspect-[16/10]">
                  <Image
                    src="/images/ups_power_datacenter.jpg"
                    alt="Enterprise UPS Power Backup Room"
                    width={800}
                    height={500}
                    className="object-cover w-full h-full transform hover:scale-102 transition-transform duration-500"
                  />
                  {/* Visual Overlay Status */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-2 border border-white/10">
                    <Zap size={13} className="text-[#51cf66]" />
                    <span>0 ms PURE SINE WAVE ONLINE</span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-black px-4 py-2 rounded-2xl text-xs font-semibold shadow-md border border-black/5 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#1ea64a]" />
                    <span>Zero Grid Disruption Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL SOLUTION 4: HOME & SUMP AUTOMATION (MINT BLOCK + SMART INTERIOR PHOTO) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-mint rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-14 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Large Smart Living Photo Visual */}
              <div className="lg:col-span-6 order-2 lg:order-1 relative">
                <div className="relative rounded-[24px] overflow-hidden border border-black/10 shadow-lg bg-black/5 aspect-[16/10]">
                  <Image
                    src="/images/smart_home_automation.jpg"
                    alt="Smart Home & Sump Automation"
                    width={800}
                    height={500}
                    className="object-cover w-full h-full transform hover:scale-102 transition-transform duration-500"
                  />
                  {/* Visual Overlay Status */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-2 border border-white/10">
                    <Cpu size={13} className="text-[#20c997]" />
                    <span>INTELLIGENT DUAL TANK SYNC</span>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-black p-3 rounded-2xl text-xs shadow-md border border-black/5">
                    <p className="text-[10px] text-black/60 font-mono uppercase">Motor Protection</p>
                    <p className="font-bold text-sm text-black">Automatic Dry-Run Cutoff Safe</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
                <span className="eyebrow-text inline-block text-black/80 font-mono">
                  04 / INTELLIGENT WATER &amp; LIGHTING CONTROLS
                </span>
                <h2 className="headline-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black">
                  Smart Sump Management &amp; Glass Touch Automation
                </h2>
                <p className="text-base sm:text-lg font-light text-black/90 leading-relaxed">
                  Eliminate water overflow and motor burnouts forever. Autonomous dual-tank sump-to-overhead pumping controllers with dry-run trip protection, and modular touch switchboards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Auto Sump &amp; Overhead Sync</p>
                    <p className="text-[11px] text-black/70">Ultrasonic contactless depth monitoring.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Dry-Run Trip Safe</p>
                    <p className="text-[11px] text-black/70">Instantly protects expensive submersible motors.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Capacitive Glass Touch Switches</p>
                    <p className="text-[11px] text-black/70">Retrofit into existing standard concealed boxes.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs rounded-[18px] p-4 border border-black/5 space-y-1">
                    <p className="font-bold text-xs text-black">Voice &amp; Smartphone Control</p>
                    <p className="text-[11px] text-black/70">Compatible with Alexa, Google Home &amp; Siri.</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3.5">
                  <Link
                    href="/home-automation"
                    className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-98 shadow-sm"
                  >
                    Explore Automation <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/request-quote?service=Automation"
                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-[#f7f7f5] px-6 py-3.5 rounded-full text-xs font-semibold border border-black/15 transition-all"
                  >
                    Get Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TURNKEY ENGINEERING EXECUTION PROCESS (4 STEPS + CERTIFIED ENGINEERS PHOTO) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Step-by-Step Execution */}
              <div className="lg:col-span-6 space-y-8">
                <div>
                  <span className="eyebrow-text inline-block mb-3 text-black/60 font-mono">
                    ENGINEERING METHODOLOGY
                  </span>
                  <h2 className="headline-text text-3xl sm:text-4xl font-semibold text-black tracking-tight">
                    How We Execute Turnkey Installations
                  </h2>
                  <p className="text-sm sm:text-base font-light text-black/75 mt-2">
                    Transparent, milestone-driven execution managed entirely by full-time in-house ProHomeX certified engineers.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Complimentary On-Site Survey', desc: 'Our senior engineer visits your facility to analyze roof shadow profiles, electrical switchgear, cable routing, and security zones.' },
                    { step: '02', title: 'CAD Engineering & Itemized Estimate', desc: 'Receive an architectural schematic, single-line diagram (SLD), structural calculation, and guaranteed fixed pricing with zero hidden costs.' },
                    { step: '03', title: 'Turnkey Installation & Discom Liaison', desc: 'Execution using concealed conduits, GI structural framing, chemical earthing, and full government/EB net-metering approvals.' },
                    { step: '04', title: 'Commissioning & 24/7 SLA Support', desc: 'Final load testing, mobile app integration, on-site staff training, and handover of manufacturer warranty certificates.' },
                  ].map((item) => (
                    <div key={item.step} className="bg-white border border-[#e6e6e6] rounded-[18px] p-4.5 flex items-start gap-4">
                      <span className="font-mono text-xs font-bold bg-black text-white px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-black">{item.title}</h3>
                        <p className="text-xs text-black/70 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Certified Engineers On-Site Inspection Photo */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-[24px] overflow-hidden border border-black/10 shadow-xl bg-black/5 aspect-[4/3]">
                  <Image
                    src="/images/engineer_site_inspection.jpg"
                    alt="ProHomeX Certified Engineering Team on Site"
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-md flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-black/60 uppercase">Quality Assurance</p>
                      <p className="font-bold text-xs text-black">100% In-House Certified Engineers</p>
                    </div>
                    <span className="text-[10px] font-mono bg-black text-white px-3 py-1 rounded-full font-semibold">
                      NO SUBCONTRACTING
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUTHORIZED OEM TIER-1 BRAND TRUST BAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="eyebrow-text text-black/60 font-mono block mb-2">DIRECT OEM PARTNERSHIPS</span>
            <h3 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">
              Only Genuine Tier-1 Hardware with Direct Manufacturer Warranties
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: 'Hikvision', type: 'CCTV & AI' },
              { name: 'Dahua', type: 'Surveillance' },
              { name: 'SolarEdge', type: 'Solar Inverters' },
              { name: 'Tata Power', type: 'Solar PV' },
              { name: 'Schneider', type: 'Switchgear' },
              { name: 'Luminous', type: 'UPS & Power' },
              { name: 'Microtek', type: 'Pure Sine Wave' },
              { name: 'Exide', type: 'Tubular Batt' },
            ].map((brand) => (
              <div
                key={brand.name}
                className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[16px] p-3.5 text-center hover:border-black transition-colors"
              >
                <p className="font-bold text-xs text-black tracking-tight">{brand.name}</p>
                <p className="text-[9px] font-mono text-black/50 uppercase mt-0.5">{brand.type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Navy Story Block: Engineering Protocols & Ironclad Standards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-navy rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16 text-white">
            <div className="max-w-4xl">
              <span className="eyebrow-text inline-block mb-4 text-white/70 font-mono">
                05 / COMMITMENTS TO PROPERTY OWNERS
              </span>
              <h2 className="display-lg text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-6">
                Why Property &amp; Business Owners Trust ProHomeX
              </h2>
              <p className="text-lg sm:text-xl font-light text-white/80 leading-relaxed mb-12 max-w-2xl">
                We combine tier-1 hardware with certified in-house engineering and ironclad on-site warranties. Zero subcontracting, zero cutting corners.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xs rounded-[20px] p-6 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Authorized OEM Supply</h3>
                  <p className="text-xs font-light text-white/75 leading-relaxed">
                    Direct manufacturer warranties with authentic components from Dahua, Hikvision, Tata Power, Luminous &amp; Microtek.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-[20px] p-6 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Award size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Certified In-House Team</h3>
                  <p className="text-xs font-light text-white/75 leading-relaxed">
                    Every installation is executed, tested, and certified by dedicated technical staff adhering to national safety standards.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-[20px] p-6 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Same-Day Field SLA</h3>
                  <p className="text-xs font-light text-white/75 leading-relaxed">
                    Rapid on-site dispatch, spare replacement buffers, and customized annual maintenance contracts (AMCs).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ALL-IN-ONE UNIFIED BUILDING INFRASTRUCTURE FRAME */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-950 text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16 border border-neutral-800 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Section Header */}
            <div className="max-w-3xl mb-10 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[#dceeb1] text-[11px] font-mono uppercase tracking-widest mb-4">
                <Sparkles size={13} className="text-[#dceeb1]" />
                <span>Unified Master Infrastructure</span>
              </div>
              <h2 className="display-lg text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                All 4 Critical Systems in One Unified Master Frame
              </h2>
              <p className="text-base sm:text-lg font-light text-neutral-300 leading-relaxed">
                Eliminate the headache of managing 4 separate contractors. ProHomeX engineers, installs, and maintains your rooftop solar, AI surveillance, zero-downtime UPS, and smart water sump systems under one single turnkey umbrella.
              </p>
            </div>

            {/* Master Visual Blueprint & Cross-Section View */}
            <div className="relative rounded-[24px] overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl mb-10 group">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/images/unified_building_infrastructure.jpg"
                  alt="All-in-One Building Infrastructure Blueprint & Cross-Section Visual"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover w-full h-full transform group-hover:scale-[1.01] transition-transform duration-700"
                />
                
                {/* Subtle Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40 pointer-events-none" />

                {/* Floating Telemetry Badges on the Master Frame */}
                {/* 1. Solar Rooftop */}
                <div className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white p-3 sm:p-4 rounded-2xl shadow-xl max-w-[210px] sm:max-w-[260px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono">
                      <Sun size={14} /> 01 / SOLAR ARRAY
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-xs font-semibold text-white">Bi-Directional Net-Meter</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Tier-1 Mono PV • Slashing 85% EB Bills</p>
                </div>

                {/* 2. CCTV Perimeter */}
                <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white p-3 sm:p-4 rounded-2xl shadow-xl max-w-[210px] sm:max-w-[260px] text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="flex items-center gap-1.5 text-xs font-bold text-lime-400 font-mono">
                      02 / AI 4K CCTV <Camera size={14} />
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">Perimeter Motion &amp; ANPR</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">ColorVu Night Vision • Encrypted NVR</p>
                </div>

                {/* 3. UPS Datacenter Power */}
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white p-3 sm:p-4 rounded-2xl shadow-xl max-w-[210px] sm:max-w-[260px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400 font-mono">
                      <Zap size={14} /> 03 / ZERO-MS UPS
                    </span>
                    <span className="text-[10px] font-mono bg-orange-950 text-orange-300 border border-orange-800 px-1.5 py-0.5 rounded">0 ms</span>
                  </div>
                  <p className="text-xs font-semibold text-white">Pure Sine Double-Conversion</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Lifepo4/Tubular • Server &amp; Lift Safety</p>
                </div>

                {/* 4. Sump & Smart Automation */}
                <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white p-3 sm:p-4 rounded-2xl shadow-xl max-w-[210px] sm:max-w-[260px] text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">AUTO</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-mono">
                      04 / SUMP AUTO <Cpu size={14} />
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">Dual-Tank Ultrasonic Sync</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Dry-Run Protection • Glass Touch Panels</p>
                </div>
              </div>
            </div>

            {/* 4 Integrated Solution Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link href="/solar" className="bg-neutral-900/90 hover:bg-neutral-800/90 p-5 rounded-2xl border border-neutral-800 hover:border-amber-400/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Sun size={20} />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 group-hover:text-amber-300 flex items-center gap-1">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Solar Rooftop Plants</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  3 kW to 500 kW grid-tied arrays with end-to-end DISCOM liaison and subsidies.
                </p>
              </Link>

              <Link href="/cctv" className="bg-neutral-900/90 hover:bg-neutral-800/90 p-5 rounded-2xl border border-neutral-800 hover:border-lime-400/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
                    <Camera size={20} />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 group-hover:text-lime-300 flex items-center gap-1">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">AI 4K CCTV Systems</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  ColorVu perimeter optics, cloud backup, and AI vehicle/human filtering.
                </p>
              </Link>

              <Link href="/ups" className="bg-neutral-900/90 hover:bg-neutral-800/90 p-5 rounded-2xl border border-neutral-800 hover:border-orange-400/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-orange-400/10 text-orange-400 border border-orange-400/20">
                    <Zap size={20} />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 group-hover:text-orange-300 flex items-center gap-1">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Online UPS Resilience</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  0-millisecond true switchover for lifts, data racks, diagnostic labs &amp; villas.
                </p>
              </Link>

              <Link href="/home-automation" className="bg-neutral-900/90 hover:bg-neutral-800/90 p-5 rounded-2xl border border-neutral-800 hover:border-cyan-400/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                    <Cpu size={20} />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 group-hover:text-cyan-300 flex items-center gap-1">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Water &amp; Smart Controls</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Autonomous dry-run safe sump motors, overflow prevention &amp; glass switchboards.
                </p>
              </Link>
            </div>

            {/* Turnkey Single-Contractor Benefits Banner */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#dceeb1]" />
                  <span className="font-semibold text-white">Single Point of Contact</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#dceeb1]" />
                  <span className="font-semibold text-white">Unified Mobile App &amp; Web Portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#dceeb1]" />
                  <span className="font-semibold text-white">Consolidated Annual AMC</span>
                </div>
              </div>

              <Link
                href="/request-quote"
                className="inline-flex items-center gap-2 bg-[#dceeb1] text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#cbe394] transition-all whitespace-nowrap active:scale-98 shadow-sm"
              >
                Get Complete Building Quote <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Signature Lime Call-to-Action Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block-lime rounded-[28px] md:rounded-[36px] p-10 sm:p-14 md:p-20 text-center">
            <div className="max-w-3xl mx-auto">
              <span className="eyebrow-text inline-block mb-3 text-black/80 font-mono">
                GET STARTED TODAY
              </span>
              <h2 className="display-lg text-3xl sm:text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">
                Ready to Upgrade Your Security or Power?
              </h2>
              <p className="text-base sm:text-lg font-light text-black/80 max-w-xl mx-auto mb-8">
                Request a complimentary on-site engineering assessment and detailed itemized quote tailored to your building.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/request-quote"
                  className="bg-black hover:bg-neutral-900 text-white font-medium px-8 py-4 rounded-full text-xs uppercase tracking-wider transition-all active:scale-98 shadow-sm"
                >
                  Request Assessment
                </Link>
                <a
                  href={`tel:${branding.phone?.replace(/[^0-9+]/g, '') || '+919876543210'}`}
                  className="bg-white hover:bg-[#f7f7f5] text-black font-medium px-8 py-4 rounded-full border border-black/10 hover:border-black text-xs uppercase tracking-wider transition-all active:scale-98"
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
    'REAL ESTATE & COMMERCIAL INFRASTRUCTURE',
    'CERTIFIED IN-HOUSE ENGINEERS',
    'TIER-1 OEM HARDWARE',
    '24/7 RAPID ON-SITE SLA',
    'DISCOM NET-METERING LIAISON',
    '25-YEAR PERFORMANCE WARRANTIES',
    'ZERO SUBCONTRACTING',
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
