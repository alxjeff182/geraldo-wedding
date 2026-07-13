-- Admin read/delete RSVP submissions (authenticated only)

create policy "rsvp_select_authenticated"
  on rsvp_submissions for select
  to authenticated
  using (true);

create policy "rsvp_delete_authenticated"
  on rsvp_submissions for delete
  to authenticated
  using (true);
