-- Shorten invite {lokasi} to city only.
update site_content
set content = jsonb_set(
  coalesce(content, '{}'::jsonb),
  '{location}',
  to_jsonb('Jakarta Barat'::text),
  true
)
where id = 'main'
  and coalesce(content #>> '{location}', '') <> 'Jakarta Barat';
