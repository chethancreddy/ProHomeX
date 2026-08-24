'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send, CheckCircle2, XCircle, Banknote, Wrench, Edit, Clock,
  ArrowRight, AlertTriangle
} from 'lucide-react';
import { markAsSent, confirmQuotation, rejectQuotation, recordAdvancePayment } from '../actions';

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE', 'OTHER'] as const;

interface Props {
  quotationId: string;
  customerId: string;
  currentStatus: string;
  advanceAmount: number;
  workOrder: { id: string; work_order_number: string; status: string } | null;
  confirmedAt: string | null;
  advancePaidAt: string | null;
  validUntil: string | null;
}

export default function QuotationAdminActions({
  quotationId, customerId, currentStatus, advanceAmount, workOrder,
  confirmedAt, advancePaidAt, validUntil
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [createdWoId, setCreatedWoId] = useState(workOrder?.id || '');
  const [createdWoNum, setCreatedWoNum] = useState(workOrder?.work_order_number || '');

  // Payment form state
  const [payAmount, setPayAmount] = useState(advanceAmount.toString());
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('');

  const router = useRouter();

  function toast(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  function handleMarkSent() {
    startTransition(async () => {
      try {
        await markAsSent(quotationId);
        setStatus('SENT');
        toast('Marked as Sent');
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  function handleConfirm() {
    if (!confirm('Mark this quotation as CONFIRMED? (Customer agreed via WhatsApp/Phone)')) return;
    startTransition(async () => {
      try {
        await confirmQuotation(quotationId);
        setStatus('CONFIRMED');
        toast('Quotation confirmed!');
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  function handleReject() {
    if (!confirm('Reject this quotation?')) return;
    startTransition(async () => {
      try {
        await rejectQuotation(quotationId);
        setStatus('REJECTED');
        toast('Quotation rejected');
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  async function handleRecordPayment() {
    if (!payAmount || Number(payAmount) <= 0) { setError('Enter a valid amount.'); return; }
    setError('');
    startTransition(async () => {
      try {
        const woId = await recordAdvancePayment({
          quotationId, customerId,
          amount: Number(payAmount),
          method: payMethod,
          reference: payRef,
          receivedAt: new Date(payDate).toISOString(),
          notes: payNotes,
        });
        setStatus('ADVANCE_RECEIVED');
        setCreatedWoId(woId);
        setShowPaymentForm(false);
        toast('Advance recorded! Work order created.');
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  // Status timeline
  const timeline = [
    { s: 'DRAFT', label: 'Draft created' },
    { s: 'SENT', label: 'Sent to customer' },
    { s: 'CONFIRMED', label: confirmedAt ? `Confirmed ${new Date(confirmedAt).toLocaleDateString('en-IN')}` : 'Confirmed by admin' },
    { s: 'ADVANCE_RECEIVED', label: advancePaidAt ? `Advance received ${new Date(advancePaidAt).toLocaleDateString('en-IN')}` : 'Advance received' },
    { s: 'IN_PROGRESS', label: 'Installation in progress' },
    { s: 'COMPLETED', label: 'Completed' },
  ];
  const statusOrder = ['DRAFT', 'SENT', 'CONFIRMED', 'ADVANCE_RECEIVED', 'IN_PROGRESS', 'COMPLETED'];
  const currentIdx = statusOrder.indexOf(status);

  return (
    <div className="space-y-4">
      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Status Timeline</p>
        <div className="space-y-2">
          {timeline.map((t, i) => {
            const done = statusOrder.indexOf(t.s) <= currentIdx;
            const current = t.s === status || (status === 'ACCEPTED' && t.s === 'CONFIRMED');
            return (
              <div key={t.s} className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-white
                  ${current ? 'bg-blue-600 ring-2 ring-blue-200' : done ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {done && !current && <CheckCircle2 size={10} />}
                  {current && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${current ? 'text-blue-700' : done ? 'text-green-700' : 'text-gray-400'}`}>{t.s}</p>
                  <p className="text-xs text-gray-500">{t.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Actions</p>

        {/* DRAFT actions */}
        {['DRAFT'].includes(status) && (
          <>
            <Link href={`/admin/quotations/${quotationId}/edit`}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              <Edit size={15} /> Edit Quotation
            </Link>
            <button onClick={handleMarkSent} disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Send size={15} /> Mark as Sent
            </button>
          </>
        )}

        {/* SENT actions */}
        {['SENT'].includes(status) && (
          <>
            <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold mb-1">💬 Awaiting Customer Reply</p>
              <p>Customer reviews via WhatsApp. Once they agree, confirm below.</p>
            </div>
            <button onClick={handleConfirm} disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
              <CheckCircle2 size={15} /> Confirm Quotation
            </button>
            <button onClick={handleReject} disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors">
              <XCircle size={15} /> Reject / Lost
            </button>
            <Link href={`/admin/quotations/${quotationId}/edit`}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <Edit size={13} /> Edit & Revise
            </Link>
          </>
        )}

        {/* CONFIRMED / ACCEPTED actions */}
        {['CONFIRMED', 'ACCEPTED'].includes(status) && !createdWoId && (
          <>
            <div className="text-xs text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="font-semibold mb-1">✅ Quotation Confirmed</p>
              <p>Record advance payment to generate the Work Order automatically.</p>
            </div>
            {!showPaymentForm ? (
              <button onClick={() => setShowPaymentForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                <Banknote size={15} /> Record Advance Payment
              </button>
            ) : (
              <div className="space-y-3 bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-xs font-bold text-green-800">Record Advance Payment</p>
                <div>
                  <label className="text-xs text-green-700 font-medium">Amount (₹) *</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} min={1}
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
                </div>
                <div>
                  <label className="text-xs text-green-700 font-medium">Payment Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    {PAYMENT_METHODS.map(m => <option key={m}>{m.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-green-700 font-medium">Reference / UTR / Cheque #</label>
                  <input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Optional"
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
                </div>
                <div>
                  <label className="text-xs text-green-700 font-medium">Date Received</label>
                  <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                    className="w-full mt-1 text-sm border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleRecordPayment} disabled={isPending}
                    className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {isPending ? 'Processing…' : 'Confirm & Create WO'}
                  </button>
                  <button onClick={() => setShowPaymentForm(false)}
                    className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Work Order created */}
        {(['ADVANCE_RECEIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status) || createdWoId) && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-bold text-emerald-800 mb-2">🔧 Work Order Created</p>
            {createdWoId && (
              <Link href={`/admin/work-orders/${createdWoId}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                <Wrench size={14} /> View Work Order <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick info */}
      {validUntil && ['DRAFT', 'SENT'].includes(status) && (
        <div className={`rounded-xl p-4 text-xs ${new Date(validUntil) < new Date() ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <p className="font-semibold">Valid Until: {new Date(validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 text-center font-medium">{success}</div>}
    </div>
  );
}
