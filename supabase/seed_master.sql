-- CCS LMS â€” Seed Data (Development)
-- Run AFTER schema.sql
-- All users: password = "password123"
-- Credentials stored in public.profiles (no auth.users)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 1. PROFILES  (email + bcrypt password_hash included)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

insert into public.profiles (
  id, email, password_hash, role, first_name, last_name, force_password_change
)
values
  -- ADMIN
  ('00000000-0000-0000-0000-000000000001',
   'admin@school.edu',
   crypt('password123', gen_salt('bf')),
   'admin', 'System', 'Administrator', false),

  -- FACULTY 1 â€” Prof. Maria Garcia
  ('00000000-0000-0000-0000-000000000011',
   'm.garcia@school.edu',
   crypt('password123', gen_salt('bf')),
   'faculty', 'Maria', 'Garcia', false),

  -- FACULTY 2 â€” Dr. Juan Santos
  ('00000000-0000-0000-0000-000000000012',
   'j.santos@school.edu',
   crypt('password123', gen_salt('bf')),
   'faculty', 'Juan', 'Santos', false),

  -- FACULTY 3 â€” Prof. Ana Reyes
  ('00000000-0000-0000-0000-000000000013',
   'a.reyes@school.edu',
   crypt('password123', gen_salt('bf')),
   'faculty', 'Ana', 'Reyes', false),

  -- FACULTY 4 â€” Dr. Lea Mendoza
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


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 2. FACULTY TABLE
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

insert into public.faculty (id, department, is_active) values
  ('00000000-0000-0000-0000-000000000011', 'Computer Science',       true),
  ('00000000-0000-0000-0000-000000000012', 'Information Technology', true),
  ('00000000-0000-0000-0000-000000000013', 'Computer Science',       true),
  ('00000000-0000-0000-0000-000000000014', 'Information Technology', false)
on conflict (id) do nothing;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 3. COURSES
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

insert into public.courses (id, name, code, description) values
  ('00000000-0000-0000-0000-000000000031', 'Bachelor of Science in Computer Science',      'BSCS', 'Core CS curriculum'),
  ('00000000-0000-0000-0000-000000000032', 'Bachelor of Science in Information Technology','BSIT', 'IT focused curriculum'),
  ('00000000-0000-0000-0000-000000000033', 'Bachelor of Science in Information Systems',   'BSIS', 'IS and business curriculum')
on conflict (code) do nothing;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 4. STUDENTS TABLE
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 5. SUBJECTS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

