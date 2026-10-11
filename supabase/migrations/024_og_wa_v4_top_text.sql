-- Point CMS OG preview to full-bleed opening card with top text (v4).
update site_content
set content = jsonb_set(
  coalesce(content, '{}'::jsonb),
  '{media,ogImage}',
  to_jsonb('/assets/ballroom/og-wa-v4.jpg'::text),
  true
)
where id = 'main'
  and coalesce(content #>> '{media,ogImage}', '') <> '/assets/ballroom/og-wa-v4.jpg';
