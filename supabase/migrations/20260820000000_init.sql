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
