-- CCS LMS — Seed Data (Development)
-- Run AFTER schema.sql
-- All users: password = "password123"
-- Credentials stored in public.profiles (no auth.users)
-- ─────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════
-- 1. PROFILES  (email + bcrypt password_hash included)
-- ════════════════════════════════════════════════════════════

insert into public.profiles (
  id, email, password_hash, role, first_name, last_name, force_password_change
)
values
  -- ADMIN
  ('00000000-0000-0000-0000-000000000001',
   'admin@school.edu',
   crypt('password123', gen_salt('bf')),
   'admin', 'System', 'Administrator', false),

  -- FACULTY 1 — Prof. Maria Garcia
  ('00000000-0000-0000-0000-000000000011',
   'm.garcia@school.edu',
   crypt('password123', gen_salt('bf')),
   'faculty', 'Maria', 'Garcia', false),

  -- FACULTY 2 — Dr. Juan Santos
  ('00000000-0000-0000-0000-000000000012',
   'j.santos@school.edu',
   crypt('password123', gen_salt('bf')),
   'faculty', 'Juan', 'Santos', false),

  -- FACULTY 3 — Prof. Ana Reyes
  ('00000000-0000-0000-0000-000000000013',
   'a.reyes@school.edu',
   crypt('password123', gen_salt('bf')),
   'faculty', 'Ana', 'Reyes', false),

  -- FACULTY 4 — Dr. Lea Mendoza
  ('00000000-0000-0000-0000-000000000014',
   'l.mendoza@school.edu',
   crypt('password123', gen_salt('bf')),
   'faculty', 'Lea', 'Mendoza', false),

  -- STUDENTS
  ('00000000-0000-0000-0000-000000000021',
   'maria.santos@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Maria', 'Santos', true),

  ('00000000-0000-0000-0000-000000000022',
   'juan.delacruz@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Juan', 'Dela Cruz', true),

  ('00000000-0000-0000-0000-000000000023',
   'ana.reyes2@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Ana', 'Reyes', true),

  ('00000000-0000-0000-0000-000000000024',
   'carlo.mendoza@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Carlo', 'Mendoza', false),

  ('00000000-0000-0000-0000-000000000025',
   'lea.garcia@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Lea', 'Garcia', false),

  ('00000000-0000-0000-0000-000000000026',
   'mark.lim@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Mark', 'Lim', false),

  ('00000000-0000-0000-0000-000000000027',
   'sofia.cruz@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Sofia', 'Cruz', false),

  ('00000000-0000-0000-0000-000000000028',
   'diego.ramos@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Diego', 'Ramos', false),

  -- pending students
  ('00000000-0000-0000-0000-000000000029',
   'jose.rizal@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Jose', 'Rizal', false),

  ('00000000-0000-0000-0000-000000000030',
   'grace.tan@school.edu',
   crypt('password123', gen_salt('bf')),
   'student', 'Grace', 'Tan', false)

on conflict (id) do nothing;


-- ════════════════════════════════════════════════════════════
-- 2. FACULTY TABLE
-- ════════════════════════════════════════════════════════════

insert into public.faculty (id, department, is_active) values
  ('00000000-0000-0000-0000-000000000011', 'Computer Science',       true),
  ('00000000-0000-0000-0000-000000000012', 'Information Technology', true),
  ('00000000-0000-0000-0000-000000000013', 'Computer Science',       true),
  ('00000000-0000-0000-0000-000000000014', 'Information Technology', false)
on conflict (id) do nothing;


-- ════════════════════════════════════════════════════════════
-- 3. COURSES
-- ════════════════════════════════════════════════════════════

insert into public.courses (id, name, code, description) values
  ('00000000-0000-0000-0000-000000000031', 'Bachelor of Science in Computer Science',      'BSCS', 'Core CS curriculum'),
  ('00000000-0000-0000-0000-000000000032', 'Bachelor of Science in Information Technology','BSIT', 'IT focused curriculum'),
  ('00000000-0000-0000-0000-000000000033', 'Bachelor of Science in Information Systems',   'BSIS', 'IS and business curriculum')
