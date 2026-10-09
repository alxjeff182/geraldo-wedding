-- Wishes moderation + invite-only anti-spam support

alter table wishes
  add column if not exists hidden boolean not null default false;

create index if not exists idx_wishes_guest_created
  on wishes (guest_id, created_at desc);

drop policy if exists "wishes_select_public" on wishes;
create policy "wishes_select_public"
  on wishes for select
  to anon, authenticated
  using (hidden = false or is_admin());

drop policy if exists "wishes_update_admin" on wishes;
create policy "wishes_update_admin"
  on wishes for update
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "wishes_delete_admin" on wishes;
create policy "wishes_delete_admin"
  on wishes for delete
  to authenticated
  using (is_admin());
