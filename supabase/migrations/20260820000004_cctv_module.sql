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