on conflict (code) do nothing;


-- ════════════════════════════════════════════════════════════
-- 4. STUDENTS TABLE
-- ════════════════════════════════════════════════════════════

insert into public.students (id, status, course_id, year_level, section, student_number) values
  ('00000000-0000-0000-0000-000000000021', 'enrolled', '00000000-0000-0000-0000-000000000031', 2, 'A', '2023-CS-001'),
  ('00000000-0000-0000-0000-000000000022', 'enrolled', '00000000-0000-0000-0000-000000000031', 2, 'A', '2023-CS-002'),
  ('00000000-0000-0000-0000-000000000023', 'enrolled', '00000000-0000-0000-0000-000000000031', 2, 'A', '2023-CS-003'),
  ('00000000-0000-0000-0000-000000000024', 'enrolled', '00000000-0000-0000-0000-000000000032', 2, 'B', '2023-IT-001'),
  ('00000000-0000-0000-0000-000000000025', 'enrolled', '00000000-0000-0000-0000-000000000032', 3, 'A', '2022-IT-005'),
  ('00000000-0000-0000-0000-000000000026', 'enrolled', '00000000-0000-0000-0000-000000000033', 1, 'C', '2024-IS-001'),
  ('00000000-0000-0000-0000-000000000027', 'enrolled', '00000000-0000-0000-0000-000000000031', 3, 'A', '2022-CS-010'),
  ('00000000-0000-0000-0000-000000000028', 'inactive', '00000000-0000-0000-0000-000000000031', 1, 'B', '2024-CS-008'),
  ('00000000-0000-0000-0000-000000000029', 'pending',  '00000000-0000-0000-0000-000000000032', 1, 'A', null),
  ('00000000-0000-0000-0000-000000000030', 'pending',  '00000000-0000-0000-0000-000000000031', 1, 'A', null)
on conflict (id) do nothing;


-- ════════════════════════════════════════════════════════════
-- 5. SUBJECTS
-- ════════════════════════════════════════════════════════════

