-- Point CMS OG image to the new luxury share card (cache-bust WhatsApp/FB).
update site_content
set content = jsonb_set(
  content,
  '{media,ogImage}',
  to_jsonb('/assets/ballroom/og-opening-v2.jpg'::text)
)
where id = 'main'
  and (
    content #>> '{media,ogImage}' is null
    or content #>> '{media,ogImage}' like '%/og-image.jpg'
    or content #>> '{media,ogImage}' like '%/og-share.jpg'
  );
