'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Box, ClipboardList, Ticket,
  PenTool, Receipt, BarChart2, Settings, LogOut, Menu, X,
  UserPlus, Briefcase, Warehouse, Landmark, Globe
} from 'lucide-react';
import { signOut } from '@/app/actions/auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/leads', label: 'Leads', icon: UserPlus },
  { href: '/admin/products', label: 'Products', icon: Box },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/quotations', label: 'Quotations', icon: ClipboardList },
  { href: '/admin/orders', label: 'Orders', icon: Briefcase },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { href: '/admin/work-orders', label: 'Work Orders', icon: PenTool },
  { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { href: '/admin/accounting', label: 'Accounting & Tax', icon: Landmark },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/content', label: 'Website CMS', icon: Globe },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Don't wrap the login page
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 w-64 bg-slate-900 text-white flex flex-col h-full transition-transform duration-200`}>
        <div className="h-16 flex items-center px-5 font-bold text-lg tracking-tight border-b border-slate-800 flex-shrink-0">
          <span className="text-blue-400">ProHome</span>X
          <span className="text-slate-400 font-normal text-xs ml-2 mt-0.5">Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 flex-shrink-0">
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors text-sm font-medium">
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="font-semibold text-gray-800 hidden md:block">
            {navItems.find(n => pathname.startsWith(n.href))?.label || 'Admin Portal'}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">Admin Portal</span>
            <Link href="/" className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 px-2 py-1 rounded transition-colors">
              ← Website
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
