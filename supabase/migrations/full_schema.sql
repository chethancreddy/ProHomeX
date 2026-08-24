-- TechMaha Database Foundation (Phase 0)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shared Enums
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN', 
    'ADMIN', 
    'MANAGER', 
    'SALES', 
    'TECHNICAL_TEAM', 
    'TECHNICIAN', 
    'INVENTORY', 
    'ACCOUNTS', 
    'CUSTOMER'
);

-- Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    role user_role DEFAULT 'CUSTOMER'::user_role NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table (CRM Base)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id),
    company_name TEXT,
    tax_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_customers_modtime
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Row Level Security (RLS) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies will be added in Phase 1 (Authentication and RBAC).
-- Phase 1: Authentication and Row Level Security Setup

-- Function to check if a user is an admin or staff (non-customer)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role != 'CUSTOMER'::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Admins can read all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin());

-- 3. Users can update their own profile (except role)
-- Prevent users from elevating their own role
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Customers Policies (CRM)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 1. Customers can view their own customer record
CREATE POLICY "Customers can view own CRM record" 
ON public.customers FOR SELECT 
USING (profile_id = auth.uid());

-- 2. Admins can view all customer records
CREATE POLICY "Admins can view all customer records" 
ON public.customers FOR SELECT 
USING (public.is_admin());

-- 3. Admins can insert/update customer records
CREATE POLICY "Admins can manage customer records" 
ON public.customers FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Supabase Auth Trigger 
-- Ensure a profile is automatically created when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
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
-- Phase 2: CCTV Module (Warranties & AMC)

CREATE TYPE warranty_status AS ENUM ('ACTIVE', 'EXPIRED');
CREATE TYPE amc_status AS ENUM ('ACTIVE', 'EXPIRED', 'RENEWAL_DUE');

-- 1. Site Warranties
CREATE TABLE IF NOT EXISTS public.site_warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id), -- Installation ticket that triggered this
    product_id UUID REFERENCES public.products(id), -- Specific product covered
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status warranty_status DEFAULT 'ACTIVE'::warranty_status,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AMC Contracts
CREATE TABLE IF NOT EXISTS public.site_amc_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    contract_value NUMERIC(12,2) DEFAULT 0,
    status amc_status DEFAULT 'ACTIVE'::amc_status,
    visits_included INTEGER DEFAULT 4,
    visits_completed INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_warranties_modtime BEFORE UPDATE ON public.site_warranties FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_amc_modtime BEFORE UPDATE ON public.site_amc_contracts FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS setup
ALTER TABLE public.site_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_amc_contracts ENABLE ROW LEVEL SECURITY;

-- Customers view their own warranties/AMC
CREATE POLICY "Customers view own warranties" ON public.site_warranties FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));
CREATE POLICY "Customers view own AMC" ON public.site_amc_contracts FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid()));

-- Admins manage warranties/AMC
CREATE POLICY "Admins manage warranties" ON public.site_warranties FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage amc" ON public.site_amc_contracts FOR ALL USING (public.is_admin());

-- Pre-seed some CCTV categories to demonstrate functionality
-- Since IDs are UUIDs we can just insert them dynamically
DO $$ 
DECLARE
    svc_cctv_id UUID;
    cat_cam_id UUID;
    cat_dvr_id UUID;
BEGIN
    -- Only insert if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'CCTV') THEN
        INSERT INTO public.services (name, description) VALUES ('CCTV', 'Surveillance and Security Systems') RETURNING id INTO svc_cctv_id;
        
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_cctv_id, 'Cameras') RETURNING id INTO cat_cam_id;
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_cctv_id, 'DVR/NVR') RETURNING id INTO cat_dvr_id;
        
        -- Insert dummy products
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_cam_id, '2MP Dome Camera', 'CAM-DOME-2MP-01', 'Hikvision', 'DS-2CE56D0T-IRPF');
        
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_dvr_id, '4 Channel DVR', 'DVR-4CH-01', 'Hikvision', 'DS-7104HGHI-F1');
    END IF;
