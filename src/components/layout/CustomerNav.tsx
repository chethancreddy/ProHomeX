import Link from 'next/link';

export default function CustomerNav() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/customer/dashboard" className="text-white font-bold text-xl tracking-tight">
              ProHomeX <span className="text-blue-500">Portal</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/customer/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link href="/customer/quotations" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Quotes & Orders</Link>
                <Link href="/customer/invoices" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Invoices</Link>
                <Link href="/customer/sites" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Sites</Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <Link href="/customer/support" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Support</Link>
             <form action="/auth/signout" method="post">
                <button type="submit" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sign Out</button>
             </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
