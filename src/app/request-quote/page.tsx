'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { submitLead } from '@/app/actions/auth';
import { ChevronRight, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function RequestQuotePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading...</div>}>
        <QuoteForm />
      </Suspense>
      <PublicFooter />
    </div>
  );
}

function QuoteForm() {
  const searchParams = useSearchParams();
  const defaultService = searchParams.get('service') || '';
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
      <div className="max-w-lg mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Enquiry Received!</h2>
        <p className="text-gray-500 mt-2">Our team will contact you within 24 hours.</p>
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Your Reference Number</p>
          <p className="text-2xl font-mono font-bold text-blue-600">{result.reference}</p>
          <p className="text-xs text-slate-400 mt-2">Save this for your records.</p>
        </div>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">Back to Home</Link>
          <button onClick={() => setResult(null)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm">Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Request a Free Quote</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
            Fill in your details and our team will prepare a customised quotation. No commitment required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">
              {result?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{result.error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input type="text" name="name" required placeholder="Your full name" className={inputClass} />
                </Field>
                <Field label="Phone Number" required>
                  <input type="tel" name="phone" required placeholder="+91 9876543210" className={inputClass} />
                </Field>
              </div>

              <Field label="Email Address">
                <input type="email" name="email" placeholder="your@email.com" className={inputClass} />
              </Field>

              <Field label="Service Required" required>
                <select name="service" required defaultValue={defaultService} className={inputClass}>
                  <option value="">Select a service...</option>
                  <option value="CCTV">CCTV Surveillance</option>
                  <option value="Solar">Solar Energy System</option>
                  <option value="UPS">UPS Power Solution</option>
                  <option value="Home Automation">Home &amp; Sump Automation</option>
                  <option value="Networking">Networking &amp; Cabling</option>
                  <option value="Multiple">Multiple Services</option>
                </select>
              </Field>

              <Field label="Location / Area" required>
                <input type="text" name="location" required placeholder="Area, city, or address" className={inputClass} />
              </Field>

              <Field label="Your Requirement" required>
                <select name="requirement" required className={inputClass}>
                  <option value="">What do you need?</option>
                  <option value="New Installation">New Installation</option>
                  <option value="Upgrade Existing">Upgrade Existing System</option>
                  <option value="Repair / Service">Repair / Service</option>
                  <option value="Annual Maintenance (AMC)">Annual Maintenance (AMC)</option>
                  <option value="Site Survey Only">Site Survey Only</option>
                </select>
              </Field>

              <Field label="Additional Details">
                <textarea name="message" rows={4} placeholder="Tell us about your property size, number of cameras needed, current issues, etc." className={`${inputClass} resize-none`} />
              </Field>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {isPending ? 'Submitting...' : <>Submit Enquiry <ChevronRight size={16} /></>}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to be contacted by our team. No spam — ever.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">What happens next?</h3>
              <div className="space-y-3">
                {['Our team reviews your enquiry within a few hours', 'We call to understand your requirements better', 'A detailed, itemised quote is prepared', 'Site visit scheduled if needed', 'You approve and we begin work'].map((step, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Prefer to call?</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Phone size={14} className="text-blue-500" /> +91 XXXXX XXXXX</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={14} className="text-blue-500" /> info@prohomex.com</div>
              <div className="flex items-start gap-2 text-sm text-slate-600"><MapPin size={14} className="text-blue-500 mt-0.5" /> India</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function PublicNav() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl text-slate-900 flex items-center gap-0.5"><span className="text-blue-600 font-extrabold">ProHome</span><span className="text-slate-900 font-extrabold">X</span></Link>
        <nav className="hidden md:flex items-center gap-7">
          {[['CCTV', '/cctv'], ['Solar', '/solar'], ['UPS', '/ups'], ['Automation', '/home-automation'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
            <Link key={h} href={h} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{l}</Link>
          ))}
        </nav>
        <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600">Login</Link>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
        <Link href="/" className="font-bold text-white text-base"><span className="text-blue-400 font-extrabold">ProHome</span>X</Link>
        <span>© {new Date().getFullYear()} ProHomeX. All rights reserved.</span>
      </div>
    </footer>
  );
}
