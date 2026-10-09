-- Auto-register personalized invite links (?guest= / legacy ?to=)
-- so wishes/RSVP unlock without requiring a prior admin import.

create or replace function ensure_guest_by_slug(guest_slug text, guest_name text default null)
returns table (id uuid, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_slug text;
  clean_name text;
begin
  clean_slug := lower(trim(coalesce(guest_slug, '')));
  clean_slug := regexp_replace(clean_slug, '[^a-z0-9-]+', '-', 'g');
  clean_slug := trim(both '-' from clean_slug);

  if clean_slug is null or length(clean_slug) < 2 or length(clean_slug) > 60 then
    return;
  end if;

  clean_name := nullif(trim(coalesce(guest_name, '')), '');
  if clean_name is null then
    clean_name := initcap(replace(clean_slug, '-', ' '));
  end if;
  clean_name := left(clean_name, 120);

  return query
  insert into guests (slug, display_name)
  values (clean_slug, clean_name)
  on conflict (slug) do update
    set display_name = case
      when excluded.display_name is not null and length(trim(excluded.display_name)) > 0
        then excluded.display_name
      else guests.display_name
    end
  returning guests.id, guests.display_name;
end;
$$;

grant execute on function ensure_guest_by_slug(text, text) to anon, authenticated;
