-- CCS LMS — Faculty Registration Workflow
-- Handles self-registration for faculty with admin approval requirement

-- 1. Update faculty table to ensure new registrations are inactive by default
ALTER TABLE public.faculty ALTER COLUMN is_active SET DEFAULT false;

-- 2. RPC for Faculty Registration
CREATE OR REPLACE FUNCTION public.register_faculty(
    p_email text,
    p_password text,
    p_first_name text,
    p_last_name text,
    p_department text
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
        false -- No force change as per user requirement
    )
    RETURNING id INTO v_profile_id;

    -- 2. Create Faculty record (inactive by default)
    INSERT INTO public.faculty (id, department, is_active)
    VALUES (v_profile_id, p_department, false);

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

-- 3. RPC for Admin Activation
CREATE OR REPLACE FUNCTION public.activate_faculty(
    p_faculty_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.faculty
    SET is_active = true
    WHERE id = p_faculty_id;

    -- Notify the faculty member
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        p_faculty_id,
        'Account Activated! ✅',
        'Your faculty account has been approved and activated. You can now access your dashboard.',
        'system',
        '/faculty/login'
    );
END;
$$;
