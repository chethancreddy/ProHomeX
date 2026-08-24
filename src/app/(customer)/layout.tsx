import React from "react";
import Link from "next/link";
import { LayoutDashboard, FileText, ClipboardList, Ticket, Banknote, ShieldCheck, Folder, User } from "lucide-react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-xl tracking-tight text-slate-900">
              TechMaha
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/quotations" label="Quotations" />
              <NavLink href="/orders" label="Orders" />
              <NavLink href="/tickets" label="Tickets" />
              <NavLink href="/invoices" label="Invoices" />
              <NavLink href="/warranty" label="Warranty & AMC" />
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <User size={20} />
              <span className="text-sm font-medium hidden sm:inline-block">My Profile</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
    >
      {label}
    </Link>
  );
}
