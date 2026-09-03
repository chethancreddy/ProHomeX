'use client';

import { useState, useTransition } from 'react';
import {
  Globe, MessageCircle, Building2, Megaphone, Home,
  Shield, Sun, Battery, Info, PhoneCall, Save, CheckCircle,
  AlertCircle, Sparkles, ExternalLink, RefreshCw, Cpu
} from 'lucide-react';
import { AllSiteSettings, HeroShowcaseCard } from '@/lib/cms';
import { saveSiteSettings } from './actions';

interface Props {
  initialSettings: AllSiteSettings;
}

export default function CMSManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState<AllSiteSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<string>('whatsapp');
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  function handleSave(key: keyof AllSiteSettings) {
    setErrorMessage('');
    startTransition(async () => {
      const res = await saveSiteSettings(key, settings[key]);
      if (res.success) {
        showToast(`Saved ${key.replace('_', ' ').toUpperCase()} successfully!`);
      } else {
        setErrorMessage(res.error || 'Failed to save changes.');
      }
    });
  }

  const tabs = [
    { id: 'whatsapp', label: 'Floating WhatsApp', icon: MessageCircle, badge: settings.whatsapp_button.enabled ? 'Active' : 'Off' },
    { id: 'branding', label: 'Company & Contact', icon: Building2 },
    { id: 'announcement', label: 'Announcement Bar', icon: Megaphone, badge: settings.announcement_bar.enabled ? 'Live' : 'Off' },
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'cctv', label: 'CCTV Page', icon: Shield },
    { id: 'solar', label: 'Solar Page', icon: Sun },
    { id: 'ups', label: 'UPS Page', icon: Battery },
    { id: 'automation', label: 'Automation Page', icon: Cpu },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact Page', icon: PhoneCall },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Globe size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Website Content &amp; CMS Studio</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Update public website texts, floating WhatsApp button, contact details, and marketing copy in real time.
              </p>
            </div>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <ExternalLink size={13} /> View Live Website
        </a>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-xl flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle size={16} className="text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-xl flex items-center gap-2 shadow-sm">
          <AlertCircle size={16} className="text-red-600" />
          {errorMessage}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Tabs */}
        <div className="md:col-span-1 space-y-1.5 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Pages &amp; Widgets</p>
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                  {t.label}
                </span>
                {t.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-white/20 text-white' : t.badge === 'Active' || t.badge === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content Editor Card */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          {/* TAB 1: Floating WhatsApp Button */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle size={18} className="text-emerald-600" /> WhatsApp Floating Button &amp; Instant Chat
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Customers clicking this floating icon on any public page will directly start a WhatsApp conversation with your sales/support desk.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('whatsapp_button')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save WhatsApp Settings'}
                </button>
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-emerald-900">Enable Floating WhatsApp Widget</p>
                  <p className="text-xs text-emerald-700">Display the WhatsApp chat button on all customer-facing pages.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_button.enabled}
                    onChange={e => setSettings({
                      ...settings,
                      whatsapp_button: { ...settings.whatsapp_button, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp Phone Number (with Country Code) *</label>
                  <input
                    type="text"
                    value={settings.whatsapp_button.phone}
                    onChange={e => setSettings({
                      ...settings,
                      whatsapp_button: { ...settings.whatsapp_button, phone: e.target.value }
                    })}
                    placeholder="+919876543210"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">E.g., +919876543210 (digits only with + sign, no hyphens).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Popup Tooltip / Teaser Text</label>
                  <input
                    type="text"
                    value={settings.whatsapp_button.popup_text}
                    onChange={e => setSettings({
                      ...settings,
                      whatsapp_button: { ...settings.whatsapp_button, popup_text: e.target.value }
                    })}
                    placeholder="Need quick help? Chat with TechMaha on WhatsApp!"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pre-filled Customer Message *</label>
                <textarea
                  rows={3}
                  value={settings.whatsapp_button.default_message}
                  onChange={e => setSettings({
                    ...settings,
                    whatsapp_button: { ...settings.whatsapp_button, default_message: e.target.value }
                  })}
                  placeholder="Hello TechMaha team! I would like to get a quote and consultation for installation services."
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">When customers click the WhatsApp button, this message is pre-typed ready for them to send.</p>
              </div>

              {/* Pulse Animation & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Pulse Glow Effect</p>
                    <p className="text-[11px] text-gray-400">Subtle animated glow ring to attract user attention.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_button.pulse_animation}
                    onChange={e => setSettings({
                      ...settings,
                      whatsapp_button: { ...settings.whatsapp_button, pulse_animation: e.target.checked }
                    })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Screen Position</label>
                  <select
                    value={settings.whatsapp_button.position}
                    onChange={e => setSettings({
                      ...settings,
                      whatsapp_button: { ...settings.whatsapp_button, position: e.target.value as any }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="bottom-right">Bottom Right (Standard)</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Company Branding & Contact Info */}
          {activeTab === 'branding' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Building2 size={18} className="text-blue-600" /> Company Identity &amp; Global Contact
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Used across navbar, footer, quotation letterhead, and tax invoices.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('branding')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save Branding'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    value={settings.branding.company_name}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, company_name: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tagline / Slogan</label>
                  <input
                    type="text"
                    value={settings.branding.tagline}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, tagline: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Hotline Phone</label>
                  <input
                    type="text"
                    value={settings.branding.phone}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, phone: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">24/7 Emergency Line</label>
                  <input
                    type="text"
                    value={settings.branding.emergency_phone}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, emergency_phone: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">General Email</label>
                  <input
                    type="email"
                    value={settings.branding.email}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, email: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Office / Warehouse Address</label>
                  <textarea
                    rows={2}
                    value={settings.branding.address}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, address: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">GSTIN (for Invoices &amp; Tax)</label>
                  <input
                    type="text"
                    value={settings.branding.gstin}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, gstin: e.target.value }
                    })}
                    placeholder="29ABCDE1234F1Z5"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <label className="block text-xs font-bold text-gray-700 uppercase mt-2 mb-1">Business Working Hours</label>
                  <input
                    type="text"
                    value={settings.branding.business_hours}
                    onChange={e => setSettings({
                      ...settings,
                      branding: { ...settings.branding, business_hours: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Top Announcement Bar */}
          {activeTab === 'announcement' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Megaphone size={18} className="text-purple-600" /> Header Announcement / Promo Bar
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Top-of-page banner displayed above the navbar to highlight discounts or updates.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('announcement_bar')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-purple-900">Show Announcement Bar</p>
                  <p className="text-xs text-purple-700">Display promo strip at the very top of all public pages.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcement_bar.enabled}
                    onChange={e => setSettings({
                      ...settings,
                      announcement_bar: { ...settings.announcement_bar, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Banner Announcement Text</label>
                <input
                  type="text"
                  value={settings.announcement_bar.text}
                  onChange={e => setSettings({
                    ...settings,
                    announcement_bar: { ...settings.announcement_bar, text: e.target.value }
                  })}
                  placeholder="🎉 Special Promotion: Free site survey & 10% instant discount on CCTV & Solar installations this month!"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Clickable URL / Link</label>
                  <input
                    type="text"
                    value={settings.announcement_bar.link}
                    onChange={e => setSettings({
                      ...settings,
                      announcement_bar: { ...settings.announcement_bar, link: e.target.value }
                    })}
                    placeholder="/request-quote"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Background Theme</label>
                  <select
                    value={settings.announcement_bar.bg_color}
                    onChange={e => setSettings({
                      ...settings,
                      announcement_bar: { ...settings.announcement_bar, bg_color: e.target.value as any }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="blue">Blue Gradient</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="amber">Amber / Gold</option>
                    <option value="purple">Purple</option>
                    <option value="slate">Dark Slate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Home Page */}
          {activeTab === 'home' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Home size={18} className="text-blue-600" /> Home Page Context &amp; Headlines
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Customize the main hero banner, value proposition, and statistics.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('home_page')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save Home Page'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hero Badge</label>
                <input
                  type="text"
                  value={settings.home_page.hero_badge}
                  onChange={e => setSettings({
                    ...settings,
                    home_page: { ...settings.home_page, hero_badge: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hero Main Heading *</label>
                <input
                  type="text"
                  value={settings.home_page.hero_title}
                  onChange={e => setSettings({
                    ...settings,
                    home_page: { ...settings.home_page, hero_title: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hero Subtitle Paragraph</label>
                <textarea
                  rows={3}
                  value={settings.home_page.hero_subtitle}
                  onChange={e => setSettings({
                    ...settings,
                    home_page: { ...settings.home_page, hero_subtitle: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Button Label</label>
                  <input
                    type="text"
                    value={settings.home_page.hero_cta_primary}
                    onChange={e => setSettings({
                      ...settings,
                      home_page: { ...settings.home_page, hero_cta_primary: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Secondary Button Label</label>
                  <input
                    type="text"
                    value={settings.home_page.hero_cta_secondary}
                    onChange={e => setSettings({
                      ...settings,
                      home_page: { ...settings.home_page, hero_cta_secondary: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-700 uppercase mb-2">Key Metric Counters (4 Badges)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(settings.home_page.stats || []).map((stat, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={e => {
                          const copy = [...settings.home_page.stats];
                          copy[idx].value = e.target.value;
                          setSettings({ ...settings, home_page: { ...settings.home_page, stats: copy } });
                        }}
                        placeholder="1,200+"
                        className="w-full text-xs font-bold text-blue-700 border border-gray-300 rounded-lg px-2 py-1 bg-white font-mono"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={e => {
                          const copy = [...settings.home_page.stats];
                          copy[idx].label = e.target.value;
                          setSettings({ ...settings, home_page: { ...settings.home_page, stats: copy } });
                        }}
                        placeholder="Installations"
                        className="w-full text-[11px] text-gray-600 border border-gray-300 rounded-lg px-2 py-1 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Live Infrastructure Showcase Cards (Right Column) */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-600" /> Hero Infrastructure Showcase Cards (Right Column)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Full control: choose which card is Top Tile, Middle Tile, or Bottom Half Tiles, change color theme, icon, tags, and metrics.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultHeroCards: HeroShowcaseCard[] = [
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
                          badge: 'Online Pure Sine',
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
                          badge: 'Trip Safe',
                        },
                      ];
                      setSettings({
                        ...settings,
                        home_page: {
                          ...settings.home_page,
                          hero_cards: defaultHeroCards,
                        }
                      });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 self-start sm:self-auto"
                  >
                    <RefreshCw size={12} /> Reset to Defaults
                  </button>
                </div>

                {(() => {
                  const defaultHeroCards: HeroShowcaseCard[] = [
                    {
                      id: 'solar',
                      slot: 'top',
                      enabled: true,
                      color: 'lilac',
                      icon: 'sun',
                      title: settings.home_page.hero_solar_title || 'Rooftop Solar Array',
                      subtitle: settings.home_page.hero_solar_subtitle || 'Bi-directional Net Meter',
                      tag: settings.home_page.hero_solar_tag || 'Active · 4.8 kW',
                      metric_label: settings.home_page.hero_solar_metric_label || 'Daily Clean Energy',
                      metric_value: settings.home_page.hero_solar_metric_value || '28.4 kWh Generated',
                      badge: settings.home_page.hero_solar_badge || '-85% EB Bill',
                    },
                    {
                      id: 'cctv',
                      slot: 'middle',
                      enabled: true,
                      color: 'lime',
                      icon: 'shield',
                      title: settings.home_page.hero_cctv_title || 'Perimeter Security Node',
                      subtitle: settings.home_page.hero_cctv_subtitle || '4K ColorVu AI Stream',
                      tag: settings.home_page.hero_cctv_tag || 'LIVE',
                      metric_label: settings.home_page.hero_cctv_metric_label || 'Intelligent Detection',
                      metric_value: settings.home_page.hero_cctv_metric_value || 'Human & Vehicle Recognized',
                      badge: settings.home_page.hero_cctv_badge || '24/7 NVR Encrypted',
                    },
                    {
                      id: 'ups',
                      slot: 'bottom_left',
                      enabled: true,
                      color: 'coral',
                      icon: 'battery',
                      title: settings.home_page.hero_ups_title || 'UPS Backup',
                      subtitle: settings.home_page.hero_ups_subtitle || 'Pure Sine Wave · 100%',
                      tag: '0 ms',
                      metric_label: 'Switchover',
                      metric_value: settings.home_page.hero_ups_value || '0 ms',
                      badge: 'Online Pure Sine',
                    },
                    {
                      id: 'sump',
                      slot: 'bottom_right',
                      enabled: true,
                      color: 'mint',
                      icon: 'cpu',
                      title: settings.home_page.hero_sump_title || 'Auto Sump',
                      subtitle: settings.home_page.hero_sump_subtitle || 'Dry-Run Trip Safe',
                      tag: 'Auto Mode',
                      metric_label: 'Tank Level',
                      metric_value: settings.home_page.hero_sump_value || '92% Level',
                      badge: 'Trip Safe',
                    },
                  ];

                  const currentCards: HeroShowcaseCard[] = (settings.home_page.hero_cards && settings.home_page.hero_cards.length > 0)
                    ? settings.home_page.hero_cards
                    : defaultHeroCards;

                  function updateCard(idx: number, patch: Partial<HeroShowcaseCard>) {
                    const nextCards = [...currentCards];
                    nextCards[idx] = { ...nextCards[idx], ...patch };
                    setSettings({
                      ...settings,
                      home_page: {
                        ...settings.home_page,
                        hero_cards: nextCards,
                      }
                    });
                  }

                  const colorStyles: Record<string, { bg: string; border: string; badgeBg: string; text: string }> = {
                    lilac: { bg: 'bg-[#c5b0f4]/15', border: 'border-[#c5b0f4]/50', badgeBg: 'bg-purple-100 text-purple-900', text: 'text-purple-950' },
                    lime: { bg: 'bg-[#dceeb1]/25', border: 'border-[#dceeb1]/70', badgeBg: 'bg-emerald-100 text-emerald-900', text: 'text-emerald-950' },
                    coral: { bg: 'bg-[#f3c9b6]/25', border: 'border-[#f3c9b6]/70', badgeBg: 'bg-orange-100 text-orange-900', text: 'text-orange-950' },
                    mint: { bg: 'bg-[#c8e6cd]/25', border: 'border-[#c8e6cd]/70', badgeBg: 'bg-teal-100 text-teal-900', text: 'text-teal-950' },
                    cream: { bg: 'bg-[#f4ecd6]/40', border: 'border-[#f4ecd6]', badgeBg: 'bg-amber-100 text-amber-900', text: 'text-amber-950' },
                    navy: { bg: 'bg-slate-900/10', border: 'border-slate-400', badgeBg: 'bg-slate-800 text-white', text: 'text-slate-900' },
                  };

                  return (
                    <div className="space-y-4">
                      {currentCards.map((card, idx) => {
                        const style = colorStyles[card.color] || colorStyles.lilac;
                        return (
                          <div key={card.id || idx} className={`p-4 rounded-2xl ${style.bg} border ${style.border} space-y-3.5 transition-all`}>
                            {/* Header Row: Card Title + Slot Position Picker + Enabled Toggle */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${style.text} flex items-center gap-1.5`}>
                                  Card #{idx + 1}: {card.title || 'Untitled Card'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2.5">
                                {/* Position / Slot Selector */}
                                <div className="flex items-center gap-1.5">
                                  <label className="text-[11px] font-bold text-gray-700 uppercase">Position:</label>
                                  <select
                                    value={card.slot}
                                    onChange={e => updateCard(idx, { slot: e.target.value as any })}
                                    className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                                  >
                                    <option value="top">⭐ Top Tile (Full Width Banner)</option>
                                    <option value="middle">📌 Middle Tile (Full Width Banner)</option>
                                    <option value="bottom_left">⬅️ Bottom Left Tile (Half Width)</option>
                                    <option value="bottom_right">➡️ Bottom Right Tile (Half Width)</option>
                                  </select>
                                </div>

                                {/* Color Theme Selector */}
                                <div className="flex items-center gap-1.5">
                                  <label className="text-[11px] font-bold text-gray-700 uppercase">Color:</label>
                                  <select
                                    value={card.color}
                                    onChange={e => updateCard(idx, { color: e.target.value as any })}
                                    className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                                  >
                                    <option value="lilac">💜 Lilac (#c5b0f4)</option>
                                    <option value="lime">💚 Lime (#dceeb1)</option>
                                    <option value="coral">🧡 Coral (#f3c9b6)</option>
                                    <option value="mint">🌿 Mint (#c8e6cd)</option>
                                    <option value="cream">🧈 Cream (#f4ecd6)</option>
                                    <option value="navy">🌌 Navy (#1f1d3d)</option>
                                  </select>
                                </div>

                                {/* Icon Selector */}
                                <div className="flex items-center gap-1.5">
                                  <label className="text-[11px] font-bold text-gray-700 uppercase">Icon:</label>
                                  <select
                                    value={card.icon}
                                    onChange={e => updateCard(idx, { icon: e.target.value as any })}
                                    className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                                  >
                                    <option value="sun">☀️ Solar / Sun</option>
                                    <option value="shield">🛡️ CCTV / Shield</option>
                                    <option value="battery">🔋 UPS / Battery</option>
                                    <option value="cpu">💻 Sump / Controller</option>
                                    <option value="droplets">💧 Water / Droplets</option>
                                    <option value="zap">⚡ Power / Zap</option>
                                    <option value="lightbulb">💡 Sensor / Light</option>
                                    <option value="lock">🔒 Lock / Security</option>
                                  </select>
                                </div>

                                {/* Enabled Toggle */}
                                <label className="flex items-center gap-1.5 cursor-pointer ml-1">
                                  <input
                                    type="checkbox"
                                    checked={card.enabled !== false}
                                    onChange={e => updateCard(idx, { enabled: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className="text-[11px] font-medium text-gray-700">Show</span>
                                </label>
                              </div>
                            </div>

                            {/* Row 1: Title & Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Card Heading / Title</label>
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={e => updateCard(idx, { title: e.target.value })}
                                  placeholder="E.g. Rooftop Solar Array"
                                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Card Subtitle / Tagline</label>
                                <input
                                  type="text"
                                  value={card.subtitle}
                                  onChange={e => updateCard(idx, { subtitle: e.target.value })}
                                  placeholder="E.g. Bi-directional Net Meter"
                                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                                />
                              </div>
                            </div>

                            {/* Row 2: Status Tag, Metric Label, Metric Value, Badge Pill */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Top-Right Status Tag</label>
                                <input
                                  type="text"
                                  value={card.tag}
                                  onChange={e => updateCard(idx, { tag: e.target.value })}
                                  placeholder="E.g. Active · 4.8 kW or LIVE"
                                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Bottom Metric Label</label>
                                <input
                                  type="text"
                                  value={card.metric_label}
                                  onChange={e => updateCard(idx, { metric_label: e.target.value })}
                                  placeholder="E.g. Daily Clean Energy"
                                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Bottom Metric Value</label>
                                <input
                                  type="text"
                                  value={card.metric_value}
                                  onChange={e => updateCard(idx, { metric_value: e.target.value })}
                                  placeholder="E.g. 28.4 kWh Generated"
                                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Badge Pill Tag</label>
                                <input
                                  type="text"
                                  value={card.badge}
                                  onChange={e => updateCard(idx, { badge: e.target.value })}
                                  placeholder="E.g. -85% EB Bill"
                                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 5: CCTV Page */}
          {activeTab === 'cctv' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Shield size={18} className="text-blue-600" /> CCTV Surveillance Page Context
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Edit texts, starting package price, and feature highlights on `/cctv`.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('cctv_page')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save CCTV Content'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Headline</label>
                <input
                  type="text"
                  value={settings.cctv_page.hero_title}
                  onChange={e => setSettings({
                    ...settings,
                    cctv_page: { ...settings.cctv_page, hero_title: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={settings.cctv_page.hero_subtitle}
                  onChange={e => setSettings({
                    ...settings,
                    cctv_page: { ...settings.cctv_page, hero_subtitle: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Starting Price Tag</label>
                  <input
                    type="text"
                    value={settings.cctv_page.starting_price || ''}
                    onChange={e => setSettings({
                      ...settings,
                      cctv_page: { ...settings.cctv_page, starting_price: e.target.value }
                    })}
                    placeholder="₹7,999"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Warranty Promise</label>
                  <input
                    type="text"
                    value={settings.cctv_page.warranty_text || ''}
                    onChange={e => setSettings({
                      ...settings,
                      cctv_page: { ...settings.cctv_page, warranty_text: e.target.value }
                    })}
                    placeholder="2-Year Comprehensive On-Site Warranty"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Solar Page */}
          {activeTab === 'solar' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sun size={18} className="text-amber-500" /> Solar Rooftop Page Context
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Edit texts, government subsidy highlights, and warranties on `/solar`.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('solar_page')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save Solar Content'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Headline</label>
                <input
                  type="text"
                  value={settings.solar_page.hero_title}
                  onChange={e => setSettings({
                    ...settings,
                    solar_page: { ...settings.solar_page, hero_title: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={settings.solar_page.hero_subtitle}
                  onChange={e => setSettings({
                    ...settings,
                    solar_page: { ...settings.solar_page, hero_subtitle: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Government Subsidy Text</label>
                  <input
                    type="text"
                    value={settings.solar_page.subsidy_text || ''}
                    onChange={e => setSettings({
                      ...settings,
                      solar_page: { ...settings.solar_page, subsidy_text: e.target.value }
                    })}
                    placeholder="Direct MNRE Subsidy assistance up to ₹78,000"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Performance Warranty</label>
                  <input
                    type="text"
                    value={settings.solar_page.warranty_text || ''}
                    onChange={e => setSettings({
                      ...settings,
                      solar_page: { ...settings.solar_page, warranty_text: e.target.value }
                    })}
                    placeholder="25-Year Performance Warranty on Solar PV Modules"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: UPS Page */}
          {activeTab === 'ups' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Battery size={18} className="text-teal-600" /> UPS &amp; Power Backup Page Context
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Edit headline, battery warranty guarantee, and features on `/ups`.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('ups_page')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save UPS Content'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Headline</label>
                <input
                  type="text"
                  value={settings.ups_page.hero_title}
                  onChange={e => setSettings({
                    ...settings,
                    ups_page: { ...settings.ups_page, hero_title: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={settings.ups_page.hero_subtitle}
                  onChange={e => setSettings({
                    ...settings,
                    ups_page: { ...settings.ups_page, hero_subtitle: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Battery &amp; Inverter Guarantee</label>
                <input
                  type="text"
                  value={settings.ups_page.warranty_text || ''}
                  onChange={e => setSettings({
                    ...settings,
                    ups_page: { ...settings.ups_page, warranty_text: e.target.value }
                  })}
                  placeholder="3-Year Replacement Guarantee on Tubular & Lithium Batteries"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* TAB 8: Home Automation Page */}
          {activeTab === 'automation' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Cpu size={18} className="text-indigo-600" /> Home &amp; Sump Automation Page Context
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Edit headline, sump controller starting prices, and warranty on `/home-automation`.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('automation_page')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save Automation Content'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Headline</label>
                <input
                  type="text"
                  value={settings.automation_page?.hero_title || ''}
                  onChange={e => setSettings({
                    ...settings,
                    automation_page: { ...settings.automation_page, hero_title: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={settings.automation_page?.hero_subtitle || ''}
                  onChange={e => setSettings({
                    ...settings,
                    automation_page: { ...settings.automation_page, hero_subtitle: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Starting Price Display</label>
                  <input
                    type="text"
                    value={settings.automation_page?.starting_price || ''}
                    onChange={e => setSettings({
                      ...settings,
                      automation_page: { ...settings.automation_page, starting_price: e.target.value }
                    })}
                    placeholder="₹4,499"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Warranty &amp; Guarantee Text</label>
                  <input
                    type="text"
                    value={settings.automation_page?.warranty_text || ''}
                    onChange={e => setSettings({
                      ...settings,
                      automation_page: { ...settings.automation_page, warranty_text: e.target.value }
                    })}
                    placeholder="2-Year Replacement Warranty on all Smart Controllers & Sensors"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: About Us */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Info size={18} className="text-blue-600" /> About Us Page Context
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Edit company story, mission, and vision on `/about`.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('about_page')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save About Page'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Page Title</label>
                  <input
                    type="text"
                    value={settings.about_page.title}
                    onChange={e => setSettings({
                      ...settings,
                      about_page: { ...settings.about_page, title: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={settings.about_page.subtitle}
                    onChange={e => setSettings({
                      ...settings,
                      about_page: { ...settings.about_page, subtitle: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Story &amp; Heritage</label>
                <textarea
                  rows={3}
                  value={settings.about_page.story}
                  onChange={e => setSettings({
                    ...settings,
                    about_page: { ...settings.about_page, story: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mission Statement</label>
                  <textarea
                    rows={3}
                    value={settings.about_page.mission}
                    onChange={e => setSettings({
                      ...settings,
                      about_page: { ...settings.about_page, mission: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vision Statement</label>
                  <textarea
                    rows={3}
                    value={settings.about_page.vision}
                    onChange={e => setSettings({
                      ...settings,
                      about_page: { ...settings.about_page, vision: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: Contact Page */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <PhoneCall size={18} className="text-blue-600" /> Contact Page Context
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Edit texts, working hours, and address displayed on `/contact`.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave('contact_page')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  <Save size={14} /> {isPending ? 'Saving...' : 'Save Contact Content'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Page Title</label>
                  <input
                    type="text"
                    value={settings.contact_page.title}
                    onChange={e => setSettings({
                      ...settings,
                      contact_page: { ...settings.contact_page, title: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={settings.contact_page.subtitle}
                    onChange={e => setSettings({
                      ...settings,
                      contact_page: { ...settings.contact_page, subtitle: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Phone</label>
                  <input
                    type="text"
                    value={settings.contact_page.phone}
                    onChange={e => setSettings({
                      ...settings,
                      contact_page: { ...settings.contact_page, phone: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Email</label>
                  <input
                    type="email"
                    value={settings.contact_page.email}
                    onChange={e => setSettings({
                      ...settings,
                      contact_page: { ...settings.contact_page, email: e.target.value }
                    })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Office Address</label>
                <textarea
                  rows={2}
                  value={settings.contact_page.address}
                  onChange={e => setSettings({
                    ...settings,
                    contact_page: { ...settings.contact_page, address: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Working Hours Information</label>
                <input
                  type="text"
                  value={settings.contact_page.working_hours}
                  onChange={e => setSettings({
                    ...settings,
                    contact_page: { ...settings.contact_page, working_hours: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
