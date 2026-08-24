import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center border border-slate-200">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8 text-sm">
          We could not find the page you were looking for. It might have been moved or deleted.
        </p>
        <Link
          href="/"
          className="inline-flex px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
