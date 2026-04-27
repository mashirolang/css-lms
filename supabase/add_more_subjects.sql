-- ─────────────────────────────────────────────────────────────
-- SUBJECT & SCHEDULE EXPANSION SCRIPT (FIXED FOR 20 ENTRIES)
-- Guarantees exactly 20 new subjects are added
-- ─────────────────────────────────────────────────────────────

-- 1. FORCE GENERATE 20 NEW SUBJECTS
with faculty_pool as (
    -- Sorts faculty so those with 0 subjects are at the top of the list
    select f.id, row_number() over (
        order by (select count(*) from public.subjects s where s.faculty_id = f.id) asc
    ) as rn
    from public.faculty f
),
template_subjects as (
    select *, row_number() over (order by id) as rn
    from public.subjects
),
new_subject_generator as (
    select 
        gs.i as item_index,
        uf.id as target_faculty_id,
        ts.name as base_name,
        ts.code as base_code,
        ts.course_id,
        ts.year_level,
        ts.id as base_id
    from generate_series(1, 20) gs(i)
    -- This ensures we cycle through faculty and templates to hit exactly 20
    left join lateral (
        select id from faculty_pool 
        where rn = mod(gs.i - 1, (select count(*) from faculty_pool)::int) + 1
    ) uf on true
    left join lateral (
        select * from template_subjects 
        where rn = mod(gs.i - 1, (select count(*) from template_subjects)::int) + 1
    ) ts on true
)
insert into public.subjects (id, name, code, course_id, year_level, section, faculty_id)
select 
    'sub-ext-' || item_index || '-' || base_id,
    base_name || ' (Sec ' || (array['P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'])[mod(item_index, 8) + 1] || ')',
    base_code || '-' || (200 + item_index),
    course_id,
    year_level,
    (array['A', 'B', 'C', 'D'])[mod(item_index, 4) + 1],
    target_faculty_id
from new_subject_generator
on conflict (id) do nothing;

-- 2. ADD SCHEDULES FOR ALL 20 NEW ENTRIES
insert into public.schedule_slots (subject_id, day_of_week, start_time, end_time, room)
select 
    s.id,
    (array[1, 2, 3, 4, 5])[mod(row_number() over ()::int, 5) + 1],
    ('07:30:00'::time + (mod(row_number() over ()::int, 6) * interval '1.5 hours')),
    ('09:00:00'::time + (mod(row_number() over ()::int, 6) * interval '1.5 hours')),
    'CL-LAB-' || (200 + mod(row_number() over ()::int, 20))
from public.subjects s
where s.id like 'sub-ext-%'
on conflict do nothing;
