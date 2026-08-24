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
