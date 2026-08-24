'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface CreateJournalLineInput {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateJournalEntryInput {
  entryDate: string;
  referenceType?: 'MANUAL' | 'INVOICE' | 'PAYMENT' | 'PURCHASE' | 'REVERSAL';
  referenceId?: string;
  narration: string;
  lines: CreateJournalLineInput[];
}

export async function createJournalEntry(input: CreateJournalEntryInput) {
  try {
    const supabase = createAdminClient();

    // 1. Validate lines
    if (!input.lines || input.lines.length < 2) {
      return { success: false, error: 'A journal entry must have at least 2 lines (Debit and Credit).' };
    }

    const totalDebit = input.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = input.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

    // Tolerance for floating point precision (0.01)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        success: false,
        error: `Journal entry is unbalanced! Total Debit (₹${totalDebit.toFixed(2)}) must equal Total Credit (₹${totalCredit.toFixed(2)}). Difference: ₹${Math.abs(totalDebit - totalCredit).toFixed(2)}`
      };
    }

    if (totalDebit <= 0) {
      return { success: false, error: 'Journal entry total amount must be greater than zero.' };
    }

    // 2. Generate sequential Entry Number JV-YYYYMM-XXXX
    const now = new Date();
    const prefix = `JV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { count } = await supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true });

    const entryNumber = `${prefix}-${String((count || 0) + 1).padStart(4, '0')}`;

    // 3. Insert Journal Entry Header
    const { data: entry, error: entryErr } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: entryNumber,
        entry_date: input.entryDate || new Date().toISOString().split('T')[0],
        reference_type: input.referenceType || 'MANUAL',
        reference_id: input.referenceId || null,
        narration: input.narration,
        status: 'POSTED',
        total_debit: totalDebit,
        total_credit: totalCredit,
      })
      .select('id, entry_number')
      .single();

    if (entryErr || !entry) {
      console.error('Error creating journal entry:', entryErr);
      return { success: false, error: entryErr?.message || 'Failed to create journal entry header.' };
    }

    // 4. Insert Journal Lines
    const linesToInsert = input.lines
      .filter(l => (Number(l.debit) || 0) > 0 || (Number(l.credit) || 0) > 0)
      .map(l => ({
        journal_entry_id: entry.id,
        account_id: l.accountId,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description || input.narration,
      }));

    const { error: linesErr } = await supabase
      .from('journal_lines')
      .insert(linesToInsert);

    if (linesErr) {
      // Rollback header if lines fail
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      return { success: false, error: linesErr.message || 'Failed to insert journal lines.' };
    }

    revalidatePath('/admin/accounting');
    return { success: true, entryNumber: entry.entry_number, id: entry.id };
  } catch (err: any) {
    console.error('Exception in createJournalEntry:', err);
    return { success: false, error: err.message || 'Internal error saving journal entry.' };
  }
}

export async function reverseJournalEntry(journalEntryId: string, reason: string) {
  try {
    const supabase = createAdminClient();

    // 1. Fetch original entry and lines
    const { data: original, error: fetchErr } = await supabase
      .from('journal_entries')
      .select(`
        id, entry_number, entry_date, narration, total_debit, total_credit, status,
        journal_lines ( id, account_id, debit, credit, description )
      `)
      .eq('id', journalEntryId)
      .single();

    if (fetchErr || !original) {
      return { success: false, error: 'Original journal entry not found.' };
    }

    if (original.status === 'REVERSED') {
      return { success: false, error: 'This journal entry has already been reversed.' };
    }

    // 2. Generate Reversal Entry Number RJV-YYYYMM-XXXX
    const now = new Date();
    const prefix = `RJV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { count } = await supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true });

    const revEntryNumber = `${prefix}-${String((count || 0) + 1).padStart(4, '0')}`;

    // 3. Create Reversing Entry Header
    const { data: revEntry, error: revHeaderErr } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: revEntryNumber,
        entry_date: new Date().toISOString().split('T')[0],
        reference_type: 'REVERSAL',
        reference_id: original.id,
        narration: `Reversal of ${original.entry_number}: ${reason || 'Correction'}`,
        status: 'POSTED',
        total_debit: original.total_credit,
        total_credit: original.total_debit,
        reversed_entry_id: original.id,
      })
      .select('id, entry_number')
      .single();

    if (revHeaderErr || !revEntry) {
      return { success: false, error: revHeaderErr?.message || 'Failed to create reversal entry.' };
    }

    // 4. Swap Debits and Credits
    const revLines = original.journal_lines.map((l: any) => ({
      journal_entry_id: revEntry.id,
      account_id: l.account_id,
      debit: Number(l.credit) || 0, // Swap Credit -> Debit
      credit: Number(l.debit) || 0, // Swap Debit -> Credit
      description: `Reversal: ${l.description || original.narration}`,
    }));

    await supabase.from('journal_lines').insert(revLines);

    // 5. Update original status to REVERSED
    await supabase
      .from('journal_entries')
      .update({ status: 'REVERSED' })
      .eq('id', original.id);

    revalidatePath('/admin/accounting');
    return { success: true, reversalNumber: revEntry.entry_number };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reverse journal entry.' };
  }
}

