'use client';

import { useState, useMemo, useTransition } from 'react';
import {
  DollarSign, Receipt, FileText, TrendingUp, Calendar,
  Download, ArrowUpRight, ArrowDownRight, Building2,
  PieChart, Shield, CheckCircle, Clock, RefreshCw,
  Plus, Trash2, Scale, BookOpen, Layers, FileSpreadsheet,
  AlertCircle, AlertTriangle, ChevronRight, Filter, Search, RotateCcw,
  Check, Wallet, ArrowRight, ArrowLeftRight
} from 'lucide-react';
import { createJournalEntry, reverseJournalEntry, syncAllTransactionsToAccounting, CreateJournalLineInput } from './actions';

export type Account = {
  id: string;
  code: string;
  name: string;
  classification: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  category: string;
  description?: string;
  is_active?: boolean;
};

export type JournalLine = {
  id: string;
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
  accounts?: Account;
};

export type JournalEntry = {
  id: string;
  entry_number: string;
  entry_date: string;
  reference_type: string;
  reference_id?: string;
  narration: string;
  status: 'POSTED' | 'DRAFT' | 'REVERSED';
  total_debit: number;
  total_credit: number;
  created_at: string;
  journal_lines: JournalLine[];
};

interface Props {
  accounts: Account[];
  journalEntries: JournalEntry[];
  invoices: any[];
  invoiceItems: any[];
  payments: any[];
  quotations: any[];
  customers: any[];
}

type TabType =
  | 'chart_of_accounts'
  | 'journal_entries'
  | 'ledger'
  | 'trial_balance'
  | 'profit_loss'
  | 'balance_sheet'
  | 'receivables'
  | 'payables'
  | 'gst_summary';

type DateFilterMode = 'ALL' | 'TODAY' | 'MONTH' | 'FY' | 'CUSTOM';

