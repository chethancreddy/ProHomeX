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
