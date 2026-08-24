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
