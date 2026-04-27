-- CCS LMS — Massive "Production-Ready" Seed Data
-- Run AFTER seed.sql and analytics_and_grading.sql

-- ─── 1. UNIVERSITY EVENTS (Including Past Due) ───────────────────────
insert into public.events (id, title, description, event_date, location, type, created_by) values
  ('e0000000-0000-0000-0000-000000000001', 'Semester Kick-off Party', 'Welcome back celebration.', now() + interval '2 days', 'University Grand Hall', 'social', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'Midterm Examination Week', 'Official examination period.', now() + interval '14 days', 'Classrooms', 'academic', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'Innovation Summit', 'Capstone showcase.', now() + interval '30 days', 'Auditorium', 'academic', '00000000-0000-0000-0000-000000000001'),
  -- PAST EVENTS
  ('e0000000-0000-0000-0000-000000000006', 'Acquaintance Day', 'New student orientation and networking.', now() - interval '60 days', 'Main Plaza', 'social', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000007', 'Prelim Exams', 'First major assessments for the term.', now() - interval '45 days', 'Online/Campus', 'academic', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000008', 'National Heroes Day', 'Public holiday observation.', now() - interval '30 days', 'Philippines', 'holiday', '00000000-0000-0000-0000-000000000001')
on conflict (id) do update set event_date = excluded.event_date;

-- ─── 2. MASSIVE STUDENT LIST (Adding 30 more students) ────────────────
-- IDs ranging from ...201 to ...230
insert into public.profiles (id, email, password_hash, role, first_name, last_name) values
  ('00000000-0000-0000-0000-000000000201', 's1@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Adrian', 'Reyes'),
  ('00000000-0000-0000-0000-000000000202', 's2@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Beatrice', 'Santos'),
  ('00000000-0000-0000-0000-000000000203', 's3@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Christian', 'Dela Cruz'),
  ('00000000-0000-0000-0000-000000000204', 's4@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Danielle', 'Garcia'),
  ('00000000-0000-0000-0000-000000000205', 's5@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Edward', 'Lim'),
  ('00000000-0000-0000-0000-000000000206', 's6@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Fiona', 'Mendoza'),
  ('00000000-0000-0000-0000-000000000207', 's7@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Gabriel', 'Ramos'),
  ('00000000-0000-0000-0000-000000000208', 's8@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Hannah', 'Cruz'),
  ('00000000-0000-0000-0000-000000000209', 's9@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Isaac', 'Torres'),
  ('00000000-0000-0000-0000-000000000210', 's10@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Jasmine', 'Vidal'),
  ('00000000-0000-0000-0000-000000000211', 's11@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Kevin', 'Pascual'),
  ('00000000-0000-0000-0000-000000000212', 's12@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Lauren', 'Aquino'),
  ('00000000-0000-0000-0000-000000000213', 's13@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Michael', 'Bautista'),
  ('00000000-0000-0000-0000-000000000214', 's14@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Nicole', 'Castro'),
  ('00000000-0000-0000-0000-000000000215', 's15@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Oscar', 'David'),
  ('00000000-0000-0000-0000-000000000216', 's16@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Patricia', 'Espino'),
  ('00000000-0000-0000-0000-000000000217', 's17@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Quentin', 'Ferrer'),
  ('00000000-0000-0000-0000-000000000218', 's18@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Rachael', 'Gomez'),
  ('00000000-0000-0000-0000-000000000219', 's19@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Samuel', 'Hernandez'),
  ('00000000-0000-0000-0000-000000000220', 's20@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Tiffany', 'Ibarra'),
  ('00000000-0000-0000-0000-000000000221', 's21@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Ulysses', 'Jimenez'),
  ('00000000-0000-0000-0000-000000000222', 's22@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Vanessa', 'King'),
  ('00000000-0000-0000-0000-000000000223', 's23@school.edu', crypt('password123', gen_salt('bf')), 'student', 'William', 'Lopez'),
  ('00000000-0000-0000-0000-000000000224', 's24@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Ximena', 'Martinez'),
  ('00000000-0000-0000-0000-000000000225', 's25@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Yusuf', 'Navarro'),
  ('00000000-0000-0000-0000-000000000226', 's26@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Zoe', 'Ocampo'),
  ('00000000-0000-0000-0000-000000000227', 's27@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Ariel', 'Pineda'),
  ('00000000-0000-0000-0000-000000000228', 's28@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Bella', 'Quito'),
  ('00000000-0000-0000-0000-000000000229', 's29@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Cedric', 'Rosales'),
  ('00000000-0000-0000-0000-000000000230', 's30@school.edu', crypt('password123', gen_salt('bf')), 'student', 'Daisy', 'Siazon')
on conflict (id) do nothing;

