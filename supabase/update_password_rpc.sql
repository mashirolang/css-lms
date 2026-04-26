-- CCS LMS — Update Profile Password RPC
-- Allows a user to change their password and clears the force_password_change flag

CREATE OR REPLACE FUNCTION public.update_profile_password(
    p_user_id uuid,
    p_new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        force_password_change = false
    WHERE id = p_user_id;
END;
$$;
