-- CCS LMS — Schema (No RLS, development mode)
-- Run in Supabase SQL Editor as postgres/superuser

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- PROFILES  (credentials stored here, not in auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid        primary key default uuid_generate_v4(),
  email         text        unique not null,
  password_hash text        not null,
  role          text        not null check (role in ('admin', 'faculty', 'student')),
  first_name    text        not null,
  last_name     text        not null,
  avatar_url    text,
  force_password_change boolean default false,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.students (
  id             uuid references public.profiles(id) on delete cascade primary key,
  status         text not null default 'pending' check (status in ('pending', 'enrolled', 'inactive', 'accepted', 'active')),
  course_id      text references public.courses(id) on delete set null,
  year_level     int  not null default 1 check (year_level between 1 and 4),
  section        text not null,
  student_number text unique
);

-- ─────────────────────────────────────────────────────────────
-- FACULTY
-- ─────────────────────────────────────────────────────────────
create table if not exists public.faculty (
  id          uuid references public.profiles(id) on delete cascade primary key,
  department  text    not null,
  is_active   boolean default true
);

-- ─────────────────────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id          text primary key,
  name        text not null,
  code        text not null unique,
  description text,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- SUBJECTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.subjects (
  id         text primary key,
  name       text not null,
  code       text not null,
  units      int  not null default 3,
  course_id  text references public.courses(id) on delete cascade,
  year_level int  not null,
  section    text not null,
  faculty_id uuid references public.faculty(id) on delete set null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- ENROLLMENTS  (student ↔ subject many-to-many)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid references public.students(id) on delete cascade,
  subject_id  text references public.subjects(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique(student_id, subject_id)
);

-- ─────────────────────────────────────────────────────────────
-- SCHEDULE SLOTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.schedule_slots (
  id           uuid primary key default uuid_generate_v4(),
  subject_id   text references public.subjects(id) on delete cascade,
  day_of_week  int  not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  room         text not null
);

-- ─────────────────────────────────────────────────────────────
-- ACTIVITIES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id          text primary key,
  subject_id  text references public.subjects(id) on delete cascade,
  title       text        not null,
  type        text        not null check (type in ('assignment', 'quiz', 'exam')),
  description text,
  file_url    text,
  due_date    timestamptz not null,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- SUBMISSIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.submissions (
  id           uuid primary key default uuid_generate_v4(),
  activity_id  text references public.activities(id) on delete cascade,
  student_id   uuid references public.students(id) on delete cascade,
  file_url     text,
  content      text,
  submitted_at timestamptz default now(),
  score        numeric(5,2),
  remarks      text,
  status       text not null default 'submitted' check (status in ('submitted', 'graded', 'returned', 'late')),
  unique(activity_id, student_id)
);

-- ─────────────────────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.attendance (
  id         uuid primary key default uuid_generate_v4(),
  subject_id text references public.subjects(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  date       date    not null,
  present    boolean not null default true,
  unique(subject_id, student_id, date)
);

-- ─────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade,
  title      text not null,
  message    text not null,
  type       text not null check (type in ('activity', 'grade', 'schedule', 'system', 'enrollment')),
  is_read    boolean default false,
  link       text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- RPC: verify_password
-- Returns profile row if email + password + role match.
-- Uses pgcrypto crypt() to compare against stored hash.
-- ─────────────────────────────────────────────────────────────
create or replace function public.verify_password(
  p_email    text,
  p_password text,
  p_role     text
)
returns table (
  id                    uuid,
  role                  text,
  first_name            text,
  last_name             text,
  force_password_change boolean
)
language plpgsql security definer as $$
begin
  return query
  select
    pr.id,
    pr.role,
    pr.first_name,
    pr.last_name,
    pr.force_password_change
  from public.profiles pr
  where pr.email         = lower(trim(p_email))
    and pr.role          = p_role
    and pr.password_hash = crypt(p_password, pr.password_hash);
end;
$$;
