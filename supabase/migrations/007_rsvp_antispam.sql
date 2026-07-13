-- One RSVP per invited guest (anti-spam / duplicate submissions)

create unique index if not exists rsvp_submissions_one_per_guest
  on rsvp_submissions (guest_id)
  where guest_id is not null;

create index if not exists idx_rsvp_name_created
  on rsvp_submissions (lower(trim(name)), created_at desc);
