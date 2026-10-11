-- Point CMS OG image to full opening-frame share card (cache-bust WhatsApp).
update site_content
set content = jsonb_set(
  content,
  '{media,ogImage}',
  to_jsonb('/og-v3.jpg'::text)
)
where id = 'main'
  and coalesce(content #>> '{media,ogImage}', '') <> '/og-v3.jpg'
  and (
    content #>> '{media,ogImage}' is null
    or content #>> '{media,ogImage}' like '%/og.jpg'
    or content #>> '{media,ogImage}' like '%/og-v2.jpg'
    or content #>> '{media,ogImage}' like '%/og-image.jpg'
    or content #>> '{media,ogImage}' like '%/og-share.jpg'
  );