export async function syncAllTransactionsToAccounting() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch Chart of Accounts
    const { data: accounts } = await supabase.from('accounts').select('id, code, name');
    if (!accounts || accounts.length === 0) {
      return { success: false, error: 'Chart of Accounts table is not seeded. Please run migration 012.' };
    }

    const arAccount = accounts.find(a => a.code === '1030') || accounts[0]; // Customer Receivables
    const bankAccount = accounts.find(a => a.code === '1020') || accounts[0]; // Bank
    const cashAccount = accounts.find(a => a.code === '1010') || accounts[0]; // Cash
    const salesAccount = accounts.find(a => a.code === '4010') || accounts[0]; // Sales Revenue
    const gstOutputAccount = accounts.find(a => a.code === '2020') || accounts[0]; // GST Output

    // 2. Fetch Invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, subtotal, gst_total, created_at, customer_id, customers(company_name)');

    let invoiceCount = 0;
    for (const inv of invoices || []) {
      // Check if entry already exists
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('reference_type', 'INVOICE')
        .eq('reference_id', inv.id)
        .maybeSingle();

      if (!existing && Number(inv.total_amount) > 0) {
        const total = Number(inv.total_amount);
        const subtotal = Number(inv.subtotal) || (total - (Number(inv.gst_total) || 0));
        const gst = Number(inv.gst_total) || 0;

        const lines: CreateJournalLineInput[] = [
          { accountId: arAccount.id, debit: total, credit: 0, description: `Invoice #${inv.invoice_number} Receivable` },
          { accountId: salesAccount.id, debit: 0, credit: subtotal, description: `Sales Revenue #${inv.invoice_number}` },
        ];

        if (gst > 0) {
          lines.push({ accountId: gstOutputAccount.id, debit: 0, credit: gst, description: `GST Output (18%) on #${inv.invoice_number}` });
        }

        const custName = Array.isArray(inv.customers)
          ? (inv.customers[0] as any)?.company_name
          : (inv.customers as any)?.company_name || 'Customer';

        await createJournalEntry({
          entryDate: inv.created_at ? new Date(inv.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          referenceType: 'INVOICE',
          referenceId: inv.id,
          narration: `Invoice #${inv.invoice_number} to ${custName}`,
          lines,
        });
        invoiceCount++;
      }
    }

    // 3. Fetch Payments
    const { data: payments } = await supabase
      .from('payments')
      .select('id, payment_number, amount, payment_method, received_at, customer_id, customers(company_name)');

    let paymentCount = 0;
    for (const pay of payments || []) {
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('reference_type', 'PAYMENT')
        .eq('reference_id', pay.id)
        .maybeSingle();

      if (!existing && Number(pay.amount) > 0) {
        const amt = Number(pay.amount);
        const targetBankOrCash = (pay.payment_method || '').toUpperCase() === 'CASH' ? cashAccount.id : bankAccount.id;
        const payCustName = Array.isArray(pay.customers)
          ? (pay.customers[0] as any)?.company_name
          : (pay.customers as any)?.company_name || 'Customer';

        const lines: CreateJournalLineInput[] = [
          { accountId: targetBankOrCash, debit: amt, credit: 0, description: `Payment Receipt #${pay.payment_number}` },
          { accountId: arAccount.id, debit: 0, credit: amt, description: `Receipt from ${payCustName}` },
        ];

        await createJournalEntry({
          entryDate: pay.received_at ? new Date(pay.received_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          referenceType: 'PAYMENT',
          referenceId: pay.id,
          narration: `Payment Receipt #${pay.payment_number} via ${pay.payment_method || 'Bank'}`,
          lines,
        });
        paymentCount++;
      }
    }

    revalidatePath('/admin/accounting');
    return {
      success: true,
      message: `Synchronized ${invoiceCount} customer invoices and ${paymentCount} payment receipts into double-entry general ledger.`
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error during transaction synchronization.' };
  }
}
