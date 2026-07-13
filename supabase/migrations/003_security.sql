-- Security hardening: restrict direct client access

-- Guest lookup by slug only (no full table enumeration)
create or replace function get_guest_by_slug(guest_slug text)
returns table (id uuid, display_name text)
language sql
security definer
set search_path = public
stable
as $$
  select g.id, g.display_name
  from guests g
  where g.slug = guest_slug
  limit 1;
$$;

grant execute on function get_guest_by_slug(text) to anon, authenticated;

drop policy if exists "guests_select_by_slug" on guests;

-- Remove public direct inserts (use edge function + service role)
drop policy if exists "rsvp_insert_public" on rsvp_submissions;
drop policy if exists "wishes_insert_public" on wishes;

-- RSVP data is private; attendance counts via edge/RPC if needed later
drop policy if exists "rsvp_select_public" on rsvp_submissions;

-- Rate limiting table for edge function
create table if not exists rate_limits (
  id bigserial primary key,
  ip text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limits_ip_action_created
  on rate_limits(ip, action, created_at desc);

alter table rate_limits enable row level security;

-- No public access to rate_limits (edge function uses service role)
create policy "rate_limits_no_public"
  on rate_limits for all
  to anon, authenticated
  using (false)
  with check (false);

-- Tighten RSVP name length at DB level
alter table rsvp_submissions
  drop constraint if exists rsvp_submissions_name_length;

alter table rsvp_submissions
  add constraint rsvp_submissions_name_length
  check (char_length(name) <= 200);

alter table rsvp_submissions
  drop constraint if exists rsvp_submissions_guest_count_ui;

alter table rsvp_submissions
  add constraint rsvp_submissions_guest_count_ui
  check (guest_count >= 1 and guest_count <= 3);
