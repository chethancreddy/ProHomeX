-- ============================================================
-- ProHomeX: Double-Entry Accounting Module
-- Migration 012 — Run in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1. Account Types Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_classification') THEN
        CREATE TYPE account_classification AS ENUM (
            'ASSET',
            'LIABILITY',
            'EQUITY',
            'REVENUE',
            'EXPENSE'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'journal_entry_status') THEN
        CREATE TYPE journal_entry_status AS ENUM (
            'DRAFT',
            'POSTED',
            'REVERSED'
        );
    END IF;
END $$;

-- 2. Chart of Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    classification account_classification NOT NULL,
    category TEXT NOT NULL, -- 'Current Asset', 'Fixed Asset', 'Current Liability', 'Operating Revenue', etc.
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Journal Entries (Master Header)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number TEXT UNIQUE NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_type TEXT DEFAULT 'MANUAL', -- 'INVOICE', 'PAYMENT', 'PURCHASE', 'MANUAL', 'REVERSAL'
    reference_id UUID,
    narration TEXT NOT NULL,
    status journal_entry_status NOT NULL DEFAULT 'POSTED',
    total_debit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_credit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    reversed_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_balanced_entry CHECK (total_debit = total_credit)
);

-- 4. Journal Entry Lines (Detail Items)
CREATE TABLE IF NOT EXISTS public.journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    debit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_positive_dr_cr CHECK (debit >= 0 AND credit >= 0),
    CONSTRAINT chk_dr_or_cr CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

-- Indexes for lightning-fast ledger and reporting queries
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_id ON public.journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry_id ON public.journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_ref ON public.journal_entries(reference_type, reference_id);

-- Triggers for modtime
DROP TRIGGER IF EXISTS update_accounts_modtime ON public.accounts;
CREATE TRIGGER update_accounts_modtime
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_journal_entries_modtime ON public.journal_entries;
CREATE TRIGGER update_journal_entries_modtime
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;

-- Admins full access
DROP POLICY IF EXISTS "Admins manage accounts" ON public.accounts;
CREATE POLICY "Admins manage accounts" ON public.accounts FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage journal entries" ON public.journal_entries;
CREATE POLICY "Admins manage journal entries" ON public.journal_entries FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage journal lines" ON public.journal_lines;
CREATE POLICY "Admins manage journal lines" ON public.journal_lines FOR ALL USING (public.is_admin());

-- Pre-seed Standard Chart of Accounts (COA)
INSERT INTO public.accounts (code, name, classification, category, description)
VALUES
    -- ASSETS (1000s)
    ('1010', 'Cash on Hand', 'ASSET', 'Current Asset', 'Physical petty cash & on-site cash receipts'),
    ('1020', 'Bank Account (Primary Current A/C)', 'ASSET', 'Current Asset', 'Company primary bank account for NEFT/RTGS/UPI'),
    ('1030', 'Customer Accounts Receivable (A/R)', 'ASSET', 'Current Asset', 'Outstanding dues receivable from customers for invoices'),
    ('1040', 'Inventory Asset (Stock on Hand)', 'ASSET', 'Current Asset', 'Current value of CCTV, Solar, UPS & Automation stock'),
    ('1050', 'GST Input Tax Credit (ITC - 18%)', 'ASSET', 'Current Asset', 'GST paid on OEM equipment & vendor purchases to offset against output tax'),
    ('1060', 'Installation Tools & Vehicles', 'ASSET', 'Fixed Asset', 'Equipment, ladders, testing multimeters & field vehicles'),

    -- LIABILITIES (2000s)
    ('2010', 'Supplier Accounts Payable (A/P)', 'LIABILITY', 'Current Liability', 'Outstanding balances owed to distributors & manufacturers'),
    ('2020', 'GST Output Tax Payable (18%)', 'LIABILITY', 'Current Liability', 'GST collected from customer invoices to be deposited with Government'),
    ('2030', 'Employee Salary & Wages Payable', 'LIABILITY', 'Current Liability', 'Accrued technician salaries and field labor dues'),
    ('2040', 'Customer Advance Deposits', 'LIABILITY', 'Current Liability', 'Advance amounts collected on quotations prior to work order execution'),

    -- EQUITY (3000s)
    ('3010', 'Owner / Founder Capital', 'EQUITY', 'Equity', 'Initial capital introduced by owners/partners'),
    ('3020', 'Retained Earnings', 'EQUITY', 'Equity', 'Cumulative net earnings retained in business'),

    -- REVENUE / INCOME (4000s)
    ('4010', 'Equipment & Product Sales Revenue', 'REVENUE', 'Operating Revenue', 'Revenue from sale of cameras, panels, UPS, switches & controllers'),
    ('4020', 'CCTV Installation Service Revenue', 'REVENUE', 'Operating Revenue', 'Labor & cabling charges for CCTV security projects'),
    ('4030', 'Solar EPC Installation Revenue', 'REVENUE', 'Operating Revenue', 'Engineering, structural mounting & net-metering liaison fees'),
    ('4040', 'UPS & Power Setup Revenue', 'REVENUE', 'Operating Revenue', 'Battery commissioning and electrical backup integration'),
    ('4050', 'Home & Sump Automation Revenue', 'REVENUE', 'Operating Revenue', 'Turnkey smart water controller & lighting automation installation'),
    ('4060', 'AMC Maintenance & Service Fees', 'REVENUE', 'Operating Revenue', 'Annual Maintenance Contracts and on-demand repair charges'),

    -- EXPENSES & COGS (5000s)
    ('5010', 'Cost of Goods Sold (COGS - Materials)', 'EXPENSE', 'Cost of Sales', 'Direct purchase cost of inventory items delivered and installed'),
    ('5020', 'Direct Installation Consumables & Cabling', 'EXPENSE', 'Cost of Sales', 'Pipes, conduits, fasteners, CAT6 cables, solar MC4 & lugs'),
    ('5030', 'Technician & Labor Wages', 'EXPENSE', 'Direct Expense', 'Site technician stipends, overtime, and subcontractor payouts'),
    ('5040', 'Logistics, Transport & Fuel', 'EXPENSE', 'Operating Expense', 'Vehicle fuel, site transit, freight & courier charges'),
    ('5050', 'Marketing, Web & Sales Commission', 'EXPENSE', 'Operating Expense', 'Website hosting, promotional campaigns & sales incentives'),
    ('5060', 'Office Rent, Utilities & Power', 'EXPENSE', 'Operating Expense', 'Office lease, warehouse electricity, and internet connectivity'),
    ('5070', 'Bank & Payment Gateway Charges', 'EXPENSE', 'Operating Expense', 'Merchant gateway fees, POS swipe charges & bank fees')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description;
