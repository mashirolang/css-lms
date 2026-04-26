-- CCS LMS — Schema Migration Update (Security & Storage)
-- Run this in your Supabase SQL Editor to fix RLS issues

-- 1. Enable RLS on submissions table (if not already)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 2. Submissions Table Policies
DROP POLICY IF EXISTS "Students can insert their own submissions" ON public.submissions;
CREATE POLICY "Students can insert their own submissions" 
ON public.submissions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view their own submissions" ON public.submissions;
CREATE POLICY "Students can view their own submissions" 
ON public.submissions FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Faculty can view submissions for their subjects" ON public.submissions;
CREATE POLICY "Faculty can view submissions for their subjects" 
ON public.submissions FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.subjects s ON a.subject_id = s.id
    WHERE a.id = submissions.activity_id 
    AND s.faculty_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Faculty can update scores" ON public.submissions;
CREATE POLICY "Faculty can update scores" 
ON public.submissions FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.subjects s ON a.subject_id = s.id
    WHERE a.id = submissions.activity_id 
    AND s.faculty_id = auth.uid()
  )
);

-- 3. Storage Policies (for the 'submissions' bucket)
-- NOTE: These policies apply to the storage.objects table
-- Make sure the bucket 'submissions' exists in your dashboard

DROP POLICY IF EXISTS "Public Access to Submissions" ON storage.objects;
CREATE POLICY "Public Access to Submissions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'submissions');

DROP POLICY IF EXISTS "Authenticated users can upload submissions" ON storage.objects;
CREATE POLICY "Authenticated users can upload submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submissions');

DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
