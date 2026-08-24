-- ============================================================
-- ProHomeX: Module 4 — Home Automation
-- Migration 011 — Run in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1. Automation Device & Controller Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automation_device_type') THEN
        CREATE TYPE automation_device_type AS ENUM (
            'SUMP_MOTOR',
            'LIGHT_SENSOR',
            'SMART_SWITCH',
            'GATEWAY',
            'SMART_LOCK',
            'CURTAIN_MOTOR',
            'AC_CONTROLLER',
            'SCENE_CONTROLLER',
            'OTHER'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automation_device_status') THEN
        CREATE TYPE automation_device_status AS ENUM (
            'ONLINE',
            'OFFLINE',
            'ON',
            'OFF',
            'TRIPPED',
            'DRY_RUN_ERROR',
            'MAINTENANCE'
        );
    END IF;
END $$;

-- 2. Automation Controllers / Hardware installed on sites
CREATE TABLE IF NOT EXISTS public.automation_controllers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    device_type automation_device_type NOT NULL DEFAULT 'SUMP_MOTOR',
    model_number TEXT,
    serial_number TEXT,
    ip_address TEXT,
    mac_address TEXT,
    status automation_device_status NOT NULL DEFAULT 'ONLINE',
    water_level_percent INTEGER DEFAULT 0,
    motor_state TEXT DEFAULT 'OFF', -- 'ON', 'OFF', 'AUTO', 'MANUAL'
    config JSONB DEFAULT '{}'::jsonb, -- sensitivity, lux threshold, off delay, timer
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Automatic Sump Motor & Water Level Event Logs
CREATE TABLE IF NOT EXISTS public.sump_motor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    controller_id UUID REFERENCES public.automation_controllers(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'AUTO_START', 'AUTO_STOP', 'MANUAL_OVERRIDE_ON', 'MANUAL_OVERRIDE_OFF', 'DRY_RUN_TRIP', 'OVERLOAD_FAULT', 'WATER_LOW_TRIGGER', 'WATER_FULL_TRIGGER'
    water_level_percent INTEGER,
    motor_state TEXT,
    voltage_volts NUMERIC(6,2),
    current_amps NUMERIC(6,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sensor-Based Lighting & Smart Switch Nodes
CREATE TABLE IF NOT EXISTS public.lighting_automation_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    controller_id UUID REFERENCES public.automation_controllers(id) ON DELETE SET NULL,
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    room_zone TEXT NOT NULL, -- 'Living Room', 'Staircase', 'Corridor', 'Bathroom', 'Porch', 'Garden'
    sensor_type TEXT NOT NULL DEFAULT 'PIR_MOTION', -- 'PIR_MOTION', 'MICROWAVE_RADAR', 'LUX_DAYLIGHT', 'DOOR_CONTACT'
    current_state TEXT NOT NULL DEFAULT 'OFF', -- 'ON', 'OFF', 'AUTO'
    lux_level INTEGER DEFAULT 50,
    off_delay_seconds INTEGER DEFAULT 60,
    motion_detected_at TIMESTAMPTZ,
    config JSONB DEFAULT '{
        "sensitivity": "HIGH",
        "daylight_saving": true,
        "manual_override": false
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Automation Event Stream (For Smart Locks, Curtains, Scenes, etc.)
CREATE TABLE IF NOT EXISTS public.automation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.customer_sites(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    event_name TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for modtime
DROP TRIGGER IF EXISTS update_automation_controllers_modtime ON public.automation_controllers;
CREATE TRIGGER update_automation_controllers_modtime
    BEFORE UPDATE ON public.automation_controllers
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_lighting_nodes_modtime ON public.lighting_automation_nodes;
CREATE TRIGGER update_lighting_nodes_modtime
    BEFORE UPDATE ON public.lighting_automation_nodes
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS
ALTER TABLE public.automation_controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sump_motor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighting_automation_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;

-- Customers view own site automation
DROP POLICY IF EXISTS "Customers view own automation controllers" ON public.automation_controllers;
CREATE POLICY "Customers view own automation controllers" ON public.automation_controllers
    FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));

DROP POLICY IF EXISTS "Customers view own sump motor logs" ON public.sump_motor_logs;
CREATE POLICY "Customers view own sump motor logs" ON public.sump_motor_logs
    FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));

