'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  Search, Download, Filter, Phone, Mail, MapPin,
  Calendar, CheckCircle2, AlertCircle, X, MessageSquare,
  MessageCircle, ArrowUpRight, MoreVertical, RefreshCw,
  FileSpreadsheet, FileText, ChevronDown, Check, Edit3, Trash2
} from 'lucide-react';
import { updateLeadStatus, deleteLead } from './actions';

export interface LeadItem {
  id: string;
  reference_number?: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  location?: string;
  requirement?: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED' | string;
  remarks?: string;
  created_at: string;
  updated_at?: string;
}

interface Props {
  initialLeads: LeadItem[];
}

const COMMON_REMARKS = [
  'Price quotation rejected / high budget',
  'Purchased from another vendor',
  'Customer not reachable / wrong number',
  'Out of operational service area',
  'Just exploring / postponed project',
  'Duplicate enquiry',
  'Converted to Work Order / Project',
];

export default function LeadsManagerClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<LeadItem | null>(null);
  const [closingLead, setClosingLead] = useState<LeadItem | null>(null);
  const [closeRemarks, setCloseRemarks] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState<boolean>(false);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Status filter
      if (statusFilter !== 'ALL' && l.status !== statusFilter) {
        return false;
      }

      // Service filter
      if (serviceFilter !== 'ALL' && !l.service?.toLowerCase().includes(serviceFilter.toLowerCase())) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = l.reference_number?.toLowerCase().includes(q);
        const nameMatch = l.name?.toLowerCase().includes(q);
        const phoneMatch = l.phone?.toLowerCase().includes(q);
        const emailMatch = l.email?.toLowerCase().includes(q);
        const locationMatch = l.location?.toLowerCase().includes(q);
        const serviceMatch = l.service?.toLowerCase().includes(q);
        const reqMatch = l.requirement?.toLowerCase().includes(q);
        const remarksMatch = l.remarks?.toLowerCase().includes(q);
        return (
          refMatch ||
          nameMatch ||
          phoneMatch ||
          emailMatch ||
          locationMatch ||
          serviceMatch ||
          reqMatch ||
          remarksMatch
        );
      }

      return true;
    });
  }, [leads, statusFilter, serviceFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'NEW').length;
    const contactedCount = leads.filter(l => l.status === 'CONTACTED').length;
    const convertedCount = leads.filter(l => l.status === 'CONVERTED').length;
    const closedCount = leads.filter(l => l.status === 'CLOSED').length;
    return { total, newCount, contactedCount, convertedCount, closedCount };
  }, [leads]);

  // Handle Quick Status Change
  function handleStatusChange(lead: LeadItem, newStatus: string) {
    if (newStatus === 'CLOSED') {
      setClosingLead(lead);
      setCloseRemarks(lead.remarks || '');
      return;
    }

    setErrorMessage('');
    startTransition(async () => {
      const res = await updateLeadStatus(lead.id, newStatus);
      if (res.success) {
        setLeads(prev =>
          prev.map(item => (item.id === lead.id ? { ...item, status: newStatus } : item))
        );
        showToast(`Lead ${lead.reference_number || lead.name} updated to ${newStatus}`);
      } else {
        setErrorMessage(res.error || 'Failed to update status');
      }
    });
  }

  // Handle Confirm Close with Remarks
  function handleConfirmClose() {
    if (!closingLead) return;

    setErrorMessage('');
    startTransition(async () => {
      const res = await updateLeadStatus(closingLead.id, 'CLOSED', closeRemarks);
      if (res.success) {
        setLeads(prev =>
          prev.map(item =>
            item.id === closingLead.id ? { ...item, status: 'CLOSED', remarks: closeRemarks } : item
          )
        );
        showToast(`Lead ${closingLead.reference_number || closingLead.name} marked as CLOSED`);
        setClosingLead(null);
        setCloseRemarks('');
      } else {
        setErrorMessage(res.error || 'Failed to close lead');
      }
    });
  }

  // Export to CSV / Excel
  function handleExport(format: 'csv' | 'excel') {
    setExportDropdownOpen(false);
    if (filteredLeads.length === 0) {
      alert('No leads available to export with current filters.');
      return;
    }

    const headers = [
      'Reference Number',
      'Date Submitted',
      'Full Name',
      'Phone Number',
      'Email Address',
      'Service Required',
      'Location / Area',
      'Requirement Type',
      'Message / Scope Details',
      'Status',
      'Remarks / Reason for Close',
    ];

    const escapeCSV = (val?: string | null) => {
      if (!val) return '""';
      const clean = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${clean}"`;
    };

    const rows = filteredLeads.map(l => [
      escapeCSV(l.reference_number || 'N/A'),
      escapeCSV(new Date(l.created_at).toLocaleString('en-IN')),
      escapeCSV(l.name),
      escapeCSV(l.phone),
      escapeCSV(l.email || ''),
      escapeCSV(l.service),
      escapeCSV(l.location || ''),
      escapeCSV(l.requirement || ''),
      escapeCSV(l.message || ''),
      escapeCSV(l.status),
      escapeCSV(l.remarks || ''),
    ]);

    // Add UTF-8 BOM (\uFEFF) for perfect character and column parsing in Microsoft Excel
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileExt = format === 'excel' ? 'csv' : 'csv';
    link.setAttribute('href', url);
    link.setAttribute('download', `ProHomeX-Leads-${statusFilter}-${dateStr}.${fileExt}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredLeads.length} leads successfully!`);
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case 'NEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            NEW
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            CONTACTED
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            CONVERTED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
            CLOSED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {s}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads &amp; Quotation Enquiries</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage incoming customer quote requests, update follow-up statuses, record closure remarks, and export reports.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 relative">
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Download size={14} /> Export Leads ({filteredLeads.length})
              <ChevronDown size={13} className="ml-0.5 opacity-70" />
            </button>

            {exportDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50 animate-fade-in">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <FileText size={14} className="text-blue-600" /> Export as CSV (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('excel')}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-600" /> Export for Excel (.csv)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast & Error Alerts */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          {toastMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-[11px] font-mono uppercase tracking-wider opacity-70">Total Leads</p>
          <p className="text-2xl font-bold font-mono mt-1">{stats.total}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('NEW')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'NEW'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-blue-50/50'
          }`}
        >
          <p className="text-[11px] font-mono uppercase tracking-wider opacity-70">New Enquiries</p>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-1" style={{ color: statusFilter === 'NEW' ? '#fff' : undefined }}>
            {stats.newCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('CONTACTED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'CONTACTED'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-amber-50/50'
          }`}
        >
          <p className="text-[11px] font-mono uppercase tracking-wider opacity-70">In Progress</p>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1" style={{ color: statusFilter === 'CONTACTED' ? '#fff' : undefined }}>
            {stats.contactedCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('CONVERTED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'CONVERTED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-emerald-50/50'
          }`}
        >
          <p className="text-[11px] font-mono uppercase tracking-wider opacity-70">Converted</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1" style={{ color: statusFilter === 'CONVERTED' ? '#fff' : undefined }}>
            {stats.convertedCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('CLOSED')}
          className={`p-4 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'CLOSED'
              ? 'bg-gray-700 text-white border-gray-700 shadow-sm'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-[11px] font-mono uppercase tracking-wider opacity-70">Closed</p>
          <p className="text-2xl font-bold font-mono text-gray-600 mt-1" style={{ color: statusFilter === 'CLOSED' ? '#fff' : undefined }}>
            {stats.closedCount}
          </p>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, ref, area..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-semibold text-gray-400 uppercase text-[10px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses ({leads.length})</option>
              <option value="NEW">New ({stats.newCount})</option>
              <option value="CONTACTED">Contacted ({stats.contactedCount})</option>
              <option value="CONVERTED">Converted ({stats.convertedCount})</option>
              <option value="CLOSED">Closed ({stats.closedCount})</option>
            </select>
          </div>

          {/* Service Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-semibold text-gray-400 uppercase text-[10px]">Service:</span>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Services</option>
              <option value="CCTV">CCTV Surveillance</option>
              <option value="Solar">Solar Energy</option>
              <option value="UPS">UPS Power</option>
              <option value="Automation">Home &amp; Sump Automation</option>
              <option value="Networking">Networking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="px-4 py-3.5">Reference</th>
                  <th className="px-4 py-3.5">Customer &amp; Contact</th>
                  <th className="px-4 py-3.5">Service &amp; Requirement</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Remarks (if Closed)</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => {
                  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Reference & Date */}
                      <td className="px-4 py-4 align-top font-mono">
                        <span className="font-bold text-blue-600 block">
                          {lead.reference_number || '—'}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {new Date(lead.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Customer Name & Contact */}
                      <td className="px-4 py-4 align-top">
                        <p className="font-bold text-gray-900">{lead.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
                          >
                            <Phone size={11} /> {lead.phone}
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(lead.name)},%20this%20is%20regarding%20your%20quote%20request%20(${lead.reference_number || ''})%20with%20ProHomeX.`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1ea64a] hover:opacity-80 p-0.5"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                          )}
                        </div>
                        {lead.email && (
                          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Mail size={10} /> {lead.email}
                          </p>
                        )}
                      </td>

                      {/* Service & Requirement */}
                      <td className="px-4 py-4 align-top">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-md text-[11px] mb-1">
                          {lead.service}
                        </span>
                        {lead.requirement && (
                          <p className="text-[11px] text-gray-600 max-w-[200px] truncate">
                            {lead.requirement}
                          </p>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4 align-top text-gray-600">
                        {lead.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                            {lead.location}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-1">
                          {statusBadge(lead.status)}
                        </div>
                      </td>

                      {/* Remarks (If Closed) */}
                      <td className="px-4 py-4 align-top max-w-[220px]">
                        {lead.status === 'CLOSED' ? (
                          lead.remarks ? (
                            <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-700 leading-snug">
                              <span className="font-semibold text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">
                                Reason / Remarks:
                              </span>
                              {lead.remarks}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setClosingLead(lead);
                                setCloseRemarks('');
                              }}
                              className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              <Edit3 size={11} /> Add Remarks
                            </button>
                          )
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-4 align-top text-right space-y-1.5">
                        {/* Quick Status Select */}
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            disabled={isPending}
                            value={lead.status}
                            onChange={e => handleStatusChange(lead, e.target.value)}
                            className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="CLOSED">Closed (with Remarks)</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelectedLeadForDetails(lead)}
                            className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-gray-400 space-y-2">
            <p className="font-semibold text-gray-600 text-sm">No matching leads found</p>
            <p>Try adjusting your search query or status filter.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: CLOSE LEAD & RECORD REMARKS */}
      {closingLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Close Lead &amp; Record Remarks</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ref: <span className="font-mono font-bold text-blue-600">{closingLead.reference_number || 'N/A'}</span> — {closingLead.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClosingLead(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Remarks Chips */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 uppercase">
                Quick Select Reason:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_REMARKS.map((remark, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCloseRemarks(remark)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left ${
                      closeRemarks === remark
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {remark}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Closing Remarks / Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={closeRemarks}
                onChange={e => setCloseRemarks(e.target.value)}
                placeholder="Explain why this lead was closed (e.g. client budget mismatch, already installed, non-responsive)..."
                className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setClosingLead(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !closeRemarks.trim()}
                onClick={handleConfirmClose}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
              >
                {isPending ? 'Closing...' : 'Confirm & Close Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL LEAD DETAILS DRAWER / MODAL */}
      {selectedLeadForDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold">
                  ENQUIRY SPECIFICATION
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedLeadForDetails.name}
                </h3>
                <p className="text-xs font-mono text-gray-500">
                  Ref: {selectedLeadForDetails.reference_number || 'N/A'} • Submitted on{' '}
                  {new Date(selectedLeadForDetails.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForDetails(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Contact Action Bar */}
            <div className="flex flex-wrap items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <a
                href={`tel:${selectedLeadForDetails.phone}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                <Phone size={13} /> Call {selectedLeadForDetails.phone}
              </a>
              {selectedLeadForDetails.phone && (
                <a
                  href={`https://wa.me/${selectedLeadForDetails.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedLeadForDetails.name)},%20we%20have%20received%20your%20quote%20request%20(${selectedLeadForDetails.reference_number || ''})%20at%20ProHomeX.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1ea64a] hover:bg-[#188c3e] text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
              )}
              {selectedLeadForDetails.email && (
                <a
                  href={`mailto:${selectedLeadForDetails.email}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold"
                >
                  <Mail size={13} /> Send Email
                </a>
              )}
            </div>

            {/* Lead Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-gray-500 uppercase text-[10px]">Service Required</p>
                <p className="font-semibold text-gray-900 mt-0.5">{selectedLeadForDetails.service}</p>
              </div>

              <div>
                <p className="font-bold text-gray-500 uppercase text-[10px]">Requirement Type</p>
                <p className="font-semibold text-gray-900 mt-0.5">{selectedLeadForDetails.requirement || '—'}</p>
              </div>

              <div>
                <p className="font-bold text-gray-500 uppercase text-[10px]">Location / Site Area</p>
                <p className="font-semibold text-gray-900 mt-0.5">{selectedLeadForDetails.location || '—'}</p>
              </div>

              <div>
                <p className="font-bold text-gray-500 uppercase text-[10px]">Current Status</p>
                <div className="mt-1">{statusBadge(selectedLeadForDetails.status)}</div>
              </div>
            </div>

            {/* Scope / Message */}
            {selectedLeadForDetails.message && (
              <div>
                <p className="font-bold text-gray-500 uppercase text-[10px] mb-1">
                  Additional Details / Customer Notes:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-700 whitespace-pre-wrap font-sans">
                  {selectedLeadForDetails.message}
                </div>
              </div>
            )}

            {/* Closure Remarks */}
            {selectedLeadForDetails.remarks && (
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-900">
                <p className="font-bold uppercase text-[10px] text-red-700 mb-0.5">
                  Closing Remarks:
                </p>
                <p>{selectedLeadForDetails.remarks}</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedLeadForDetails(null)}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
