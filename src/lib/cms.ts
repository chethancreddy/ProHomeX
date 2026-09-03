import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export interface BrandingSettings {
  company_name: string;
  tagline: string;
  phone: string;
  emergency_phone: string;
  whatsapp_number: string;
  email: string;
  support_email: string;
  address: string;
  gstin: string;
  business_hours: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}

export interface WhatsAppButtonSettings {
  enabled: boolean;
  phone: string;
  default_message: string;
  position: 'bottom-right' | 'bottom-left';
  pulse_animation: boolean;
  popup_text: string;
}

export interface AnnouncementBarSettings {
  enabled: boolean;
  text: string;
  link: string;
  bg_color: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
}

export interface HeroShowcaseCard {
  id: string;
  slot: 'top' | 'middle' | 'bottom_left' | 'bottom_right';
  enabled: boolean;
  color: 'lilac' | 'lime' | 'coral' | 'mint' | 'cream' | 'navy';
  icon: 'sun' | 'shield' | 'battery' | 'cpu' | 'droplets' | 'zap' | 'lightbulb' | 'lock';
  title: string;
  subtitle: string;
  tag: string;
  metric_label: string;
  metric_value: string;
  badge: string;
}

export interface HomePageSettings {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  stats: { label: string; value: string }[];
  why_choose_us: { title: string; desc: string }[];
  // Full configurable hero showcase card array
  hero_cards?: HeroShowcaseCard[];
  // Legacy fallback fields
  hero_solar_title?: string;
  hero_solar_subtitle?: string;
  hero_solar_tag?: string;
  hero_solar_metric_label?: string;
  hero_solar_metric_value?: string;
  hero_solar_badge?: string;
  hero_cctv_title?: string;
  hero_cctv_subtitle?: string;
  hero_cctv_tag?: string;
  hero_cctv_metric_label?: string;
  hero_cctv_metric_value?: string;
  hero_cctv_badge?: string;
  hero_ups_title?: string;
  hero_ups_value?: string;
  hero_ups_subtitle?: string;
  hero_sump_title?: string;
  hero_sump_value?: string;
  hero_sump_subtitle?: string;
}

export interface ServicePageSettings {
  hero_title: string;
  hero_subtitle: string;
  starting_price?: string;
  subsidy_text?: string;
  warranty_text?: string;
  features: string[];
}

export interface AboutPageSettings {
  title: string;
  subtitle: string;
  story: string;
  mission: string;
  vision: string;
}

export interface ContactPageSettings {
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
  working_hours: string;
}

export interface AllSiteSettings {
  branding: BrandingSettings;
  whatsapp_button: WhatsAppButtonSettings;
  announcement_bar: AnnouncementBarSettings;
  home_page: HomePageSettings;
  cctv_page: ServicePageSettings;
  solar_page: ServicePageSettings;
  ups_page: ServicePageSettings;
  automation_page: ServicePageSettings;
  about_page: AboutPageSettings;
  contact_page: ContactPageSettings;
}

