'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Send, Banknote } from 'lucide-react';
import { markInvoiceIssued, recordFinalPayment } from '../actions';

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE', 'OTHER'] as const;

interface Props {
  invoiceId: string;
  customerId: string;
  quotationId?: string;
  workOrderId?: string;
  currentStatus: string;
  balanceDue: number;
  totalPaid: number;
}

export default function InvoiceActions({
  invoiceId, customerId, quotationId, workOrderId, currentStatus, balanceDue, totalPaid
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);
  const [remaining, setRemaining] = useState(balanceDue);

  const [payAmount, setPayAmount] = useState(balanceDue.toString());
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const router = useRouter();
  function toast(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }

  function handleMarkIssued() {
    startTransition(async () => {
      try {
        await markInvoiceIssued(invoiceId);
        setStatus('ISSUED'); toast('Invoice issued!'); router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  function handleRecordPayment() {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { setError('Enter a valid amount.'); return; }
    setError('');
    startTransition(async () => {
      try {
        const newBalance = Math.max(0, remaining - amount);
        await recordFinalPayment({
          invoiceId, customerId, quotationId, workOrderId,
          amount, method: payMethod, reference: payRef,
          receivedAt: new Date(payDate).toISOString(),
          newBalance,
        });
        setRemaining(newBalance);
        if (newBalance <= 0) setStatus('PAID');
        setShowPayForm(false);
        toast('Payment recorded!');
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  return (
    <div className="space-y-4 sticky top-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase">Invoice Actions</p>

        {status === 'DRAFT' && (
          <button onClick={handleMarkIssued} disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Send size={15} /> Mark as Issued
          </button>
        )}

        {status === 'ISSUED' && remaining > 0 && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-bold text-red-700">Balance Due</p>
              <p className="text-lg font-bold text-red-900">
                ₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {!showPayForm ? (
              <button onClick={() => setShowPayForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                <Banknote size={15} /> Record Payment
              </button>
            ) : (
              <div className="space-y-3 bg-green-50 p-3 rounded-xl border border-green-200">
                <p className="text-xs font-bold text-green-800">Record Payment</p>
                <div>
                  <label className="text-xs text-green-700 font-medium">Amount (₹)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
                </div>
                <div>
                  <label className="text-xs text-green-700 font-medium">Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white">
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-green-700 font-medium">Reference (UTR / Cheque #)</label>
                  <input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Optional"
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white" />
                </div>
                <div>
                  <label className="text-xs text-green-700 font-medium">Date</label>
                  <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleRecordPayment} disabled={isPending}
                    className="flex-1 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {isPending ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setShowPayForm(false)}
                    className="px-3 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {status === 'PAID' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle2 size={24} className="mx-auto text-green-600 mb-1" />
            <p className="text-sm font-bold text-green-800">Fully Paid</p>
            <p className="text-xs text-green-600 mt-0.5">
              ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })} received
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}
      {success && <p className="text-xs text-green-700 bg-green-50 p-3 rounded-xl border border-green-200 text-center font-medium">{success}</p>}
    </div>
  );
}
