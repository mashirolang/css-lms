-- CCS LMS — Enrollment Workflow Update
-- Adds status tracking to enrollments and student state

-- 1. Add status to enrollments
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected'));

-- 2. Add a flag to students to indicate if they have submitted their selection for review
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS selection_submitted boolean DEFAULT false;

-- 3. Update the student status check if necessary (it already has 'enrolled')
-- No change needed to the check constraint if it already includes 'enrolled'.
