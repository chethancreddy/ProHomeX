'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Minus, Plus, X, CheckCircle2, FileQuestion, ArrowLeft } from 'lucide-react';
import { submitQuotationRequest } from './actions';

const CART_KEY = 'prohomex_quote_cart';
const LEGACY_CART_KEY = 'techmaha_quote_cart';

export type CartItem = {
  productId: string;
  quantity: number;
  name: string;
  sku: string;
  price: number;
  unit: string;
};

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface Props {
  customerName: string;
  customerEmail: string;
}

export default function QuoteRequestForm({ customerName, customerEmail }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ requestNumber: string } | null>(null);
  const router = useRouter();

  useEffect(() => { setCart(loadCart()); }, []);

  function updateQty(productId: string, qty: number) {
    setCart(prev => {
      const next = qty <= 0
        ? prev.filter(i => i.productId !== productId)
        : prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeItem(productId: string) { updateQty(productId, 0); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) { setError('Your basket is empty. Go back and add products.'); return; }
    setError('');

    startTransition(async () => {
      try {
        const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity }));
        const result = await submitQuotationRequest(items, notes);
        localStorage.setItem(CART_KEY, '[]');
        setCart([]);
        setSuccess({ requestNumber: result.requestNumber });
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  const estimatedTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Success screen
  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Request Submitted!</h2>
        <p className="text-gray-500 mt-2">Your quotation request has been sent to our team.</p>
        <div className="mt-5 inline-block px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-600 font-medium">Request Number</p>
          <p className="text-xl font-bold text-blue-800 font-mono">{success.requestNumber}</p>
        </div>
        <p className="text-sm text-gray-400 mt-4">You can track this in your Quotations section. Our team will respond within 24 hours.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/customer/quotations" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            View My Quotations
          </Link>
          <Link href="/customer/products" className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Browse More Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/customer/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-3">
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Request Quotation</h1>
        <p className="text-sm text-gray-500 mt-1">Review your selected products and submit your quote request.</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-600 font-medium">Your quote basket is empty</p>
          <Link href="/customer/products" className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Your Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Your Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{customerName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{customerEmail || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Selected Products */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Selected Products ({cart.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <Minus size={12} />
                    </button>
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => updateQty(item.productId, parseInt(e.target.value, 10) || 1)}
                      className="w-12 text-center text-sm font-bold border border-gray-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <Plus size={12} />
                    </button>
                    <span className="text-xs text-slate-400 w-8">{item.unit}</span>
                  </div>
                  {item.price > 0 && (
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-400">₹{Number(item.price).toLocaleString('en-IN')} ea.</p>
                    </div>
                  )}
                  <button type="button" onClick={() => removeItem(item.productId)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            {estimatedTotal > 0 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Estimated Total (excl. GST)</span>
                <span className="font-bold text-slate-900">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
              Additional Notes <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any specific requirements, installation preferences, site details…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4} />
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm">
              <FileQuestion size={18} />
              {isPending ? 'Submitting…' : 'Submit Quote Request'}
            </button>
            <Link href="/customer/products" className="px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Add More
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
