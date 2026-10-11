-- Lock gift QRIS to the codes provided by the couple (v4).
update site_content
set content = jsonb_set(
  jsonb_set(
    jsonb_set(
      content,
      '{gift,qrisBride}',
      to_jsonb('/assets/ballroom/qris-bride-v4.webp'::text)
    ),
    '{gift,qrisGroom}',
    to_jsonb('/assets/ballroom/qris-groom-v4.webp'::text)
  ),
  '{gift,qris}',
  to_jsonb('/assets/ballroom/qris-bride-v4.webp'::text)
)
where id = 'main';
