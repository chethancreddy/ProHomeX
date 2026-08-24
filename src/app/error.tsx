'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center border border-slate-200">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
        <p className="text-slate-500 mb-8 text-sm">
          An unexpected error has occurred on the server. We have been notified.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