insert into public.subjects (id, name, code, course_id, year_level, section, faculty_id) values
  ('00000000-0000-0000-0000-000000000041', 'Data Structures and Algorithms', 'CS101', '00000000-0000-0000-0000-000000000031', 2, 'A', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000042', 'Database Management Systems',    'CS201', '00000000-0000-0000-0000-000000000031', 2, 'A', '00000000-0000-0000-0000-000000000012'),
  ('00000000-0000-0000-0000-000000000043', 'Operating Systems',              'CS301', '00000000-0000-0000-0000-000000000031', 3, 'A', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000044', 'Web Development',                'IT201', '00000000-0000-0000-0000-000000000032', 2, 'B', '00000000-0000-0000-0000-000000000012'),
  ('00000000-0000-0000-0000-000000000045', 'Network Security',               'IT401', '00000000-0000-0000-0000-000000000032', 3, 'A', '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000046', 'System Analysis and Design',     'IS201', '00000000-0000-0000-0000-000000000033', 1, 'C', '00000000-0000-0000-0000-000000000013')
on conflict (id) do nothing;


-- ════════════════════════════════════════════════════════════
-- 6. SCHEDULE SLOTS
-- ════════════════════════════════════════════════════════════

insert into public.schedule_slots (subject_id, day, start_time, end_time, room) values
  -- s1 CS101 (Garcia) — MWF 7:00–8:30
  ('00000000-0000-0000-0000-000000000041', 'Monday',    '07:00', '08:30', 'CL1'),
  ('00000000-0000-0000-0000-000000000041', 'Wednesday', '07:00', '08:30', 'CL1'),
  ('00000000-0000-0000-0000-000000000041', 'Friday',    '07:00', '08:30', 'CL1'),

  -- s2 CS201 (Santos) — TTh 10:00–11:30
  ('00000000-0000-0000-0000-000000000042', 'Tuesday',   '10:00', '11:30', 'Lab2'),
  ('00000000-0000-0000-0000-000000000042', 'Thursday',  '10:00', '11:30', 'Lab2'),

  -- s3 CS301 (Garcia) — MF 1:00–2:30
  ('00000000-0000-0000-0000-000000000043', 'Monday',    '13:00', '14:30', 'Lab1'),
  ('00000000-0000-0000-0000-000000000043', 'Friday',    '13:00', '14:30', 'Lab1'),

  -- s4 IT201 (Santos) — TTh 8:00–9:30
  ('00000000-0000-0000-0000-000000000044', 'Tuesday',   '08:00', '09:30', 'Lab3'),
  ('00000000-0000-0000-0000-000000000044', 'Thursday',  '08:00', '09:30', 'Lab3'),

  -- s5 IT401 (Reyes) — MWF 2:00–3:00
  ('00000000-0000-0000-0000-000000000045', 'Monday',    '14:00', '15:00', 'CL2'),
  ('00000000-0000-0000-0000-000000000045', 'Wednesday', '14:00', '15:00', 'CL2'),
  ('00000000-0000-0000-0000-000000000045', 'Friday',    '14:00', '15:00', 'CL2'),

  -- s6 IS201 (Reyes) — TTh 1:00–2:30
  ('00000000-0000-0000-0000-000000000046', 'Tuesday',   '13:00', '14:30', 'CL3'),
  ('00000000-0000-0000-0000-000000000046', 'Thursday',  '13:00', '14:30', 'CL3');


-- ════════════════════════════════════════════════════════════
-- 7. ENROLLMENTS
-- ════════════════════════════════════════════════════════════

insert into public.enrollments (student_id, subject_id) values
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000041'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000042'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000041'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000042'),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000041'),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000042'),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000044'),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000045'),
  ('00000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000046'),
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000043')
on conflict (student_id, subject_id) do nothing;


-- ════════════════════════════════════════════════════════════
-- 8. ACTIVITIES
-- ════════════════════════════════════════════════════════════