insert into public.students (id, status, course_id, year_level, section, student_number) values
  ('00000000-0000-0000-0000-000000000201', 'enrolled', '00000000-0000-0000-0000-000000000031', 1, 'A', '2024-CS-201'),
  ('00000000-0000-0000-0000-000000000202', 'enrolled', '00000000-0000-0000-0000-000000000032', 1, 'B', '2024-IT-202'),
  ('00000000-0000-0000-0000-000000000203', 'enrolled', '00000000-0000-0000-0000-000000000031', 1, 'A', '2024-CS-203'),
  ('00000000-0000-0000-0000-000000000204', 'enrolled', '00000000-0000-0000-0000-000000000032', 1, 'B', '2024-IT-204'),
  ('00000000-0000-0000-0000-000000000205', 'active',   '00000000-0000-0000-0000-000000000031', 2, 'A', '2023-CS-205'),
  ('00000000-0000-0000-0000-000000000206', 'active',   '00000000-0000-0000-0000-000000000032', 2, 'B', '2023-IT-206'),
  ('00000000-0000-0000-0000-000000000207', 'enrolled', '00000000-0000-0000-0000-000000000033', 2, 'C', '2023-IS-207'),
  ('00000000-0000-0000-0000-000000000208', 'enrolled', '00000000-0000-0000-0000-000000000031', 3, 'A', '2022-CS-208'),
  ('00000000-0000-0000-0000-000000000209', 'active',   '00000000-0000-0000-0000-000000000032', 3, 'B', '2022-IT-209'),
  ('00000000-0000-0000-0000-000000000210', 'enrolled', '00000000-0000-0000-0000-000000000033', 3, 'C', '2022-IS-210'),
  ('00000000-0000-0000-0000-000000000211', 'enrolled', '00000000-0000-0000-0000-000000000031', 4, 'A', '2021-CS-211'),
  ('00000000-0000-0000-0000-000000000212', 'active',   '00000000-0000-0000-0000-000000000032', 4, 'B', '2021-IT-212'),
  ('00000000-0000-0000-0000-000000000213', 'enrolled', '00000000-0000-0000-0000-000000000033', 4, 'C', '2021-IS-213'),
  ('00000000-0000-0000-0000-000000000214', 'enrolled', '00000000-0000-0000-0000-000000000031', 1, 'B', '2024-CS-214'),
  ('00000000-0000-0000-0000-000000000215', 'enrolled', '00000000-0000-0000-0000-000000000032', 1, 'A', '2024-IT-215'),
  ('00000000-0000-0000-0000-000000000216', 'enrolled', '00000000-0000-0000-0000-000000000031', 2, 'B', '2023-CS-216'),
  ('00000000-0000-0000-0000-000000000217', 'active',   '00000000-0000-0000-0000-000000000032', 2, 'A', '2023-IT-217'),
  ('00000000-0000-0000-0000-000000000218', 'enrolled', '00000000-0000-0000-0000-000000000033', 3, 'B', '2022-IS-218'),
  ('00000000-0000-0000-0000-000000000219', 'enrolled', '00000000-0000-0000-0000-000000000031', 4, 'B', '2021-CS-219'),
  ('00000000-0000-0000-0000-000000000220', 'enrolled', '00000000-0000-0000-0000-000000000032', 1, 'C', '2024-IT-220'),
  ('00000000-0000-0000-0000-000000000221', 'enrolled', '00000000-0000-0000-0000-000000000033', 2, 'A', '2023-IS-221'),
  ('00000000-0000-0000-0000-000000000222', 'active',   '00000000-0000-0000-0000-000000000031', 3, 'C', '2022-CS-222'),
  ('00000000-0000-0000-0000-000000000223', 'enrolled', '00000000-0000-0000-0000-000000000032', 4, 'A', '2021-IT-223'),
  ('00000000-0000-0000-0000-000000000224', 'enrolled', '00000000-0000-0000-0000-000000000031', 1, 'C', '2024-CS-224'),
  ('00000000-0000-0000-0000-000000000225', 'enrolled', '00000000-0000-0000-0000-000000000033', 2, 'B', '2023-IS-225'),
  ('00000000-0000-0000-0000-000000000226', 'active',   '00000000-0000-0000-0000-000000000032', 3, 'A', '2022-IT-226'),
  ('00000000-0000-0000-0000-000000000227', 'enrolled', '00000000-0000-0000-0000-000000000031', 4, 'C', '2021-CS-227'),
  ('00000000-0000-0000-0000-000000000228', 'enrolled', '00000000-0000-0000-0000-000000000032', 1, 'B', '2024-IT-228'),
  ('00000000-0000-0000-0000-000000000229', 'active',   '00000000-0000-0000-0000-000000000033', 2, 'A', '2023-IS-229'),
  ('00000000-0000-0000-0000-000000000230', 'enrolled', '00000000-0000-0000-0000-000000000031', 3, 'B', '2022-CS-230')
on conflict (id) do nothing;

-- ─── 3. BULK TRANSCRIPTS (Manual Grades for New Students) ────────────
-- Assigning random-ish high grades to show analytics
insert into public.manual_subject_grades (student_id, subject_id, assign_avg, quiz_avg, exam_avg)
select 
  s.id, 
  sub.id,
  (random() * 20 + 80), -- 80-100
  (random() * 25 + 75), -- 75-100
  (random() * 30 + 70)  -- 70-100
from students s
cross join subjects sub
where s.id::text like '00000000-0000-0000-0000-0000000002%'
  and sub.year_level = s.year_level
on conflict do nothing;

-- Ensure enrollments exist for those grades to show up
insert into public.enrollments (student_id, subject_id, status)
select 
  s.id, 
  sub.id,
  'confirmed'
from students s
cross join subjects sub
where s.id::text like '00000000-0000-0000-0000-0000000002%'
  and sub.year_level = s.year_level
on conflict do nothing;

-- ─── 4. RE-IMPORT ORIGINAL PROFILING DATA ────────────────────────────
-- (Same as before, ensuring it's at the end of the profiling file)
insert into public.student_extended_profiles (student_id, phone, address, birth_date, gender)
select id, '0912-000-0000', 'Metro Manila', '2004-01-01', 'prefer_not_to_say'
from students where id::text like '00000000-0000-0000-0000-0000000002%'
on conflict do nothing;
