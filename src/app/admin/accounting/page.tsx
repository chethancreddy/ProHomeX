import { createAdminClient } from '@/lib/supabase/admin';
import AccountingDashboard from './AccountingDashboard';

export const dynamic = 'force-dynamic';

const DEFAULT_ACCOUNTS = [
  { id: 'acc-1010', code: '1010', name: 'Cash on Hand', classification: 'ASSET', category: 'Current Asset', description: 'Petty cash & physical collections' },
  { id: 'acc-1020', code: '1020', name: 'Bank Account (Primary Current A/C)', classification: 'ASSET', category: 'Current Asset', description: 'Company current bank account' },
  { id: 'acc-1030', code: '1030', name: 'Customer Accounts Receivable (A/R)', classification: 'ASSET', category: 'Current Asset', description: 'Unpaid customer invoice balances' },
  { id: 'acc-1040', code: '1040', name: 'Inventory Asset (Stock on Hand)', classification: 'ASSET', category: 'Current Asset', description: 'CCTV, Solar, UPS & Automation stock' },
  { id: 'acc-1050', code: '1050', name: 'GST Input Tax Credit (ITC - 18%)', classification: 'ASSET', category: 'Current Asset', description: 'GST paid on purchases & vendor bills' },
  { id: 'acc-1060', code: '1060', name: 'Installation Tools & Vehicles', classification: 'ASSET', category: 'Fixed Asset', description: 'Ladders, multimeters & service vans' },
  { id: 'acc-2010', code: '2010', name: 'Supplier Accounts Payable (A/P)', classification: 'LIABILITY', category: 'Current Liability', description: 'Balances owed to distributors' },
  { id: 'acc-2020', code: '2020', name: 'GST Output Tax Payable (18%)', classification: 'LIABILITY', category: 'Current Liability', description: 'GST collected on customer invoices' },
  { id: 'acc-2030', code: '2030', name: 'Employee Salary & Wages Payable', classification: 'LIABILITY', category: 'Current Liability', description: 'Accrued staff & labor wages' },
  { id: 'acc-2040', code: '2040', name: 'Customer Advance Deposits', classification: 'LIABILITY', category: 'Current Liability', description: 'Advance payments on quotations' },
  { id: 'acc-3010', code: '3010', name: 'Owner / Founder Capital', classification: 'EQUITY', category: 'Equity', description: 'Owner invested equity capital' },
  { id: 'acc-3020', code: '3020', name: 'Retained Earnings', classification: 'EQUITY', category: 'Equity', description: 'Cumulative business earnings' },
  { id: 'acc-4010', code: '4010', name: 'Equipment & Product Sales Revenue', classification: 'REVENUE', category: 'Operating Revenue', description: 'Sales of hardware & components' },
  { id: 'acc-4020', code: '4020', name: 'CCTV Installation Service Revenue', classification: 'REVENUE', category: 'Operating Revenue', description: 'CCTV labor & setup charges' },
  { id: 'acc-4030', code: '4030', name: 'Solar EPC Installation Revenue', classification: 'REVENUE', category: 'Operating Revenue', description: 'Solar turnkey project revenue' },
  { id: 'acc-4040', code: '4040', name: 'UPS & Power Setup Revenue', classification: 'REVENUE', category: 'Operating Revenue', description: 'Power backup installation revenue' },
  { id: 'acc-4050', code: '4050', name: 'Home & Sump Automation Revenue', classification: 'REVENUE', category: 'Operating Revenue', description: 'Smart home & water controller setup' },
  { id: 'acc-4060', code: '4060', name: 'AMC Maintenance & Service Fees', classification: 'REVENUE', category: 'Operating Revenue', description: 'Annual service contract fees' },
  { id: 'acc-5010', code: '5010', name: 'Cost of Goods Sold (COGS - Materials)', classification: 'EXPENSE', category: 'Cost of Sales', description: 'Direct equipment purchase costs' },
  { id: 'acc-5020', code: '5020', name: 'Direct Installation Consumables & Cabling', classification: 'EXPENSE', category: 'Cost of Sales', description: 'Cables, conduits, connectors & lugs' },
  { id: 'acc-5030', code: '5030', name: 'Technician & Labor Wages', classification: 'EXPENSE', category: 'Direct Expense', description: 'Field engineer & contractor payouts' },
  { id: 'acc-5040', code: '5040', name: 'Logistics, Transport & Fuel', classification: 'EXPENSE', category: 'Operating Expense', description: 'Freight, van fuel & site dispatch' },
  { id: 'acc-5050', code: '5050', name: 'Marketing, Web & Sales Commission', classification: 'EXPENSE', category: 'Operating Expense', description: 'Advertising & promotions' },
  { id: 'acc-5060', code: '5060', name: 'Office Rent, Utilities & Power', classification: 'EXPENSE', category: 'Operating Expense', description: 'Office lease, power & internet' },
  { id: 'acc-5070', code: '5070', name: 'Bank & Payment Gateway Charges', classification: 'EXPENSE', category: 'Operating Expense', description: 'Gateway processing fees' }
];

export default async function AdminAccountingPage() {
  const supabase = createAdminClient();

  const [
    { data: accountsData },
    { data: journalEntriesData },
    { data: invoices },
    { data: invoiceItems },
    { data: payments },
    { data: quotations },
    { data: customers }
  ] = await Promise.all([
    supabase.from('accounts').select('*').order('code'),
    supabase
      .from('journal_entries')
      .select(`
        id, entry_number, entry_date, reference_type, reference_id, narration,
        status, total_debit, total_credit, created_at,
        journal_lines (
          id, account_id, debit, credit, description,
          accounts ( id, code, name, classification, category )
        )
      `)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('invoices')
      .select(`
        id, invoice_number, status, total_amount, subtotal, gst_total,
        discount_total, advance_paid, balance_due, created_at, paid_at,
        customer_id,
        customers ( id, company_name, tax_id, profiles ( full_name, email, phone_number ) )
      `)
      .order('created_at', { ascending: false }),
    supabase.from('invoice_items')
      .select('id, invoice_id, description, quantity, unit_price, gst_rate, gst_amount, amount, item_type'),
    supabase.from('payments')
      .select(`
        id, payment_number, payment_type, amount, payment_method, reference_number, received_at, notes,
        customer_id,
        customers ( company_name, tax_id, profiles ( full_name ) )
      `)
      .order('received_at', { ascending: false }),
    supabase.from('quotations')
      .select('id, quotation_number, status, total_amount, advance_amount, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('customers')
      .select('id, company_name, tax_id, profiles ( full_name )')
  ]);

  const accounts = (accountsData && accountsData.length > 0) ? accountsData : DEFAULT_ACCOUNTS;
  const journalEntries = (journalEntriesData || []) as any[];

  return (
    <AccountingDashboard
      accounts={accounts as any[]}
      journalEntries={journalEntries}
      invoices={(invoices || []) as any[]}
      invoiceItems={(invoiceItems || []) as any[]}
      payments={(payments || []) as any[]}
      quotations={(quotations || []) as any[]}
      customers={(customers || []) as any[]}
    />
  );
}
