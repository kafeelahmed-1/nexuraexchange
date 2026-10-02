create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  suspended boolean not null default false
);

create table if not exists public.account_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists suspended boolean not null default false;
alter table public.account_data add column if not exists data jsonb not null default '{}'::jsonb;
alter table public.account_data add column if not exists updated_at timestamptz not null default now();

update public.profiles set full_name = '' where full_name is null;
update public.profiles set role = 'user' where role is null or role not in ('user', 'admin');
update public.profiles set suspended = false where suspended is null;
update public.account_data set data = '{}'::jsonb where data is null;
update public.account_data set updated_at = now() where updated_at is null;

alter table public.profiles alter column full_name set default '';
alter table public.profiles alter column full_name set not null;
alter table public.profiles alter column role set default 'user';
alter table public.profiles alter column role set not null;
alter table public.profiles alter column suspended set default false;
alter table public.profiles alter column suspended set not null;
alter table public.account_data alter column data set default '{}'::jsonb;
alter table public.account_data alter column data set not null;
alter table public.account_data alter column updated_at set default now();
alter table public.account_data alter column updated_at set not null;

delete from public.account_data as account
where not exists (select 1 from auth.users as auth_user where auth_user.id = account.user_id);
delete from public.profiles as profile
where not exists (select 1 from auth.users as auth_user where auth_user.id = profile.id);

create unique index if not exists profiles_id_admin_integrity_idx on public.profiles (id);
create unique index if not exists account_data_user_id_admin_integrity_idx on public.account_data (user_id);

do $$
declare
  existing_constraint record;
begin
  for existing_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
  loop
    execute format('alter table public.profiles drop constraint %I', existing_constraint.conname);
  end loop;

  for existing_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.account_data'::regclass
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
  loop
    execute format('alter table public.account_data drop constraint %I', existing_constraint.conname);
  end loop;
end;
$$;

alter table public.profiles
  add constraint profiles_id_auth_users_fkey foreign key (id) references auth.users(id) on delete cascade;
alter table public.account_data
  add constraint account_data_user_id_auth_users_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.profiles enable row level security;
alter table public.account_data enable row level security;

grant select on public.profiles to authenticated;
grant select, insert, update on public.account_data to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can read their own account data" on public.account_data;
create policy "Users can read their own account data"
  on public.account_data for select to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and not profiles.suspended
    )
  );

drop policy if exists "Users can create their own account data" on public.account_data;
create policy "Users can create their own account data"
  on public.account_data for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and not profiles.suspended
    )
  );

drop policy if exists "Users can update their own account data" on public.account_data;
create policy "Users can update their own account data"
  on public.account_data for update to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and not profiles.suspended
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and not profiles.suspended
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();