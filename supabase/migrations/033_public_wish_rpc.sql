-- Public guestbook wishes (share links / social) without personal guest invite.
create or replace function public.submit_public_wish(p_name text, p_message text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text;
  clean_message text;
  recent_count int;
  latest_at timestamptz;
  digit_count int;
begin
  clean_name := nullif(btrim(p_name), '');
  clean_message := nullif(btrim(p_message), '');

  if clean_name is null or char_length(clean_name) > 200 then
    raise exception 'Nama tidak valid' using errcode = 'P0001';
  end if;

  if clean_message is null or char_length(clean_message) < 3 or char_length(clean_message) > 500 then
    raise exception 'Data ucapan tidak valid' using errcode = 'P0001';
  end if;

  if position('http://' in lower(clean_message)) > 0
     or position('https://' in lower(clean_message)) > 0
     or position('www.' in lower(clean_message)) > 0
     or position('@' in clean_message) > 0 then
    raise exception 'Ucapan berisi tautan atau nomor tidak diperbolehkan.' using errcode = 'P0001';
  end if;

  digit_count := char_length(regexp_replace(clean_message, '[^0-9]', '', 'g'));
  if digit_count >= 9 then
    raise exception 'Ucapan berisi tautan atau nomor tidak diperbolehkan.' using errcode = 'P0001';
  end if;

  select count(*), max(created_at)
    into recent_count, latest_at
  from wishes
  where guest_id is null
    and lower(btrim(name)) = lower(clean_name)
    and created_at >= now() - interval '1 hour';

  if coalesce(recent_count, 0) >= 3 then
    raise exception 'Batas 3 ucapan untuk nama ini sudah tercapai.' using errcode = 'P0001';
  end if;

  if latest_at is not null and latest_at > now() - interval '60 seconds' then
    raise exception 'Tunggu sebentar sebelum mengirim ucapan lagi.' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from wishes
    where guest_id is null
      and lower(btrim(name)) = lower(clean_name)
      and lower(btrim(message)) = lower(clean_message)
      and created_at >= now() - interval '1 hour'
  ) then
    raise exception 'Ucapan yang sama sudah pernah dikirim.' using errcode = 'P0001';
  end if;

  insert into wishes (guest_id, name, message)
  values (null, clean_name, clean_message);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_public_wish(text, text) from public;
grant execute on function public.submit_public_wish(text, text) to anon, authenticated;
