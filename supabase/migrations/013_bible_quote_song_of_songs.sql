-- Switch quote section to Song of Songs 2:16 (Indonesian TB, short form matching English).
update site_content
set content = jsonb_set(
  jsonb_set(
    content,
    '{bibleQuote}',
    '"Kekasihku kepunyaanku, dan aku kepunyaan dia."'::jsonb,
    true
  ),
  '{bibleReference}',
  '"Kidung Agung 2:16"'::jsonb,
  true
)
where id = 'main';
