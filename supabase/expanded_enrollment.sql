-- CCS LMS — Expanded Enrollment Schema Update
-- Adds personal and guardian information fields to student profiles

-- 1. Update public.profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS middle_name    text,
ADD COLUMN IF NOT EXISTS birth_date     date,
ADD COLUMN IF NOT EXISTS gender         text,
ADD COLUMN IF NOT EXISTS contact_number  text,
ADD COLUMN IF NOT EXISTS address        text;

-- 2. Update public.students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS guardian_name    text,
ADD COLUMN IF NOT EXISTS guardian_contact text;

-- 3. Registration RPC
-- This allows creating a profile and student entry in a single transaction
-- and handles the password hashing using pgcrypto.
CREATE OR REPLACE FUNCTION public.register_student(
    p_email          text,
    p_password       text,
    p_first_name     text,
    p_last_name      text,
    p_middle_name    text,
    p_birth_date     date,
    p_gender         text,
    p_contact_number  text,
    p_address        text,
    p_course_id      text,
    p_year_level     int,
    p_section        text,
    p_guardian_name  text,
    p_guardian_contact text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id uuid;
BEGIN
    -- 1. Create Profile
    INSERT INTO public.profiles (
        email,
        password_hash,
        role,
        first_name,
        last_name,
        middle_name,
        birth_date,
        gender,
        contact_number,
        address,
        force_password_change
    )
    VALUES (
        lower(trim(p_email)),
        crypt(p_password, gen_salt('bf')),
        'student',
        p_first_name,
        p_last_name,
        p_middle_name,
        p_birth_date,
        p_gender,
        p_contact_number,
        p_address,
        true -- Force change on first login
    )
    RETURNING id INTO v_profile_id;

    -- 2. Create Student entry
    INSERT INTO public.students (
        id,
        status,
        course_id,
        year_level,
        section,
        guardian_name,
        guardian_contact
    )
    VALUES (
        v_profile_id,
        'pending',
        p_course_id,
        p_year_level,
        p_section,
        p_guardian_name,
        p_guardian_contact
    );

    -- 3. Notify Admins about new registration
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT id, 'New Student Application', p_first_name || ' ' || p_last_name || ' has applied for enrollment.', 'enrollment', '/admin/students'
    FROM public.profiles
    WHERE role = 'admin';

    RETURN v_profile_id;
END;
$$;
