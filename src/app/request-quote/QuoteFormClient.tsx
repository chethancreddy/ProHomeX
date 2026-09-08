'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronRight, Phone, Mail, MapPin, Sparkles, ArrowRight, ArrowUpRight } from 'lucide-react';
import { submitLead } from '@/app/actions/auth';
import { QuotePageSettings, BrandingSettings } from '@/lib/cms';

interface Props {
  settings: QuotePageSettings;
  branding: BrandingSettings;
}

export default function QuoteFormClient({ settings, branding }: Props) {
  const searchParams = useSearchParams();
  const defaultServiceParam = searchParams.get('service') || '';

  // Determine initial selected service from query param matching options or first option
  const [selectedService, setSelectedService] = useState<string>(() => {
    if (defaultServiceParam) {
      const match = settings.services_list?.find(s => s.toLowerCase().includes(defaultServiceParam.toLowerCase()));
      if (match) return match;
    }
    return settings.services_list?.[0] || '';
  });

  const [result, setResult] = useState<{ success?: boolean; reference?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitLead(fd);
      setResult(res);
    });
  };

  if (result?.success) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#ecfaee] border border-[#a4e8b3] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="text-[#1ea64a]" size={32} />
        </div>
        <h2 className="text-3xl font-semibold text-black tracking-tight mb-2">
          {settings.success_title || 'Enquiry Received!'}
        </h2>
        <p className="text-sm text-black/70 max-w-md mx-auto leading-relaxed mb-8">
          {settings.success_subtitle || 'Our team will contact you within 24 hours.'}
        </p>

        <div className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-2xl p-6 mb-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-black/50 mb-1">
            Reference Tracking Number
          </p>
          <p className="text-3xl font-mono font-bold text-black tracking-wider">
            {result.reference}
          </p>
          <p className="text-xs text-black/50 mt-2">
            {settings.success_note || 'Save this reference for tracking your quotation.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-900 text-white font-medium text-xs px-6 py-3 rounded-full transition-all active:scale-98"
          >
            Back to Home <ArrowRight size={13} />
          </Link>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-medium text-black px-6 py-3 rounded-full border border-[#e6e6e6] hover:bg-[#f7f7f5] transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  // Support details resolution (custom quote fields fall back to branding)
  const phone = settings.custom_phone || branding.phone || '+91 98765 43210';
  const email = settings.custom_email || branding.email || 'info@prohomex.com';
  const address = settings.custom_address || branding.address || 'Bangalore, Karnataka, India';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Form Card */}
      <div className="lg:col-span-8 bg-white border border-[#e6e6e6] rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {result?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {result.error}
            </div>
          )}

          {/* Full Name & Phone (Always Mandatory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Full Name" required>
              <input
                type="text"
                name="name"
                required
                placeholder="Your full name"
                className={inputClass}
              />
            </Field>

            <Field label="Phone Number" required>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </Field>
          </div>

          {/* Email Address (ON/OFF Toggleable) */}
          {settings.enable_email && (
            <Field label="Email Address">
              <input
                type="email"
                name="email"
                placeholder="your.email@domain.com"
                className={inputClass}
              />
            </Field>
          )}

          {/* Service Required (ON/OFF Toggleable) */}
          {settings.enable_service && (
            <Field label="Service Required" required>
              {settings.services_list && settings.services_list.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {settings.services_list.map((srv) => {
                      const isSelected = selectedService === srv;
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => setSelectedService(srv)}
                          className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white text-black/80 border-[#e6e6e6] hover:bg-[#f7f7f5]'
                          }`}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" name="service" value={selectedService} />
                </div>
              ) : (
                <select name="service" required className={inputClass}>
                  <option value="General Consultation">General Consultation</option>
                </select>
              )}
            </Field>
          )}

          {/* Location / Area (ON/OFF Toggleable) */}
          {settings.enable_location && (
            <Field label="Location / Area" required>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Indiranagar, Bangalore or City Name"
                className={inputClass}
              />
            </Field>
          )}

          {/* Your Requirement / Nature of Work (ON/OFF Toggleable) */}
          {settings.enable_requirement && (
            <Field label="Your Requirement" required>
              <select name="requirement" required className={inputClass} defaultValue="">
                <option value="" disabled>Select requirement type...</option>
                {settings.requirement_options?.map((req) => (
                  <option key={req} value={req}>
                    {req}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Optional: Property Type (ON/OFF Toggleable) */}
          {settings.enable_property_type && (
            <Field label="Property / Facility Type">
              <select name="property_type" className={inputClass} defaultValue="">
                <option value="">Select property type (Optional)...</option>
                {settings.property_type_options?.map((prop) => (
                  <option key={prop} value={prop}>
                    {prop}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Optional: Budget Range (ON/OFF Toggleable) */}
          {settings.enable_budget && (
            <Field label="Estimated Budget Range">
              <select name="budget" className={inputClass} defaultValue="">
                <option value="">Select budget range (Optional)...</option>
                {settings.budget_options?.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Optional: Preferred Timeline (ON/OFF Toggleable) */}
          {settings.enable_timeline && (
            <Field label="Preferred Installation Timeline">
              <select name="timeline" className={inputClass} defaultValue="">
                <option value="">Select timeline (Optional)...</option>
                {settings.timeline_options?.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Additional Details (ON/OFF Toggleable) */}
          {settings.enable_message && (
            <Field label={settings.message_label || 'Additional Details'}>
              <textarea
                name="message"
                rows={4}
                placeholder={settings.message_placeholder || 'Tell us about your property size, requirements, or current issues...'}
                className={`${inputClass} resize-none`}
              />
            </Field>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black hover:bg-neutral-900 text-white font-medium py-3.5 px-6 rounded-full text-xs tracking-wide uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98 shadow-sm"
            >
              {isPending ? (
                'Submitting...'
              ) : (
                <>
                  {settings.submit_button_text || 'Submit Enquiry'} <ArrowRight size={14} />
                </>
              )}
            </button>

            {settings.privacy_note && (
              <p className="text-[11px] text-black/50 text-center mt-3">
                {settings.privacy_note}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Sidebar: Steps & Prefer to call? */}
      <div className="lg:col-span-4 space-y-6">
        {/* Process Steps */}
        {settings.show_steps && (
          <div className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-black/70 font-semibold">
              {settings.steps_title || 'What happens next?'}
            </h3>
            <div className="space-y-3">
              {settings.steps?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-black/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prefer to call? (Direct Consultation) */}
        {settings.show_prefer_to_call && (
          <div className="bg-white border border-[#e6e6e6] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-black/70 font-semibold">
              {settings.prefer_to_call_title || 'Prefer to call?'}
            </h3>

            <div className="space-y-3.5 text-xs text-black/80">
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-2.5 text-black hover:opacity-70 transition-opacity font-medium"
                >
                  <span className="p-1.5 bg-[#f7f7f5] rounded-lg text-black">
                    <Phone size={13} />
                  </span>
                  {phone}
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 text-black hover:opacity-70 transition-opacity font-medium"
                >
                  <span className="p-1.5 bg-[#f7f7f5] rounded-lg text-black">
                    <Mail size={13} />
                  </span>
                  {email}
                </a>
              )}

              {address && (
                <div className="flex items-start gap-2.5 text-black/70">
                  <span className="p-1.5 bg-[#f7f7f5] rounded-lg text-black mt-0.5">
                    <MapPin size={13} />
                  </span>
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 border border-[#e6e6e6] rounded-xl text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-black transition-colors bg-white';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-black/80">
        {label} {required && <span className="text-black font-bold">*</span>}
      </label>
      {children}
    </div>
  );
}