DROP POLICY IF EXISTS "Customers view own lighting nodes" ON public.lighting_automation_nodes;
CREATE POLICY "Customers view own lighting nodes" ON public.lighting_automation_nodes
    FOR SELECT USING (site_id IN (SELECT id FROM public.customer_sites WHERE customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())));

-- Admins full control
DROP POLICY IF EXISTS "Admins manage automation controllers" ON public.automation_controllers;
CREATE POLICY "Admins manage automation controllers" ON public.automation_controllers FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage sump motor logs" ON public.sump_motor_logs;
CREATE POLICY "Admins manage sump motor logs" ON public.sump_motor_logs FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage lighting nodes" ON public.lighting_automation_nodes;
CREATE POLICY "Admins manage lighting nodes" ON public.lighting_automation_nodes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage automation events" ON public.automation_events;
CREATE POLICY "Admins manage automation events" ON public.automation_events FOR ALL USING (public.is_admin());

-- Pre-seed Home Automation Catalog (Service, Categories, Product Types, Products & Prices)
DO $$ 
DECLARE
    svc_auto_id UUID;
    cat_motor_id UUID;
    cat_light_id UUID;
    cat_hub_id UUID;
    cat_sec_id UUID;
    
    type_sump_id UUID;
    type_sensor_id UUID;
    type_pir_id UUID;
    type_switch_id UUID;
    type_hub_id UUID;
    type_lock_id UUID;
    
    prod_sump1 UUID;
    prod_sump2 UUID;
    prod_pir1 UUID;
    prod_radar1 UUID;
    prod_touch1 UUID;
    prod_hub1 UUID;
    prod_lock1 UUID;
