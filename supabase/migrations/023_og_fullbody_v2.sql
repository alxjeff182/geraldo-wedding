-- Point CMS OG image to full-body share card (cache-bust WhatsApp).
update site_content
set content = jsonb_set(
  content,
  '{media,ogImage}',
  to_jsonb('/og-v2.jpg'::text)
)
where id = 'main'
  and (
    content #>> '{media,ogImage}' is null
    or content #>> '{media,ogImage}' like '%/og.jpg'
    or content #>> '{media,ogImage}' like '%/og-image.jpg'
    or content #>> '{media,ogImage}' like '%/og-share.jpg'
  )
  and coalesce(content #>> '{media,ogImage}', '') <> '/og-v2.jpg';
