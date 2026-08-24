-- ============================================================
-- TechMaha: Product, Inventory & Quotation Request Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Extend products table with new fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 2. Extend quotations table
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS quotation_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ADMIN';

-- Auto-generate quotation numbers
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

-- 3. Customer Quotation Requests (product-selection based, pre-formal-quotation)
CREATE TABLE IF NOT EXISTS public.quotation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  request_number TEXT UNIQUE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'QUOTED', 'REJECTED')),
  customer_notes TEXT,
  admin_notes TEXT,
  converted_quotation_id UUID REFERENCES public.quotations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotation_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-number requests
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_request_number ON public.quotation_requests;
CREATE TRIGGER set_request_number
  BEFORE INSERT ON public.quotation_requests
  FOR EACH ROW EXECUTE FUNCTION public.generate_request_number();

-- Updated_at trigger
CREATE TRIGGER update_quotation_requests_modtime
  BEFORE UPDATE ON public.quotation_requests
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 4. RLS for quotation_requests and items
ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_request_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers view own requests" ON public.quotation_requests;
CREATE POLICY "Customers view own requests" ON public.quotation_requests
  FOR SELECT USING (customer_id IN (
    SELECT id FROM public.customers WHERE profile_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Customers create requests" ON public.quotation_requests;
CREATE POLICY "Customers create requests" ON public.quotation_requests
  FOR INSERT WITH CHECK (customer_id IN (
    SELECT id FROM public.customers WHERE profile_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins manage requests" ON public.quotation_requests;
CREATE POLICY "Admins manage requests" ON public.quotation_requests
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Customers view own request items" ON public.quotation_request_items;
CREATE POLICY "Customers view own request items" ON public.quotation_request_items
  FOR SELECT USING (request_id IN (
    SELECT id FROM public.quotation_requests
    WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Customers insert request items" ON public.quotation_request_items;
CREATE POLICY "Customers insert request items" ON public.quotation_request_items
  FOR INSERT WITH CHECK (request_id IN (
    SELECT id FROM public.quotation_requests
    WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Admins manage request items" ON public.quotation_request_items;
CREATE POLICY "Admins manage request items" ON public.quotation_request_items
  FOR ALL USING (public.is_admin());

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_quotation_requests_customer ON public.quotation_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_status ON public.quotation_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotation_request_items_request ON public.quotation_request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_public ON public.products(is_public) WHERE is_public = true;
