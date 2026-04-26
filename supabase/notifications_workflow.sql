-- CCS LMS — Notifications Workflow
-- Adds automated notifications for key system events

-- 1. Notify Admins when a student submits subjects for review
CREATE OR REPLACE FUNCTION public.submit_enrollment_review(
    p_student_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_student_name text;
BEGIN
    -- 1. Mark selection as submitted
    UPDATE public.students
    SET selection_submitted = true
    WHERE id = p_student_id;

    -- 2. Get student name
    SELECT first_name || ' ' || last_name INTO v_student_name
    FROM public.profiles
    WHERE id = p_student_id;

    -- 3. Notify Admins
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT id, 'Subject Selection Submitted', v_student_name || ' has submitted their subjects for review.', 'enrollment', '/admin/students'
    FROM public.profiles
    WHERE role = 'admin';
END;
$$;

-- 2. Notify ALL Students & Faculty when a University Event is created
-- This trigger will automatically notify everyone when a row is inserted into 'events'
CREATE OR REPLACE FUNCTION public.notify_on_new_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT id, 'New University Event: ' || NEW.title, NEW.description, 'system', '/student'
    FROM public.profiles
    WHERE role IN ('student', 'faculty');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_new_event ON public.events;
CREATE TRIGGER tr_notify_on_new_event
AFTER INSERT ON public.events
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_event();
