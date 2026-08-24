'use client';

import { Printer, Download } from 'lucide-react';

interface Props {
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark';
}

export default function PrintButton({ label = 'Download / Print PDF', className = '', variant = 'dark' }: Props) {
  function handlePrint() {
    window.print();
  }

  const baseCls = variant === 'primary'
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : variant === 'secondary'
    ? 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
    : 'bg-slate-900 hover:bg-slate-800 text-white';

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer no-print ${baseCls} ${className}`}
    >
      <Printer size={14} /> {label}
    </button>
  );
}
