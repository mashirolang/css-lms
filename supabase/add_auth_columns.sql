-- CCS LMS — Add Custom Auth Columns to Profiles
-- This migration adds the necessary columns for the custom login system

-- 1. Ensure pgcrypto is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add password and force_password_change columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password text,
ADD COLUMN IF NOT EXISTS force_password_change boolean DEFAULT true;

-- 3. Update existing profiles with a default password (optional, but good for testing)
-- All existing accounts will have 'password123' as default
UPDATE public.profiles 
SET password = crypt('password123', gen_salt('bf')) 
WHERE password IS NULL;
