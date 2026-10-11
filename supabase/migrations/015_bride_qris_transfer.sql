-- Bride BCA transfer + QRIS (Christin Samosir / 2480419009).
update site_content
set content = jsonb_set(
  jsonb_set(
    jsonb_set(
      content,
      '{gift,accounts}',
      '[
        {
          "bank": "BCA",
          "logo": "/assets/ballroom/bca-logo.png",
          "side": "bride",
          "holder": "Christin Samosir",
          "number": "2480419009"
        },
        {
          "bank": "BCA",
          "logo": "/assets/ballroom/bca-logo.png",
          "side": "groom",
          "holder": "Geraldo Gracedo Sudena Tampubolon",
          "number": ""
        }
      ]'::jsonb,
      true
    ),
    '{gift,qrisBride}',
    '"/assets/ballroom/qris-bride.webp"'::jsonb,
    true
  ),
  '{gift,qris}',
  '"/assets/ballroom/qris-bride.webp"'::jsonb,
  true
)
where id = 'main';