insert into public.activities (id, subject_id, title, type, description, due_date, created_by) values
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000041', 'Activity 1: Arrays and Linked Lists', 'assignment',
   'Implement singly linked list with insert, delete, and search operations in Java or Python.',
   now() - interval '21 days', '00000000-0000-0000-0000-000000000011'),

  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000041', 'Quiz 1: Stacks and Queues', 'quiz',
   'Written quiz covering stack operations, queue operations, and their applications.',
   now() - interval '14 days', '00000000-0000-0000-0000-000000000011'),

  ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000041', 'Activity 3: Stack Implementation', 'assignment',
   'Implement a stack using arrays and linked lists. Include push, pop, peek, and isEmpty methods.',
   now() - interval '3 days', '00000000-0000-0000-0000-000000000011'),

  ('00000000-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000041', 'Midterm Exam', 'exam',
   'Comprehensive exam covering all topics from Week 1 to Week 7.',
   now() + interval '10 days', '00000000-0000-0000-0000-000000000011'),

  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000042', 'Lab 1: Entity-Relationship Diagram', 'assignment',
   'Design an ER diagram for a university enrollment system. Submit as PDF.',
   now() - interval '18 days', '00000000-0000-0000-0000-000000000012'),

  ('00000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000042', 'Lab 2: SQL Queries', 'assignment',
   'Write 20 SQL queries using SELECT, JOIN, GROUP BY, HAVING, and subqueries.',
   now() - interval '5 days', '00000000-0000-0000-0000-000000000012'),

  ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000042', 'Quiz 1: Normalization', 'quiz',
   'Short quiz on 1NF, 2NF, 3NF, and BCNF with practical examples.',
   now() - interval '10 days', '00000000-0000-0000-0000-000000000012'),

  ('00000000-0000-0000-0000-000000000058', '00000000-0000-0000-0000-000000000042', 'Midterm Exam', 'exam',
   'Covers ER modeling, relational algebra, SQL, and normalization.',
   now() + interval '8 days', '00000000-0000-0000-0000-000000000012'),

  ('00000000-0000-0000-0000-000000000059', '00000000-0000-0000-0000-000000000043', 'Report 1: Process Scheduling Algorithms', 'assignment',
   'Compare FCFS, SJF, Round Robin, and Priority scheduling with Gantt charts.',
   now() - interval '15 days', '00000000-0000-0000-0000-000000000011'),

  ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000043', 'Quiz 1: Memory Management', 'quiz',
   'Quiz on paging, segmentation, and virtual memory concepts.',
   now() - interval '7 days', '00000000-0000-0000-0000-000000000011'),

  ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000044', 'Project 1: Static Website', 'assignment',
   'Build a 5-page static website using HTML5 and CSS3. Must be responsive.',
   now() - interval '20 days', '00000000-0000-0000-0000-000000000012'),

  ('00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000044', 'Activity 2: JavaScript DOM', 'assignment',
   'Create an interactive to-do list using vanilla JavaScript and DOM manipulation.',
   now() - interval '4 days', '00000000-0000-0000-0000-000000000012'),

  ('00000000-0000-0000-0000-000000000063', '00000000-0000-0000-0000-000000000045', 'Lab 1: Network Scanning with Nmap', 'assignment',
   'Use Nmap to scan a test environment. Document open ports, services, and vulnerabilities found.',
   now() - interval '12 days', '00000000-0000-0000-0000-000000000013'),

  ('00000000-0000-0000-0000-000000000064', '00000000-0000-0000-0000-000000000045', 'Quiz 1: Cryptography Basics', 'quiz',
   'Multiple choice and short answer on symmetric vs asymmetric encryption, hashing algorithms.',
   now() - interval '6 days', '00000000-0000-0000-0000-000000000013'),

  ('00000000-0000-0000-0000-000000000065', '00000000-0000-0000-0000-000000000046', 'Activity 1: System Proposal', 'assignment',
   'Write a 3-page system proposal for your chosen project. Include problem statement, scope, and objectives.',
   now() - interval '9 days', '00000000-0000-0000-0000-000000000013'),

  ('00000000-0000-0000-0000-000000000066', '00000000-0000-0000-0000-000000000046', 'Quiz 1: SDLC Models', 'quiz',
   'Quiz on Waterfall, Agile, Spiral, and Incremental development models.',
   now() - interval '3 days', '00000000-0000-0000-0000-000000000013')

on conflict (id) do nothing;


-- ════════════════════════════════════════════════════════════
-- 9. SUBMISSIONS
-- ════════════════════════════════════════════════════════════

insert into public.submissions
  (activity_id, student_id, file_url, submitted_at, score, remarks, status)
