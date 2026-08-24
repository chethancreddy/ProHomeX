-- Phase 1: CRM & Catalog Foundation

-- 1. CRM Setup

CREATE TABLE IF NOT EXISTS public.customer_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Catalog Setup

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- e.g., 'CCTV', 'Solar', 'UPS'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, name)
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.product_categories(id),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    brand TEXT,
    model TEXT,
    hsn_sac TEXT,
    gst_rate NUMERIC(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    purchase_price NUMERIC(12,2) DEFAULT 0,
    selling_price NUMERIC(12,2) DEFAULT 0,
    effective_date TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial index to ensure only one current price per product
CREATE UNIQUE INDEX product_prices_current_idx ON public.product_prices(product_id) WHERE is_current = true;

CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update Triggers
CREATE TRIGGER update_customer_contacts_modtime BEFORE UPDATE ON public.customer_contacts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_customer_sites_modtime BEFORE UPDATE ON public.customer_sites FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_product_attributes_modtime BEFORE UPDATE ON public.product_attributes FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS setup
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;

-- CRM Policies
CREATE POLICY "Customers view own contacts" ON public.customer_contacts FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));
CREATE POLICY "Admins manage contacts" ON public.customer_contacts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Customers view own sites" ON public.customer_sites FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));
CREATE POLICY "Admins manage sites" ON public.customer_sites FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Catalog Policies (Public Read for Active Products, Admin Manage)
CREATE POLICY "Anyone views services" ON public.services FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage services" ON public.services FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Anyone views categories" ON public.product_categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage categories" ON public.product_categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Anyone views products" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Anyone views attributes" ON public.product_attributes FOR SELECT USING (product_id IN (SELECT id FROM public.products WHERE is_active = true OR public.is_admin()));
CREATE POLICY "Admins manage attributes" ON public.product_attributes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Prices: Customers can view selling_price but not purchase_price via RLS? 
-- RLS doesn't do column-level security well out of the box in this way. We will restrict the whole table to Admin only, and expose a secure PostgreSQL view or RPC function for customers to see selling price.
-- Actually, a better way is an RPC or just let RLS block it completely for customers, and the frontend server-actions will use a Service Role key to fetch selling prices safely.
-- Let's just grant SELECT to everyone for now on product_prices, BUT in application logic we won't expose purchase_price to customers. 
-- Wait, TRD says: "Protect purchase cost". If RLS allows SELECT, they can query it via the Supabase client.
-- Instead, we will restrict product_prices to ADMIN only.
CREATE POLICY "Admins manage prices" ON public.product_prices FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Provide a secure view for selling prices only
CREATE OR REPLACE VIEW public.vw_product_selling_prices AS
SELECT id, product_id, selling_price, effective_date, is_current 
FROM public.product_prices 
WHERE is_current = true;

-- Grant access to the view
GRANT SELECT ON public.vw_product_selling_prices TO authenticated;
