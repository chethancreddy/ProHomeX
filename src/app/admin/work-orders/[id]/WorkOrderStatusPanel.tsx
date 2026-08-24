'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { assignTechnician, updateWorkOrderStatus, completeWorkOrderAndGenerateInvoice } from '../actions';
import { CheckCircle2, Wrench, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface Technician { id: string; full_name: string; email: string }

interface Props {
  workOrderId: string;
  currentStatus: string;
  assignedToId: string;
  assignedToName: string;
  scheduledDate: string | null;
  technicians: Technician[];
  hasInvoice: boolean;
}

export default function WorkOrderStatusPanel({ workOrderId, currentStatus, assignedToId, assignedToName, scheduledDate, technicians, hasInvoice }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [techId, setTechId] = useState(assignedToId);
  const [schDate, setSchDate] = useState(scheduledDate || '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const router = useRouter();

  function toast(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }

  function handleAssign() {
    startTransition(async () => {
      try {
        await assignTechnician(workOrderId, techId, schDate);
        toast('Technician assigned!');
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      try {
        await updateWorkOrderStatus(workOrderId, newStatus);
        setStatus(newStatus);
        toast(`Status → ${newStatus}`);
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  function handleComplete() {
    if (!confirm('Mark as COMPLETE and generate the final invoice? This cannot be undone.')) return;
    startTransition(async () => {
      try {
        const id = await completeWorkOrderAndGenerateInvoice(workOrderId);
        setInvoiceId(id);
        setStatus('COMPLETED');
        toast('Work order completed! Invoice generated.');
        router.refresh();
      } catch (e: any) { setError(e.message); }
    });
  }

  const canComplete = ['IN_PROGRESS', 'ASSIGNED'].includes(status) && !hasInvoice && !invoiceId;

  return (
    <div className="space-y-4 sticky top-4">
      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Work Order Status</p>
        {['PENDING', 'ASSIGNED', 'IN_PROGRESS'].map(s => (
          <button key={s} onClick={() => handleStatusChange(s)}
            disabled={isPending || status === s || status === 'COMPLETED'}
            className={`w-full py-2 text-xs font-semibold rounded-lg border transition-all ${
              status === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 disabled:opacity-40'
            }`}>
            {s.replace('_', ' ')}
          </button>
        ))}

        {status === 'COMPLETED' && (
          <div className="flex items-center gap-2 py-2 px-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 size={14} className="text-green-600" />
            <span className="text-xs font-bold text-green-700">COMPLETED</span>
          </div>
        )}
      </div>

      {/* Assign Technician */}
      {status !== 'COMPLETED' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase">Assign Technician</p>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Technician</label>
            <select value={techId} onChange={e => setTechId(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Unassigned</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Scheduled Date</label>
            <input type="date" value={schDate} onChange={e => setSchDate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={handleAssign} disabled={isPending}
            className="w-full py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
            Save Assignment
          </button>
        </div>
      )}

      {/* Complete & Generate Invoice */}
      {canComplete && (
        <button onClick={handleComplete} disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
          <CheckCircle2 size={16} />
          {isPending ? 'Generating…' : 'Complete & Generate Invoice'}
        </button>
      )}

      {(invoiceId || (hasInvoice && status === 'COMPLETED')) && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <CheckCircle2 size={20} className="mx-auto text-emerald-600 mb-1" />
          <p className="text-xs font-bold text-emerald-800">Invoice Generated</p>
          {invoiceId && (
            <Link href={`/admin/invoices/${invoiceId}`}
              className="mt-2 inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-900">
              View Invoice →
            </Link>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
      {success && <p className="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 text-center font-medium">{success}</p>}
    </div>
  );
}
