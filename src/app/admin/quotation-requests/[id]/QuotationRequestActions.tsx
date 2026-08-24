'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateRequestStatus, addAdminNote, convertRequestToQuotation } from '../actions';
import { Clock, CheckCircle2, RefreshCw, XCircle, ArrowRight } from 'lucide-react';

const STATUSES = [
  { value: 'PENDING', label: 'Pending', icon: Clock, cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'REVIEWING', label: 'Reviewing', icon: RefreshCw, cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'QUOTED', label: 'Quoted', icon: CheckCircle2, cls: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'REJECTED', label: 'Rejected', icon: XCircle, cls: 'text-red-700 bg-red-50 border-red-200' },
];

interface Props {
  requestId: string;
  currentStatus: string;
  adminNotes: string;
  convertedQuotationId: string | null;
  createdAt: string;
}

export default function QuotationRequestActions({ requestId, currentStatus, adminNotes, convertedQuotationId, createdAt }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(adminNotes);
  const [isPending, startTransition] = useTransition();
  const [convertedId, setConvertedId] = useState(convertedQuotationId);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const router = useRouter();

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateRequestStatus(requestId, newStatus);
        setSavedMsg('Status updated');
        setTimeout(() => setSavedMsg(''), 2000);
        router.refresh();
      } catch (err: any) { setError(err.message); }
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      try {
        await addAdminNote(requestId, notes);
        setSavedMsg('Note saved');
        setTimeout(() => setSavedMsg(''), 2000);
      } catch (err: any) { setError(err.message); }
    });
  }

  function handleConvert() {
    if (!confirm('Convert this request to a formal quotation? This will create a DRAFT quotation with current selling prices.')) return;
    startTransition(async () => {
      try {
        const quotationId = await convertRequestToQuotation(requestId);
        setConvertedId(quotationId);
        setStatus('QUOTED');
        router.refresh();
      } catch (err: any) { setError(err.message); }
    });
  }

  return (
    <div className="space-y-4">
      {/* Request Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Request Info</p>
        <p className="text-xs text-gray-500">Received: <span className="text-gray-700 font-medium">{new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></p>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Update Status</p>
        {STATUSES.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={isPending || status === s.value}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                status === s.value ? `${s.cls} border opacity-100` : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              } disabled:cursor-default`}
            >
              <Icon size={14} />{s.label}
              {status === s.value && <span className="ml-auto text-xs opacity-70">Current</span>}
            </button>
          );
        })}
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Internal Notes</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add notes for your team…"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button onClick={handleSaveNotes} disabled={isPending}
          className="mt-2 w-full py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Saving…' : 'Save Note'}
        </button>
      </div>

      {/* Convert to Quotation */}
      {!convertedId ? (
        <button onClick={handleConvert} disabled={isPending || status === 'REJECTED'}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
          <CheckCircle2 size={16} />
          Convert to Quotation
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <CheckCircle2 size={20} className="mx-auto text-green-600 mb-1" />
          <p className="text-xs font-semibold text-green-800">Quotation Created</p>
          <Link href={`/admin/quotations`} className="mt-2 inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium">
            View Quotation <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Error / success */}
      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
      {savedMsg && <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg text-center">{savedMsg}</p>}
    </div>
  );
}
