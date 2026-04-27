-- Analytics and Grading Module Migration

-- ─── Manual Subject Grades (for direct entry/fast retrieval) ─────────────
create table if not exists public.manual_subject_grades (
  student_id     uuid not null references public.students(id) on delete cascade,
  subject_id     text not null references public.subjects(id) on delete cascade,
  assign_avg     numeric(5,2) default 0,
  quiz_avg       numeric(5,2) default 0,
  exam_avg       numeric(5,2) default 0,
  weighted_avg   numeric(5,2) generated always as (assign_avg * 0.30 + quiz_avg * 0.30 + exam_avg * 0.40) stored,
  updated_at     timestamptz default now(),
  primary key (student_id, subject_id)
);

-- ─── Redefining get_student_gpa to include manual grades ──────────────────
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
  dynamic_avgs as (
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
      case
        -- 1. Check if manual grade exists
        when msg.weighted_avg is not null then msg.weighted_avg
        -- 2. Fall back to dynamic calculation
        when da.avg_assign is not null and da.avg_quiz is not null and da.avg_exam is not null
          then da.avg_assign * 0.30 + da.avg_quiz * 0.30 + da.avg_exam * 0.40
        when da.avg_assign is null and da.avg_quiz is not null and da.avg_exam is not null
          then da.avg_quiz * 0.4286 + da.avg_exam * 0.5714
        when da.avg_assign is not null and da.avg_quiz is null and da.avg_exam is not null
          then da.avg_assign * 0.4286 + da.avg_exam * 0.5714
        when da.avg_assign is not null and da.avg_quiz is not null and da.avg_exam is null
          then da.avg_assign * 0.50 + da.avg_quiz * 0.50
        when da.avg_assign is not null or da.avg_quiz is not null or da.avg_exam is not null
          then coalesce(da.avg_assign, da.avg_quiz, da.avg_exam)
        else null
      end as wavg,
      (msg.weighted_avg is not null or coalesce(da.graded_count, 0) > 0) as has_graded
    from enrolled_subjects es
    left join dynamic_avgs da on da.subject_id = es.id
    left join manual_subject_grades msg on msg.subject_id = es.id and msg.student_id = p_student_id
  )
  select
    sg.subject_id,
    sg.subject_name,
    sg.subject_code,
    sg.units,
    round(coalesce(sg.wavg, 0), 2) as weighted_avg,
    case
      when sg.wavg is null or not sg.has_graded then null
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
      when sg.wavg is null or not sg.has_graded then 'INC'
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
      when sg.wavg is null or not sg.has_graded then 'Incomplete'
      when sg.wavg >= 97 then 'Excellent'
      when sg.wavg >= 88 then 'Very Good'
      when sg.wavg >= 79 then 'Good'
      when sg.wavg >= 75 then 'Passing'
      else 'Failed'
    end as descriptor,
    sg.has_graded as has_grades
  from subject_grades sg;
end;
$$;

-- ─── College-wide Analytics RPCs ──────────────────────────────────────────

-- 1. General Stats
create or replace function public.get_college_analytics()
returns json
language plpgsql security definer as $$
declare
  result json;
begin
  select json_build_object(
    'total_students', (select count(*) from students),
    'enrolled_students', (select count(*) from students where status = 'enrolled'),
    'avg_gpa', (
      select round(avg(gpa)::numeric, 2)
      from (
        select (get_student_gpa_summary(id)).gpa
        from students
      ) sub where gpa is not null
    ),
    'students_by_year', (
      select json_agg(row_to_json(t))
      from (
        select year_level, count(*) as count
        from students
        group by year_level
        order by year_level
      ) t
    )
  ) into result;
  return result;
end;
$$;

-- 2. Skill Category Distribution
create or replace function public.get_skill_distribution()
returns table (category text, count bigint)
language plpgsql security definer as $$
begin
  return query
  select s.category, count(*)
  from student_skills s
  group by s.category;
end;
$$;

-- 3. Subject Performance Stats
create or replace function public.get_subject_performance_stats()
returns table (subject_code text, avg_weighted_score numeric)
language plpgsql security definer as $$
begin
  return query
  with all_grades as (
    select s.id as student_id, (get_student_gpa(s.id)).*
    from students s
  )
  select ag.subject_code, round(avg(ag.weighted_avg)::numeric, 1)
  from all_grades ag
  where ag.has_grades = true
  group by ag.subject_code
  order by avg_weighted_score desc
  limit 10;
end;
$$;
