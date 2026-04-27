-- ─────────────────────────────────────────────────────────────
-- MASSIVE SEED DATA FOR CCS LMS (PROFILING STYLE)
-- Adds 500 Students, 10 Teachers, Skills, and Activities
-- ─────────────────────────────────────────────────────────────

-- 1. ADD 10 NEW TEACHERS
insert into public.profiles (id, email, password_hash, role, first_name, last_name, force_password_change)
select 
  ('00000000-0000-0000-0000-000000000' || (100 + i))::uuid,
  'teacher.mass' || i || '@school.edu',
  crypt('password123', gen_salt('bf')),
  'faculty',
  (array['Robert', 'Susan', 'Michael', 'Karen', 'David', 'Linda', 'James', 'Sarah', 'William', 'Emily'])[mod(i, 10) + 1],
  (array['Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'])[mod(i, 10) + 1],
  false
from generate_series(1, 10) i
on conflict (id) do nothing;

-- 1.1 ADD FACULTY TABLE ENTRIES FOR TEACHERS
insert into public.faculty (id, department, is_active)
select 
  id, 
  (array['Computer Science', 'Information Technology', 'Information Systems'])[mod(row_number() over ()::int, 3) + 1],
  true
from public.profiles 
where role = 'faculty' 
  and id::text like '00000000-0000-0000-0000-0000000001%'
on conflict (id) do nothing;

-- 2. ADD 500 NEW STUDENTS (PROFILES)
insert into public.profiles (id, email, password_hash, role, first_name, last_name, force_password_change)
select 
  ('00000000-0000-0000-0000-000000000' || (300 + i))::uuid,
  'student.mass' || i || '@school.edu',
  crypt('password123', gen_salt('bf')),
  'student',
  (array['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper'])[mod(i, 18) + 1],
  (array['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore'])[mod(i, 18) + 1],
  false
from generate_series(1, 500) i
on conflict (id) do nothing;

-- 3. STUDENTS TABLE ENTRIES
insert into public.students (id, status, course_id, year_level, section, student_number, selection_submitted)
select 
  id,
  'enrolled',
  (array['00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000033'])[mod(row_number() over ()::int, 3) + 1],
  mod(row_number() over ()::int, 4) + 1,
  (array['A', 'B', 'C'])[mod(row_number() over ()::int, 3) + 1],
  '2024-' || (case 
    when mod(row_number() over ()::int, 3) = 0 then 'CS-' 
    when mod(row_number() over ()::int, 3) = 1 then 'IT-' 
    else 'IS-' 
  end) || (500 + row_number() over ()::int),
  true
from public.profiles
where id::text like '00000000-0000-0000-0000-000000000' || '3%'
   or id::text like '00000000-0000-0000-0000-000000000' || '4%'
   or id::text like '00000000-0000-0000-0000-000000000' || '5%'
   or id::text like '00000000-0000-0000-0000-000000000' || '6%'
   or id::text like '00000000-0000-0000-0000-000000000' || '7%'
on conflict (id) do nothing;

-- 4. STUDENT EXTENDED PROFILES
insert into public.student_extended_profiles (student_id, phone, address, birth_date, gender)
select 
  id, 
  '09' || (100000000 + floor(random() * 900000000)), 
  'Campus Residence Block ' || mod(row_number() over ()::int, 10) + 1, 
  '2004-01-01'::date + (random() * 365 * 3)::int,
  (array['male', 'female'])[mod(row_number() over ()::int, 2) + 1]
from students
where id::text like '00000000-0000-0000-0000-000000000' || '3%'
   or id::text like '00000000-0000-0000-0000-000000000' || '4%'
   or id::text like '00000000-0000-0000-0000-000000000' || '5%'
   or id::text like '00000000-0000-0000-0000-000000000' || '6%'
   or id::text like '00000000-0000-0000-0000-000000000' || '7%'
on conflict (student_id) do nothing;

-- 5. SKILLS
insert into public.student_skills (id, student_id, category, name, proficiency)
select 
  extensions.uuid_generate_v5('00000000-0000-0000-0000-000000000000'::uuid, id::text || name)::uuid,
  id,
  cat,
  name,
  prof
from (
  select 
    id,
    (array['programming', 'hardware', 'software'])[mod(row_number() over ()::int, 3) + 1] as cat,
    (array['Python', 'Java', 'React', 'TypeScript', 'SQL', 'Networking', 'UI/UX Design', 'Cloud Computing'])[mod(row_number() over ()::int, 8) + 1] as name,
    (array['beginner', 'intermediate', 'advanced', 'expert'])[mod(row_number() over ()::int, 4) + 1] as prof
  from students
  where id::text like '00000000-0000-0000-0000-000000000' || '3%'
     or id::text like '00000000-0000-0000-0000-000000000' || '4%'
     or id::text like '00000000-0000-0000-0000-000000000' || '5%'
     or id::text like '00000000-0000-0000-0000-000000000' || '6%'
     or id::text like '00000000-0000-0000-0000-000000000' || '7%'
) sub
on conflict (id) do nothing;

-- 6. CO-CURRICULAR ACTIVITIES
insert into public.student_cocurricular (id, student_id, type, organization, role, start_date)
select 
  extensions.uuid_generate_v5('00000000-0000-0000-0000-000000000000'::uuid, id::text || org)::uuid,
  id,
  type,
  org,
  role,
  '2024-01-15'
from (
  select 
    id,
    (array['club', 'competition', 'org_role', 'volunteer'])[mod(row_number() over ()::int, 4) + 1] as type,
    (array['CCS Student Council', 'Google Developer Student Clubs', 'JPCS', 'Programming Guild', 'Debate Society'])[mod(row_number() over ()::int, 5) + 1] as org,
    (array['Member', 'Officer', 'Lead Developer', 'Volunteer Agent', 'Participant'])[mod(row_number() over ()::int, 5) + 1] as role
  from students
  where id::text like '00000000-0000-0000-0000-000000000' || '3%'
     or id::text like '00000000-0000-0000-0000-000000000' || '4%'
     or id::text like '00000000-0000-0000-0000-000000000' || '5%'
     or id::text like '00000000-0000-0000-0000-000000000' || '6%'
     or id::text like '00000000-0000-0000-0000-000000000' || '7%'
) sub
on conflict (id) do nothing;

-- 7. ENROLLMENTS
insert into public.enrollments (student_id, subject_id)
select 
  s.id, 
  sub.id
from students s
cross join subjects sub
where s.id::text like '00000000-0000-0000-0000-000000000' || '3%'
  and sub.year_level = s.year_level
on conflict do nothing;

-- 8. MANUAL SUBJECT GRADES (REPLACING student_transcripts)
insert into public.manual_subject_grades (student_id, subject_id, assign_avg, quiz_avg, exam_avg)
select 
  e.student_id,
  e.subject_id,
  (random() * 20 + 80),
  (random() * 25 + 75),
  (random() * 30 + 70)
from enrollments e
join students s on s.id = e.student_id
where s.id::text like '00000000-0000-0000-0000-000000000' || '3%'
   or s.id::text like '00000000-0000-0000-0000-000000000' || '4%'
on conflict do nothing;
