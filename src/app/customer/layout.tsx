'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, ShoppingCart, LifeBuoy, Receipt, ShieldCheck, User, LogOut, Menu, X, ShoppingBag, Cpu } from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/app/actions/auth';

const navLinks = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customer/products', label: 'Products', icon: ShoppingBag },
  { href: '/customer/automation', label: 'Home Automation', icon: Cpu },
  { href: '/customer/quotations', label: 'Quotations', icon: FileText },
  { href: '/customer/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/customer/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { href: '/customer/invoices', label: 'Invoices', icon: Receipt },
  { href: '/customer/warranty', label: 'Warranty & AMC', icon: ShieldCheck },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/customer/dashboard" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-extrabold">ProHome</span><span className="text-slate-900 font-extrabold">X</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Customer Portal</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/customer/profile" className={`p-2 rounded-md transition-colors ${pathname === '/customer/profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              <User size={20} />
            </Link>
            <form action={signOut}>
              <button type="submit" className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Logout">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileOpen(false)}>
          <nav className="bg-white w-72 h-full shadow-xl flex flex-col py-4" onClick={e => e.stopPropagation()}>
            <div className="px-4 pb-3 border-b border-gray-100 font-bold text-lg text-slate-900">
              <span className="text-blue-600">Tech</span>Maha
            </div>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            <Link href="/customer/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <User size={18} /> My Profile
            </Link>
          </nav>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-sm text-gray-400">
          <span>© {new Date().getFullYear()} ProHomeX. All rights reserved.</span>
          <Link href="/" className="hover:text-blue-600 transition-colors">← Back to Website</Link>
        </div>
      </footer>
    </div>
  );
}
