-- Admin allowlist + tighten authenticated policies

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

-- site_content
drop policy if exists "site_content_insert_authenticated" on site_content;
drop policy if exists "site_content_update_authenticated" on site_content;

create policy "site_content_insert_admin"
  on site_content for insert
  to authenticated
  with check (is_admin());

create policy "site_content_update_admin"
  on site_content for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- guests
drop policy if exists "guests_select_authenticated" on guests;
drop policy if exists "guests_insert_authenticated" on guests;
drop policy if exists "guests_update_authenticated" on guests;
drop policy if exists "guests_delete_authenticated" on guests;

create policy "guests_select_admin"
  on guests for select
  to authenticated
  using (is_admin());

create policy "guests_insert_admin"
  on guests for insert
  to authenticated
  with check (is_admin());

create policy "guests_update_admin"
  on guests for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "guests_delete_admin"
  on guests for delete
  to authenticated
  using (is_admin());

-- rsvp_submissions admin
drop policy if exists "rsvp_select_authenticated" on rsvp_submissions;
drop policy if exists "rsvp_delete_authenticated" on rsvp_submissions;

create policy "rsvp_select_admin"
  on rsvp_submissions for select
  to authenticated
  using (is_admin());

create policy "rsvp_delete_admin"
  on rsvp_submissions for delete
  to authenticated
  using (is_admin());

-- storage
drop policy if exists "wedding_media_insert_authenticated" on storage.objects;
drop policy if exists "wedding_media_update_authenticated" on storage.objects;
drop policy if exists "wedding_media_delete_authenticated" on storage.objects;

create policy "wedding_media_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wedding-media' and is_admin());

create policy "wedding_media_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'wedding-media' and is_admin());

create policy "wedding_media_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wedding-media' and is_admin());
