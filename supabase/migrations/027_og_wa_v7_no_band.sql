-- OG share without dark text band (v7).
update site_content
set content = jsonb_set(
  coalesce(content, '{}'::jsonb),
  '{media,ogImage}',
  to_jsonb('/assets/ballroom/og-wa-v7.jpg'::text),
  true
)
where id = 'main'
  and coalesce(content #>> '{media,ogImage}', '') <> '/assets/ballroom/og-wa-v7.jpg';
