'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, User, Building2, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { createCustomer } from './actions';

export default function AddCustomerModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'site'>('info');
  const router = useRouter();

  // Customer info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  // Optional site
  const [addSite, setAddSite] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteCity, setSiteCity] = useState('');
  const [siteState, setSiteState] = useState('');

  function reset() {
    setFullName(''); setEmail(''); setPhone(''); setCompanyName(''); setTaxId('');
    setSiteName(''); setSiteAddress(''); setSiteCity(''); setSiteState('');
    setAddSite(false); setStep('info'); setError('');
  }

  function handleClose() { setOpen(false); reset(); }

  function handleSubmit() {
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required.'); return; }
    if (addSite && !siteName.trim()) { setError('Site name is required when adding a site.'); return; }
    setError('');

    startTransition(async () => {
      const result = await createCustomer({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        companyName: companyName.trim() || undefined,
        taxId: taxId.trim() || undefined,
        siteName: addSite ? siteName.trim() : undefined,
        siteAddress: addSite ? siteAddress.trim() : undefined,
        siteCity: addSite ? siteCity.trim() : undefined,
        siteState: addSite ? siteState.trim() : undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      handleClose();
      router.refresh();
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
        <Plus size={16} /> Add Customer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Customer</h2>
                <p className="text-sm text-gray-500 mt-0.5">Create a customer profile and optionally add their site.</p>
              </div>
              <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Personal Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <User size={13} /> Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="e.g., Rahul Kumar"
                      className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="rahul@email.com"
                          className="w-full text-sm border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full text-sm border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Building2 size={13} /> Business Details <span className="font-normal normal-case text-gray-400">(optional)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g., ABC Enterprises"
                      className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input value={taxId} onChange={e => setTaxId(e.target.value)}
                      placeholder="e.g., 29ABCDE1234F1Z5"
                      className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Site toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setAddSite(!addSite)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${addSite ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${addSite ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add installation site now</span>
                </label>
              </div>

              {/* Site Info */}
              {addSite && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-2">
                    <MapPin size={13} /> Site Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">System / Service Type *</label>
                      <select
                        value={siteCity ? siteCity : 'CCTV'}
                        onChange={e => {
                          const val = e.target.value;
                          if (!siteName) setSiteName(`${val} Installation Site`);
                        }}
                        className="w-full text-sm border border-blue-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="CCTV">CCTV Security System</option>
                        <option value="UPS">UPS &amp; Power Backup</option>
                        <option value="Solar">Solar Power Rooftop</option>
                        <option value="Networking">Structured Networking / Wi-Fi</option>
                        <option value="Other">Other Custom Installation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Name / Location Label *</label>
                      <input
                        value={siteName}
                        onChange={e => setSiteName(e.target.value)}
                        placeholder="e.g., CCTV - Factory Unit 2, Solar - Villa Rooftop"
                        className="w-full text-sm border border-blue-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address / Landmark</label>
                    <input value={siteAddress} onChange={e => setSiteAddress(e.target.value)}
                      placeholder="Street / Building / Area"
                      className="w-full text-sm border border-blue-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input value={siteCity} onChange={e => setSiteCity(e.target.value)} placeholder="e.g., Bangalore"
                        className="w-full text-sm border border-blue-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input value={siteState} onChange={e => setSiteState(e.target.value)} placeholder="e.g., Karnataka"
                        className="w-full text-sm border border-blue-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {isPending ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <><Plus size={15} /> Create Customer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
