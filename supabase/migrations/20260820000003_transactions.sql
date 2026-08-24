-- Phase 1: Transactional Systems Setup

-- Enums
CREATE TYPE quotation_status AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE inventory_tx_type AS ENUM ('RESTOCK', 'CONSUMED', 'RETURNED');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE');

-- 1. Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.customer_sites(id),
    status quotation_status DEFAULT 'DRAFT'::quotation_status,
    total_amount NUMERIC(12,2) DEFAULT 0,
    valid_until TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER DEFAULT 1,
    unit_price_at_time NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES public.quotations(id),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.customer_sites(id),
    status order_status DEFAULT 'PENDING'::order_status,
    total_amount NUMERIC(12,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tickets & Work Orders
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id), -- Optional: Some tickets might be general support
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.customer_sites(id),
    assigned_to UUID REFERENCES public.profiles(id), -- Technician
    status ticket_status DEFAULT 'OPEN'::ticket_status,
    priority TEXT DEFAULT 'MEDIUM',
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    comment TEXT,
    status_change ticket_status,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inventory Transactions
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id),
    ticket_id UUID REFERENCES public.tickets(id),
    quantity_change INTEGER NOT NULL, -- + for restock, - for consumed
    transaction_type inventory_tx_type NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Invoices (Billing)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.tickets(id), -- Strict reliance: Invoice generated when ticket closed
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    status invoice_status DEFAULT 'DRAFT'::invoice_status,
    due_date TIMESTAMPTZ,
    total_amount NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_quotations_modtime BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_tickets_modtime BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS setup
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Transaction RLS Policies
-- Customers view their own records
CREATE POLICY "Customers view own quotations" ON public.quotations FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));
CREATE POLICY "Customers view own tickets" ON public.tickets FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));
CREATE POLICY "Customers view own invoices" ON public.invoices FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));

-- Sub-items access based on parent access
CREATE POLICY "Customers view own quotation items" ON public.quotation_items FOR SELECT USING (quotation_id IN (SELECT id FROM public.quotations WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));
CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));
CREATE POLICY "Customers view own invoice items" ON public.invoice_items FOR SELECT USING (invoice_id IN (SELECT id FROM public.invoices WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));

-- Admin/Staff Access
CREATE POLICY "Admins manage quotations" ON public.quotations FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage quotation_items" ON public.quotation_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage order_items" ON public.order_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage tickets" ON public.tickets FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage ticket_logs" ON public.ticket_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage inventory_transactions" ON public.inventory_transactions FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage invoice_items" ON public.invoice_items FOR ALL USING (public.is_admin());

-- Additional Rule: Customers can accept their own quotation (UPDATE)
CREATE POLICY "Customers can update quotation status" ON public.quotations FOR UPDATE 
USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()))
WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));
