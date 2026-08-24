-- ============================================================
-- ProHomeX: Website CMS & Site Settings
-- Migration 010 — Run in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);

-- Allow admins full management of site settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Seed Default CMS Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('branding', '{
    "company_name": "ProHomeX Systems & Solutions",
    "tagline": "Smart Security, Reliable Power & Sustainable Solar Energy",
    "phone": "+91 98765 43210",
    "emergency_phone": "+91 98765 43211",
    "whatsapp_number": "+919876543210",
    "email": "info@prohomex.com",
    "support_email": "support@prohomex.com",
    "address": "ProHomeX Tower, 100 Feet Ring Road, Bangalore, Karnataka 560068",
    "gstin": "29ABCDE1234F1Z5",
    "business_hours": "Monday – Saturday: 9:00 AM – 7:00 PM",
    "facebook_url": "https://facebook.com",
    "instagram_url": "https://instagram.com",
    "linkedin_url": "https://linkedin.com",
    "youtube_url": "https://youtube.com"
  }'::jsonb),

  ('whatsapp_button', '{
    "enabled": true,
    "phone": "+919876543210",
    "default_message": "Hello ProHomeX team! I would like to get a quote and consultation for installation services.",
    "position": "bottom-right",
    "pulse_animation": true,
    "popup_text": "Need instant assistance? Chat with ProHomeX on WhatsApp!"
  }'::jsonb),

  ('announcement_bar', '{
    "enabled": false,
    "text": "🎉 Special Promotion: Free site survey & 10% instant discount on CCTV & Solar installations this month!",
    "link": "/request-quote",
    "bg_color": "blue"
  }'::jsonb),

  ('home_page', '{
    "hero_badge": "Certified Installation & Maintenance Partner",
    "hero_title": "Enterprise Security, Solar & Power Backup Solutions",
    "hero_subtitle": "From high-definition CCTV surveillance and rooftop solar to uninterrupted UPS power backup — ProHomeX delivers turnkey engineering for homes, offices, and industries.",
    "hero_cta_primary": "Get Free Quote",
    "hero_cta_secondary": "Explore Solutions",
    "stats": [
      {"label": "Successful Installations", "value": "1,200+"},
      {"label": "Satisfied Clients", "value": "850+"},
      {"label": "Cities Covered", "value": "15+"},
      {"label": "Rapid Support", "value": "24/7 SLA"}
    ],
    "why_choose_us": [
      {"title": "Authorized OEM Brands", "desc": "We only supply certified cameras, tier-1 solar panels, and pure sine-wave UPS systems with direct manufacturer warranties."},
      {"title": "Trained In-House Engineers", "desc": "No subcontracting. Every project is executed and certified by ProHomeX certified field engineers."},
      {"title": "Same-Day Dispatch & SLA Support", "desc": "Fast on-site resolution, emergency backup support, and scheduled annual maintenance contracts."}
    ]
  }'::jsonb),

  ('cctv_page', '{
    "hero_title": "HD CCTV Surveillance & Smart Security",
    "hero_subtitle": "Keep your home, retail showroom, office, and industrial warehouse safe with AI-powered CCTV cameras, remote mobile monitoring, and night vision.",
    "starting_price": "₹7,999",
    "warranty_text": "2-Year Comprehensive On-Site Warranty on all cameras and DVR/NVR recorders.",
    "features": [
      "2MP, 4MP, 5MP, and 8MP 4K Ultra-HD Resolution",
      "Full Color Night Vision with Smart White LEDs",
      "AI Motion Detection, Line Crossing & Human/Vehicle Filtering",
      "Remote Live View on iOS, Android, and PC",
      "Cloud & Local NVR Backup with H.265+ Compression"
    ]
  }'::jsonb),

  ('solar_page', '{
    "hero_title": "Rooftop Solar Power & Net-Metering",
    "hero_subtitle": "Cut your electricity bills by up to 90% with Tier-1 On-Grid, Off-Grid, and Hybrid Solar systems with government subsidy support.",
    "subsidy_text": "Direct MNRE / Government Subsidy assistance up to ₹78,000 for residential rooftops.",
    "warranty_text": "25-Year Performance Warranty on Solar PV Modules & 5-Year Inverter Warranty.",
    "features": [
      "Monocrystalline High-Efficiency Half-Cut Solar Panels",
      "Complete Net-Metering Approval & Discom Liaison",
      "Hybrid Inverters with Lithium-Ion Battery Storage",
      "Real-time Smartphone Generation Monitoring App",
      "Turnkey Installation with GI Structure & Earthing"
    ]
  }'::jsonb),

  ('ups_page', '{
    "hero_title": "Industrial & Home UPS Power Backup",
    "hero_subtitle": "Zero-millisecond switchover UPS and inverter systems to protect sensitive electronics, servers, medical equipment, and workstations from outages.",
    "warranty_text": "3-Year Replacement Guarantee on Tubular & Lithium Batteries.",
    "features": [
      "Pure Sine Wave Online & Line-Interactive UPS",
      "Heavy-duty Tall Tubular & Lithium Ferro Phosphate (LiFePO4) Batteries",
      "Scalable from 1 kVA Home Backups to 100+ kVA Industrial Plants",
      "Auto-Overload & Short Circuit Protection",
      "Periodic Health-Check and Water Topping AMC Services"
    ]
  }'::jsonb),

  ('about_page', '{
    "title": "About ProHomeX Systems",
    "subtitle": "Building reliable, sustainable, and intelligent infrastructure across India since 2018.",
    "story": "ProHomeX was founded with a clear vision: to deliver enterprise-grade engineering excellence in surveillance, renewable energy, and power backup with uncompromising transparency.",
    "mission": "To empower homes and businesses with clean energy, reliable power, and 24/7 security through superior engineering and rapid on-site customer service.",
    "vision": "To be the most trusted infrastructure partner for security and clean energy solutions across South India."
  }'::jsonb),

  ('contact_page', '{
    "title": "Contact ProHomeX",
    "subtitle": "Speak directly with our technical consultants for site assessments, quotes, or support tickets.",
    "phone": "+91 98765 43210",
    "email": "info@prohomex.com",
    "address": "ProHomeX Tower, 100 Feet Ring Road, Bangalore, Karnataka 560068",
    "working_hours": "Monday – Saturday: 9:00 AM – 7:00 PM (Emergency 24/7 helpline available)"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
