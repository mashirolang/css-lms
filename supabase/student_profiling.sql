-- Student Profiling System Migration
-- Run this in the Supabase SQL Editor

-- ─── Extended Profile (one-to-one with students) ──────────────────────────
create table if not exists public.student_extended_profiles (
  student_id        uuid primary key references public.students(id) on delete cascade,
  phone             text,
  address           text,
  birth_date        date,
  gender            text check (gender in ('male','female','non_binary','prefer_not_to_say')),
  guardian_name     text,
  guardian_phone    text,
  guardian_relation text,
  updated_at        timestamptz default now()
);

-- ─── Skills ───────────────────────────────────────────────────────────────
create table if not exists public.student_skills (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  category    text not null check (category in ('programming','hardware','software','other')),
  name        text not null,
  proficiency text not null check (proficiency in ('beginner','intermediate','advanced','expert')),
  notes       text,
  created_at  timestamptz default now()
);
create index if not exists idx_student_skills_student on public.student_skills(student_id);

-- ─── Co-Curricular Activities ─────────────────────────────────────────────
create table if not exists public.student_cocurricular (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  type         text not null check (type in ('club','competition','org_role','volunteer','other')),
  organization text not null,
  role         text not null,
  description  text,
  start_date   date not null,
  end_date     date,
  created_at   timestamptz default now()
);
create index if not exists idx_student_cocurricular_student on public.student_cocurricular(student_id);

-- ─── GPA Function (per-subject grades) ───────────────────────────────────
create or replace function public.get_student_gpa(p_student_id uuid)
returns table (
  subject_id    text,
  subject_name  text,
  subject_code  text,
  units         int,
  weighted_avg  numeric,
  grade_point   numeric,
  letter_grade  text,
  descriptor    text,
  has_grades    boolean
)
language plpgsql security definer as $$
begin
  return query
  with enrolled_subjects as (
    select s.id, s.name, s.code, s.units
    from enrollments e
    join subjects s on s.id = e.subject_id
    where e.student_id = p_student_id
      and e.status = 'confirmed'
  ),
  type_avgs as (
    select
      a.subject_id,
      avg(sub.score) filter (where a.type = 'assignment' and sub.score is not null) as avg_assign,
      avg(sub.score) filter (where a.type = 'quiz'       and sub.score is not null) as avg_quiz,
      avg(sub.score) filter (where a.type = 'exam'       and sub.score is not null) as avg_exam,
      count(sub.id)  filter (where sub.score is not null)                            as graded_count
    from enrolled_subjects es
    join activities a on a.subject_id = es.id
    join submissions sub on sub.activity_id = a.id
      and sub.student_id = p_student_id
      and sub.status in ('graded', 'returned')
    group by a.subject_id
  ),
  subject_grades as (
    select
      es.id    as subject_id,
      es.name  as subject_name,
      es.code  as subject_code,
      es.units,
      ta.graded_count,
      case
        when ta.avg_assign is not null and ta.avg_quiz is not null and ta.avg_exam is not null
          then ta.avg_assign * 0.30 + ta.avg_quiz * 0.30 + ta.avg_exam * 0.40
        when ta.avg_assign is null and ta.avg_quiz is not null and ta.avg_exam is not null
          then ta.avg_quiz * 0.4286 + ta.avg_exam * 0.5714
        when ta.avg_assign is not null and ta.avg_quiz is null and ta.avg_exam is not null
          then ta.avg_assign * 0.4286 + ta.avg_exam * 0.5714
        when ta.avg_assign is not null and ta.avg_quiz is not null and ta.avg_exam is null
          then ta.avg_assign * 0.50 + ta.avg_quiz * 0.50
        when ta.avg_assign is not null and ta.avg_quiz is null and ta.avg_exam is null
          then ta.avg_assign
        when ta.avg_assign is null and ta.avg_quiz is not null and ta.avg_exam is null
          then ta.avg_quiz
        when ta.avg_assign is null and ta.avg_quiz is null and ta.avg_exam is not null
          then ta.avg_exam
        else null
      end as wavg
    from enrolled_subjects es
    left join type_avgs ta on ta.subject_id = es.id
  )
  select
    sg.subject_id,
    sg.subject_name,
    sg.subject_code,
    sg.units,
    round(coalesce(sg.wavg, 0), 2) as weighted_avg,
    case
      when sg.wavg is null or coalesce(sg.graded_count, 0) = 0 then null
      when sg.wavg >= 97 then 1.00
      when sg.wavg >= 94 then 1.25
      when sg.wavg >= 91 then 1.50
      when sg.wavg >= 88 then 1.75
      when sg.wavg >= 85 then 2.00
      when sg.wavg >= 82 then 2.25
      when sg.wavg >= 79 then 2.50
      when sg.wavg >= 76 then 2.75
      when sg.wavg >= 75 then 3.00
      else 5.00
    end as grade_point,
    case
      when sg.wavg is null or coalesce(sg.graded_count, 0) = 0 then 'INC'
      when sg.wavg >= 97 then 'A+'
      when sg.wavg >= 94 then 'A'
      when sg.wavg >= 91 then 'A-'
      when sg.wavg >= 88 then 'B+'
      when sg.wavg >= 85 then 'B'
      when sg.wavg >= 82 then 'B-'
      when sg.wavg >= 79 then 'C+'
      when sg.wavg >= 76 then 'C'
      when sg.wavg >= 75 then 'C-'
      else 'F'
    end as letter_grade,
    case
      when sg.wavg is null or coalesce(sg.graded_count, 0) = 0 then 'Incomplete'
      when sg.wavg >= 97 then 'Excellent'
      when sg.wavg >= 88 then 'Very Good'
      when sg.wavg >= 79 then 'Good'
      when sg.wavg >= 75 then 'Passing'
      else 'Failed'
    end as descriptor,
    (coalesce(sg.graded_count, 0) > 0) as has_grades
  from subject_grades sg;
end;
$$;

-- ─── GPA Summary Function ─────────────────────────────────────────────────
create or replace function public.get_student_gpa_summary(p_student_id uuid)
returns table (
  gpa            numeric,
  total_units    int,
  graded_units   int,
  subjects_count int
)
language plpgsql security definer as $$
begin
  return query
  select
    case
      when sum(case when gp.has_grades then gp.units else 0 end) > 0
        then round(
          sum(case when gp.has_grades then gp.grade_point * gp.units else 0 end) /
          sum(case when gp.has_grades then gp.units else 0 end),
          4)
      else null
    end as gpa,
    sum(gp.units)::int                                                as total_units,
    sum(case when gp.has_grades then gp.units else 0 end)::int       as graded_units,
    count(*)::int                                                     as subjects_count
  from public.get_student_gpa(p_student_id) gp;
end;
$$;
