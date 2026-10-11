-- Replace wrong LinkAja QR crops with BCA QRIS flyers + matching account holders.
update site_content
set content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{gift,accounts}',
        '[
          {
            "bank": "BCA",
            "number": "2480419009",
            "holder": "Christin Samosir",
            "logo": "/assets/ballroom/bca-logo.png",
            "side": "bride"
          },
          {
            "bank": "BCA",
            "number": "5271021641",
            "holder": "Geraldo Gracedo Sudena",
            "logo": "/assets/ballroom/bca-logo.png",
            "side": "groom"
          }
        ]'::jsonb
      ),
      '{gift,qrisBride}',
      to_jsonb('/assets/ballroom/qris-bride-v3.webp'::text)
    ),
    '{gift,qrisGroom}',
    to_jsonb('/assets/ballroom/qris-groom-v3.webp'::text)
  ),
  '{gift,qris}',
  to_jsonb('/assets/ballroom/qris-bride-v3.webp'::text)
)
where id = 'main';
