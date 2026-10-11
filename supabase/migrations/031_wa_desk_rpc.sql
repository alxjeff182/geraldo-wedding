-- Secret WA desk: list/mark guests via token (hash only — token never stored in git).
-- Frontend route: /k/<token>  (see src/lib/wa-desk-route.ts)

create extension if not exists pgcrypto with schema extensions;

create or replace function public.wa_desk_token_ok(p_token text)
returns boolean
language sql
stable
parallel safe
as $$
  select
    p_token is not null
    and length(p_token) >= 32
    and encode(extensions.digest(p_token, 'sha256'), 'hex')
      = 'c7f2ecb1d77e836d3ff8f430b3777b78c3f52f787be5c727bfa99530110b3604';
$$;

revoke all on function public.wa_desk_token_ok(text) from public;
-- keep internal; not granted to anon

create or replace function public.wa_desk_list(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.wa_desk_token_ok(p_token) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  return coalesce(
    (
      select jsonb_agg(to_jsonb(g) order by g.display_name)
      from (
        select id, slug, display_name, phone, notes, invite_sent_at
        from guests
        order by display_name
      ) g
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.wa_desk_mark(p_token text, p_guest_id uuid, p_sent boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_guest guests%rowtype;
begin
  if not public.wa_desk_token_ok(p_token) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  update guests
  set invite_sent_at = case when p_sent then now() else null end
  where id = p_guest_id
  returning * into row_guest;

  if not found then
    raise exception 'guest_not_found' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'id', row_guest.id,
    'invite_sent_at', row_guest.invite_sent_at
  );
end;
$$;

revoke all on function public.wa_desk_list(text) from public;
revoke all on function public.wa_desk_mark(text, uuid, boolean) from public;
grant execute on function public.wa_desk_list(text) to anon, authenticated;
grant execute on function public.wa_desk_mark(text, uuid, boolean) to anon, authenticated;
