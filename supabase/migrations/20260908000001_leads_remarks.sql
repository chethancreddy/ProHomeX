-- ============================================================
-- TechMaha / ProHomeX: Add remarks column to leads table
-- Migration 20260908000001 — Safe to run multiple times
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'leads' 
      AND column_name = 'remarks'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN remarks TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'leads' 
      AND column_name = 'closed_at'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN closed_at TIMESTAMPTZ;
  END IF;
END $$;
