'use client';

import { useState, useMemo } from 'react';
import {
  BarChart2, TrendingUp, Calendar, Download, Filter,
  DollarSign, Users, Wrench, Ticket, FileText, CheckCircle2,
  PieChart, RefreshCw, Box, ArrowUpRight
} from 'lucide-react';

interface Props {
  invoices: any[];
  payments: any[];
  quotations: any[];
  workOrders: any[];
  leads: any[];
  tickets: any[];
  customers: any[];
  products: any[];
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function ReportsDashboard({
  invoices,
  payments,
  quotations,
  workOrders,
  leads,
  tickets,
  customers,
  products
}: Props) {
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Date Filtering Helper
  function matchesDate(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();

    if (dateRange === 'ALL') return true;

    if (dateRange === 'TODAY') {
      return d.toDateString() === now.toDateString();
    }

    if (dateRange === 'LAST_7_DAYS') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= sevenDaysAgo && d <= now;
    }

    if (dateRange === 'THIS_MONTH') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }

    if (dateRange === 'LAST_MONTH') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return d >= lastMonth && d <= endLastMonth;
    }

    if (dateRange === 'FY25_26') {
      return d >= new Date('2025-04-01') && d <= new Date('2026-03-31');
    }

    if (dateRange === 'FY24_25') {
      return d >= new Date('2024-04-01') && d <= new Date('2025-03-31');
    }

    if (dateRange === 'CUSTOM') {
      if (customStart && d < new Date(customStart)) return false;
      if (customEnd && d > new Date(customEnd + 'T23:59:59')) return false;
      return true;
    }

    return true;
  }

  // Filter datasets
  const filteredInvoices = useMemo(() => invoices.filter(i => matchesDate(i.created_at)), [invoices, dateRange, customStart, customEnd]);
  const filteredPayments = useMemo(() => payments.filter(p => matchesDate(p.received_at)), [payments, dateRange, customStart, customEnd]);
  const filteredQuotations = useMemo(() => quotations.filter(q => matchesDate(q.created_at)), [quotations, dateRange, customStart, customEnd]);
  const filteredWorkOrders = useMemo(() => workOrders.filter(w => matchesDate(w.created_at)), [workOrders, dateRange, customStart, customEnd]);
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (!matchesDate(l.created_at)) return false;
      if (serviceFilter !== 'ALL' && !(l.service || '').toLowerCase().includes(serviceFilter.toLowerCase())) return false;
      return true;
    });
  }, [leads, dateRange, serviceFilter, customStart, customEnd]);
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (!matchesDate(t.created_at)) return false;
      if (serviceFilter !== 'ALL' && !(t.category || '').toLowerCase().includes(serviceFilter.toLowerCase())) return false;
      return true;
    });
  }, [tickets, dateRange, serviceFilter, customStart, customEnd]);

  // Aggregated KPIs
  const totalBilled = filteredInvoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
  const totalCollected = filteredPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalOutstanding = filteredInvoices.reduce((s, i) => s + (Number(i.balance_due) || 0), 0);
  const totalQuotedValue = filteredQuotations.reduce((s, q) => s + (Number(q.total_amount) || 0), 0);

  // Conversion rate
  const convertedLeadsCount = filteredLeads.filter(l => l.status === 'CONVERTED').length;
  const leadConversionRate = filteredLeads.length > 0 ? Math.round((convertedLeadsCount / filteredLeads.length) * 100) : 0;

  // Work Orders Completion
  const completedWOCount = filteredWorkOrders.filter(w => w.status === 'COMPLETED').length;
  const woCompletionRate = filteredWorkOrders.length > 0 ? Math.round((completedWOCount / filteredWorkOrders.length) * 100) : 0;

  // Breakdown by Service / Category for Leads & Tickets
  const leadsByService = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach(l => {
      const s = l.service || 'Other';
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [filteredLeads]);

  const ticketsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const c = t.category || 'General';
      map[c] = (map[c] || 0) + 1;
    });
    return map;
  }, [filteredTickets]);

  // Generic CSV Downloader
  function exportDataToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
    const csvRows = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${dateRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Date / Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BarChart2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Business Reports</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Comprehensive data analytics, conversion metrics, and multi-dataset CSV export.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Date Picker */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Range */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
            <Calendar size={14} className="text-gray-400 ml-2" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-transparent border-0 focus:ring-0 cursor-pointer pr-3"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="FY25_26">FY 2025-26</option>
              <option value="FY24_25">FY 2024-25</option>
              <option value="CUSTOM">Custom Range...</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'CUSTOM' && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-2 py-1 shadow-sm text-xs">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="text-xs border-0 p-0 focus:ring-0 text-gray-700"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="text-xs border-0 p-0 focus:ring-0 text-gray-700"
              />
            </div>
          )}

          {/* Service Filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
            <Filter size={13} className="text-gray-400 ml-2" />
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-transparent border-0 focus:ring-0 cursor-pointer pr-3"
            >
              <option value="ALL">All Services</option>
              <option value="CCTV">CCTV</option>
              <option value="UPS">UPS &amp; Power</option>
              <option value="Solar">Solar</option>
              <option value="Networking">Networking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Invoiced</span>
            <DollarSign size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 font-mono">₹{fmt(totalBilled)}</p>
          <p className="text-[11px] text-gray-400">{filteredInvoices.length} invoice(s) in period</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Collections Received</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono">₹{fmt(totalCollected)}</p>
          <p className="text-[11px] text-gray-400">{filteredPayments.length} payment receipts</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Lead Conversion</span>
            <Users size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700 font-mono">{leadConversionRate}%</p>
          <p className="text-[11px] text-gray-400">{convertedLeadsCount} of {filteredLeads.length} leads converted</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Jobs Completion</span>
            <Wrench size={16} className="text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-700 font-mono">{woCompletionRate}%</p>
          <p className="text-[11px] text-gray-400">{completedWOCount} of {filteredWorkOrders.length} work orders done</p>
        </div>
      </div>

      {/* Quick Export Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Download size={18} className="text-blue-400" /> Multi-Dataset Export Center
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Export filtered business records to CSV spreadsheet format for external audits, reporting, or CRM backup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Export Invoices */}
          <button
            type="button"
            onClick={() =>
              exportDataToCSV(
                'ProHomeX_Invoices_Report',
                ['Invoice Number', 'Date', 'Customer Name', 'Subtotal (₹)', 'GST Total (₹)', 'Grand Total (₹)', 'Balance Due (₹)', 'Status'],
                filteredInvoices.map(i => [
                  i.invoice_number,
                  new Date(i.created_at).toLocaleDateString('en-IN'),
                  i.customers?.company_name || i.customers?.profiles?.full_name || 'Customer',
                  Number(i.subtotal) || 0,
                  Number(i.gst_total) || 0,
                  Number(i.total_amount) || 0,
                  Number(i.balance_due) || 0,
                  i.status,
                ])
              )
            }
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <DollarSign size={14} className="text-emerald-400" /> Export Invoices CSV
          </button>

          {/* Export Leads */}
          <button
            type="button"
            onClick={() =>
              exportDataToCSV(
                'ProHomeX_Leads_Report',
                ['Reference #', 'Name', 'Phone', 'Email', 'Service', 'Location', 'Status', 'Date'],
                filteredLeads.map(l => [
                  l.reference_number || '',
                  l.name || '',
                  l.phone || '',
                  l.email || '',
                  l.service || '',
                  l.location || '',
                  l.status || '',
                  new Date(l.created_at).toLocaleDateString('en-IN'),
                ])
              )
            }
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <Users size={14} className="text-blue-400" /> Export Leads CSV
          </button>

          {/* Export Work Orders */}
          <button
            type="button"
            onClick={() =>
              exportDataToCSV(
                'ProHomeX_WorkOrders_Report',
                ['Work Order #', 'Customer', 'Technician', 'Scheduled Date', 'Completed Date', 'Status'],
                filteredWorkOrders.map(w => [
                  w.work_order_number,
                  w.customers?.company_name || w.customers?.profiles?.full_name || 'Customer',
                  (w.profiles as any)?.full_name || 'Unassigned',
                  w.scheduled_date || '—',
                  w.completed_date || '—',
                  w.status,
                ])
              )
            }
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <Wrench size={14} className="text-amber-400" /> Export Work Orders CSV
          </button>

          {/* Export Quotations */}
          <button
            type="button"
            onClick={() =>
              exportDataToCSV(
                'ProHomeX_Quotations_Report',
                ['Quotation #', 'Title', 'Customer', 'Total Value (₹)', 'Advance Required (₹)', 'Status', 'Created Date'],
                filteredQuotations.map(q => [
                  q.quotation_number,
                  q.title || 'Quotation',
                  q.customers?.company_name || q.customers?.profiles?.full_name || 'Customer',
                  Number(q.total_amount) || 0,
                  Number(q.advance_amount) || 0,
                  q.status,
                  new Date(q.created_at).toLocaleDateString('en-IN'),
                ])
              )
            }
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <FileText size={14} className="text-purple-400" /> Export Quotations CSV
          </button>
        </div>
      </div>

      {/* Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Service Group */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <PieChart size={16} className="text-blue-600" /> Enquiries by System / Service
          </h3>
          <div className="space-y-3 text-xs">
            {Object.entries(leadsByService).length > 0 ? (
              Object.entries(leadsByService).map(([srv, count]) => {
                const total = filteredLeads.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={srv}>
                    <div className="flex justify-between text-gray-700 font-semibold mb-1">
                      <span>{srv}</span>
                      <span>{count} enquiries ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-gray-400">No leads recorded in this timeframe.</p>
            )}
          </div>
        </div>

        {/* Tickets by Category */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Ticket size={16} className="text-purple-600" /> Support Tickets by Category
          </h3>
          <div className="space-y-3 text-xs">
            {Object.entries(ticketsByCategory).length > 0 ? (
              Object.entries(ticketsByCategory).map(([cat, count]) => {
                const total = filteredTickets.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-gray-700 font-semibold mb-1">
                      <span>{cat}</span>
                      <span>{count} ticket(s) ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-gray-400">No support tickets recorded in this timeframe.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
