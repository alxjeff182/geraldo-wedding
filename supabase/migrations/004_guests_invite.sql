-- Guest invite: phone numbers + admin CRUD for authenticated users

alter table guests
  add column if not exists phone text;

create index if not exists idx_guests_phone on guests (phone) where phone is not null;

create policy "guests_select_authenticated"
  on guests for select
  to authenticated
  using (true);

create policy "guests_insert_authenticated"
  on guests for insert
  to authenticated
  with check (true);

create policy "guests_update_authenticated"
  on guests for update
  to authenticated
  using (true)
  with check (true);

create policy "guests_delete_authenticated"
  on guests for delete
  to authenticated
  using (true);