values
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000021', 'uploads/a1-maria.pdf',   now()-interval '20 days', 95.00,  'Excellent work!',          'graded'),
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000022', 'uploads/a1-juan.pdf',    now()-interval '20 days', 88.00,  'Good implementation.',     'graded'),
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000023', 'uploads/a1-ana.pdf',     now()-interval '19 days', 100.00, 'Perfect. Well documented.','graded'),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000021', null, now()-interval '14 days', 88.00, null,                     'graded'),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000022', null, now()-interval '14 days', 72.00, 'Review queue operations.','graded'),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000023', null, now()-interval '14 days', 95.00, null,                     'graded'),
  ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000021', 'uploads/a3-maria.zip',   now()-interval '1 day',  null, null, 'submitted'),
  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000021', 'uploads/lab1-maria.pdf', now()-interval '17 days', 92.00, 'Clean diagram.',        'graded'),
  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000022', 'uploads/lab1-juan.pdf',  now()-interval '17 days', 85.00, 'Some cardinality errors.','graded'),
  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000023', 'uploads/lab1-ana.pdf',   now()-interval '16 days', 98.00, 'Outstanding.',          'graded'),
  ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000021', null, now()-interval '10 days', 80.00, null,          'graded'),
  ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000022', null, now()-interval '10 days', 75.00, 'Review 3NF.', 'graded'),
  ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000023', null, now()-interval '10 days', 90.00, null,          'graded'),
  ('00000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000021', 'uploads/lab2-maria.sql', now()-interval '4 days',  null, null, 'submitted'),
  ('00000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000023', 'uploads/lab2-ana.sql',   now()-interval '3 days',  null, null, 'submitted'),
  ('00000000-0000-0000-0000-000000000059', '00000000-0000-0000-0000-000000000027', 'uploads/report1-sofia.pdf', now()-interval '14 days', 88.00, 'Good analysis.',    'graded'),
  ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000027', null, now()-interval '6 days',  82.00, null, 'graded'),
  ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000024', 'uploads/proj1-carlo.zip', now()-interval '19 days', 90.00, 'Good responsive design.', 'graded'),
  ('00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000024', 'uploads/a2-carlo.js',    now()-interval '3 days',  null, null, 'submitted'),
  ('00000000-0000-0000-0000-000000000063', '00000000-0000-0000-0000-000000000025', 'uploads/lab1-lea.pdf',   now()-interval '11 days', 87.00, 'Thorough documentation.', 'graded'),
  ('00000000-0000-0000-0000-000000000064', '00000000-0000-0000-0000-000000000025', null, now()-interval '6 days',  93.00, null, 'graded'),
  ('00000000-0000-0000-0000-000000000065', '00000000-0000-0000-0000-000000000026', 'uploads/act1-mark.pdf',  now()-interval '8 days',  78.00, 'Needs more detail in objectives.', 'graded'),
  ('00000000-0000-0000-0000-000000000066', '00000000-0000-0000-0000-000000000026', null, now()-interval '2 days',  null, null, 'submitted')
on conflict (activity_id, student_id) do nothing;


-- ════════════════════════════════════════════════════════════
-- 10. ATTENDANCE
-- ════════════════════════════════════════════════════════════

insert into public.attendance (subject_id, student_id, date, present) values
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000021','2024-10-28', true),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000022','2024-10-28', true),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000023','2024-10-28', false),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000021','2024-10-30', true),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000022','2024-10-30', false),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000023','2024-10-30', true),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000021','2024-11-01', true),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000022','2024-11-01', true),
  ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000023','2024-11-01', true),
  ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000021','2024-10-29', true),
  ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000022','2024-10-29', true),
  ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000023','2024-10-29', true),
  ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000021','2024-10-31', true),
  ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000022','2024-10-31', false),
  ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000023','2024-10-31', true),
  ('00000000-0000-0000-0000-000000000044','00000000-0000-0000-0000-000000000024','2024-10-29', true),
  ('00000000-0000-0000-0000-000000000044','00000000-0000-0000-0000-000000000024','2024-10-31', true),
  ('00000000-0000-0000-0000-000000000046','00000000-0000-0000-0000-000000000026','2024-10-29', true),
  ('00000000-0000-0000-0000-000000000046','00000000-0000-0000-0000-000000000026','2024-10-31', false)
on conflict (subject_id, student_id, date) do nothing;


-- ════════════════════════════════════════════════════════════
-- 11. NOTIFICATIONS
-- ════════════════════════════════════════════════════════════

