'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adjustStock, type StockAdjustType } from './actions';

interface Props {
  productId: string;
  currentStock: number;
}

export default function StockAdjuster({ productId, currentStock }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(1);
  const [type, setType] = useState<StockAdjustType>('ADD');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount < 0) { setError('Amount must be positive'); return; }
    setError('');

    startTransition(async () => {
      try {
        await adjustStock(productId, amount, type, notes || undefined);
        setOpen(false);
        setAmount(1);
        setNotes('');
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg transition-colors border border-slate-200"
      >
        Adjust
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 justify-end flex-wrap">
      <select
        value={type}
        onChange={e => setType(e.target.value as StockAdjustType)}
        className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="ADD">+ Add</option>
        <option value="SUBTRACT">− Remove</option>
        <option value="SET">= Set to</option>
      </select>
      <input
        type="number"
        min="0"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        className="w-16 text-xs border border-gray-300 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? '...' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(''); }}
        className="text-xs font-medium px-2 py-1.5 text-slate-500 hover:text-slate-700 transition-colors"
      >
        Cancel
      </button>
      {error && <p className="text-xs text-red-600 w-full text-right">{error}</p>}
    </form>
  );
}