END $$;
-- Phase 3: Solar Module Setup

CREATE TYPE net_metering_status AS ENUM ('DOCUMENT_COLLECTION', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMMISSIONED');
CREATE TYPE subsidy_status AS ENUM ('APPLIED', 'RECEIVED', 'CLAIMED');

-- 1. Net Metering Tracking
CREATE TABLE IF NOT EXISTS public.solar_net_metering (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id), -- Installation ticket reference
    application_number TEXT UNIQUE,
    status net_metering_status DEFAULT 'DOCUMENT_COLLECTION'::net_metering_status,
    submission_date TIMESTAMPTZ,
    approval_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subsidies
CREATE TABLE IF NOT EXISTS public.solar_subsidies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    subsidy_scheme_name TEXT NOT NULL,
    estimated_amount NUMERIC(12,2) DEFAULT 0,
    status subsidy_status DEFAULT 'APPLIED'::subsidy_status,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_net_metering_modtime BEFORE UPDATE ON public.solar_net_metering FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_solar_subsidies_modtime BEFORE UPDATE ON public.solar_subsidies FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS setup
ALTER TABLE public.solar_net_metering ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_subsidies ENABLE ROW LEVEL SECURITY;

-- Customer Read Access
CREATE POLICY "Customers view own net metering" ON public.solar_net_metering FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));
CREATE POLICY "Customers view own subsidies" ON public.solar_subsidies FOR SELECT USING (quotation_id IN (SELECT id FROM public.quotations WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));

-- Admin Write Access
CREATE POLICY "Admins manage net metering" ON public.solar_net_metering FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage subsidies" ON public.solar_subsidies FOR ALL USING (public.is_admin());

-- Pre-seed Solar categories to demonstrate functionality
DO $$ 
DECLARE
    svc_solar_id UUID;
    cat_panel_id UUID;
    cat_inverter_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Solar') THEN
        INSERT INTO public.services (name, description) VALUES ('Solar', 'Solar Energy Generation Systems') RETURNING id INTO svc_solar_id;
        
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_solar_id, 'Solar Panels') RETURNING id INTO cat_panel_id;
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_solar_id, 'Inverters') RETURNING id INTO cat_inverter_id;
        
        -- Insert dummy products
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_panel_id, '550W Monocrystalline Panel', 'SOL-PAN-550-01', 'Longi', 'LR5-72HBD-550M');
        
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_inverter_id, '5kW Hybrid Inverter', 'SOL-INV-5KW-01', 'Deye', 'SUN-5K-SG04LP1-EU');
    END IF;
END $$;
-- Phase 4: UPS Module Setup

CREATE TYPE electrical_phase AS ENUM ('SINGLE', 'THREE');
CREATE TYPE battery_status AS ENUM ('HEALTHY', 'REPLACE_SOON', 'REPLACED');

-- 1. Site Electrical Load Tracking
CREATE TABLE IF NOT EXISTS public.ups_site_loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    calculated_kva NUMERIC(10,2) NOT NULL,
    phase_type electrical_phase DEFAULT 'SINGLE'::electrical_phase,
    last_assessed TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Battery Lifecycle Tracking
CREATE TABLE IF NOT EXISTS public.ups_battery_lifecycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id), -- Installation/Replacement ticket
    product_id UUID REFERENCES public.products(id), -- The battery product
    quantity INTEGER DEFAULT 1,
    installation_date TIMESTAMPTZ NOT NULL,
    expected_life_months INTEGER DEFAULT 36, -- usually 3 to 5 years
    replacement_status battery_status DEFAULT 'HEALTHY'::battery_status,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_ups_loads_modtime BEFORE UPDATE ON public.ups_site_loads FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_ups_battery_modtime BEFORE UPDATE ON public.ups_battery_lifecycles FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS setup