insert into public.notifications (user_id, title, message, type, is_read, created_at) values
  ('00000000-0000-0000-0000-000000000001', 'New Enrollment Application', 'Jose Rizal submitted an enrollment application for BSIT Year 1.', 'enrollment', false, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-000000000001', 'New Enrollment Application', 'Grace Tan submitted an enrollment application for BSCS Year 1.', 'enrollment', false, now() - interval '5 hours'),
  ('00000000-0000-0000-0000-000000000001', 'Faculty Account Created', 'New faculty account created for Prof. Ana Reyes (Computer Science).', 'system', true, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000011', 'New Submission', 'Maria Santos submitted Activity 3: Stack Implementation in CS101–2A.', 'activity', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000011', 'Deadline Alert', 'CS101 Activity 3 is due in 2 days. 2 students have not submitted.', 'activity', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000011', 'Schedule Updated', 'Your Friday CS301 slot has been moved to Lab1 Room.', 'schedule', true, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000012', 'New Submission', 'Maria Santos submitted Lab 2: SQL Queries in CS201–2A.', 'activity', false, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000012', 'New Submission', 'Ana Reyes submitted Lab 2: SQL Queries in CS201–2A.', 'activity', false, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000012', 'System Announcement', 'Semester mid-term week schedule adjustment by Admin.', 'system', true, now() - interval '6 days'),
  ('00000000-0000-0000-0000-000000000021', 'New Activity Posted', 'Prof. Garcia posted Midterm Exam in CS101. Due in 10 days.', 'activity', false, now() - interval '1 hour'),
  ('00000000-0000-0000-0000-000000000021', 'Grade Released', 'Your CS101 Activity 1 score: 95/100. Excellent work!', 'grade', false, now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000021', 'Grade Released', 'Your CS201 Lab 1 score: 92/100. Clean diagram.', 'grade', true, now() - interval '17 days'),
  ('00000000-0000-0000-0000-000000000021', 'Deadline Reminder', 'CS101 Activity 3 is due tomorrow. Submit before midnight!', 'activity', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000021', 'Enrollment Approved', 'Your enrollment application has been approved. Welcome to CCS LMS!', 'enrollment', true, now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000022', 'New Activity Posted', 'Prof. Garcia posted Midterm Exam in CS101. Due in 10 days.', 'activity', false, now() - interval '1 hour'),
  ('00000000-0000-0000-0000-000000000022', 'Grade Released', 'Your CS101 Quiz 1 score: 72/100. Review queue operations.', 'grade', false, now() - interval '14 days'),
  ('00000000-0000-0000-0000-000000000022', 'Deadline Reminder', 'CS101 Activity 3 is due tomorrow. You have not submitted yet!', 'activity', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000022', 'Enrollment Approved', 'Your enrollment application has been approved. Welcome to CCS LMS!', 'enrollment', true, now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000023', 'Grade Released', 'Your CS101 Activity 1 score: 100/100. Perfect score!', 'grade', true, now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000023', 'Grade Released', 'Your CS201 Lab 1 score: 98/100. Outstanding.', 'grade', true, now() - interval '16 days'),
  ('00000000-0000-0000-0000-000000000023', 'New Activity Posted', 'Dr. Santos posted Midterm Exam in CS201. Due in 8 days.', 'activity', false, now() - interval '30 minutes'),
  ('00000000-0000-0000-0000-000000000029', 'Application Received', 'Your enrollment application has been received and is under review.', 'enrollment', false, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-000000000030', 'Application Received', 'Your enrollment application has been received and is under review.', 'enrollment', false, now() - interval '5 hours'),
  ('00000000-0000-0000-0000-000000000021', 'Semester Reminder', 'Mid-term week begins November 11. Check your schedule for exam times.', 'system', true, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000022', 'Semester Reminder', 'Mid-term week begins November 11. Check your schedule for exam times.', 'system', true, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000023', 'Semester Reminder', 'Mid-term week begins November 11. Check your schedule for exam times.', 'system', true, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000011', 'Semester Reminder', 'Mid-term week begins November 11. Finalize grade sheets before Nov 15.', 'system', true, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000012', 'Semester Reminder', 'Mid-term week begins November 11. Finalize grade sheets before Nov 15.', 'system', true, now() - interval '7 days');
