-- ============================================================
-- TechMaha: CRM Business Flow Overhaul
-- Migration 009 — Run in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- ============================================================
-- 1. FIX CRITICAL: Create leads table if it doesn't exist
-- (20260820_critical_fix.sql may not have been run)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  location TEXT,
  requirement TEXT,
  message TEXT,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.generate_lead_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := 'ENQ-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_lead_reference ON public.leads;
CREATE TRIGGER set_lead_reference
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.generate_lead_reference();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create a lead" ON public.leads;
CREATE POLICY "Anyone can create a lead" ON public.leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
CREATE POLICY "Admins manage leads" ON public.leads FOR ALL USING (public.is_admin());

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_leads_modtime' AND tgrelid = 'public.leads'::regclass
  ) THEN
    CREATE TRIGGER update_leads_modtime
      BEFORE UPDATE ON public.leads
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

GRANT INSERT ON public.leads TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Also fix ticket_number column if missing (from critical_fix.sql)
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS attachment_url TEXT;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number ON public.tickets;
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

-- Fix invoices columns from critical_fix.sql
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id);

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

DROP POLICY IF EXISTS "Customers can create tickets" ON public.tickets;
CREATE POLICY "Customers can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "Customers view own ticket logs" ON public.ticket_logs;
CREATE POLICY "Customers view own ticket logs" ON public.ticket_logs
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM public.tickets
      WHERE customer_id IN (
        SELECT id FROM public.customers WHERE profile_id = auth.uid()
      )
    )
  );

GRANT INSERT ON public.leads TO anon;

-- ============================================================
-- 2. Extend quotation_status enum
-- ============================================================
DO $$ BEGIN
  BEGIN ALTER TYPE public.quotation_status ADD VALUE 'CONFIRMED'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE public.quotation_status ADD VALUE 'ADVANCE_RECEIVED'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE public.quotation_status ADD VALUE 'IN_PROGRESS'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE public.quotation_status ADD VALUE 'COMPLETED'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE public.quotation_status ADD VALUE 'CANCELLED'; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ============================================================
-- 3. Enhance quotations table
-- ============================================================
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS terms TEXT,
  ADD COLUMN IF NOT EXISTS advance_percentage NUMERIC(5,2) DEFAULT 30,
  ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS advance_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12,2) DEFAULT 0;

-- Also add fields from migration 008 if not already done
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS quotation_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ADMIN';

CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quotation_number IS NULL THEN
    NEW.quotation_number := 'QOT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_quotation_number ON public.quotations;
CREATE TRIGGER set_quotation_number
  BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.generate_quotation_number();

-- Enhance quotation_items
ALTER TABLE public.quotation_items
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS line_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ============================================================
-- 4. Product subcategories (product_types)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, name)
);

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone views product types" ON public.product_types;
CREATE POLICY "Anyone views product types" ON public.product_types
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage product types" ON public.product_types;
CREATE POLICY "Admins manage product types" ON public.product_types
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Add type_id and track_stock to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES public.product_types(id),
  ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT false;

-- Also add migration 008 fields if missing
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- ============================================================
-- 5. Work Orders (dedicated table, separate from tickets)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_number TEXT UNIQUE,
  quotation_id UUID REFERENCES public.quotations(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.customer_sites(id),
  assigned_to UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  scheduled_date DATE,
  completed_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  quotation_item_id UUID REFERENCES public.quotation_items(id),
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  original_qty NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2) DEFAULT 0,
  change_type TEXT DEFAULT 'ORIGINAL'
    CHECK (change_type IN ('ORIGINAL','ADDED','REMOVED','QTY_CHANGE','PRICE_CHANGE','DISCOUNT','SERVICE')),
  revised_qty NUMERIC(10,2),
  revised_price NUMERIC(12,2),
  change_notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_work_order_number ON public.work_orders;
CREATE TRIGGER set_work_order_number
  BEFORE INSERT ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_work_order_number();

DROP TRIGGER IF EXISTS update_work_orders_modtime ON public.work_orders;
CREATE TRIGGER update_work_orders_modtime
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers view own work orders" ON public.work_orders;
CREATE POLICY "Customers view own work orders" ON public.work_orders
  FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage work orders" ON public.work_orders;
CREATE POLICY "Admins manage work orders" ON public.work_orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage work order items" ON public.work_order_items;
CREATE POLICY "Admins manage work order items" ON public.work_order_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Customers view own work order items" ON public.work_order_items;
CREATE POLICY "Customers view own work order items" ON public.work_order_items
  FOR SELECT USING (work_order_id IN (
    SELECT id FROM public.work_orders
    WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  ));

-- ============================================================
-- 6. Payments tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number TEXT UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  quotation_id UUID REFERENCES public.quotations(id),
  work_order_id UUID REFERENCES public.work_orders(id),
  invoice_id UUID REFERENCES public.invoices(id),
  payment_type TEXT NOT NULL
    CHECK (payment_type IN ('ADVANCE','PARTIAL','FINAL','REFUND','ADJUSTMENT')),
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT
    CHECK (payment_method IN ('CASH','BANK_TRANSFER','UPI','CHEQUE','ONLINE','OTHER')),
  reference_number TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_number IS NULL THEN
    NEW.payment_number := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payment_number ON public.payments;
CREATE TRIGGER set_payment_number
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.generate_payment_number();

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Customers view own payments" ON public.payments;
CREATE POLICY "Customers view own payments" ON public.payments
  FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));

-- ============================================================
-- 7. Extend invoices for final invoice generation
-- ============================================================
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES public.work_orders(id),
  ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES public.quotations(id),
  ADD COLUMN IF NOT EXISTS advance_paid NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS terms TEXT;

ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id),
  ADD COLUMN IF NOT EXISTS quantity NUMERIC(10,2) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'PRODUCT'
    CHECK (item_type IN ('PRODUCT','SERVICE','DISCOUNT','ADVANCE','ADJUSTMENT','LABOUR'));

-- ============================================================
-- 8. Seed CCTV product types
-- ============================================================
DO $$
DECLARE
  v_cat_id UUID;
BEGIN
  SELECT pc.id INTO v_cat_id
  FROM public.product_categories pc
  JOIN public.services s ON pc.service_id = s.id
  WHERE s.name ILIKE '%cctv%'
  ORDER BY pc.created_at
  LIMIT 1;

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO public.product_types (category_id, name, sort_order) VALUES
      (v_cat_id, '2MP Camera', 1), (v_cat_id, '4MP Camera', 2),
      (v_cat_id, '5MP Camera', 3), (v_cat_id, '8MP Camera', 4),
      (v_cat_id, '12MP Camera', 5), (v_cat_id, 'Dome Camera', 6),
      (v_cat_id, 'Bullet Camera', 7), (v_cat_id, 'Varifocal Camera', 8),
      (v_cat_id, 'PTZ Camera', 9), (v_cat_id, 'Fisheye Camera', 10),
      (v_cat_id, 'NVR', 11), (v_cat_id, 'DVR', 12),
      (v_cat_id, 'PoE Switch', 13), (v_cat_id, 'Hard Disk', 14),
      (v_cat_id, 'Cable & Accessories', 15), (v_cat_id, 'Other', 99)
    ON CONFLICT (category_id, name) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 9. Performance indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON public.work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_quotation ON public.work_orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_order_items_wo ON public.work_order_items(work_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_quotation ON public.payments(quotation_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
