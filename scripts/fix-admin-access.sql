-- Quick fix: enable admin access for admin@geraldo.com
-- Run in Supabase Dashboard → SQL Editor → Run
-- Safe to re-run (idempotent)

create table if not exists admin_allowlist (
  email text primary key
);

insert into admin_allowlist (email)
values ('admin@geraldo.com')
on conflict (email) do nothing;

alter table admin_allowlist enable row level security;

drop policy if exists "admin_allowlist_select_self" on admin_allowlist;
create policy "admin_allowlist_select_self"
  on admin_allowlist for select
  to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from admin_allowlist
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function is_admin() to authenticated;

-- Verify (should return true after you sign in as admin@geraldo.com)
-- select is_admin();