insert into public.subjects (id, name, code, course_id, year_level, section, faculty_id) values
  ('00000000-0000-0000-0000-000000000041', 'Data Structures and Algorithms', 'CS101', '00000000-0000-0000-0000-000000000031', 2, 'A', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000042', 'Database Management Systems',    'CS201', '00000000-0000-0000-0000-000000000031', 2, 'A', '00000000-0000-0000-0000-000000000012'),
  ('00000000-0000-0000-0000-000000000043', 'Operating Systems',              'CS301', '00000000-0000-0000-0000-000000000031', 3, 'A', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000044', 'Web Development',                'IT201', '00000000-0000-0000-0000-000000000032', 2, 'B', '00000000-0000-0000-0000-000000000012'),
  ('00000000-0000-0000-0000-000000000045', 'Network Security',               'IT401', '00000000-0000-0000-0000-000000000032', 3, 'A', '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000046', 'System Analysis and Design',     'IS201', '00000000-0000-0000-0000-000000000033', 1, 'C', '00000000-0000-0000-0000-000000000013')
on conflict (id) do nothing;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 6. SCHEDULE SLOTS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

insert into public.schedule_slots (subject_id, day_of_week, start_time, end_time, room) values
  -- s1 CS101 (Garcia) â€” MWF 7:00â€“8:30
  ('00000000-0000-0000-0000-000000000041', 1, '07:00', '08:30', 'CL1'),
  ('00000000-0000-0000-0000-000000000041', 3, '07:00', '08:30', 'CL1'),
  ('00000000-0000-0000-0000-000000000041', 5, '07:00', '08:30', 'CL1'),

  -- s2 CS201 (Santos) â€” TTh 10:00â€“11:30
  ('00000000-0000-0000-0000-000000000042', 2, '10:00', '11:30', 'Lab2'),
  ('00000000-0000-0000-0000-000000000042', 4, '10:00', '11:30', 'Lab2'),

  -- s3 CS301 (Garcia) â€” MF 1:00â€“2:30
  ('00000000-0000-0000-0000-000000000043', 1, '13:00', '14:30', 'Lab1'),
  ('00000000-0000-0000-0000-000000000043', 5, '13:00', '14:30', 'Lab1'),

  -- s4 IT201 (Santos) â€” TTh 8:00â€“9:30
  ('00000000-0000-0000-0000-000000000044', 2, '08:00', '09:30', 'Lab3'),
  ('00000000-0000-0000-0000-000000000044', 4, '08:00', '09:30', 'Lab3'),

  -- s5 IT401 (Reyes) â€” MWF 2:00â€“3:00
  ('00000000-0000-0000-0000-000000000045', 1, '14:00', '15:00', 'CL2'),
  ('00000000-0000-0000-0000-000000000045', 3, '14:00', '15:00', 'CL2'),
  ('00000000-0000-0000-0000-000000000045', 5, '14:00', '15:00', 'CL2'),

  -- s6 IS201 (Reyes) â€” TTh 1:00â€“2:30
  ('00000000-0000-0000-0000-000000000046', 2, '13:00', '14:30', 'CL3'),
  ('00000000-0000-0000-0000-000000000046', 4, '13:00', '14:30', 'CL3');


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 7. ENROLLMENTS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 8. ACTIVITIES
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 9. SUBMISSIONS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 10. ATTENDANCE
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 11. NOTIFICATIONS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

insert into public.notifications (user_id, title, message, type, is_read, created_at) values
  ('00000000-0000-0000-0000-000000000001', 'New Enrollment Application', 'Jose Rizal submitted an enrollment application for BSIT Year 1.', 'enrollment', false, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-000000000001', 'New Enrollment Application', 'Grace Tan submitted an enrollment application for BSCS Year 1.', 'enrollment', false, now() - interval '5 hours'),
  ('00000000-0000-0000-0000-000000000001', 'Faculty Account Created', 'New faculty account created for Prof. Ana Reyes (Computer Science).', 'system', true, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000011', 'New Submission', 'Maria Santos submitted Activity 3: Stack Implementation in CS101â€“2A.', 'activity', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000011', 'Deadline Alert', 'CS101 Activity 3 is due in 2 days. 2 students have not submitted.', 'activity', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000011', 'Schedule Updated', 'Your Friday CS301 slot has been moved to Lab1 Room.', 'schedule', true, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000012', 'New Submission', 'Maria Santos submitted Lab 2: SQL Queries in CS201â€“2A.', 'activity', false, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000012', 'New Submission', 'Ana Reyes submitted Lab 2: SQL Queries in CS201â€“2A.', 'activity', false, now() - interval '3 days'),
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
-- CCS LMS â€” Massive "Production-Ready" Seed Data
-- Run AFTER seed.sql and analytics_and_grading.sql

-- â”€â”€â”€ 1. UNIVERSITY EVENTS (Including Past Due) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into public.events (id, title, description, event_date, location, type, created_by) values
  ('e0000000-0000-0000-0000-000000000001', 'Semester Kick-off Party', 'Welcome back celebration.', now() + interval '2 days', 'University Grand Hall', 'social', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'Midterm Examination Week', 'Official examination period.', now() + interval '14 days', 'Classrooms', 'academic', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'Innovation Summit', 'Capstone showcase.', now() + interval '30 days', 'Auditorium', 'academic', '00000000-0000-0000-0000-000000000001'),
  -- PAST EVENTS
  ('e0000000-0000-0000-0000-000000000006', 'Acquaintance Day', 'New student orientation and networking.', now() - interval '60 days', 'Main Plaza', 'social', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000007', 'Prelim Exams', 'First major assessments for the term.', now() - interval '45 days', 'Online/Campus', 'academic', '00000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000008', 'National Heroes Day', 'Public holiday observation.', now() - interval '30 days', 'Philippines', 'holiday', '00000000-0000-0000-0000-000000000001')
on conflict (id) do update set event_date = excluded.event_date;

-- â”€â”€â”€ 2. MASSIVE STUDENT LIST (Adding 30 more students) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ 3. BULK TRANSCRIPTS (Manual Grades for New Students) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ 4. RE-IMPORT ORIGINAL PROFILING DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- (Same as before, ensuring it's at the end of the profiling file)
insert into public.student_extended_profiles (student_id, phone, address, birth_date, gender)
select id, '0912-000-0000', 'Metro Manila', '2004-01-01', 'prefer_not_to_say'
from students where id::text like '00000000-0000-0000-0000-0000000002%'
on conflict do nothing;
