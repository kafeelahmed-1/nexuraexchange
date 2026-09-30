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

alter table public.profiles enable row level security;
alter table public.account_data enable row level security;

grant select on public.profiles to authenticated;
grant select, insert, update on public.account_data to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'Users can read their own profile'
  ) then
    create policy "Users can read their own profile"
      on public.profiles for select to authenticated
      using ((select auth.uid()) = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'account_data'
      and policyname = 'Users can read their own account data'
  ) then
    create policy "Users can read their own account data"
      on public.account_data for select to authenticated
      using (
        (select auth.uid()) = user_id
        and exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid()) and not profiles.suspended
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'account_data'
      and policyname = 'Users can create their own account data'
  ) then
    create policy "Users can create their own account data"
      on public.account_data for insert to authenticated
      with check (
        (select auth.uid()) = user_id
        and exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid()) and not profiles.suspended
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'account_data'
      and policyname = 'Users can update their own account data'
  ) then
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
  end if;
end;
$$;

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

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;
