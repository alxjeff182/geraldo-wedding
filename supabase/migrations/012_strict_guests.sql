-- Strict invites: stop anonymous auto-create of guests by slug.
-- Function remains for ops/admin tooling if re-granted later.

revoke execute on function public.ensure_guest_by_slug(text, text) from anon, authenticated;
