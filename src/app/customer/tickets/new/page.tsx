'use client';
import { useState, useTransition } from 'react';
import { raiseTicket } from '@/app/actions/auth';
import { MapPin, Phone, LifeBuoy, CheckCircle, ChevronRight } from 'lucide-react';

const CATEGORIES = ['CCTV', 'Solar', 'UPS', 'Home Automation', 'Networking', 'Others'];

export default function RaiseTicketPage() {
  const [category, setCategory] = useState('');
  const [locationType, setLocationType] = useState<'text' | null>(null);
  const [result, setResult] = useState<{ success?: boolean; ticketNumber?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await raiseTicket(formData);
      setResult(res);
    });
  };

  if (result?.success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket Created Successfully</h1>
        <p className="text-gray-500 mt-2">Our team has been notified and will be in touch shortly.</p>

        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-6 text-left">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Your Ticket Number</p>
          <p className="text-2xl font-mono font-bold text-blue-600">{result.ticketNumber || 'TKT-XXXXXX'}</p>
          <p className="text-xs text-slate-500 mt-2">Save this reference number to track your ticket status.</p>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <a href="/customer/tickets" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
            View All Tickets
          </a>
          <button onClick={() => setResult(null)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
            Raise Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Raise a Support Ticket</h1>
        <p className="mt-1 text-sm text-gray-500">
          Describe your issue and our technical team will be assigned to help you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {result?.error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {result.error}
          </div>
        )}

        {/* Category */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Service Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input type="hidden" name="category" value={category} required />
        </div>

        {/* Location */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setLocationType('text')}
              className={`flex-1 flex items-center gap-2 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                locationType === 'text' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200'
              }`}
            >
              <MapPin size={16} /> Enter Location
            </button>
          </div>
          {locationType === 'text' && (
            <input
              type="text"
              name="location"
              placeholder="Area / Address / Landmark"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          )}
          {!locationType && <p className="text-xs text-gray-400">Please select a location option above.</p>}
        </div>

        {/* Contact */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">Our team will call this number before visiting.</p>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-300 text-gray-500 text-sm flex items-center gap-1.5">
              <Phone size={14} /> +91
            </span>
            <input
              type="tel"
              name="contact_number"
              placeholder="9876543210"
              required
              maxLength={10}
              className="flex-1 px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {/* Problem description */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Problem Description <span className="text-gray-400 font-normal">(Recommended)</span>
          </label>
          <textarea
            name="problem"
            rows={4}
            placeholder="Describe the issue in detail — what's happening, since when, any error messages..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="p-6 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <LifeBuoy size={14} /> You&apos;ll receive a ticket number after submission.
          </p>
          <button
            type="submit"
            disabled={isPending || !category || !locationType}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
          >
            {isPending ? 'Submitting...' : 'Submit Ticket'}
            {!isPending && <ChevronRight size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
