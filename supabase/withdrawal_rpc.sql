-- CCS LMS — Admin Withdrawal RPC
-- Allows administrators to formally withdraw a student from a confirmed subject

CREATE OR REPLACE FUNCTION public.withdraw_student_subject(
    p_student_id uuid,
    p_subject_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subject_code text;
BEGIN
    -- 1. Get subject code for notification
    SELECT code INTO v_subject_code FROM public.subjects WHERE id = p_subject_id;

    -- 2. Delete enrollment record
    DELETE FROM public.enrollments
    WHERE student_id = p_student_id
      AND subject_id = p_subject_id;

    -- 3. Notify the student
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        p_student_id,
        'Subject Withdrawn ⚠️',
        'You have been officially withdrawn from ' || COALESCE(v_subject_code, 'a subject') || ' by the administrator.',
        'enrollment',
        '/student/classes'
    );
END;
$$;
