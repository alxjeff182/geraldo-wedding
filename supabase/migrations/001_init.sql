-- Wedding invitation schema for Geraldo & Christin

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  created_at timestamptz default now()
);

create table if not exists rsvp_submissions (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete set null,
  name text not null,
  gender text,
  city text,
  attendance text not null check (attendance in ('hadir', 'tidak_hadir', 'ragu')),
  guest_count int default 1 check (guest_count >= 1 and guest_count <= 10),
  created_at timestamptz default now()
);

create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete set null,
  name text not null,
  message text not null,
  attendance text check (attendance in ('hadir', 'tidak_hadir', 'ragu')),
  created_at timestamptz default now()
);

create index if not exists idx_guests_slug on guests(slug);
create index if not exists idx_wishes_created_at on wishes(created_at desc);
create index if not exists idx_rsvp_created_at on rsvp_submissions(created_at desc);

alter table guests enable row level security;
alter table rsvp_submissions enable row level security;
alter table wishes enable row level security;

-- Public read guest by slug only
create policy "guests_select_by_slug"
  on guests for select
  to anon, authenticated
  using (true);

-- Public insert RSVP
create policy "rsvp_insert_public"
  on rsvp_submissions for insert
  to anon, authenticated
  with check (true);

-- Public read RSVP for attendance counts
create policy "rsvp_select_public"
  on rsvp_submissions for select
  to anon, authenticated
  using (true);

-- Public insert wishes
create policy "wishes_insert_public"
  on wishes for insert
  to anon, authenticated
  with check (char_length(message) <= 2000 and char_length(name) <= 200);

-- Public read wishes (guestbook)
create policy "wishes_select_public"
  on wishes for select
  to anon, authenticated
  using (true);

-- Enable realtime for attendance counters
alter publication supabase_realtime add table rsvp_submissions;
alter publication supabase_realtime add table wishes;
