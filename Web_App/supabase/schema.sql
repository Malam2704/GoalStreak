create extension if not exists "pgcrypto";

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.block_tasks (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.blocks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.today_blocks (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.blocks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.today_block_tasks (
  id uuid primary key default gen_random_uuid(),
  today_block_id uuid not null references public.today_blocks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on public.todos(user_id);
create index if not exists blocks_user_id_idx on public.blocks(user_id);
create index if not exists block_tasks_block_id_idx on public.block_tasks(block_id);
create index if not exists block_tasks_user_id_idx on public.block_tasks(user_id);
create index if not exists today_blocks_block_id_idx on public.today_blocks(block_id);
create index if not exists today_blocks_user_id_idx on public.today_blocks(user_id);
create index if not exists today_block_tasks_today_block_id_idx
  on public.today_block_tasks(today_block_id);
create index if not exists today_block_tasks_user_id_idx
  on public.today_block_tasks(user_id);

alter table public.todos enable row level security;
alter table public.blocks enable row level security;
alter table public.block_tasks enable row level security;
alter table public.today_blocks enable row level security;
alter table public.today_block_tasks enable row level security;

create policy "todos_select_own"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "todos_insert_own"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "todos_update_own"
  on public.todos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "todos_delete_own"
  on public.todos for delete
  using (auth.uid() = user_id);

create policy "blocks_select_own"
  on public.blocks for select
  using (auth.uid() = user_id);

create policy "blocks_insert_own"
  on public.blocks for insert
  with check (auth.uid() = user_id);

create policy "blocks_update_own"
  on public.blocks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "blocks_delete_own"
  on public.blocks for delete
  using (auth.uid() = user_id);

create policy "block_tasks_select_own"
  on public.block_tasks for select
  using (auth.uid() = user_id);

create policy "block_tasks_insert_own"
  on public.block_tasks for insert
  with check (auth.uid() = user_id);

create policy "block_tasks_update_own"
  on public.block_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "block_tasks_delete_own"
  on public.block_tasks for delete
  using (auth.uid() = user_id);

create policy "today_blocks_select_own"
  on public.today_blocks for select
  using (auth.uid() = user_id);

create policy "today_blocks_insert_own"
  on public.today_blocks for insert
  with check (auth.uid() = user_id);

create policy "today_blocks_update_own"
  on public.today_blocks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "today_blocks_delete_own"
  on public.today_blocks for delete
  using (auth.uid() = user_id);

create policy "today_block_tasks_select_own"
  on public.today_block_tasks for select
  using (auth.uid() = user_id);

create policy "today_block_tasks_insert_own"
  on public.today_block_tasks for insert
  with check (auth.uid() = user_id);

create policy "today_block_tasks_update_own"
  on public.today_block_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "today_block_tasks_delete_own"
  on public.today_block_tasks for delete
  using (auth.uid() = user_id);
