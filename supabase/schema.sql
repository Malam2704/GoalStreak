-- GoalStreak database setup
-- Paste this entire file into Supabase > SQL Editor > New query, then click Run.

create extension if not exists "pgcrypto";

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at date not null default current_date,
  unique (id, user_id)
);

create table if not exists public.check_ins (
  habit_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  note text not null default '',
  completed_at timestamptz not null default now(),
  primary key (habit_id, date),
  constraint check_ins_habit_owner_fk
    foreign key (habit_id, user_id)
    references public.habits (id, user_id)
    on delete cascade
);

create index if not exists habits_user_id_idx
  on public.habits (user_id, created_at);

create index if not exists check_ins_user_date_idx
  on public.check_ins (user_id, date desc);

alter table public.habits enable row level security;
alter table public.check_ins enable row level security;

drop policy if exists "habits_select_own" on public.habits;
drop policy if exists "habits_insert_own" on public.habits;
drop policy if exists "habits_update_own" on public.habits;
drop policy if exists "habits_delete_own" on public.habits;
drop policy if exists "check_ins_select_own" on public.check_ins;
drop policy if exists "check_ins_insert_own" on public.check_ins;
drop policy if exists "check_ins_update_own" on public.check_ins;
drop policy if exists "check_ins_delete_own" on public.check_ins;

create policy "habits_select_own" on public.habits
  for select to authenticated using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits
  for insert to authenticated with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits
  for delete to authenticated using (auth.uid() = user_id);

create policy "check_ins_select_own" on public.check_ins
  for select to authenticated using (auth.uid() = user_id);
create policy "check_ins_insert_own" on public.check_ins
  for insert to authenticated with check (auth.uid() = user_id);
create policy "check_ins_update_own" on public.check_ins
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "check_ins_delete_own" on public.check_ins
  for delete to authenticated using (auth.uid() = user_id);

