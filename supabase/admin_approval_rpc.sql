-- CCS LMS — Admin Enrollment Approval RPC (Updated)
-- Atomically confirms all pending subjects and marks the student as enrolled
-- Optionally assigns or updates the student number

CREATE OR REPLACE FUNCTION public.confirm_student_enrollment(
    p_student_id uuid,
    p_student_number text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Confirm all pending enrollments for this student
    UPDATE public.enrollments
    SET status = 'confirmed'
    WHERE student_id = p_student_id
      AND status = 'pending';

    -- 2. Mark student as officially enrolled, clear flag, and assign student number
    UPDATE public.students
    SET status = 'enrolled',
        selection_submitted = false,
        student_number = COALESCE(p_student_number, student_number)
    WHERE id = p_student_id;

    -- 3. Notify the student
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        p_student_id,
        'Enrollment Confirmed 🎓',
        'Your subject selection has been approved. You are now officially enrolled!',
        'enrollment',
        '/student'
    );
END;
$$;