export default function AccountingDashboard({
  accounts,
  journalEntries: initialJournalEntries,
  invoices,
  invoiceItems,
  payments,
  quotations,
  customers,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('trial_balance');
  const [dateFilter, setDateFilter] = useState<DateFilterMode>('FY');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>(accounts[0]?.id || '');
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Manual Journal Entry Form State
  const [newEntryDate, setNewEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newEntryNarration, setNewEntryNarration] = useState<string>('');
  const [newEntryLines, setNewEntryLines] = useState<CreateJournalLineInput[]>([
    { accountId: accounts.find(a => a.code === '1030')?.id || accounts[0]?.id || '', debit: 0, credit: 0, description: '' },
    { accountId: accounts.find(a => a.code === '4010')?.id || accounts[1]?.id || '', debit: 0, credit: 0, description: '' },
  ]);

  // Derived Date Bounds (Financial Year is Apr 1 to Mar 31 in India)
  const dateRange = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (3 = April)
    
    // Determine current FY start year (If Jan-Mar, start year was previous calendar year)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStart = new Date(fyStartYear, 3, 1);
    const fyEnd = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);

    if (dateFilter === 'TODAY') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      return { start: todayStart, end: todayEnd, label: 'Today' };
    }
    if (dateFilter === 'MONTH') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start: monthStart, end: monthEnd, label: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}` };
    }
    if (dateFilter === 'FY') {
      return { start: fyStart, end: fyEnd, label: `FY ${fyStartYear}-${String(fyStartYear + 1).slice(2)}` };
    }
    if (dateFilter === 'CUSTOM' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd + 'T23:59:59'), label: `${customStart} to ${customEnd}` };
    }
    return { start: new Date(2000, 0, 1), end: new Date(2099, 11, 31), label: 'All Time' };
  }, [dateFilter, customStart, customEnd]);

  // Filter Journal Entries based on Date Range
  const filteredJournalEntries = useMemo(() => {
    return initialJournalEntries.filter(entry => {
      const entryDate = new Date(entry.entry_date);
      return entryDate >= dateRange.start && entryDate <= dateRange.end;
    });
  }, [initialJournalEntries, dateRange]);

  // Compute Account Balances dynamically from Posted Journal Lines
  const accountBalances = useMemo(() => {
    const balances: Record<string, { debitTotal: number; creditTotal: number; netDebit: number; netCredit: number }> = {};
    
    // Initialize all accounts with 0
    accounts.forEach(acc => {
      balances[acc.id] = { debitTotal: 0, creditTotal: 0, netDebit: 0, netCredit: 0 };
    });

    // Sum all posted journal lines
    filteredJournalEntries.forEach(entry => {
      if (entry.status !== 'POSTED') return;
      entry.journal_lines?.forEach(line => {
        if (!balances[line.account_id]) {
          balances[line.account_id] = { debitTotal: 0, creditTotal: 0, netDebit: 0, netCredit: 0 };
        }
        balances[line.account_id].debitTotal += Number(line.debit) || 0;
        balances[line.account_id].creditTotal += Number(line.credit) || 0;
      });
    });

    // Calculate Normal Net Balance per Account Classification:
    // ASSET & EXPENSE -> Normal Debit (Debit - Credit)
    // LIABILITY, EQUITY, REVENUE -> Normal Credit (Credit - Debit)
    accounts.forEach(acc => {
      const b = balances[acc.id] || { debitTotal: 0, creditTotal: 0, netDebit: 0, netCredit: 0 };
      if (acc.classification === 'ASSET' || acc.classification === 'EXPENSE') {
        const net = b.debitTotal - b.creditTotal;
        b.netDebit = net >= 0 ? net : 0;
        b.netCredit = net < 0 ? Math.abs(net) : 0;
      } else {
        const net = b.creditTotal - b.debitTotal;
        b.netCredit = net >= 0 ? net : 0;
        b.netDebit = net < 0 ? Math.abs(net) : 0;
      }
    });

    return balances;
  }, [accounts, filteredJournalEntries]);

  // Trial Balance Grand Totals
  const trialBalanceTotals = useMemo(() => {
    let totalDr = 0;
    let totalCr = 0;
    accounts.forEach(acc => {
      const b = accountBalances[acc.id];
      if (b) {
        totalDr += b.netDebit;
        totalCr += b.netCredit;
      }
    });
    const isBalanced = Math.abs(totalDr - totalCr) < 0.01;
    return { totalDr, totalCr, isBalanced };
  }, [accounts, accountBalances]);

  // Profit & Loss Calculations
  const pnlData = useMemo(() => {
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalExpenses = 0;

    const revenueLines: { account: Account; amount: number }[] = [];
    const cogsLines: { account: Account; amount: number }[] = [];
    const expenseLines: { account: Account; amount: number }[] = [];

    accounts.forEach(acc => {
      const b = accountBalances[acc.id];
      const bal = (b?.netCredit || 0) - (b?.netDebit || 0);
      const expBal = (b?.netDebit || 0) - (b?.netCredit || 0);

      if (acc.classification === 'REVENUE') {
        const val = Math.max(0, bal);
        totalRevenue += val;
        if (val > 0) revenueLines.push({ account: acc, amount: val });
      } else if (acc.classification === 'EXPENSE') {
        const val = Math.max(0, expBal);
        if (acc.category === 'Cost of Sales') {
          totalCOGS += val;
          if (val > 0) cogsLines.push({ account: acc, amount: val });
        } else {
          totalExpenses += val;
          if (val > 0) expenseLines.push({ account: acc, amount: val });
        }
      }
    });

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    return { totalRevenue, totalCOGS, grossProfit, totalExpenses, netProfit, revenueLines, cogsLines, expenseLines };
  }, [accounts, accountBalances]);

  // Balance Sheet Calculations
  const balanceSheetData = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const assetLines: { account: Account; amount: number }[] = [];
    const liabilityLines: { account: Account; amount: number }[] = [];
    const equityLines: { account: Account; amount: number }[] = [];

    accounts.forEach(acc => {
      const b = accountBalances[acc.id];
      if (acc.classification === 'ASSET') {
        const val = (b?.netDebit || 0) - (b?.netCredit || 0);
        totalAssets += val;
        if (val !== 0) assetLines.push({ account: acc, amount: val });
      } else if (acc.classification === 'LIABILITY') {
        const val = (b?.netCredit || 0) - (b?.netDebit || 0);
        totalLiabilities += val;
        if (val !== 0) liabilityLines.push({ account: acc, amount: val });
      } else if (acc.classification === 'EQUITY') {
        const val = (b?.netCredit || 0) - (b?.netDebit || 0);
        totalEquity += val;
        if (val !== 0) equityLines.push({ account: acc, amount: val });
      }
    });

    // Add Net Profit from P&L to Equity
    const totalEquityWithProfit = totalEquity + pnlData.netProfit;
    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquityWithProfit)) < 0.01;

    return { totalAssets, totalLiabilities, totalEquity: totalEquityWithProfit, assetLines, liabilityLines, equityLines, isBalanced };
  }, [accounts, accountBalances, pnlData.netProfit]);

  // Ledger for Selected Account
  const selectedLedgerLines = useMemo(() => {
    if (!selectedLedgerAccountId) return { lines: [], runningClosingBalance: 0 };
    const targetAccount = accounts.find(a => a.id === selectedLedgerAccountId);
    const lines: {
      date: string;
      entryNumber: string;
      narration: string;
      description: string;
      debit: number;
      credit: number;
      runningBalance: number;
    }[] = [];

    let running = 0;
    // Sort chronological
    const sortedEntries = [...initialJournalEntries].sort(
      (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );

    sortedEntries.forEach(entry => {
      if (entry.status !== 'POSTED') return;
      entry.journal_lines?.forEach(line => {
        if (line.account_id === selectedLedgerAccountId) {
          const dr = Number(line.debit) || 0;
          const cr = Number(line.credit) || 0;
          if (targetAccount?.classification === 'ASSET' || targetAccount?.classification === 'EXPENSE') {
            running += (dr - cr);
          } else {
            running += (cr - dr);
          }
          lines.push({
            date: entry.entry_date,
            entryNumber: entry.entry_number,
            narration: entry.narration,
            description: line.description || entry.narration,
            debit: dr,
            credit: cr,
            runningBalance: running,
          });
        }
      });
    });

    return { lines, runningClosingBalance: running };
  }, [selectedLedgerAccountId, accounts, initialJournalEntries]);

  // Manual Journal Form Live Balancing Validator
  const journalFormBalance = useMemo(() => {
    const totalDr = newEntryLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCr = newEntryLines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    const diff = Math.abs(totalDr - totalCr);
    const isBalanced = diff < 0.01 && totalDr > 0;
    return { totalDr, totalCr, diff, isBalanced };
  }, [newEntryLines]);

  function handleAddJournalLine() {
    setNewEntryLines(prev => [
      ...prev,
      { accountId: accounts[0]?.id || '', debit: 0, credit: 0, description: '' }
    ]);
  }

  function handleRemoveJournalLine(index: number) {
    if (newEntryLines.length <= 2) return;
    setNewEntryLines(prev => prev.filter((_, idx) => idx !== index));
  }

  function handleLineChange(index: number, field: keyof CreateJournalLineInput, value: any) {
    setNewEntryLines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleSaveManualJournal(e: React.FormEvent) {
    e.preventDefault();
    setActionError('');
    setActionMessage('');

    if (!journalFormBalance.isBalanced) {
      setActionError(`Cannot post unbalanced journal! Debit (₹${journalFormBalance.totalDr}) must equal Credit (₹${journalFormBalance.totalCr}).`);
      return;
    }

    startTransition(async () => {
      const res = await createJournalEntry({
        entryDate: newEntryDate,
        narration: newEntryNarration || 'Manual Journal Adjustment',
        referenceType: 'MANUAL',
        lines: newEntryLines,
      });

      if (res.success) {
        setActionMessage(`Journal Entry ${res.entryNumber} posted successfully!`);
        setNewEntryNarration('');
        setNewEntryLines([
          { accountId: accounts.find(a => a.code === '1030')?.id || accounts[0]?.id || '', debit: 0, credit: 0, description: '' },
          { accountId: accounts.find(a => a.code === '4010')?.id || accounts[1]?.id || '', debit: 0, credit: 0, description: '' },
        ]);
      } else {
        setActionError(res.error || 'Failed to post journal entry.');
      }
    });
  }

  function handleReverseEntry(id: string, num: string) {
    if (!confirm(`Are you sure you want to reverse Journal Entry ${num}? A reversing voucher will be created.`)) return;
    setActionError('');
    setActionMessage('');
    startTransition(async () => {
      const res = await reverseJournalEntry(id, 'User manual cancellation');
      if (res.success) {
        setActionMessage(`Journal ${num} reversed with Reversal Voucher ${res.reversalNumber}.`);
      } else {
        setActionError(res.error || 'Failed to reverse entry.');
      }
    });
  }

  function handleSyncAll() {
    setActionError('');
    setActionMessage('');
    startTransition(async () => {
      const res = await syncAllTransactionsToAccounting();
      if (res.success) {
        setActionMessage(res.message || 'Transactions synchronized.');
      } else {
        setActionError(res.error || 'Sync failed.');
      }
    });
  }

  // Export CSV Helper
  function exportReportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Global Synchronizer */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600/30 text-blue-400 rounded-xl">
              <Scale size={20} />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
              ProHomeX Double-Entry Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Financial Accounting &amp; General Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time double-entry bookkeeping with strict Debit = Credit balance enforcement, multi-line journal vouchers, trial balance, and statutory reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSyncAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
            {isPending ? 'Syncing...' : 'Sync Invoices & Payments'}
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-sm text-emerald-800 font-medium animate-fade-in shadow-sm">
          <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-sm text-red-800 font-medium animate-fade-in shadow-sm">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Date Filter & Reporting Scope */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Reporting Period:</span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">
            {dateRange.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All Time' },
            { id: 'TODAY', label: 'Daily' },
            { id: 'MONTH', label: 'Monthly' },
            { id: 'FY', label: 'Financial Year (FY)' },
            { id: 'CUSTOM', label: 'Custom' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id as DateFilterMode)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                dateFilter === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {dateFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="border border-gray-300 rounded-lg p-1.5"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="border border-gray-300 rounded-lg p-1.5"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{pnlData.totalRevenue.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">From Invoiced Sales</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Net Profit / Margin</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${pnlData.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ₹{pnlData.netProfit.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
            {pnlData.totalRevenue > 0 ? `${((pnlData.netProfit / pnlData.totalRevenue) * 100).toFixed(1)}% Net Margin` : '0%'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Accounts Receivable (A/R)</p>
          <p className="text-2xl font-bold text-blue-600 font-mono mt-1">
            ₹{(accountBalances[accounts.find(a => a.code === '1030')?.id || '']?.netDebit || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Customer Pending Dues</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trial Balance Balance</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold font-mono text-slate-800">
              ₹{trialBalanceTotals.totalDr.toLocaleString('en-IN')}
            </span>
            {trialBalanceTotals.isBalanced ? (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> Balanced
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                <AlertTriangle size={10} /> Discrepancy
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">DR = CR Verified</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1">
        {[
          { id: 'chart_of_accounts', label: 'Chart of Accounts', icon: BookOpen },
          { id: 'journal_entries', label: 'Journal Entry', icon: FileText },
          { id: 'ledger', label: 'General Ledger', icon: Layers },
          { id: 'trial_balance', label: 'Trial Balance', icon: Scale },
          { id: 'profit_loss', label: 'Profit & Loss (P&L)', icon: TrendingUp },
          { id: 'balance_sheet', label: 'Balance Sheet', icon: Building2 },
          { id: 'receivables', label: 'Receivables (A/R)', icon: ArrowUpRight },
          { id: 'payables', label: 'Payables (A/P)', icon: ArrowDownRight },
          { id: 'gst_summary', label: 'GST Tax Summary', icon: Receipt },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon size={14} className={active ? 'text-blue-600' : 'text-slate-400'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CHART OF ACCOUNTS (COA) */}
      {/* ========================================================================= */}
      {activeTab === 'chart_of_accounts' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" /> Standard Chart of Accounts (COA)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                5-tier accounting structure compliant with Indian Accounting Standards and GST rules.
              </p>
            </div>
            <button
              onClick={() =>
                exportReportToCSV(
                  'Chart_of_Accounts',
                  ['Code', 'Account Name', 'Classification', 'Category', 'Debit Balance (₹)', 'Credit Balance (₹)', 'Description'],
                  accounts.map(a => [
                    a.code,
                    a.name,
                    a.classification,
                    a.category,
                    accountBalances[a.id]?.netDebit || 0,
                    accountBalances[a.id]?.netCredit || 0,
                    a.description || '',
                  ])
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              <Download size={13} /> Export COA CSV
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Debit Balance (₹)</th>
                  <th className="py-3 px-4 text-right">Credit Balance (₹)</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accounts.map(acc => {
                  const bal = accountBalances[acc.id] || { netDebit: 0, netCredit: 0 };
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{acc.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{acc.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.classification === 'ASSET' ? 'bg-blue-100 text-blue-700' :
                          acc.classification === 'LIABILITY' ? 'bg-amber-100 text-amber-700' :
                          acc.classification === 'EQUITY' ? 'bg-purple-100 text-purple-700' :
                          acc.classification === 'REVENUE' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {acc.classification}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{acc.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {bal.netDebit > 0 ? `₹${bal.netDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {bal.netCredit > 0 ? `₹${bal.netCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{acc.description || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: JOURNAL ENTRY (MULTI-LINE BUILDER & POSTED ENTRIES) */}
      {/* ========================================================================= */}
      {activeTab === 'journal_entries' && (
        <div className="space-y-6">
          {/* Builder Form */}
          <form onSubmit={handleSaveManualJournal} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" /> New Multi-Line Journal Entry Voucher
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record adjusting entries, depreciation, petty cash, or partner transfers. Must satisfy Debit = Credit.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {journalFormBalance.isBalanced ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <CheckCircle size={14} className="text-emerald-600" />
                    Status: Balanced (₹{journalFormBalance.totalDr.toLocaleString('en-IN')})
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-800 bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl">
                    <AlertTriangle size={14} className="text-red-600" />
                    Status: Unbalanced (Diff: ₹{journalFormBalance.diff.toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Entry Date *</label>
                <input
                  type="date"
                  required
                  value={newEntryDate}
                  onChange={e => setNewEntryDate(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Narration / Remarks *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Month-end depreciation for installation tools / petty cash replenishment"
                  value={newEntryNarration}
                  onChange={e => setNewEntryNarration(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Line Items Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 uppercase">Journal Accounts &amp; Debits / Credits</span>
                <button
                  type="button"
                  onClick={handleAddJournalLine}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                >
                  <Plus size={13} /> Add Line
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Account (COA)</th>
                      <th className="py-2.5 px-3">Description / Note</th>
                      <th className="py-2.5 px-3 w-36 text-right">Debit (DR ₹)</th>
                      <th className="py-2.5 px-3 w-36 text-right">Credit (CR ₹)</th>
                      <th className="py-2.5 px-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {newEntryLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className="py-2 px-3">
                          <select
                            value={line.accountId}
                            onChange={e => handleLineChange(idx, 'accountId', e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded-lg p-2 font-medium bg-white"
                          >
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                [{acc.code}] {acc.name} ({acc.classification})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Line detail..."
                            value={line.description}
                            onChange={e => handleLineChange(idx, 'description', e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded-lg p-2"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={line.debit || ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              handleLineChange(idx, 'debit', val);
                              if (val > 0) handleLineChange(idx, 'credit', 0);
                            }}
                            className="w-full text-right font-mono font-bold text-xs border border-gray-300 rounded-lg p-2 text-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={line.credit || ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              handleLineChange(idx, 'credit', val);
                              if (val > 0) handleLineChange(idx, 'debit', 0);
                            }}
                            className="w-full text-right font-mono font-bold text-xs border border-gray-300 rounded-lg p-2 text-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {newEntryLines.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveJournalLine(idx)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-gray-200 font-bold">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 text-slate-700 text-xs">Total Voucher Sum</td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-blue-700">
                        ₹{journalFormBalance.totalDr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-blue-700">
                        ₹{journalFormBalance.totalCr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={!journalFormBalance.isBalanced || isPending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                {isPending ? 'Posting Entry...' : 'Post Journal Entry (DR = CR)'}
              </button>
            </div>
          </form>

          {/* Posted Journal Vouchers Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900">
                Posted Journal Vouchers ({filteredJournalEntries.length})
              </h3>
              <button
                onClick={() =>
                  exportReportToCSV(
                    'Journal_Entries',
                    ['Entry #', 'Date', 'Type', 'Narration', 'Total Amount (₹)', 'Status'],
                    filteredJournalEntries.map(j => [
                      j.entry_number,
                      j.entry_date,
                      j.reference_type,
                      j.narration,
                      j.total_debit,
                      j.status,
                    ])
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                <Download size={12} /> Export CSV
              </button>
            </div>

            <div className="space-y-3">
              {filteredJournalEntries.map(entry => (
                <div key={entry.id} className="border border-gray-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        {entry.entry_number}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{entry.narration}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Date: {entry.entry_date} · Type: {entry.reference_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        Total: ₹{entry.total_debit?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.status === 'POSTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {entry.status}
                      </span>
                      {entry.status === 'POSTED' && (
                        <button
                          type="button"
                          onClick={() => handleReverseEntry(entry.id, entry.entry_number)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 p-1 hover:bg-rose-50 rounded"
                          title="Create reversing voucher"
                        >
                          <RotateCcw size={12} /> Reverse
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lines preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {entry.journal_lines?.map(l => (
                      <div key={l.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-bold text-slate-800">
                            [{l.accounts?.code || '—'}] {l.accounts?.name || 'Account'}
                          </p>
                          <p className="text-[10px] text-slate-400">{l.description}</p>
                        </div>
                        <div className="text-right font-mono">
                          {Number(l.debit) > 0 && <span className="font-bold text-blue-700">DR ₹{Number(l.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>}
                          {Number(l.credit) > 0 && <span className="font-bold text-emerald-700">CR ₹{Number(l.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GENERAL LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-blue-600" /> Account General Ledger
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Dynamic running balances calculated chronologically from posted vouchers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedLedgerAccountId}
                onChange={e => setSelectedLedgerAccountId(e.target.value)}
                className="text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-slate-50 min-w-[280px]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    [{acc.code}] {acc.name} ({acc.classification})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Voucher Ref #</th>
                  <th className="py-3 px-4">Narration / Particulars</th>
                  <th className="py-3 px-4 text-right">Debit (DR ₹)</th>
                  <th className="py-3 px-4 text-right">Credit (CR ₹)</th>
                  <th className="py-3 px-4 text-right font-bold">Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedLedgerLines.lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No posted journal movements recorded for this account in the selected period.
                    </td>
                  </tr>
                ) : (
                  selectedLedgerLines.lines.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-slate-600">{l.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{l.entryNumber}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{l.description}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{l.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-xs">Closing Ledger Balance</td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-blue-300">
                    ₹{selectedLedgerLines.runningClosingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRIAL BALANCE */}
      {/* ========================================================================= */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Scale size={18} className="text-blue-600" /> Trial Balance Statement
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Mathematical proof of double-entry ledger accuracy. Total Debits must strictly equal Total Credits.
              </p>
            </div>

            <button
              onClick={() =>
                exportReportToCSV(
                  'Trial_Balance',
                  ['Code', 'Account Name', 'Type', 'Debit (₹)', 'Credit (₹)'],
                  accounts.map(a => [
                    a.code,
                    a.name,
                    a.classification,
                    accountBalances[a.id]?.netDebit || 0,
                    accountBalances[a.id]?.netCredit || 0,
                  ])
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Download size={13} /> Export Trial Balance
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Debit Balance (₹)</th>
                  <th className="py-3 px-4 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accounts.map(acc => {
                  const b = accountBalances[acc.id] || { netDebit: 0, netCredit: 0 };
                  if (b.netDebit === 0 && b.netCredit === 0) return null; // hide zero lines for neatness
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{acc.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{acc.name}</td>
                      <td className="py-3 px-4 text-slate-500">{acc.classification}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {b.netDebit > 0 ? `₹${b.netDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {b.netCredit > 0 ? `₹${b.netCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-950 text-white font-bold text-xs">
                <tr>
                  <td colSpan={3} className="py-4 px-4">
                    Grand Total (Status: {trialBalanceTotals.isBalanced ? '✓ PERFECTLY BALANCED' : '⚠ UNBALANCED'})
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-400">
                    ₹{trialBalanceTotals.totalDr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-400">
                    ₹{trialBalanceTotals.totalCr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROFIT & LOSS (P&L) */}
      {/* ========================================================================= */}
      {activeTab === 'profit_loss' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" /> Profit &amp; Loss Statement (Income Statement)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Operating revenue, direct costs, and net margin for {dateRange.label}.</p>
            </div>
            <button
              onClick={() =>
                exportReportToCSV('Profit_and_Loss', ['Category', 'Particulars', 'Amount (₹)'], [
                  ['Revenue', 'Total Operating Revenue', pnlData.totalRevenue],
                  ['Cost of Sales', 'Cost of Goods Sold (COGS)', pnlData.totalCOGS],
                  ['Gross Margin', 'Gross Profit', pnlData.grossProfit],
                  ['Expenses', 'Operating Expenses', pnlData.totalExpenses],
                  ['Net Result', 'Net Profit / Loss', pnlData.netProfit],
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Download size={13} /> Export P&amp;L
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Section 1: Revenue */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50/80 px-4 py-2.5 font-bold text-emerald-900 flex justify-between">
                <span>1. Operating Revenue &amp; Sales</span>
                <span className="font-mono">₹{pnlData.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 divide-y divide-gray-100">
                {pnlData.revenueLines.map(r => (
                  <div key={r.account.id} className="py-1.5 flex justify-between text-slate-700">
                    <span>[{r.account.code}] {r.account.name}</span>
                    <span className="font-mono font-semibold">₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: COGS */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-amber-50/80 px-4 py-2.5 font-bold text-amber-900 flex justify-between">
                <span>2. Less: Cost of Goods Sold (COGS - Materials &amp; Hardware)</span>
                <span className="font-mono">₹{pnlData.totalCOGS.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 divide-y divide-gray-100">
                {pnlData.cogsLines.length === 0 ? (
                  <p className="text-slate-400 py-1">No direct hardware purchase cost lines recorded.</p>
                ) : (
                  pnlData.cogsLines.map(c => (
                    <div key={c.account.id} className="py-1.5 flex justify-between text-slate-700">
                      <span>[{c.account.code}] {c.account.name}</span>
                      <span className="font-mono font-semibold">₹{c.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gross Profit Bar */}
            <div className="bg-slate-100 p-4 rounded-xl flex justify-between font-bold text-sm text-slate-900">
              <span>Gross Profit (Revenue - COGS)</span>
              <span className="font-mono text-blue-700">₹{pnlData.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Section 3: Operating Expenses */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50/80 px-4 py-2.5 font-bold text-rose-900 flex justify-between">
                <span>3. Less: Operating &amp; Administrative Expenses</span>
                <span className="font-mono">₹{pnlData.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 divide-y divide-gray-100">
                {pnlData.expenseLines.length === 0 ? (
                  <p className="text-slate-400 py-1">No indirect operating expense lines recorded.</p>
                ) : (
                  pnlData.expenseLines.map(e => (
                    <div key={e.account.id} className="py-1.5 flex justify-between text-slate-700">
                      <span>[{e.account.code}] {e.account.name}</span>
                      <span className="font-mono font-semibold">₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Net Profit Grand Summary */}
            <div className={`p-5 rounded-2xl flex justify-between items-center text-white ${
              pnlData.netProfit >= 0 ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold opacity-80">Net Financial Result</span>
                <h3 className="text-xl font-extrabold mt-0.5">
                  {pnlData.netProfit >= 0 ? 'Net Operating Profit' : 'Net Operating Loss'}
                </h3>
              </div>
              <span className="text-2xl font-extrabold font-mono">
                ₹{pnlData.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BALANCE SHEET */}
      {/* ========================================================================= */}
      {activeTab === 'balance_sheet' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" /> Balance Sheet Statement
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Financial Position: Assets = Liabilities + Owner Equity (including Net Profit).
              </p>
            </div>
            <button
              onClick={() =>
                exportReportToCSV('Balance_Sheet', ['Category', 'Account', 'Amount (₹)'], [
                  ['Assets', 'Total Assets', balanceSheetData.totalAssets],
                  ['Liabilities', 'Total Liabilities', balanceSheetData.totalLiabilities],
                  ['Equity', 'Total Owner Equity & Retained Earnings', balanceSheetData.totalEquity],
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Download size={13} /> Export Balance Sheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Assets */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-blue-600 text-white p-3.5 font-bold flex justify-between items-center">
                  <span>ASSETS (Application of Funds)</span>
                  <span className="font-mono text-sm">₹{balanceSheetData.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-4 divide-y divide-gray-100 space-y-2">
                  {balanceSheetData.assetLines.map(a => (
                    <div key={a.account.id} className="pt-2 flex justify-between text-slate-700">
                      <div>
                        <p className="font-bold text-slate-900">[{a.account.code}] {a.account.name}</p>
                        <p className="text-[10px] text-slate-400">{a.account.category}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-800">₹{a.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-t border-gray-200 flex justify-between font-extrabold text-sm text-blue-900">
                <span>Total Assets</span>
                <span className="font-mono">₹{balanceSheetData.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-slate-900 text-white p-3.5 font-bold flex justify-between items-center">
                  <span>LIABILITIES &amp; EQUITY (Sources of Funds)</span>
                  <span className="font-mono text-sm">
                    ₹{(balanceSheetData.totalLiabilities + balanceSheetData.totalEquity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-[11px] text-amber-700 uppercase tracking-wider mb-2">Liabilities</h4>
                    <div className="divide-y divide-gray-100 space-y-2">
                      {balanceSheetData.liabilityLines.map(l => (
                        <div key={l.account.id} className="pt-2 flex justify-between text-slate-700">
                          <div>
                            <p className="font-bold text-slate-900">[{l.account.code}] {l.account.name}</p>
                            <p className="text-[10px] text-slate-400">{l.account.category}</p>
                          </div>
                          <span className="font-mono font-bold text-slate-800">₹{l.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[11px] text-purple-700 uppercase tracking-wider mb-2">Equity &amp; Earnings</h4>
                    <div className="divide-y divide-gray-100 space-y-2">
                      {balanceSheetData.equityLines.map(e => (
                        <div key={e.account.id} className="pt-2 flex justify-between text-slate-700">
                          <span>[{e.account.code}] {e.account.name}</span>
                          <span className="font-mono font-bold text-slate-800">₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between text-emerald-700 font-bold">
                        <span>Current Period Net Profit (from P&amp;L)</span>
                        <span className="font-mono">₹{pnlData.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-gray-200 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Total Liabilities &amp; Equity</span>
                <span className="font-mono">
                  ₹{(balanceSheetData.totalLiabilities + balanceSheetData.totalEquity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: RECEIVABLES (A/R) */}
      {/* ========================================================================= */}
      {activeTab === 'receivables' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ArrowUpRight size={18} className="text-blue-600" /> Accounts Receivable (A/R Aging &amp; Dues)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Unpaid customer invoices and collections schedule.</p>
            </div>
            <button
              onClick={() =>
                exportReportToCSV(
                  'Accounts_Receivable',
                  ['Invoice #', 'Customer', 'Date', 'Total (₹)', 'Balance Due (₹)', 'Status'],
                  invoices.filter(i => Number(i.balance_due) > 0).map(i => [
                    i.invoice_number,
                    i.customers?.company_name || i.customers?.profiles?.full_name || 'Customer',
                    i.created_at ? new Date(i.created_at).toLocaleDateString('en-IN') : '',
                    i.total_amount,
                    i.balance_due,
                    i.status,
                  ])
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Download size={13} /> Export A/R CSV
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Total Invoice (₹)</th>
                  <th className="py-3 px-4 text-right font-bold text-blue-700">Balance Due (₹)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.filter(i => Number(i.balance_due) > 0).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      All customer invoices are fully settled. Zero outstanding receivables!
                    </td>
                  </tr>
                ) : (
                  invoices
                    .filter(i => Number(i.balance_due) > 0)
                    .map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{inv.invoice_number}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {inv.customers?.company_name || inv.customers?.profiles?.full_name || 'Customer'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-800">
                          ₹{Number(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                          ₹{Number(inv.balance_due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: PAYABLES (A/P) */}
      {/* ========================================================================= */}
      {activeTab === 'payables' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ArrowDownRight size={18} className="text-rose-600" /> Accounts Payable (A/P &amp; Supplier Liabilities)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Liabilities owed to OEM equipment distributors, tax authorities &amp; labor.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase">Supplier Payables (A/P)</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ₹{(accountBalances[accounts.find(a => a.code === '2010')?.id || '']?.netCredit || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase">GST Output Tax Due</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ₹{(accountBalances[accounts.find(a => a.code === '2020')?.id || '']?.netCredit || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase">Customer Advance Deposits</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ₹{(accountBalances[accounts.find(a => a.code === '2040')?.id || '']?.netCredit || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: GST TAX SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === 'gst_summary' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Receipt size={18} className="text-blue-600" /> GST Tax Return Summary (GSTR-1 &amp; GSTR-3B)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Calculated output tax, input tax credit (ITC), and net payable to Government.</p>
            </div>
            <button
              onClick={() =>
                exportReportToCSV('GSTR_Tax_Report', ['Invoice #', 'Customer GSTIN', 'Taxable Value (₹)', 'IGST/CGST/SGST (₹)', 'Total (₹)'],
                  invoices.map(i => [
                    i.invoice_number,
                    i.customers?.tax_id || 'B2C Unregistered',
                    i.subtotal || (Number(i.total_amount) - Number(i.gst_total)),
                    i.gst_total,
                    i.total_amount,
                  ])
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Download size={13} /> Export GSTR CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
              <span className="text-blue-700 text-xs font-bold uppercase">Total GST Output (Collected)</span>
              <p className="text-2xl font-bold font-mono text-blue-950 mt-1">
                ₹{invoices.reduce((sum, i) => sum + (Number(i.gst_total) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-blue-600 mt-1 block">Payable under GSTR-3B Table 3.1</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
              <span className="text-emerald-700 text-xs font-bold uppercase">GST Input Tax Credit (ITC)</span>
              <p className="text-2xl font-bold font-mono text-emerald-950 mt-1">
                ₹{(accountBalances[accounts.find(a => a.code === '1050')?.id || '']?.netDebit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-emerald-600 mt-1 block">Eligible offset credit from purchases</span>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase">Net GST Cash Liability</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                ₹{Math.max(
                  0,
                  invoices.reduce((sum, i) => sum + (Number(i.gst_total) || 0), 0) -
                    (accountBalances[accounts.find(a => a.code === '1050')?.id || '']?.netDebit || 0)
                ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Due by 20th of succeeding month</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
