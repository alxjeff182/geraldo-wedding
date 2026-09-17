-- Track WhatsApp invite delivery status per guest

alter table guests
  add column if not exists invite_sent_at timestamptz;

create index if not exists idx_guests_invite_sent_at
  on guests (invite_sent_at)
  where invite_sent_at is not null;
