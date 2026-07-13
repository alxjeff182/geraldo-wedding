-- CMS: site content + media storage

create table if not exists site_content (
  id text primary key default 'main',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_content_updated on site_content(updated_at desc);

alter table site_content enable row level security;

-- Public read for wedding site
create policy "site_content_select_public"
  on site_content for select
  to anon, authenticated
  using (true);

-- Only authenticated users can write (admin via Supabase Auth)
create policy "site_content_insert_authenticated"
  on site_content for insert
  to authenticated
  with check (true);

create policy "site_content_update_authenticated"
  on site_content for update
  to authenticated
  using (true)
  with check (true);

-- Storage bucket for wedding media (run via Supabase dashboard if storage API unavailable in SQL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media',
  'wedding-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'audio/mpeg', 'audio/mp3', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for media files
create policy "wedding_media_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wedding-media');

-- Authenticated upload/update/delete
create policy "wedding_media_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wedding-media');

create policy "wedding_media_update_authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'wedding-media');

create policy "wedding_media_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wedding-media');
