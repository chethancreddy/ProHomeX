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
