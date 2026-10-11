-- Shorten OG/share description to a clear CTA.
update site_content
set content = jsonb_set(
  content,
  '{site,description}',
  to_jsonb('Klik untuk informasi lebih lengkap'::text)
)
where id = 'main'
  and content #>> '{site,description}' in (
    'Pernikahan Geraldo & Christin. Tangerang, 24 Oktober 2026',
    'The Wedding Of Geraldo & Christin · Sabtu, 24 Oktober 2026. Dengan penuh sukacita, kami mengundang Anda hadir.'
  );