BEGIN
    -- 1. Insert Home Automation Service
    SELECT id INTO svc_auto_id FROM public.services WHERE name = 'Home Automation';
    IF svc_auto_id IS NULL THEN
        INSERT INTO public.services (name, description)
        VALUES ('Home Automation', 'Smart Water Sump Controllers, Sensor Lighting, Smart Switches, Hubs & IoT Automation')
        RETURNING id INTO svc_auto_id;
    END IF;

    -- 2. Insert Categories
    SELECT id INTO cat_motor_id FROM public.product_categories WHERE name = 'Motor & Water Automation' AND service_id = svc_auto_id;
    IF cat_motor_id IS NULL THEN
        INSERT INTO public.product_categories (service_id, name, description)
        VALUES (svc_auto_id, 'Motor & Water Automation', 'Automatic Sump & Overhead Tank Motor Controllers, Ultrasonic Sensors & Dry-Run Starters')
        RETURNING id INTO cat_motor_id;
    END IF;

    SELECT id INTO cat_light_id FROM public.product_categories WHERE name = 'Smart Lighting & Sensors' AND service_id = svc_auto_id;
    IF cat_light_id IS NULL THEN
        INSERT INTO public.product_categories (service_id, name, description)
        VALUES (svc_auto_id, 'Smart Lighting & Sensors', 'PIR Occupancy Sensors, Microwave Radar Switches, Smart Touch Panels & Dimming Relays')
        RETURNING id INTO cat_light_id;
    END IF;

    SELECT id INTO cat_hub_id FROM public.product_categories WHERE name = 'Automation Hubs & Gateways' AND service_id = svc_auto_id;
    IF cat_hub_id IS NULL THEN
        INSERT INTO public.product_categories (service_id, name, description)
        VALUES (svc_auto_id, 'Automation Hubs & Gateways', 'Zigbee 3.0 Hubs, Wi-Fi Gateways, Scene Controllers & IoT Relays')
        RETURNING id INTO cat_hub_id;
    END IF;

    SELECT id INTO cat_sec_id FROM public.product_categories WHERE name = 'Smart Access & Curtains' AND service_id = svc_auto_id;
    IF cat_sec_id IS NULL THEN
        INSERT INTO public.product_categories (service_id, name, description)
        VALUES (svc_auto_id, 'Smart Access & Curtains', 'Smart Fingerprint Door Locks, Motorized Curtain Tracks & Video Doorbells')
        RETURNING id INTO cat_sec_id;
    END IF;

    -- 3. Insert Product Types
    SELECT id INTO type_sump_id FROM public.product_types WHERE name = 'Auto Sump Controller' AND category_id = cat_motor_id;
    IF type_sump_id IS NULL THEN
        INSERT INTO public.product_types (category_id, name, description)
        VALUES (cat_motor_id, 'Auto Sump Controller', 'Dual Tank Sump + Overhead Tank Auto Motor Switcher')
        RETURNING id INTO type_sump_id;
    END IF;

    SELECT id INTO type_sensor_id FROM public.product_types WHERE name = 'Water Level Sensors' AND category_id = cat_motor_id;
    IF type_sensor_id IS NULL THEN
        INSERT INTO public.product_types (category_id, name, description)
        VALUES (cat_motor_id, 'Water Level Sensors', 'Non-contact Ultrasonic & Stainless Steel Magnetic Float Sensors')
        RETURNING id INTO type_sensor_id;
    END IF;

    SELECT id INTO type_pir_id FROM public.product_types WHERE name = 'PIR Motion Sensor' AND category_id = cat_light_id;
    IF type_pir_id IS NULL THEN
        INSERT INTO public.product_types (category_id, name, description)
        VALUES (cat_light_id, 'PIR Motion Sensor', 'Ceiling and Wall Mounted Infrared Human Motion Sensors')
        RETURNING id INTO type_pir_id;
    END IF;

    SELECT id INTO type_switch_id FROM public.product_types WHERE name = 'Smart Touch Switch' AND category_id = cat_light_id;
    IF type_switch_id IS NULL THEN
        INSERT INTO public.product_types (category_id, name, description)
        VALUES (cat_light_id, 'Smart Touch Switch', '1/2/4 Gang Capacitive Glass Touch Panels with App Control')
        RETURNING id INTO type_switch_id;
    END IF;

    SELECT id INTO type_hub_id FROM public.product_types WHERE name = 'Zigbee Gateway Hub' AND category_id = cat_hub_id;
    IF type_hub_id IS NULL THEN
        INSERT INTO public.product_types (category_id, name, description)
        VALUES (cat_hub_id, 'Zigbee Gateway Hub', 'Multi-Protocol Smart Home Gateway with Cloud Sync')
        RETURNING id INTO type_hub_id;
    END IF;

    SELECT id INTO type_lock_id FROM public.product_types WHERE name = 'Smart Door Lock' AND category_id = cat_sec_id;
    IF type_lock_id IS NULL THEN
        INSERT INTO public.product_types (category_id, name, description)
        VALUES (cat_sec_id, 'Smart Door Lock', 'Biometric Fingerprint, RFID Card, Passcode & Mobile App Smart Lock')
        RETURNING id INTO type_lock_id;
    END IF;

    -- 4. Sample Products & Prices
    -- Product A: ProHomeX SumpMaster Pro Auto Motor Controller
    INSERT INTO public.products (category_id, type_id, name, sku, brand, model, description, unit, gst_rate, is_active)
    VALUES (
        cat_motor_id, type_sump_id,
        'ProHomeX SumpMaster Pro Dual Tank Auto Motor Controller',
        'AUTO-SUMP-PRO', 'ProHomeX', 'SMP-2000X',
        'Microcontroller-based intelligent water level controller with dry-run protection, high/low voltage cutoff, automatic cyclic timer, and manual override rocker switch. Suitable for up to 3HP motors.',
        'unit', 18.00, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO prod_sump1;

    IF prod_sump1 IS NOT NULL THEN
        INSERT INTO public.product_prices (product_id, cost_price, selling_price, is_current)
        VALUES (prod_sump1, 2800.00, 4499.00, true);
    END IF;

    -- Product B: Ultrasonic Non-Contact Tank Level Sensor
    INSERT INTO public.products (category_id, type_id, name, sku, brand, model, description, unit, gst_rate, is_active)
    VALUES (
        cat_motor_id, type_sensor_id,
        'ProHomeX Precision Ultrasonic Water Depth Sensor (0-5m)',
        'AUTO-WTR-US5M', 'ProHomeX', 'ULS-500X',
        'Corrosion-free non-contact ultrasonic sensor for real-time tank depth percentage monitoring with waterproof IP68 rating.',
        'unit', 18.00, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO prod_sump2;

    IF prod_sump2 IS NOT NULL THEN
        INSERT INTO public.product_prices (product_id, cost_price, selling_price, is_current)
        VALUES (prod_sump2, 1200.00, 1999.00, true);
    END IF;

    -- Product C: 360° Ceiling PIR Occupancy Sensor Light Switch
    INSERT INTO public.products (category_id, type_id, name, sku, brand, model, description, unit, gst_rate, is_active)
    VALUES (
        cat_light_id, type_pir_id,
        'ProHomeX 360° Ceiling PIR Motion Sensor Switch with Lux Sensor',
        'AUTO-PIR-360', 'ProHomeX', 'PIR-360LX',
        'Dual element passive infrared sensor with 6m detection radius, adjustable timer (10s to 15min), and ambient lux day/night threshold dial. Ideal for staircases, bathrooms, and corridors.',
        'unit', 18.00, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO prod_pir1;

    IF prod_pir1 IS NOT NULL THEN
        INSERT INTO public.product_prices (product_id, cost_price, selling_price, is_current)
        VALUES (prod_pir1, 450.00, 899.00, true);
    END IF;

    -- Product D: Microwave Doppler Radar Sensor Switch
    INSERT INTO public.products (category_id, type_id, name, sku, brand, model, description, unit, gst_rate, is_active)
    VALUES (
        cat_light_id, type_pir_id,
        'ProHomeX 5.8GHz Microwave Radar Motion Sensor Switch',
        'AUTO-MWR-58G', 'ProHomeX', 'MWR-580X',
        'High-sensitivity microwave radar detector that penetrates thin glass, doors, and false ceilings for hidden aesthetic installation. Instant sub-second trigger.',
        'unit', 18.00, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO prod_radar1;

    IF prod_radar1 IS NOT NULL THEN
        INSERT INTO public.product_prices (product_id, cost_price, selling_price, is_current)
        VALUES (prod_radar1, 650.00, 1299.00, true);
    END IF;

    -- Product E: 4-Gang Smart Touch Panel
    INSERT INTO public.products (category_id, type_id, name, sku, brand, model, description, unit, gst_rate, is_active)
    VALUES (
        cat_light_id, type_switch_id,
        'ProHomeX 4-Gang Tempered Glass Smart Touch Switch (Wi-Fi + Zigbee)',
        'AUTO-SW4-GLS', 'ProHomeX', 'STP-400X',
        'Luxury tempered glass capacitive touch panel with RGB LED backlight, smartphone app control, voice assistant integration (Alexa/Google), and timer schedules.',
        'unit', 18.00, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO prod_touch1;

    IF prod_touch1 IS NOT NULL THEN
        INSERT INTO public.product_prices (product_id, cost_price, selling_price, is_current)
        VALUES (prod_touch1, 1400.00, 2499.00, true);
    END IF;

    -- Product F: Smart Home Zigbee 3.0 Central Gateway Hub
    INSERT INTO public.products (category_id, type_id, name, sku, brand, model, description, unit, gst_rate, is_active)
    VALUES (
        cat_hub_id, type_hub_id,
        'ProHomeX Zigbee 3.0 & Matter Mesh Central Gateway Hub',
        'AUTO-HUB-ZIG3', 'ProHomeX', 'HUB-3000X',
        'Low-latency mesh gateway supporting up to 128 smart devices with local offline automation execution even when internet is down.',
        'unit', 18.00, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO prod_hub1;

    IF prod_hub1 IS NOT NULL THEN
        INSERT INTO public.product_prices (product_id, cost_price, selling_price, is_current)
        VALUES (prod_hub1, 1800.00, 3299.00, true);
    END IF;

    -- Product G: 5-in-1 Biometric Smart Fingerprint Door Lock
    INSERT INTO public.products (category_id, type_id, name, sku, brand, model, description, unit, gst_rate, is_active)
    VALUES (
        cat_sec_id, type_lock_id,
        'ProHomeX Smart Biometric Fingerprint & RFID Digital Door Lock',
        'AUTO-LOCK-BIO5', 'ProHomeX', 'SDL-500X',
        'Aerospace-grade zinc alloy smart door lock with semiconductor 360° fingerprint scanner, virtual anti-peep PIN, RFID keyfobs, mechanical backup keys, and emergency USB power.',
        'unit', 18.00, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO prod_lock1;

    IF prod_lock1 IS NOT NULL THEN
        INSERT INTO public.product_prices (product_id, cost_price, selling_price, is_current)
        VALUES (prod_lock1, 5500.00, 9999.00, true);
    END IF;

END $$;
