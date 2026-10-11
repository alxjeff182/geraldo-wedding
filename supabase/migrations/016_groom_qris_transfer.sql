-- Groom BCA transfer + QRIS (Geraldo Gracedo Sudena / 5271021641).
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
          "holder": "Geraldo Gracedo Sudena",
          "number": "5271021641"
        }
      ]'::jsonb,
      true
    ),
    '{gift,qrisGroom}',
    '"/assets/ballroom/qris-groom-code.webp"'::jsonb,
    true
  ),
  '{gift,qrisBride}',
  '"/assets/ballroom/qris-bride-code.webp"'::jsonb,
  true
)
where id = 'main';
