-- Fix invite {lokasi}: replace placeholder Tangerang with actual venue city.
update site_content
set content = jsonb_set(
  coalesce(content, '{}'::jsonb),
  '{location}',
  to_jsonb('HKBP Kebon Jeruk, Jakarta Barat'::text),
  true
)
where id = 'main'
  and (
    coalesce(content #>> '{location}', '') = ''
    or coalesce(content #>> '{location}', '') = 'Tangerang'
  );
