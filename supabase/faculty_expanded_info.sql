-- Update faculty table to include contact and address information
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS contact_number text;
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS address text;

-- Update register_faculty RPC to accept these new fields
CREATE OR REPLACE FUNCTION public.register_faculty(
    p_email text,
    p_password text,
    p_first_name text,
    p_last_name text,
    p_department text,
    p_contact_number text DEFAULT null,
    p_address text DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id uuid;
BEGIN
    -- Verify email doesn't exist
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = lower(trim(p_email))) THEN
        RAISE EXCEPTION 'Email already registered';
    END IF;

    -- 1. Create Profile
    INSERT INTO public.profiles (
        email,
        password_hash,
        role,
        first_name,
        last_name,
        force_password_change
    )
    VALUES (
        lower(trim(p_email)),
        crypt(p_password, gen_salt('bf')),
        'faculty',
        p_first_name,
        p_last_name,
        false
    )
    RETURNING id INTO v_profile_id;

    -- 2. Create Faculty record
    INSERT INTO public.faculty (id, department, is_active, contact_number, address)
    VALUES (v_profile_id, p_department, false, p_contact_number, p_address);

    -- 3. Notify Admins
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
        id, 
        'New Faculty Applied 🎓', 
        p_first_name || ' ' || p_last_name || ' is awaiting account activation for ' || p_department || '.', 
        'enrollment',
        '/admin/faculty'
    FROM public.profiles 
    WHERE role = 'admin';

    RETURN v_profile_id;
END;
$$;
