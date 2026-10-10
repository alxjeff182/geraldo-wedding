-- Strict invites: stop anonymous auto-create of guests by slug.
-- Function remains for ops/admin tooling (service_role / postgres).
-- Note: default PUBLIC execute must also be revoked; anon/authenticated inherit it.

revoke execute on function public.ensure_guest_by_slug(text, text) from public;
revoke execute on function public.ensure_guest_by_slug(text, text) from anon, authenticated;
