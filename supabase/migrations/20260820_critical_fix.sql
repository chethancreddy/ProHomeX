-- ============================================================
-- TechMaha: Critical Fix Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Fix the handle_new_user trigger to ALSO create a customers row
-- This is the root cause of "Customer profile not found"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;

  -- If the new user is a CUSTOMER, also create a customers CRM record
  IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER'::user_role) = 'CUSTOMER' THEN
    INSERT INTO public.customers (profile_id, company_name)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'company_name'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill: Create customers records for existing CUSTOMER profiles that don't have one
INSERT INTO public.customers (profile_id)
SELECT p.id FROM public.profiles p
WHERE p.role = 'CUSTOMER'
  AND NOT EXISTS (
    SELECT 1 FROM public.customers c WHERE c.profile_id = p.id
  );

-- 3. Add missing columns to tickets table for the raise-ticket form
ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- 4. Auto-generate ticket numbers (TKT-XXXXXX format)
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

-- 5. Create the leads table for the public quote form
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

-- Auto-generate lead reference numbers
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

-- RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a lead (public form)
CREATE POLICY "Anyone can create a lead" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Only admins can view/manage leads
CREATE POLICY "Admins manage leads" ON public.leads
  FOR ALL USING (public.is_admin());

-- Updated_at trigger for leads
CREATE TRIGGER update_leads_modtime
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 6. Allow customers to INSERT their own tickets
CREATE POLICY "Customers can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  );

-- 7. Allow customers to view their ticket logs
CREATE POLICY "Customers view own ticket logs" ON public.ticket_logs
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM public.tickets
      WHERE customer_id IN (
        SELECT id FROM public.customers WHERE profile_id = auth.uid()
      )
    )
  );

-- 8. Add invoice_number column to invoices for readable IDs
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

-- 9. Allow anon to INSERT leads (public form doesn't require login)
GRANT INSERT ON public.leads TO anon;
GRANT USAGE ON SCHEMA public TO anon;
