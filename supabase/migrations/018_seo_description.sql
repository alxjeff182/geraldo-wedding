-- Refresh CMS SEO description to match luxury-minimal invite captions.
update site_content
set content = jsonb_set(
  content,
  '{site,description}',
  to_jsonb(
    'The Wedding Of Geraldo & Christin · Sabtu, 24 Oktober 2026. Dengan penuh sukacita, kami mengundang Anda hadir.'::text
  )
)
where id = 'main'
  and content #>> '{site,description}' = 'Pernikahan Geraldo & Christin. Tangerang, 24 Oktober 2026';