export const DEFAULT_SITE_SETTINGS: AllSiteSettings = {
  branding: {
    company_name: 'ProHomeX Systems & Solutions',
    tagline: 'Smart Security, Reliable Power & Sustainable Solar Energy',
    phone: '+91 98765 43210',
    emergency_phone: '+91 98765 43211',
    whatsapp_number: '+919876543210',
    email: 'info@prohomex.com',
    support_email: 'support@prohomex.com',
    address: 'ProHomeX Tower, 100 Feet Ring Road, Bangalore, Karnataka 560068',
    gstin: '29ABCDE1234F1Z5',
    business_hours: 'Monday – Saturday: 9:00 AM – 7:00 PM',
    facebook_url: 'https://facebook.com',
    instagram_url: 'https://instagram.com',
    linkedin_url: 'https://linkedin.com',
    youtube_url: 'https://youtube.com',
  },
  whatsapp_button: {
    enabled: true,
    phone: '+919876543210',
    default_message: 'Hello ProHomeX team! I would like to get a quote and consultation for installation services.',
    position: 'bottom-right',
    pulse_animation: true,
    popup_text: 'Need quick help? Chat with ProHomeX on WhatsApp!',
  },
  announcement_bar: {
    enabled: false,
    text: '🎉 Special Promotion: Free site survey & 10% instant discount on CCTV & Solar installations this month!',
    link: '/request-quote',
    bg_color: 'blue',
  },
  home_page: {
    hero_badge: 'Certified Installation & Maintenance Partner',
    hero_title: 'Enterprise Security, Solar & Power Backup Solutions',
    hero_subtitle: 'From high-definition CCTV surveillance and rooftop solar to uninterrupted UPS power backup — ProHomeX delivers turnkey engineering for homes, offices, and industries.',
    hero_cta_primary: 'Get Free Quote',
    hero_cta_secondary: 'Explore Solutions',
    stats: [
      { label: 'Successful Installations', value: '1,200+' },
      { label: 'Satisfied Clients', value: '850+' },
      { label: 'Cities Covered', value: '15+' },
      { label: 'Rapid Support', value: '24/7 SLA' },
    ],
    why_choose_us: [
      { title: 'Authorized OEM Brands', desc: 'We only supply certified cameras, tier-1 solar panels, and pure sine-wave UPS systems with direct manufacturer warranties.' },
      { title: 'Trained In-House Engineers', desc: 'No subcontracting. Every project is executed and certified by ProHomeX certified field engineers.' },
      { title: 'Same-Day Dispatch & SLA Support', desc: 'Fast on-site resolution, emergency backup support, and scheduled annual maintenance contracts.' },
    ],
    // Hero Live Infrastructure Showcase Cards Configurable Array
    hero_cards: [
      {
        id: 'solar',
        slot: 'top',
        enabled: true,
        color: 'lilac',
        icon: 'sun',
        title: 'Rooftop Solar Array',
        subtitle: 'Bi-directional Net Meter',
        tag: 'Active · 4.8 kW',
        metric_label: 'Daily Clean Energy',
        metric_value: '28.4 kWh Generated',
        badge: '-85% EB Bill',
      },
      {
        id: 'cctv',
        slot: 'middle',
        enabled: true,
        color: 'lime',
        icon: 'shield',
        title: 'Perimeter Security Node',
        subtitle: '4K ColorVu AI Stream',
        tag: 'LIVE',
        metric_label: 'Intelligent Detection',
        metric_value: 'Human & Vehicle Recognized',
        badge: '24/7 NVR Encrypted',
      },
      {
        id: 'ups',
        slot: 'bottom_left',
        enabled: true,
        color: 'coral',
        icon: 'battery',
        title: 'UPS Backup',
        subtitle: 'Pure Sine Wave · 100%',
        tag: '0 ms',
        metric_label: 'Switchover',
        metric_value: '0 ms',
        badge: 'Online Double Conv',
      },
      {
        id: 'sump',
        slot: 'bottom_right',
        enabled: true,
        color: 'mint',
        icon: 'cpu',
        title: 'Auto Sump',
        subtitle: 'Dry-Run Trip Safe',
        tag: 'Auto Mode',
        metric_label: 'Tank Level',
        metric_value: '92% Level',
        badge: 'Auto Cutoff Safe',
      },
    ],
    // Legacy flat defaults
    hero_solar_title: 'Rooftop Solar Array',
    hero_solar_subtitle: 'Bi-directional Net Meter',
    hero_solar_tag: 'Active · 4.8 kW',
    hero_solar_metric_label: 'Daily Clean Energy',
    hero_solar_metric_value: '28.4 kWh Generated',
    hero_solar_badge: '-85% EB Bill',
    hero_cctv_title: 'Perimeter Security Node',
    hero_cctv_subtitle: '4K ColorVu AI Stream',
    hero_cctv_tag: 'LIVE',
    hero_cctv_metric_label: 'Intelligent Detection',
    hero_cctv_metric_value: 'Human & Vehicle Recognized',
    hero_cctv_badge: '24/7 NVR Encrypted',
    hero_ups_title: 'UPS Backup',
    hero_ups_value: '0 ms',
    hero_ups_subtitle: 'Pure Sine Wave · 100%',
    hero_sump_title: 'Auto Sump',
    hero_sump_value: '92% Level',
    hero_sump_subtitle: 'Dry-Run Trip Safe',
  },
  cctv_page: {
    hero_title: 'HD CCTV Surveillance & Smart Security',
    hero_subtitle: 'Keep your home, retail showroom, office, and industrial warehouse safe with AI-powered CCTV cameras, remote mobile monitoring, and night vision.',
    starting_price: '₹7,999',
    warranty_text: '2-Year Comprehensive On-Site Warranty on all cameras and DVR/NVR recorders.',
    features: [
      '2MP, 4MP, 5MP, and 8MP 4K Ultra-HD Resolution',
      'Full Color Night Vision with Smart White LEDs',
      'AI Motion Detection, Line Crossing & Human/Vehicle Filtering',
      'Remote Live View on iOS, Android, and PC',
      'Cloud & Local NVR Backup with H.265+ Compression',
    ],
  },
  solar_page: {
    hero_title: 'Rooftop Solar Power & Net-Metering',
    hero_subtitle: 'Cut your electricity bills by up to 90% with Tier-1 On-Grid, Off-Grid, and Hybrid Solar systems with government subsidy support.',
    subsidy_text: 'Direct MNRE / Government Subsidy assistance up to ₹78,000 for residential rooftops.',
    warranty_text: '25-Year Performance Warranty on Solar PV Modules & 5-Year Inverter Warranty.',
    features: [
      'Monocrystalline High-Efficiency Half-Cut Solar Panels',
      'Complete Net-Metering Approval & Discom Liaison',
      'Hybrid Inverters with Lithium-Ion Battery Storage',
      'Real-time Smartphone Generation Monitoring App',
      'Turnkey Installation with GI Structure & Earthing',
    ],
  },
  ups_page: {
    hero_title: 'Industrial & Home UPS Power Backup',
    hero_subtitle: 'Zero-millisecond switchover UPS and inverter systems to protect sensitive electronics, servers, medical equipment, and workstations from outages.',
    warranty_text: '3-Year Replacement Guarantee on Tubular & Lithium Batteries.',
    features: [
      'Pure Sine Wave Online & Line-Interactive UPS',
      'Heavy-duty Tall Tubular & Lithium Ferro Phosphate (LiFePO4) Batteries',
      'Scalable from 1 kVA Home Backups to 100+ kVA Industrial Plants',
      'Auto-Overload & Short Circuit Protection',
      'Periodic Health-Check and Water Topping AMC Services',
    ],
  },
  automation_page: {
    hero_title: 'Intelligent Home Automation & Sump Control',
    hero_subtitle: 'Experience effortless living with automated water sump motor management, motion-sensor smart lighting, Wi-Fi glass switches, and centralized security.',
    starting_price: '₹4,499',
    warranty_text: '2-Year Replacement Warranty on all Smart Controllers & Ultrasonic Sensors.',
    features: [
      'Automatic Dual-Tank Sump & Overhead Water Motor Control with Dry-Run Trip Protection',
      'PIR & Microwave Motion Sensor Lighting with Lux Daylight Harvesting',
      'Capacitive Tempered Glass Smart Touch Switches with Smartphone & Voice Control',
      'Real-time Water Level Depth Monitoring & History Event Logs',
      'Modular Zigbee 3.0 & Matter Mesh Gateway supporting 128+ smart devices',
    ],
  },
  about_page: {
    title: 'About ProHomeX Systems',
    subtitle: 'Building reliable, sustainable, and intelligent infrastructure across India since 2018.',
    story: 'ProHomeX was founded with a clear vision: to deliver enterprise-grade engineering excellence in surveillance, renewable energy, and power backup with uncompromising transparency.',
    mission: 'To empower homes and businesses with clean energy, reliable power, and 24/7 security through superior engineering and rapid on-site customer service.',
    vision: 'To be the most trusted infrastructure partner for security and clean energy solutions across South India.',
  },
  contact_page: {
    title: 'Contact ProHomeX',
    subtitle: 'Speak directly with our technical consultants for site assessments, quotes, or support tickets.',
    phone: '+91 98765 43210',
    email: 'info@prohomex.com',
    address: 'ProHomeX Tower, 100 Feet Ring Road, Bangalore, Karnataka 560068',
    working_hours: 'Monday – Saturday: 9:00 AM – 7:00 PM (Emergency 24/7 helpline available)',
  },
};

export async function getAllSiteSettings(): Promise<AllSiteSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('site_settings').select('key, value');

    if (error || !data || data.length === 0) {
      return DEFAULT_SITE_SETTINGS;
    }

    const settingsMap: any = { ...DEFAULT_SITE_SETTINGS };
    for (const row of data) {
      if (row.key && row.value) {
        settingsMap[row.key] = {
          ...(DEFAULT_SITE_SETTINGS[row.key as keyof AllSiteSettings] || {}),
          ...row.value,
        };
      }
    }

    return settingsMap as AllSiteSettings;
  } catch (err) {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getSectionSettings<T>(key: keyof AllSiteSettings): Promise<T> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle();

    if (error || !data || !data.value) {
      return DEFAULT_SITE_SETTINGS[key] as unknown as T;
    }

    return {
      ...(DEFAULT_SITE_SETTINGS[key] as any),
      ...data.value,
    } as T;
  } catch {
    return DEFAULT_SITE_SETTINGS[key] as unknown as T;
  }
}
