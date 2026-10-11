-- Point CMS OG image to landscape opening share card (breaks WhatsApp cache).
update site_content
set content = jsonb_set(
  content,
  '{media,ogImage}',
  to_jsonb('/assets/ballroom/og-wa.jpg'::text)
)
where id = 'main'
  and coalesce(content #>> '{media,ogImage}', '') <> '/assets/ballroom/og-wa.jpg';