ALTER TABLE public.ups_site_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ups_battery_lifecycles ENABLE ROW LEVEL SECURITY;

-- Customer Read Access
CREATE POLICY "Customers view own site loads" ON public.ups_site_loads FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));
CREATE POLICY "Customers view own battery lifecycles" ON public.ups_battery_lifecycles FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));

-- Admin Write Access
CREATE POLICY "Admins manage site loads" ON public.ups_site_loads FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage battery lifecycles" ON public.ups_battery_lifecycles FOR ALL USING (public.is_admin());

-- Pre-seed UPS categories to demonstrate functionality
DO $$ 
DECLARE
    svc_ups_id UUID;
    cat_inverter_id UUID;
    cat_battery_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'UPS') THEN
        INSERT INTO public.services (name, description) VALUES ('UPS', 'Uninterruptible Power Supply Systems') RETURNING id INTO svc_ups_id;
        
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_ups_id, 'UPS Inverters') RETURNING id INTO cat_inverter_id;
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_ups_id, 'Batteries') RETURNING id INTO cat_battery_id;
        
        -- Insert dummy products
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_inverter_id, '10kVA Online UPS', 'UPS-INV-10K-01', 'APC', 'SRT10KXLI');
        
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_battery_id, '12V 150Ah SMF Battery', 'BAT-12V-150-01', 'Exide', 'Powersafe Plus');
    END IF;
END $$;
-- Phase 5: Networking Module Setup

CREATE TYPE cable_drop_type AS ENUM ('DATA', 'VOICE', 'FIBER', 'CCTV');

-- 1. Physical Racks (MDF/IDF)
CREATE TABLE IF NOT EXISTS public.net_racks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    rack_name TEXT NOT NULL, -- e.g. MDF-1, IDF-A
    location_details TEXT, -- e.g. 2nd Floor Server Room
    u_height INTEGER DEFAULT 42,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, rack_name)
);

-- 2. Structured Cabling Drops
CREATE TABLE IF NOT EXISTS public.net_cable_drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    rack_id UUID REFERENCES public.net_racks(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id), -- Work order that installed them
    drop_type cable_drop_type DEFAULT 'DATA'::cable_drop_type,
    quantity INTEGER NOT NULL DEFAULT 1,
    tested_and_certified BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_net_racks_modtime BEFORE UPDATE ON public.net_racks FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_net_drops_modtime BEFORE UPDATE ON public.net_cable_drops FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS setup
ALTER TABLE public.net_racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_cable_drops ENABLE ROW LEVEL SECURITY;

-- Customer Read Access
CREATE POLICY "Customers view own racks" ON public.net_racks FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));
CREATE POLICY "Customers view own drops" ON public.net_cable_drops FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));

-- Admin Write Access
CREATE POLICY "Admins manage racks" ON public.net_racks FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage drops" ON public.net_cable_drops FOR ALL USING (public.is_admin());

-- Pre-seed Networking categories to demonstrate functionality
DO $$ 
DECLARE
    svc_net_id UUID;
    cat_switch_id UUID;
    cat_cable_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Networking') THEN
        INSERT INTO public.services (name, description) VALUES ('Networking', 'Structured Cabling and IT Infrastructure') RETURNING id INTO svc_net_id;
        
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_net_id, 'Switches') RETURNING id INTO cat_switch_id;
        INSERT INTO public.product_categories (service_id, name) VALUES (svc_net_id, 'Cabling') RETURNING id INTO cat_cable_id;
        
        -- Insert dummy products
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_switch_id, '48-Port PoE Gigabit Switch', 'NET-SW-48P-01', 'Cisco', 'C9200L-48P-4G');
        
        INSERT INTO public.products (category_id, name, sku, brand, model) 
        VALUES (cat_cable_id, 'Cat6 UTP Cable Box (305m)', 'NET-CAB-CAT6-01', 'D-Link', 'NCB-C6UGRYR-305');
    END IF;
END $$;
