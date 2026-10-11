-- Point CMS OG image to opening share card with date safe from WA crop.
update site_content
set content = jsonb_set(
  content,
  '{media,ogImage}',
  to_jsonb('/assets/ballroom/og-opening-v2.jpg'::text)
)
where id = 'main'
  and coalesce(content #>> '{media,ogImage}', '') <> '/assets/ballroom/og-opening-v2.jpg'
  and (
    content #>> '{media,ogImage}' is null
    or content #>> '{media,ogImage}' like '%/og.jpg'
    or content #>> '{media,ogImage}' like '%/og-v2.jpg'
    or content #>> '{media,ogImage}' like '%/og-v3.jpg'
    or content #>> '{media,ogImage}' like '%/og-opening.jpg'
    or content #>> '{media,ogImage}' like '%/og-image.jpg'
    or content #>> '{media,ogImage}' like '%/og-share.jpg'
  );
