-- 018_ai_assessments_v2.sql
-- Optional: unify attempts tables later; for now we assume existing attempts_* tables.
-- Add generic score/feedback columns used by APIs.

alter table if exists public.attempts_speaking
  add column if not exists score_json jsonb,
  add column if not exists ai_feedback_json jsonb;

alter table if exists public.attempts_writing
  add column if not exists score_json jsonb,
  add column if not exists ai_feedback_json jsonb;

-- Reading question bank for explanations endpoint
create table if not exists public.reading_questions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null,
  question_no int,
  prompt text,
  answer text,
  rationale text,
  created_at timestamptz default now()
);

alter table public.reading_questions enable row level security;
create policy "reading_questions_read_all" on public.reading_questions
for select to authenticated using (true);

-- Optional helpful index
create index if not exists reading_questions_paper_ix on public.reading_questions(paper_id);
